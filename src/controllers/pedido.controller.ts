import { Request, Response } from 'express';
import PedidoService from '../services/pedido.service';
import NotificacaoService from '../services/notificacao.service';
import logger from '../utils/logger';

class PedidoController {
    async create(req: Request, res: Response) {
        try {
            const authorId = req.user!.id;
            const pedidoData = { ...req.body };

            // Verifica se um arquivo foi enviado e adiciona o caminho ao DTO
            if (req.file) {
                // Normaliza o caminho para ser uma URL válida
                pedidoData.imagem = `/${req.file.path.replace(/\\/g, '/')}`;
            }

            const pedido = await PedidoService.create(authorId, pedidoData);
            logger.info(`Pedido "${pedido.titulo}" criado pelo usuário ${authorId}`);
            return res.status(201).json(pedido);
        } catch (error: any) {
            logger.error(`Erro ao criar pedido: ${error.message}`);
            return res.status(400).json({ message: 'Não foi possível criar o pedido.', details: error.message });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const userId = req.user?.id; // Pega o ID do usuário logado
            const { search } = req.query;
            const pedidos = await PedidoService.findAll(userId, search as string);
            return res.status(200).json(pedidos);
        } catch (error: any) {
            logger.error(`Erro ao buscar todos os pedidos: ${error.message}`);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.id; // Pega o ID do usuário logado (pode ser undefined se não houver login)
            const pedido = await PedidoService.findById(id, userId);
            return res.status(200).json(pedido);
        } catch (error: any) {
            logger.error(`Erro ao buscar pedido ${req.params.id}: ${error.message}`);
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const pedido = await PedidoService.update(id, req.body);
            return res.status(200).json(pedido);
        } catch (error: any) {
            logger.error(`Erro ao atualizar pedido ${req.params.id}: ${error.message}`);
            return res.status(400).json({ message: 'Não foi possível atualizar o pedido.', details: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.id;
            await PedidoService.delete(id, userId);
            logger.info(`Pedido ${id} deletado pelo usuário ${userId}`);
            return res.status(204).send();
        } catch (error: any) {
            logger.error(`Erro ao deletar pedido ${req.params.id}: ${error.message}`);
            if (error.message === 'Acesso negado') {
                return res.status(403).json({ message: error.message });
            }
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        }
    }

    async addInteresse(req: Request, res: Response) {
        try {
            const pedidoId = req.params.id;
            const userId = req.user!.id;
            const { pedido, interesse } = await PedidoService.addInteresse(pedidoId, userId);
            logger.info(`Usuário ${userId} demonstrou interesse no pedido ${pedidoId}`);
            return res.status(200).json({ pedido, interesse });
        } catch (error: any) {
            logger.error(`Erro ao adicionar interesse no pedido ${req.params.id}: ${error.message}`);
            return res.status(400).json({ message: 'Não foi possível registrar o interesse.', details: error.message });
        }
    }

    async escolherAjudante(req: Request, res: Response) {
        try {
            const pedidoId = req.params.id;
            const authorId = req.user!.id;
            const { userId: ajudanteUserId } = req.body;

            if (!ajudanteUserId) {
                return res.status(400).json({ message: 'O ID do usuário ajudante (userId) é obrigatório no corpo da requisição.' });
            }

            const pedido = await PedidoService.escolherAjudante(pedidoId, authorId, ajudanteUserId);
            logger.info(`Usuário ${authorId} escolheu ${ajudanteUserId} como ajudante para o pedido ${pedidoId}`);
            return res.status(200).json(pedido);
        } catch (error: any) {
            logger.error(`Erro ao escolher ajudante para o pedido ${req.params.id}: ${error.message}`);
            if (error.message.includes('Acesso negado')) {
                return res.status(403).json({ message: error.message });
            }
            return res.status(400).json({ message: error.message });
        }
    }

    async finalizar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const authorId = req.user!.id;
            const pedido = await PedidoService.finalizar(id, authorId);
            logger.info(`Pedido ${id} finalizado pelo usuário ${authorId}`);
            
            // Opcional: Notificar o ajudante que o pedido foi finalizado.
            if (pedido.ajudanteId) {
                await NotificacaoService.criar({
                    userId: pedido.ajudanteId,
                    tipo: 'PEDIDO_FINALIZADO',
                    mensagem: `O pedido "${pedido.titulo}" que você ajudou foi finalizado. Obrigado!`,
                    pedidoId: id,
                    remetenteId: authorId,
                });
            }
    
            return res.status(200).json(pedido);
        } catch (error: any) {
            logger.error(`Erro ao finalizar pedido ${req.params.id}: ${error.message}`);
            return res.status(400).json({ message: error.message });
        }
    }

    async desistir(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const ajudanteId = req.user!.id;

            const pedido = await PedidoService.desistir(id, ajudanteId);
            logger.info(`Ajudante ${ajudanteId} desistiu do pedido ${id}`);

            return res.status(200).json(pedido);
        } catch (error: any) {
            logger.error(`Erro ao desistir do pedido ${req.params.id}: ${error.message}`);
            if (error.message.includes('Acesso negado')) {
                return res.status(403).json({ message: error.message });
            }
            return res.status(400).json({ message: error.message });
        }
    }
}

export default new PedidoController();