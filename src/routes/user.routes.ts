import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const userRouter = Router();


userRouter.post('/register', UserController.create);
userRouter.post('/login', UserController.login);


userRouter.get('/profile', authMiddleware, UserController.getMyProfile);
userRouter.put('/profile', authMiddleware, UserController.updateProfile);


userRouter.post('/forgot-password', UserController.forgotPassword);
userRouter.post('/reset-password/:token', UserController.resetPassword);

export default userRouter;