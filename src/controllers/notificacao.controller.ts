import { Request, Response } from 'express';
import NotificacaoService from '../services/notificacao.service';
import logger from '../utils/logger';

class NotificacaoController {
  async listarPorUsuario(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const notificacoes = await NotificacaoService.listarPorUsuario(userId);
      return res.json(notificacoes);
    } catch (error: any) {
      logger.error(`Erro ao buscar notificações: ${error.message}`);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async marcarComoLida(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      await NotificacaoService.marcarComoLida(id, userId);
      return res.status(204).send();
    } catch (error: any) {
      logger.error(`Erro ao marcar notificação como lida: ${error.message}`);
      return res.status(400).json({ message: error.message });
    }
  }

  async contarNaoLidas(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const quantidade = await NotificacaoService.contarNaoLidas(userId);
      return res.json({ quantidade });
    } catch (error: any) {
      logger.error(`Erro ao contar notificações: ${error.message}`);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

export default new NotificacaoController();