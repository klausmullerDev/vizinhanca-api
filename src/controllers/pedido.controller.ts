import { Request, Response } from 'express';
import PedidoService from '../services/pedido.service';
import logger from '../utils/logger';

class PedidoController {


    async create(req: Request, res: Response) {
        try {

            if (!req.user) {
                return res.status(401).json({ message: 'Utilizador não autenticado.' });
            }


            const authorId = req.user.id;
            const pedidoData = req.body;

            const novoPedido = await PedidoService.create(pedidoData, authorId);
            logger.info(`Novo pedido criado com sucesso pelo utilizador ${authorId}`);

            return res.status(201).json(novoPedido);

        } catch (error: any) {
            logger.error(`Erro ao criar pedido: ${error.message}`);

            return res.status(400).json({ message: error.message });
        }
    }


    async findAll(req: Request, res: Response) {
        try {
            const todosPedidos = await PedidoService.findAll();
            return res.status(200).json(todosPedidos);
        } catch (error: any) {
            logger.error(`Erro ao buscar pedidos: ${error.message}`);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }
    async manifestarInteresse(req: Request, res: Response) {
        try {

            if (!req.user) {
                return res.status(401).json({ message: 'Utilizador não autenticado.' });
            }


            const { id: pedidoId } = req.params;


            const ajudanteId = req.user.id;

            await PedidoService.manifestarInteresse(pedidoId, ajudanteId);

            logger.info(`Utilizador ${ajudanteId} manifestou interesse no pedido ${pedidoId}`);
            return res.status(201).json({ message: 'Interesse registrado com sucesso.' });

        } catch (error: any) {
            logger.error(`Erro ao manifestar interesse: ${error.message}`);

            return res.status(400).json({ message: error.message });
        }
    }
}

export default new PedidoController();

