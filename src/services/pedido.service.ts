// services/pedido.service.ts

import { prisma } from '../database/prismaClient';
import { Prisma, Pedido, Interesse, User } from '@prisma/client';

type PedidoCreateDTO = {
    titulo: string;
    descricao: string;
}

type PedidoUpdateDTO = {
    titulo?: string;
    descricao?: string;
}

// Erro customizado para permissões
export class AuthorizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthorizationError';
    }
}

class PedidoService {

    async create(data: PedidoCreateDTO, authorId: string): Promise<Pedido> {
        const { titulo, descricao } = data;

        if (!titulo || !descricao) {
            throw new Error('Título e descrição são obrigatórios.');
        }

        return prisma.pedido.create({
            data: {
                titulo,
                descricao,
                authorId: authorId,
            }
        });
    }

    async findAll(userId: string | null): Promise<any[]> {
        const pedidos = await prisma.pedido.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                // Incluímos os interesses para fazer a verificação
                interesses: {
                    select: {
                        userId: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });


        if (!userId) {

            return pedidos.map(({ interesses, ...pedido }) => pedido);
        }


        const pedidosComStatus = pedidos.map(pedido => {

            const currentUserHasInterest = pedido.interesses.some(
                interesse => interesse.userId === userId
            );


            const { interesses, ...pedidoRestante } = pedido;

            return {
                ...pedidoRestante,
                currentUserHasInterest
            };
        });

        return pedidosComStatus;
    }

    async findById(pedidoId: string, userId: string | null): Promise<any> {
        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId },
            include: {
                author: {
                    select: { id: true, name: true, email: true }
                },
                interesses: {
                    include: {
                        user: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        });

        if (!pedido) {
            throw new Error('Pedido não encontrado.');
        }

        // Se não houver usuário logado, retorne o pedido como está
        if (!userId) {
            return pedido;
        }

        // Adiciona a mesma verificação de interesse
        const currentUserHasInterest = pedido.interesses.some(
            interesse => interesse.userId === userId
        );

        return {
            ...pedido,
            currentUserHasInterest
        };
    }

    async update(pedidoId: string, userId: string, data: PedidoUpdateDTO): Promise<Pedido> {
        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId },
        });

        if (!pedido) {
            throw new Error('Pedido não encontrado.');
        }

        if (pedido.authorId !== userId) {
            throw new AuthorizationError('Você não tem permissão para editar este pedido.');
        }

        return prisma.pedido.update({
            where: { id: pedidoId },
            data: data
        });
    }

    async delete(pedidoId: string, userId: string): Promise<void> {
        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId },
        });

        if (!pedido) {
            throw new Error('Pedido não encontrado.');
        }

        if (pedido.authorId !== userId) {
            throw new AuthorizationError('Você não tem permissão para deletar este pedido.');
        }

        await prisma.pedido.delete({
            where: { id: pedidoId },
        });
    }

    async manifestarInteresse(pedidoId: string, ajudanteId: string): Promise<Interesse> {
        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId },
        });

        if (!pedido) {
            throw new Error('Pedido não encontrado.');
        }

        if (pedido.authorId === ajudanteId) {
            throw new Error('Você não pode manifestar interesse no seu próprio pedido.');
        }

        try {
            return await prisma.interesse.create({
                data: {
                    pedidoId: pedidoId,
                    userId: ajudanteId,
                }
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new Error('Você já manifestou interesse neste pedido.');
            }
            throw error;
        }
    }
}

export default new PedidoService();