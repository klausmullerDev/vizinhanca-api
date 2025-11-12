import { Request, Response } from 'express';
import CategoriaService from '../services/categoria.service';
import logger from '../utils/logger';

class CategoriaController {
    async findAll(req: Request, res: Response) {
        try {
            const categorias = await CategoriaService.findAll();
            return res.status(200).json(categorias);
        } catch (error: any) {
            logger.error(`Erro ao buscar todas as categorias: ${error.message}`);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }
}

export default new CategoriaController();