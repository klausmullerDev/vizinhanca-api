// services/pedido.service.ts

import { PedidoCreateDTO, PedidoUpdateDTO } from '../types/dtos/pedido.dto';
import { prisma } from '../database/prismaClient';

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

    const interesse = await prisma.interesse.create({
      data: {
        userId,
        pedidoId
      },
      select: {
        id: true,
        userId: true,
        pedidoId: true
      }
    });

    return { pedido, interesse };
  }
}

export default new PedidoService();