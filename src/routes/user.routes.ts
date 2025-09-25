import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadConfig as upload } from '../services/upload.service';

const userRouter = Router();

userRouter.post('/register', UserController.create);
userRouter.post('/login', UserController.login);

userRouter.get('/profile', authMiddleware, UserController.getMyProfile);
// A linha abaixo é a correção principal.
// Adicionamos `upload.single('avatar')` para processar o arquivo antes do controller.
userRouter.put('/profile', authMiddleware, upload.single('avatar'), UserController.updateProfile);

userRouter.post('/forgot-password', UserController.forgotPassword);
userRouter.post('/reset-password/:token', UserController.resetPassword);

userRouter.get('/', authMiddleware, UserController.findAll);
userRouter.get('/:id', authMiddleware, UserController.findById);
userRouter.get('/:id/pedidos', authMiddleware, UserController.findPedidosByAuthor);
userRouter.delete('/:id', authMiddleware, UserController.delete);

export default userRouter;