import { prisma } from '../database/prismaClient';
import { Pedido } from '@prisma/client';


type PedidoCreateDTO = {
    titulo: string;
    descricao: string;
}

class PedidoService {

    
    async create(data: PedidoCreateDTO, authorId: string): Promise<Pedido> {
        const { titulo, descricao } = data;

        
        if (!titulo || !descricao) {
            throw new Error('Título e descrição são obrigatórios.');
        }

        const pedido = await prisma.pedido.create({
            data: {
                titulo,
                descricao,
                authorId: authorId, 
            }
        });

        return pedido;
    }

    
    async findAll(): Promise<Pedido[]> {
        const pedidos = await prisma.pedido.findMany({
            
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            
            orderBy: {
                createdAt: 'desc'
            }
        });
        return pedidos;
    }
}

export default new PedidoService();