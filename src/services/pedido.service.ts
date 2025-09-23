// services/pedido.service.ts

import { prisma } from '../database/prismaClient';
import notificacaoService from './notificacao.service';
import logger from '../utils/logger';
import { PedidoCreateDTO, PedidoUpdateDTO } from '../types/dtos/pedido.dto';

class PedidoService {
  async create(data: PedidoCreateDTO) {
    return prisma.pedido.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            telefone: true
          }
        }
      }
    });
  }

  async findAll(userId: string) {
    return prisma.pedido.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        interesses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findById(id: string, userId: string | null) {
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        interesses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    return pedido;
  }

  async update(id: string, userId: string, data: PedidoUpdateDTO) {
    const pedido = await prisma.pedido.findUnique({
      where: { id }
    });

    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    if (pedido.authorId !== userId) {
      throw new Error('Não autorizado');
    }

    return prisma.pedido.update({
      where: { id },
      data,
      include: {
        author: true,
        interesses: true
      }
    });
  }

  async delete(id: string, userId: string) {
    const pedido = await prisma.pedido.findUnique({
      where: { id }
    });

    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    if (pedido.authorId !== userId) {
      throw new Error('Não autorizado');
    }

    await prisma.pedido.delete({
      where: { id }
    });
  }

  async manifestarInteresse(pedidoId: string, userId: string) {
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            telefone: true
          }
        }
      }
    });

    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    // Buscar dados do usuário interessado
    const interessadoUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    if (!interessadoUser) {
      throw new Error('Usuário não encontrado');
    }

    if (pedido.author.id === userId) {
      throw new Error('Não é possível manifestar interesse no próprio pedido');
    }

    // Verificar se já existe interesse
    const existingInteresse = await prisma.interesse.findFirst({
      where: {
        pedidoId,
        userId
      }
    });

    if (existingInteresse) {
      throw new Error('Você já manifestou interesse neste pedido');
    }

    // Criar interesse em uma transação com a notificação
    const result = await prisma.$transaction(async (tx) => {
      const interesse = await tx.interesse.create({
        data: {
          userId,
          pedidoId
        }
      });

      const notificacao = await tx.notificacao.create({
        data: {
          tipo: 'INTERESSE_RECEBIDO',
          mensagem: `${interessadoUser.name} demonstrou interesse em ajudar no seu pedido "${pedido.titulo}"`,
          userId: pedido.author.id,
          pedidoId,
          lida: false
        }
      });

      return { interesse, notificacao };
    });

    logger.info(`Interesse registrado: usuário ${interessadoUser.name} no pedido ${pedido.titulo}`);
    logger.info(`Notificação ${result.notificacao.id} criada para o usuário ${pedido.author.id}`);

    return { 
      pedido,
      interesse: result.interesse
    };
  }
}

export default new PedidoService();