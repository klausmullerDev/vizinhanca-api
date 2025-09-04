import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const userRouter = Router();


userRouter.post('/register', UserController.create);
userRouter.post('/login', UserController.login);



export default userRouter;