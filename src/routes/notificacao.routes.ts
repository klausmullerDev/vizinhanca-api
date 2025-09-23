import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import NotificacaoController from '../controllers/notificacao.controller';

const notificacaoRouter = Router();

notificacaoRouter.use(authMiddleware);

notificacaoRouter.get('/', NotificacaoController.listarPorUsuario);
notificacaoRouter.get('/nao-lidas/quantidade', NotificacaoController.contarNaoLidas);
notificacaoRouter.patch('/:id/lida', NotificacaoController.marcarComoLida);

export default notificacaoRouter;