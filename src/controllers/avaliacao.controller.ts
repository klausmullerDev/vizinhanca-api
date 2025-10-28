import { Request, Response } from 'express';
import AvaliacaoService from '../services/avaliacao.service';
import logger from '../utils/logger';

class AvaliacaoController {
  async criar(req: Request, res: Response) {
    try {
      const avaliadorId = req.user!.id;
      const avaliacao = await AvaliacaoService.criar(avaliadorId, req.body);

      logger.info(`Avaliação ${avaliacao.id} criada para o pedido ${req.body.pedidoId}`);
      return res.status(201).json(avaliacao);
    } catch (error: any) {
      logger.error(`Erro ao criar avaliação: ${error.message}`);
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new AvaliacaoController();