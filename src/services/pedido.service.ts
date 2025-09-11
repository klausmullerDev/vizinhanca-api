import { prisma } from '../database/prismaClient';
import { Prisma, Pedido, Interesse } from '@prisma/client';


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
    async manifestarInteresse(pedidoId: string, ajudanteId: string): Promise<Interesse> {
        
        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId },
        });

        if (!pedido) {
            throw new Error('Pedido não encontrado.');
        }

        
        if (pedido.authorId === ajudanteId) {
            throw new Error('Você não pode manifestar interesse no seu próprio pedido.');
        }

        try {
            
            const novoInteresse = await prisma.interesse.create({
                data: {
                    pedidoId: pedidoId,
                    userId: ajudanteId, 
                }
            });

            return novoInteresse;

        } catch (error) {
            
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new Error('Você já manifestou interesse neste pedido.');
            }
            
            throw error;
        }
    }

}

export default new PedidoService();