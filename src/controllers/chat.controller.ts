import { Request, Response } from 'express';
import ChatService from '../services/chat.service';
import logger from '../utils/logger';

class ChatController {
    async createOrGetChat(req: Request, res: Response) {
        try {
            const { pedidoId, destinatarioId } = req.body;
            const remetenteId = req.user!.id;

            if (!pedidoId || !destinatarioId) {
                return res.status(400).json({ message: 'pedidoId e destinatarioId são obrigatórios.' });
            }

            const chat = await ChatService.createOrGet(pedidoId, remetenteId, destinatarioId);
            return res.status(201).json(chat);
        } catch (error: any) {
            logger.error(`Erro ao criar ou obter chat: ${error.message}`);
            return res.status(400).json({ message: error.message });
        }
    }

    async getChatsPorPedido(req: Request, res: Response) {
        try {
            const { pedidoId } = req.params;
            const userId = req.user!.id;
            const chats = await ChatService.findChatsByPedidoForUser(pedidoId, userId);
            return res.status(200).json(chats);
        } catch (error: any) {
            logger.error(`Erro ao buscar chats por pedido: ${error.message}`);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    async getMensagens(req: Request, res: Response) {
        try {
            const { chatId } = req.params;
            const userId = req.user!.id;
            const mensagens = await ChatService.findMensagensByChat(chatId, userId);
            return res.status(200).json(mensagens);
        } catch (error: any) {
      logger.error(`Erro ao buscar mensagens do chat ${req.params.chatId}: ${error.message}`);
            return res.status(400).json({ message: error.message });
        }
    }

    async enviarMensagem(req: Request, res: Response) {
        try {
            const { chatId } = req.params;
            const { conteudo } = req.body;
            const senderId = req.user!.id;

            if (!conteudo) {
                return res.status(400).json({ message: 'O conteúdo da mensagem é obrigatório.' });
            }

            const mensagem = await ChatService.createMensagem(chatId, senderId, conteudo);
            // Idealmente, aqui você emitiria um evento via WebSocket para o destinatário.
            // Por enquanto, a notificação cuidará de avisá-lo.
            return res.status(201).json(mensagem);
        } catch (error: any) {
            logger.error(`Erro ao enviar mensagem no chat ${req.params.chatId}: ${error.message}`);
            return res.status(400).json({ message: error.message });
        }
    }
}

export default new ChatController();
