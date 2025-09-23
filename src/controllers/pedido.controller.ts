import { Request, Response } from 'express';
import PedidoService from '../services/pedido.service';
import NotificacaoService from '../services/notificacao.service';
import logger from '../utils/logger';
import { PedidoCreateDTO } from '../types/dtos/pedido.dto';

class PedidoController {
  async create(req: Request, res: Response) {
    try {
      const { titulo, descricao } = req.body;
      const imagem = req.file?.filename;
      const authorId = req.user.id;

      const pedidoData: PedidoCreateDTO = {
        titulo,
        descricao,
        imagem,
        authorId
      };

      const pedido = await PedidoService.create(pedidoData);

      return res.status(201).json(pedido);
    } catch (error) {
      logger.error('Erro ao criar pedido:', error);
      return res.status(500).json({ error: 'Erro ao criar pedido' });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const userId = req.user.id; // Não precisa mais do optional chaining
      const todosPedidos = await PedidoService.findAll(userId);
      return res.status(200).json(todosPedidos);
    } catch (error: any) {
      logger.error(`Erro ao buscar pedidos: ${error.message}`);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || null;
      const pedido = await PedidoService.findById(id, userId);
      return res.status(200).json(pedido);
    } catch (error: any) {
      logger.error(`Erro ao buscar pedido ${req.params.id}: ${error.message}`);
      return res.status(404).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Utilizador não autenticado.' });
      }
      const { id } = req.params;
      const updatedPedido = await PedidoService.update(id, req.user.id, req.body);
      logger.info(`Pedido ${id} atualizado pelo utilizador ${req.user.id}`);
      return res.status(200).json(updatedPedido);
    } catch (error: any) {
      logger.error(`Erro ao atualizar pedido: ${error.message}`);
      return res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Utilizador não autenticado.' });
      }
      const { id } = req.params;
      await PedidoService.delete(id, req.user.id);
      logger.info(`Pedido ${id} deletado pelo utilizador ${req.user.id}`);
      return res.status(204).send();
    } catch (error: any) {
      logger.error(`Erro ao deletar pedido: ${error.message}`);
      return res.status(400).json({ message: error.message });
    }
  }

  async manifestarInteresse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { pedido, interesse } = await PedidoService.manifestarInteresse(id, userId);
      
      await NotificacaoService.criar({
        tipo: 'INTERESSE_RECEBIDO',
        mensagem: 'Alguém demonstrou interesse no seu pedido!',
        userId: pedido.authorId,
        pedidoId: id
      });

      return res.json({ pedido, interesse });
    } catch (error) {
      logger.error('Erro ao manifestar interesse:', error);
      return res.status(500).json({ error: 'Erro ao manifestar interesse' });
    }
  }
}

export default new PedidoController();