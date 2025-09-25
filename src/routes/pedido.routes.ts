import { Router } from 'express';
import PedidoController from '../controllers/pedido.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadConfig as upload } from '../services/upload.service';

const pedidoRouter = Router();

// Aplica o middleware de autenticação para todas as rotas de pedido
pedidoRouter.use(authMiddleware);

/**
 * @swagger
 * /pedidos:
 *   get:
 *     tags: [Pedidos]
 *     summary: Lista todos os pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo para buscar nos títulos e descrições dos pedidos.
 *     responses:
 *       '200':
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 */
pedidoRouter.get('/', PedidoController.findAll);

/**
 * @swagger
 * /pedidos:
 *   post:
 *     tags: [Pedidos]
 *     summary: Cria um novo pedido
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               imagem:
 *                 type: string
 *                 format: binary
 *             required:
 *               - titulo
 *               - descricao
 *     responses:
 *       '201':
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 */
pedidoRouter.post('/', upload.single('imagem'), PedidoController.create);

/**
 * @swagger
 * /pedidos/{id}:
 *   get:
 *     tags: [Pedidos]
 *     summary: Busca um pedido por ID
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
 *       '200':
 *         description: Dados do pedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       '404':
 *         description: Pedido não encontrado
 */
pedidoRouter.get('/:id', PedidoController.findById);

/**
 * @swagger
 * /pedidos/{id}:
 *   patch:
 *     tags: [Pedidos]
 *     summary: Atualiza um pedido (parcialmente)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo: { type: 'string' }
 *               descricao: { type: 'string' }
 *               status: { type: 'string', enum: ['ABERTO', 'FINALIZADO', 'CANCELADO'] }
 *     responses:
 *       '200':
 *         description: Pedido atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 */
pedidoRouter.patch('/:id', PedidoController.update);

/**
 * @swagger
 * /pedidos/{id}:
 *   delete:
 *     tags: [Pedidos]
 *     summary: Deleta um pedido
 *     description: Permite que o autor do pedido o delete.
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
 *         description: Pedido deletado com sucesso
 *       '403':
 *         description: Acesso negado
 *       '404':
 *         description: Pedido não encontrado
 */
pedidoRouter.delete('/:id', PedidoController.delete);

/**
 * @swagger
 * /pedidos/{id}/interesse:
 *   post:
 *     tags: [Pedidos]
 *     summary: Manifesta interesse em um pedido
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
 *       '200':
 *         description: Interesse registrado com sucesso
 *       '400':
 *         description: 'Erro ao registrar interesse (ex: interesse próprio, interesse duplicado)'
 *       '404':
 *         description: Pedido não encontrado
 */
pedidoRouter.post('/:id/interesse', PedidoController.addInteresse);

export default pedidoRouter;