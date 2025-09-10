import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import PedidoController from '../controllers/pedido.controller';

const pedidoRouter = Router();

pedidoRouter.get('/', authMiddleware, PedidoController.findAll);
pedidoRouter.post('/', authMiddleware, PedidoController.create);





export default pedidoRouter;