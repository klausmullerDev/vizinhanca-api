import { Router } from 'express';
import PedidoController from '../controllers/pedido.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadConfig as upload } from '../services/upload.service';

const pedidoRouter = Router();

// Aplica o middleware de autenticação para todas as rotas de pedido
pedidoRouter.use(authMiddleware);

// A rota de criação agora usa o multer para aceitar uma imagem no campo 'imagem'
pedidoRouter.post('/', upload.single('imagem'), PedidoController.create);

pedidoRouter.get('/', PedidoController.findAll);
pedidoRouter.get('/:id', PedidoController.findById);
pedidoRouter.patch('/:id', PedidoController.update);
pedidoRouter.delete('/:id', PedidoController.delete);

pedidoRouter.post('/:id/interesse', PedidoController.addInteresse);

export default pedidoRouter;