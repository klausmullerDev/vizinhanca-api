import { prisma } from '../database/prismaClient';
import logger from '../utils/logger';

class NotificacaoService {
  async criar(data: {
    tipo: 'INTERESSE_RECEBIDO' | 'PEDIDO_ACEITO';
    mensagem: string;
    userId: string;
    pedidoId: string;
  }) {
    logger.info(`Criando notificação tipo ${data.tipo} para usuário ${data.userId}`);

    const notificacao = await prisma.notificacao.create({
      data: {
        ...data,
        // A mensagem já vem formatada do serviço que a chama.
        // Isso torna o serviço de notificação mais genérico.
        lida: false
      },
      include: {
        pedido: {
          select: {
            titulo: true,
            descricao: true
          }
        }
      }
    });

    logger.info(`Notificação ${notificacao.id} criada com sucesso`);
    return notificacao;
  }

  async listarPorUsuario(userId: string) {
    return prisma.notificacao.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        pedido: {
          select: {
            titulo: true,
            descricao: true
          }
        }
      }
    });
  }

  async marcarComoLida(id: string, userId: string) {
    const notificacao = await prisma.notificacao.findUnique({
      where: { id }
    });

    if (!notificacao) {
      throw new Error('Notificação não encontrada');
    }

    if (notificacao.userId !== userId) {
      throw new Error('Não autorizado');
    }

    return prisma.notificacao.update({
      where: { id },
      data: { lida: true }
    });
  }

  async contarNaoLidas(userId: string) {
    const count = await prisma.notificacao.count({
      where: {
        userId,
        lida: false
      }
    });

    return { quantidade: count };
  }
}

export default new NotificacaoService();