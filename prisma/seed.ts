import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando o processo de seeding...');

    // 1. Limpar dados existentes para garantir um estado limpo
    console.log('Limpando o banco de dados...');
    await prisma.interesse.deleteMany({});
    await prisma.notificacao.deleteMany({});
    await prisma.pedido.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Banco de dados limpo.');

    // 2. Criar usuários
    console.log('Criando usuários...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    const user1 = await prisma.user.create({
        data: {
            name: 'Ana Silva',
            email: 'ana.silva@example.com',
            password: hashedPassword,
            telefone: '11987654321',
            cpf: '11122233344',
            avatar: 'https://i.pravatar.cc/150?u=ana.silva@example.com',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            name: 'Carlos Pereira',
            email: 'carlos.pereira@example.com',
            password: hashedPassword,
            telefone: '11912345678',
            cpf: '55566677788',
            avatar: 'https://i.pravatar.cc/150?u=carlos.pereira@example.com',
        },
    });
    console.log(`Usuários criados: ${user1.name}, ${user2.name}`);

    // 3. Criar Pedidos
    console.log('Criando pedidos...');
    const pedido1 = await prisma.pedido.create({
        data: {
            titulo: 'Preciso de ajuda com as compras',
            descricao: 'Alguém poderia me ajudar a buscar minhas compras no mercado? Fica a duas quadras daqui.',
            authorId: user1.id,
        },
    });

    const pedido2 = await prisma.pedido.create({
        data: {
            titulo: 'Regar minhas plantas',
            descricao: 'Vou viajar por uma semana e preciso que alguém regue minhas plantas a cada dois dias.',
            authorId: user2.id,
        },
    });
    console.log(`Pedidos criados: "${pedido1.titulo}" e "${pedido2.titulo}"`);

    // 4. Criar Interesses e Notificações (simulando interação)
    console.log('Simulando interações...');
    // Carlos (user2) se interessa pelo pedido da Ana (user1)
    await prisma.interesse.create({
        data: {
            userId: user2.id,
            pedidoId: pedido1.id,
        },
    });

    // Ana (user1) recebe uma notificação sobre o interesse
    await prisma.notificacao.create({
        data: {
            tipo: 'INTERESSE_RECEBIDO',
            mensagem: `${user2.name} demonstrou interesse no seu pedido "${pedido1.titulo}".`,
            userId: user1.id,
            pedidoId: pedido1.id,
        },
    });
    console.log('Interesse e notificação criados.');

    console.log('Seeding finalizado com sucesso! 🎉');
}

main()
    .catch((e) => {
        console.error('Ocorreu um erro durante o seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
