import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Token não fornecido ou mal formatado');
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET as string;

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded as any; 
        next(); 
    } catch (error) {
        logger.error('Token inválido ou expirado');
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};