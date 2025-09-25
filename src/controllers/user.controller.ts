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
            const payload = { id: userResponse.id, email: userResponse.email };
            const secret = process.env.JWT_SECRET as string;
            const options = { expiresIn: 86400 }; // 24 horas
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
            const userId = req.user.id;
            const profileData = { ...req.body };

            // Adiciona o caminho do avatar se um arquivo foi enviado
            if (req.file) {
                // Normaliza o caminho do arquivo para usar barras '/' e ser compatível com URLs
                profileData.avatar = `/${req.file.path.replace(/\\/g, '/')}`; // Garante a barra inicial
            }

            const updatedUser = await UserService.updateProfile(userId, profileData);
            logger.info(`Perfil do utilizador ${userId} atualizado com sucesso.`);
            return res.status(200).json(updatedUser);
        } catch (error: any) {
            logger.error(`Erro ao atualizar perfil do utilizador ${req.user?.id}: ${error.message}`);
            return res.status(400).json({ message: 'Não foi possível atualizar o perfil.', details: error.message });
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            await UserService.forgotPassword(email);
            return res.status(200).json({ message: 'Se um utilizador com este e-mail existir, um link para redefinição de senha foi enviado.' });
        } catch (error: any) {
            logger.error(`Erro no processo de forgotPassword: ${error.message}`);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { token } = req.params;
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({ message: 'A nova senha é obrigatória.' });
            }

            await UserService.resetPassword(token, password);
            return res.status(200).json({ message: 'Senha redefinida com sucesso.' });

        } catch (error: any) {
            logger.error(`Erro ao redefinir senha com token: ${error.message}`);
            return res.status(400).json({ message: error.message });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await UserService.findById(id);
            return res.status(200).json(user);
        } catch (error: any) {
            logger.error(`Erro ao buscar utilizador por ID ${req.params.id}: ${error.message}`);
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }
    }

    async findPedidosByAuthor(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const pedidos = await UserService.findPedidosByAuthor(id);
            return res.status(200).json(pedidos);
        } catch (error: any) {
            logger.error(`Erro ao buscar pedidos do autor ${req.params.id}: ${error.message}`);
            return res.status(500).json({ message: 'Erro ao buscar os pedidos do utilizador.' });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const users = await UserService.findAll();
            return res.status(200).json(users);
        } catch (error: any) {
            logger.error(`Erro ao buscar todos os utilizadores: ${error.message}`);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await UserService.deleteUser(id);
            logger.info(`Utilizador ${id} deletado com sucesso.`);
            return res.status(204).send();
        } catch (error: any) {
            logger.error(`Erro ao deletar utilizador ${req.params.id}: ${error.message}`);
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }
    }
}

export default new UserController();