import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import NotificacaoController from '../controllers/notificacao.controller';

const notificacaoRouter = Router();

notificacaoRouter.use(authMiddleware);

/**
 * @swagger
 * /notificacoes:
 *   get:
 *     tags: [Notificações]
 *     summary: Lista notificações do usuário logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de notificações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notificacao'
 */
notificacaoRouter.get('/', NotificacaoController.listarPorUsuario);

/**
 * @swagger
 * /notificacoes/nao-lidas/quantidade:
 *   get:
 *     tags: [Notificações]
 *     summary: Retorna a quantidade de notificações não lidas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Quantidade de notificações não lidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quantidade:
 *                   type: number
 */
notificacaoRouter.get('/nao-lidas/quantidade', NotificacaoController.contarNaoLidas);

/**
 * @swagger
 * /notificacoes/{id}/lida:
 *   patch:
 *     tags: [Notificações]
 *     summary: Marca uma notificação como lida
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '204':
 *         description: Notificação marcada como lida com sucesso
 *       '403':
 *         description: 'Acesso negado (notificação não pertence ao usuário)'
 *       '404':
 *         description: Notificação não encontrada
 */
notificacaoRouter.patch('/:id/lida', NotificacaoController.marcarComoLida);

export default notificacaoRouter;