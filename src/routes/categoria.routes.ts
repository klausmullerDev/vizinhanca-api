import { Router } from 'express';
import CategoriaController from '../controllers/categoria.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const categoriaRouter = Router();

// Aplica o middleware de autenticação para todas as rotas de categoria
categoriaRouter.use(authMiddleware);

/**
 * @swagger
 * /categorias:
 *   get:
 *     tags: [Categorias]
 *     summary: Lista todas as categorias de pedidos
 *     description: Retorna uma lista de todas as categorias disponíveis para classificar os pedidos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de categorias retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 *       '401':
 *         description: Não autorizado. O token de autenticação não foi fornecido ou é inválido.
 */
categoriaRouter.get('/', CategoriaController.findAll);

export default categoriaRouter;