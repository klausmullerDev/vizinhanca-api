import { Router } from 'express';
import ChatController from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const chatRouter = Router();

chatRouter.use(authMiddleware);

/**
 * @swagger
 * /chats:
 *   post:
 *     tags: [Chat]
 *     summary: Cria ou obtém um chat existente
 *     description: Inicia uma conversa entre o usuário logado e outro usuário sobre um pedido específico. Se o chat já existir, ele é retornado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pedidoId:
 *                 type: string
 *                 format: uuid
 *               destinatarioId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       '201':
 *         description: Chat criado ou obtido com sucesso.
 */
chatRouter.post('/', ChatController.createOrGetChat);

/**
 * @swagger
 * /chats/pedido/{pedidoId}:
 *   get:
 *     tags: [Chat]
 *     summary: Lista os chats de um pedido para o usuário logado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pedidoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Lista de chats.
 */
chatRouter.get('/pedido/:pedidoId', ChatController.getChatsPorPedido);

/**
 * @swagger
 * /chats/{chatId}/mensagens:
 *   get:
 *     tags: [Chat]
 *     summary: Lista as mensagens de um chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Lista de mensagens.
 */
chatRouter.get('/:chatId/mensagens', ChatController.getMensagens);

/**
 * @swagger
 * /chats/{chatId}/mensagens:
 *   post:
 *     tags: [Chat]
 *     summary: Envia uma nova mensagem
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conteudo:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Mensagem enviada com sucesso.
 */
chatRouter.post('/:chatId/mensagens', ChatController.enviarMensagem);

export default chatRouter;
