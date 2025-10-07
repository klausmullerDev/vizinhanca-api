import { prisma } from '../database/prismaClient';
import { Pedido } from '@prisma/client';
import NotificacaoService from './notificacao.service';

type PedidoCreateDTO = {
    titulo: string;
    descricao: string;
    imagem?: string; // O campo imagem é opcional
};

type PedidoUpdateDTO = {
    titulo?: string;
    descricao?: string;
    status?: string;
};

class PedidoService {
    async create(authorId: string, data: PedidoCreateDTO): Promise<Pedido> {
        const pedido = await prisma.pedido.create({
            data: {
                ...data,
                authorId: authorId,
            },
        });
        return pedido;
    }

    async findAll(userId?: string, search?: string): Promise<any[]> {
        const whereClause: any = {};

        if (search) {
            whereClause.OR = [
                { titulo: { contains: search, mode: 'insensitive' } },
                { descricao: { contains: search, mode: 'insensitive' } },
            ];
        }

        const pedidos = await prisma.pedido.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { id: true, name: true, avatar: true } },
                _count: {
                    select: { interesses: true }
                },
                interesses: {
                    take: 4, // Limita a 4 para otimização, conforme sugerido
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
        
        return pedidos.map(pedido => {
            const { _count, ...rest } = pedido;
            const usuarioJaDemonstrouInteresse = userId 
                ? pedido.interesses.some(interesse => interesse.user.id === userId)
                : false;
            return { ...rest, usuarioJaDemonstrouInteresse, interessesCount: _count.interesses };
        });
    }

    async findById(id: string, userId?: string): Promise<any | null> {
        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, name: true, avatar: true } },
                ajudante: { select: { id: true, name: true, avatar: true } },
                interesses: { include: { user: { select: { id: true, name: true, avatar: true } } } },
            },
        });
        if (!pedido) {
            throw new Error('Pedido não encontrado');
        }

        // Se um userId for fornecido, verifica se ele já demonstrou interesse
        const usuarioJaDemonstrouInteresse = userId
            ? pedido.interesses.some(interesse => interesse.user.id === userId)
            : false;

        return {
            ...pedido,
            usuarioJaDemonstrouInteresse,
        };
    }

    async update(id: string, data: PedidoUpdateDTO): Promise<Pedido> {
        return prisma.pedido.update({
            where: { id },
            data,
        });
    }

    async delete(id: string, userId: string): Promise<void> {
        const pedido = await prisma.pedido.findUnique({ where: { id } });
        if (!pedido) {
            throw new Error('Pedido não encontrado');
        }
        if (pedido.authorId !== userId) {
            throw new Error('Acesso negado');
        }
        await prisma.pedido.delete({ where: { id } });
    }

    async addInteresse(pedidoId: string, userId: string) {
        const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });
        if (!pedido) {
            throw new Error('Pedido não encontrado');
        }
        if (pedido.authorId === userId) {
            throw new Error('Você não pode demonstrar interesse no seu próprio pedido.');
        }

        // Verifica se o usuário já demonstrou interesse neste pedido
        const interesseExistente = await prisma.interesse.findUnique({
            where: {
                pedidoId_userId: {
                    pedidoId,
                    userId,
                },
            },
        });

        if (interesseExistente) {
            throw new Error('Você já demonstrou interesse neste pedido.');
        }

        const interesse = await prisma.interesse.create({
            data: {
                pedidoId,
                userId,
            },
        });

        // Criar notificação para o autor do pedido
        const autorDoPedidoId = pedido.authorId;
        const interessado = await prisma.user.findUnique({ where: { id: userId } });
        await NotificacaoService.criar({
            userId: autorDoPedidoId,
            tipo: 'INTERESSE_RECEBIDO',
            mensagem: `${interessado?.name} demonstrou interesse no seu pedido "${pedido.titulo}".`,
            pedidoId: pedidoId,
            remetenteId: userId,
        });

        return { pedido, interesse };
    }

    async escolherAjudante(pedidoId: string, authorId: string, ajudanteUserId: string): Promise<Pedido> {
        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId },
            include: { interesses: { where: { userId: ajudanteUserId } } }
        });

        if (!pedido) {
            throw new Error('Pedido não encontrado');
        }
        if (pedido.authorId !== authorId) {
            throw new Error('Acesso negado. Apenas o autor do pedido pode escolher um ajudante.');
        }
        if (pedido.ajudanteId) {
            throw new Error('Este pedido já possui um ajudante.');
        }
        if (pedido.interesses.length === 0) {
            throw new Error('O usuário escolhido não demonstrou interesse neste pedido.');
        }

        const pedidoAtualizado = await prisma.pedido.update({
            where: { id: pedidoId },
            data: {
                ajudanteId: ajudanteUserId,
                status: 'EM_ANDAMENTO',
            },
        });

        // ✅ NOTIFICAR O AJUDANTE ESCOLHIDO
        await NotificacaoService.criar({
            userId: ajudanteUserId,
            tipo: 'AJUDANTE_ESCOLHIDO',
            mensagem: `Você foi escolhido para ajudar no pedido "${pedido.titulo}"!`,
            pedidoId: pedidoId,
            remetenteId: authorId,
        });

        return pedidoAtualizado;
    }

    async finalizar(pedidoId: string, authorId: string): Promise<Pedido> {
        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId },
        });

        if (!pedido) {
            throw new Error('Pedido não encontrado');
        }
        if (pedido.authorId !== authorId) {
            throw new Error('Acesso negado. Apenas o autor pode finalizar o pedido.');
        }
        if (pedido.status !== 'EM_ANDAMENTO') {
            throw new Error('Apenas pedidos em andamento podem ser finalizados.');
        }

        return prisma.pedido.update({
            where: { id: pedidoId },
            data: { status: 'FINALIZADO' },
        });
    }

    async desistir(pedidoId: string, ajudanteId: string): Promise<Pedido> {
        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId },
        });

        if (!pedido) {
            throw new Error('Pedido não encontrado');
        }
        if (pedido.ajudanteId !== ajudanteId) {
            throw new Error('Acesso negado. Apenas o ajudante escolhido pode desistir.');
        }
        if (pedido.status !== 'EM_ANDAMENTO') {
            throw new Error('Não é possível desistir de um pedido que não está em andamento.');
        }

        // Notificar o autor do pedido
        const ajudante = await prisma.user.findUnique({ where: { id: ajudanteId } });
        await NotificacaoService.criar({
            userId: pedido.authorId,
            tipo: 'AJUDANTE_DESISTIU',
            mensagem: `${ajudante?.name} não pode mais te ajudar no pedido "${pedido.titulo}". Você pode escolher outro ajudante.`,
            pedidoId: pedidoId,
            remetenteId: ajudanteId,
        });

        return prisma.pedido.update({
            where: { id: pedidoId },
            data: { ajudanteId: null, status: 'ABERTO' },
        });
    }
}

export default new PedidoService();