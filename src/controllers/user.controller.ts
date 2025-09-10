import { Request, Response } from 'express';
import UserService from '../services/user.service';
import { AuthenticationError } from '../services/user.service';
import logger from '../utils/logger';
import jwt from 'jsonwebtoken';

class UserController {
    async create(req: Request, res: Response) {
        try {
            const userResponse = await UserService.create(req.body);
            logger.info(`Utilizador criado com sucesso: ${userResponse.email}`);
            return res.status(201).json(userResponse);
        } catch (error: any) {
            logger.error(`Erro ao criar utilizador: ${error.message}`);
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

            // O payload é criado com 'id' (CORRETO)
            const payload = { id: userResponse.id, email: userResponse.email };

            const secret = process.env.JWT_SECRET as string;
            const options = { expiresIn: 86400 };
            const token = jwt.sign(payload, secret, options);
            logger.info(`Utilizador logado com sucesso: ${email}`);
            return res.status(200).json({ user: userResponse, token });
        } catch (error: any) {
            if (error instanceof AuthenticationError) {
                logger.warn(`Tentativa de login falhou para o email: ${email}`);
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }
            logger.error(`Erro inesperado durante o login para ${email}: ${error.message}`);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    async getMyProfile(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Utilizador não autenticado.' });
            }

            // CORREÇÃO AQUI: Lemos a propriedade 'id' do token (CORRETO)
            const userId = req.user.id;
            const userProfile = await UserService.getProfile(userId);
            return res.status(200).json(userProfile);

        } catch (error: any) {
            logger.error(`Erro ao buscar perfil: ${error.message}`);
            return res.status(404).json({ message: error.message });
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Utilizador não autenticado.' });
            }

            // CORREÇÃO AQUI: Lemos a propriedade 'id' do token (CORRETO)
            const userId = req.user.id;
            const profileData = req.body;

            const updatedUser = await UserService.updateProfile(userId, profileData);

            logger.info(`Perfil do utilizador ${userId} atualizado com sucesso.`);
            return res.status(200).json(updatedUser);

        } catch (error: any) {
            // CORREÇÃO AQUI: Usamos 'id' também no log de erro (CORRETO)
            logger.error(`Erro ao atualizar perfil do utilizador ${req.user?.id}: ${error.message}`);
            return res.status(400).json({ message: 'Não foi possível atualizar o perfil.', details: error.message });
        }
    }
}

export default new UserController();