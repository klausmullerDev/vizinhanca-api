import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import PedidoController from '../controllers/pedido.controller';

const pedidoRouter = Router();

// Rotas para a coleção de pedidos (/pedidos)
pedidoRouter.get('/', authMiddleware, PedidoController.findAll);
pedidoRouter.post('/', authMiddleware, PedidoController.create);

// Rotas para um pedido específico (/pedidos/:id)
pedidoRouter.get('/:id', authMiddleware, PedidoController.findById);
pedidoRouter.patch('/:id', authMiddleware, PedidoController.update);
pedidoRouter.delete('/:id', authMiddleware, PedidoController.delete);

// Rota para ações customizadas em um pedido específico
pedidoRouter.post('/:id/interesse', authMiddleware, PedidoController.manifestarInteresse);

export default pedidoRouter;