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

    async findAll(userId?: string): Promise<any[]> {
        const pedidos = await prisma.pedido.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { id: true, name: true, avatar: true } },
                interesses: { select: { userId: true } },
            },
        });

        // Se um userId for fornecido, mapeia os pedidos para incluir a flag de interesse
        if (userId) {
            return pedidos.map(pedido => {
                const usuarioJaDemonstrouInteresse = pedido.interesses.some(interesse => interesse.userId === userId);
                return { ...pedido, usuarioJaDemonstrouInteresse };
            });
        }

        return pedidos;
    }

    async findById(id: string, userId?: string): Promise<any | null> {
        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, name: true, avatar: true } },
                interesses: { include: { user: { select: { id: true, name: true, avatar: true } } } },
            },
        });
        if (!pedido) {
            throw new Error('Pedido não encontrado');
        }

        // Se um userId for fornecido, verifica se ele já demonstrou interesse
        const usuarioJaDemonstrouInteresse = userId
            ? pedido.interesses.some(interesse => interesse.userId === userId)
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
        });

        return { pedido, interesse };
    }
}

export default new PedidoService();