import { prisma } from '../database/prismaClient';
import NotificacaoService from './notificacao.service';

class ChatService {
    async createOrGet(pedidoId: string, userId1: string, userId2: string) {
        // Garante uma ordem consistente para os participantes para evitar duplicatas
        const [p1, p2] = [userId1, userId2].sort();

        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId },
            include: { interesses: true },
        });

        if (!pedido) {
            throw new Error('Pedido não encontrado.');
        }

        const isUser1Author = pedido.authorId === userId1;
        const isUser2Author = pedido.authorId === userId2;
        const isUser1Interested = pedido.interesses.some(i => i.userId === userId1);
        const isUser2Interested = pedido.interesses.some(i => i.userId === userId2);

        // Permite chat entre autor e interessado, ou vice-versa.
        if (!((isUser1Author && isUser2Interested) || (isUser2Author && isUser1Interested))) {
            throw new Error('Chat só pode ser iniciado entre o autor e um interessado no pedido.');
        }

        const existingChat = await prisma.chat.findUnique({
            where: {
                pedidoId_participante1Id_participante2Id: {
                    pedidoId,
                    participante1Id: p1,
                    participante2Id: p2,
                },
            },
        });

        if (existingChat) {
            return existingChat;
        }

        return prisma.chat.create({
            data: {
                pedidoId,
                participante1Id: p1,
                participante2Id: p2,
            },
        });
    }

    async findChatsByPedidoForUser(pedidoId: string, userId: string) {
        const chats = await prisma.chat.findMany({
            where: {
                pedidoId,
                OR: [{ participante1Id: userId }, { participante2Id: userId }],
            },
            include: {
                participante1: { select: { id: true, name: true, avatar: true } },
                participante2: { select: { id: true, name: true, avatar: true } },
                _count: { select: { mensagens: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Transforma o resultado para combinar os participantes em um único array
        return chats.map(({ participante1, participante2, ...resto }) => ({
            ...resto,
            participantes: [participante1, participante2],
        }));
    }

    async findChatByIdForUser(chatId: string, userId: string) {
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                OR: [{ participante1Id: userId }, { participante2Id: userId }],
            },
            include: {
                participante1: { select: { id: true, name: true, avatar: true } },
                participante2: { select: { id: true, name: true, avatar: true } },
                pedido: { select: { id: true, titulo: true, authorId: true } },
            },
        });

        if (!chat) {
            throw new Error('Chat não encontrado ou acesso negado.');
        }

        const { participante1, participante2, ...resto } = chat;
        return { ...resto, participantes: [participante1, participante2] };
    }

    async findMensagensByChat(chatId: string, userId: string) {
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                OR: [{ participante1Id: userId }, { participante2Id: userId }],
            },
        });

        if (!chat) {
            throw new Error('Chat não encontrado ou acesso negado.');
        }

        return prisma.mensagem.findMany({
            where: { chatId },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async createMensagem(chatId: string, senderId: string, conteudo: string) {
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                OR: [{ participante1Id: senderId }, { participante2Id: senderId }],
            },
            include: { pedido: true }
        });

        if (!chat) {
            throw new Error('Chat não encontrado ou acesso negado.');
        }

        const destinatarioId = chat.participante1Id === senderId ? chat.participante2Id : chat.participante1Id;

        const mensagem = await prisma.mensagem.create({
            data: {
                conteudo,
                chatId,
                senderId,
            },
        });

        // Atualiza o `updatedAt` do chat para que ele apareça no topo da lista
        await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() }
        });

        // Notifica o outro usuário
        await NotificacaoService.criar({
            userId: destinatarioId,
            tipo: 'NOVA_MENSAGEM',
            mensagem: `Você tem uma nova mensagem no chat do pedido "${chat.pedido.titulo}".`,
            pedidoId: chat.pedidoId,
            remetenteId: senderId,
        });

        return mensagem;
    }
}

export default new ChatService();
