import { Request, Response } from 'express';
import PedidoService, { AuthorizationError } from '../services/pedido.service';
import logger from '../utils/logger';

class PedidoController {

    async create(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Utilizador não autenticado.' });
            }
            const authorId = req.user.id;
            const novoPedido = await PedidoService.create(req.body, authorId);
            logger.info(`Novo pedido criado com sucesso pelo utilizador ${authorId}`);
            return res.status(201).json(novoPedido);
        } catch (error: any) {
            logger.error(`Erro ao criar pedido: ${error.message}`);
            return res.status(400).json({ message: error.message });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const userId = req.user?.id || null;
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
            if (error instanceof AuthorizationError) {
                return res.status(403).json({ message: error.message });
            }
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
            if (error instanceof AuthorizationError) {
                return res.status(403).json({ message: error.message });
            }
            return res.status(400).json({ message: error.message });
        }
    }

    async manifestarInteresse(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Utilizador não autenticado.' });
            }
            const { id: pedidoId } = req.params;
            const ajudanteId = req.user.id;
            const novoInteresse = await PedidoService.manifestarInteresse(pedidoId, ajudanteId);
            logger.info(`Utilizador ${ajudanteId} manifestou interesse no pedido ${pedidoId}`);
            return res.status(201).json(novoInteresse);
        } catch (error: any) {
            logger.error(`Erro ao manifestar interesse: ${error.message}`);
            return res.status(400).json({ message: error.message });
        }
    }
}

export default new PedidoController();