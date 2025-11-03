import { prisma } from '../database/prismaClient';
import NotificacaoService from './notificacao.service';

type AvaliacaoCreateDTO = {
  nota: number;
  comentario?: string;
  pedidoId: string;
};

class AvaliacaoService {
  async criar(avaliadorId: string, data: AvaliacaoCreateDTO) {
    const { pedidoId, nota, comentario } = data;

    if (nota < 1 || nota > 5) {
      throw new Error('A nota deve ser um valor entre 1 e 5.');
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      throw new Error('Pedido não encontrado.');
    }

    // Regra 1: O pedido precisa estar finalizado.
    if (pedido.status !== 'FINALIZADO') {
      throw new Error('A avaliação só pode ser feita para pedidos finalizados.');
    }

    // Regra 2: O avaliador deve ser o autor ou o ajudante.
    const isAuthor = pedido.authorId === avaliadorId;
    const isHelper = pedido.ajudanteId === avaliadorId;

    if (!isAuthor && !isHelper) {
      throw new Error('Apenas o autor ou o ajudante do pedido podem realizar a avaliação.');
    }

    // Regra 3: O pedido precisa ter tido um ajudante.
    if (!pedido.ajudanteId) {
      throw new Error('Este pedido não teve um ajudante para ser avaliado.');
    }

    // Regra 4: O pedido não pode ter sido avaliado ainda pelo mesmo avaliador.
    const avaliacaoExistente = await prisma.avaliacao.findUnique({
      where: { pedidoId_avaliadorId: { pedidoId, avaliadorId } },
    });

    if (avaliacaoExistente) {
      throw new Error('Você já avaliou este pedido.');
    }

    // Regra 5: Determina quem é o avaliado.
    const avaliadoId = isAuthor ? pedido.ajudanteId : pedido.authorId;

    const avaliacao = await prisma.avaliacao.create({
      data: {
        nota,
        comentario,
        pedidoId,
        avaliadorId,
        avaliadoId,
      },
    });

    // Notificar o usuário que foi avaliado
    await NotificacaoService.criar({
      userId: avaliadoId,
      tipo: 'AVALIACAO_RECEBIDA',
      mensagem: `Você recebeu uma nova avaliação para o pedido "${pedido.titulo}".`,
      pedidoId: pedido.id,
      remetenteId: avaliadorId,
    });

    return avaliacao;
  }
}

export default new AvaliacaoService();