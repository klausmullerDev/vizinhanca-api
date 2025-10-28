import { prisma } from '../database/prismaClient';

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

    // Regra 1: Apenas o autor do pedido pode avaliar.
    if (pedido.authorId !== avaliadorId) {
      throw new Error('Apenas o autor do pedido pode realizar a avaliação.');
    }

    // Regra 2: O pedido precisa ter um ajudante e estar finalizado.
    if (pedido.status !== 'FINALIZADO' || !pedido.ajudanteId) {
      throw new Error('A avaliação só pode ser feita para pedidos finalizados que tiveram um ajudante.');
    }

    // Regra 3: O pedido não pode ter sido avaliado ainda (garantido pelo `pedidoId @unique` no schema, mas verificamos para uma mensagem de erro melhor).
    const avaliacaoExistente = await prisma.avaliacao.findUnique({
      where: { pedidoId },
    });

    if (avaliacaoExistente) {
      throw new Error('Este pedido já foi avaliado.');
    }

    const avaliacao = await prisma.avaliacao.create({
      data: {
        nota,
        comentario,
        pedidoId,
        avaliadorId,
        avaliadoId: pedido.ajudanteId, // O ajudante é o `avaliado`.
      },
    });

    return avaliacao;
  }
}

export default new AvaliacaoService();