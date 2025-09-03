// src/routes/user.routes.ts
import { Router } from 'express';
import UserController from '../controllers/user.controller';

const userRouter = Router();


userRouter.post('/register', UserController.create);

export default userRouter;