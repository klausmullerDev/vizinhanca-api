import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import PedidoController from '../controllers/pedido.controller';

const pedidoRouter = Router();

pedidoRouter.get('/', authMiddleware, PedidoController.findAll);
pedidoRouter.post('/', authMiddleware, PedidoController.create);

pedidoRouter.post('/:id/interesse', authMiddleware, PedidoController.manifestarInteresse);






export default pedidoRouter;