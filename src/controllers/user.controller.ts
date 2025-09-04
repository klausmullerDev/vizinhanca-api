import { Request, Response } from 'express';
import UserService, { AuthenticationError } from '../services/user.service';
import logger from '../utils/logger';
import jwt from 'jsonwebtoken';

class UserController {
    async create(req: Request, res: Response) {
        try {
            
            const userResponse = await UserService.create(req.body);
            

            logger.info(`Usuário criado com sucesso: ${userResponse.email}`);
            return res.status(201).json(userResponse);
        } catch (error: any) {
            logger.error(`Erro ao criar usuário: ${error.message}`);

            
            if (error.message === 'Este email já está em uso.') {
                return res.status(409).json({ message: error.message }); 
            }

            
            return res.status(400).json({ message: 'Dados inválidos fornecidos.' });
        }
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        try {
            
            const userResponse = await UserService.login(email, password);

            const payload = { userId: userResponse.id, email: userResponse.email };
            
            const secret = process.env.JWT_SECRET as string

            const options = { expiresIn: 86400 };

            const token = jwt.sign(payload, secret, options);

            logger.info(`Usuário logado com sucesso: ${email}`);
            
            return res.status(200).json({user : userResponse, token });
        } catch (error: any) {

            if (error instanceof AuthenticationError) {
                logger.warn(`Tentativa de login falhou para o email: ${email}`);
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }


            logger.error(`Erro inesperado durante o login para ${email}: ${error.message}`);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }
    
    
    
}

export default new UserController();''


