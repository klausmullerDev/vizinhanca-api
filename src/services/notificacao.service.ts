import { prisma } from '../database/prismaClient';

class NotificacaoService {
  async criar(data: {
    tipo: 'INTERESSE_RECEBIDO' | 'PEDIDO_ACEITO';
    mensagem: string;
    userId: string;
    pedidoId: string;
  }) {
    const pedido = await prisma.pedido.findUnique({
      where: { id: data.pedidoId },
      select: { titulo: true }
    });

    const mensagemFormatada = `${data.mensagem} Pedido: ${pedido?.titulo}`;

    return prisma.notificacao.create({
      data: {
        ...data,
        mensagem: mensagemFormatada
      },
      include: {
        pedido: {
          select: {
            titulo: true,
            descricao: true
          }
        },
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      }
    });
  }

  async buscarPorUsuario(userId: string) {
    return prisma.notificacao.findMany({
      where: {
        userId,
      },
      include: {
        pedido: {
          select: {
            titulo: true,
            descricao: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async marcarComoLida(id: string, userId: string) {
    const notificacao = await prisma.notificacao.findUnique({
      where: { id }
    });

    if (!notificacao || notificacao.userId !== userId) {
      throw new Error('Notificação não encontrada ou não autorizada');
    }

    return prisma.notificacao.update({
      where: { id },
      data: { lida: true }
    });
  }

  async contarNaoLidas(userId: string) {
    return prisma.notificacao.count({
      where: {
        userId,
        lida: false
      }
    });
  }
}

export default new NotificacaoService();