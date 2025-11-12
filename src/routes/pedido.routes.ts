import { Router } from 'express';
import PedidoController from '../controllers/pedido.controller';
import ChatController from '../controllers/chat.controller';
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
 *       - bearerAuth: [] # Indica que esta rota requer autenticação
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo para buscar nos títulos e descrições.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ABERTO, EM_ANDAMENTO, FINALIZADO, CANCELADO]
 *         description: Filtra pedidos por status.
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filtra os pedidos pelo ID da categoria.
 *     responses:
 *       '200':
 *         description: Uma lista de pedidos, possivelmente filtrada.
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
 *               video:
 *                 type: string
 *                 format: binary
 *               categoriaId:
 *                 type: string
 *                 description: ID da categoria à qual o pedido pertence.
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
pedidoRouter.post('/', upload.fields([
  { name: 'imagem', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), PedidoController.create);

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

/**
 * @swagger
 * /pedidos/{id}/escolher-ajudante:
 *   post:
 *     tags: [Pedidos]
 *     summary: Escolhe um ajudante para o pedido
 *     description: Permite que o autor do pedido escolha um dos usuários interessados como ajudante.
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: 'string', format: 'uuid' }
 */
pedidoRouter.post('/:id/escolher-ajudante', PedidoController.escolherAjudante);

/**
 * @swagger
 * /pedidos/{id}/finalizar:
 *   post:
 *     tags: [Pedidos]
 *     summary: Finaliza um pedido
 *     description: Permite que o autor do pedido o marque como finalizado.
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
 *         description: Pedido finalizado com sucesso
 *       '400':
 *         description: 'Erro (ex: pedido não está em andamento)'
 *       '403':
 *         description: Acesso negado
 */
pedidoRouter.post('/:id/finalizar', PedidoController.finalizar);

/**
 * @swagger
 * /pedidos/{id}/desistir:
 *   patch:
 *     tags: [Pedidos]
 *     summary: Desiste de ajudar em um pedido
 *     description: Permite que o ajudante escolhido desista de um pedido, que voltará ao status 'ABERTO'.
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
 *         description: Desistência registrada com sucesso
 *       '400':
 *         description: 'Erro (ex: pedido não está em andamento)'
 *       '403':
 *         description: Acesso negado
 */
pedidoRouter.patch('/:id/desistir', PedidoController.desistir);

/**
 * @swagger
 * /pedidos/{id}/cancelar:
 *   patch:
 *     tags: [Pedidos]
 *     summary: Cancela um pedido
 *     description: Permite que o autor do pedido o marque como cancelado.
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
 *         description: Pedido cancelado com sucesso. Retorna o pedido atualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       '403':
 *         description: Acesso negado
 */
pedidoRouter.patch('/:id/cancelar', PedidoController.cancelar);

/**
 * @swagger
 * /pedidos/{id}/chats:
 *   get:
 *     tags: [Pedidos, Chat]
 *     summary: Lista os chats de um pedido para o usuário logado
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
 *         description: Lista de chats.
 */
pedidoRouter.get('/:id/chats', ChatController.getChatsPorPedido);


export default pedidoRouter;