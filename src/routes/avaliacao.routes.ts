import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import AvaliacaoController from '../controllers/avaliacao.controller';

const avaliacaoRouter = Router();

avaliacaoRouter.use(authMiddleware);

/**
 * @swagger
 * /avaliacoes:
 *   post:
 *     tags: [Avaliações]
 *     summary: Cria uma nova avaliação para um pedido finalizado
 *     description: Permite que o autor de um pedido finalizado avalie o ajudante.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pedidoId, nota]
 *             properties:
 *               pedidoId:
 *                 type: string
 *                 format: uuid
 *               nota:
 *                 type: integer
 *                 description: Nota de 1 a 5.
 *               comentario:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Avaliação criada com sucesso.
 */
avaliacaoRouter.post('/', AvaliacaoController.criar);

export default avaliacaoRouter;