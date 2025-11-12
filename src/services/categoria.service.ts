import { prisma } from '../database/prismaClient';
import { Categoria } from '@prisma/client';

class CategoriaService {
    async findAll(): Promise<Categoria[]> {
        return prisma.categoria.findMany({
            orderBy: {
                name: 'asc'
            }
        });
    }
}

export default new CategoriaService();