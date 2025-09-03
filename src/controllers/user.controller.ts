import { Request, Response } from 'express';
import UserService from '../services/user.service';
import logger from '../utils/logger';

class UserController {
    async create(req: Request, res: Response) {
        try {
            const newUser = await UserService.create(req.body);
            const { password, ...userResponse } = newUser;

            logger.info(`Usuário criado com sucesso: ${newUser.email}`);
            return res.status(201).json(userResponse);
        } catch (error: any) {

            logger.error(`Erro ao criar usuário: ${error.message}`);
            return res.status(400).json({ message: error.message });
        }
    }
}

export default new UserController();