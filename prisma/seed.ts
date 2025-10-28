import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// --- Configurações ---
const TOTAL_USERS = 10;
const TOTAL_PEDIDOS = 20;
const TEST_USER_PASSWORD = 'password123';
// ---------------------

async function main() {
  const { faker } = await import('@faker-js/faker');

  console.log('🚀 Iniciando o processo de seeding...');

  // 1. Limpar dados existentes para garantir um estado limpo
  console.log('🧹 Limpando o banco de dados...');
  // A ordem importa para não violar as constraints de chave estrangeira
  await prisma.mensagem.deleteMany({});
  await prisma.chat.deleteMany({});
  await prisma.notificacao.deleteMany({});
  await prisma.interesse.deleteMany({});
  await prisma.pedido.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Banco de dados limpo.');

  // 2. Criar usuários
  console.log(`👤 Criando ${TOTAL_USERS + 1} usuários...`);
  const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 10);

  const users = [];

  // Criar usuário de teste
  const testUser = await prisma.user.create({
    data: {
      name: 'Usuário de Teste',
      email: 'test@example.com',
      password: hashedPassword,
      telefone: faker.string.numeric(11),
      cpf: faker.string.numeric(11),
      avatar: `https://i.pravatar.cc/150?u=test@example.com`,
    },
  });
  users.push(testUser);

  // Criar usuários aleatórios
  for (let i = 0; i < TOTAL_USERS; i++) {
    const name = faker.person.fullName();
    const email = faker.internet.email({ firstName: name.split(' ')[0] });
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        telefone: faker.string.numeric(11),
        cpf: faker.string.numeric(11),
        avatar: `https://i.pravatar.cc/150?u=${email}`,
      },
    });
    users.push(user);
  }
  console.log(`✅ ${users.length} usuários criados.`);

  // 3. Criar Pedidos (agora chamados de Feeds)
  console.log(`📝 Criando ${TOTAL_PEDIDOS} pedidos (feeds)...`);
  const pedidos = [];
  for (let i = 0; i < TOTAL_PEDIDOS; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];

    // 50% de chance de ter uma foto
    const hasPhoto = Math.random() > 0.5;

    const pedido = await prisma.pedido.create({
      data: {
        titulo: faker.lorem.sentence(5),
        descricao: faker.lorem.paragraph(2),
        authorId: randomUser.id,
        // Adicionando a foto opcional
        imagem: hasPhoto
          ? `https://picsum.photos/seed/${faker.string.uuid()}/400/300`
          : null,
      },
    });
    pedidos.push(pedido);
  }
  console.log(`✅ ${pedidos.length} pedidos criados.`);

  // 4. Criar Interesses e Notificações (simulando interação)
  // E escolher um ajudante para alguns pedidos
  console.log('❤️  Simulando interações (interesses e notificações)...');
  let interacoesCriadas = 0;
  for (const pedido of pedidos) {
    // Simular interesse de 0 a 3 usuários por pedido
    const numInteresses = Math.floor(Math.random() * 4);
    const usersInteressados = faker.helpers.shuffle(users).slice(0, numInteresses);

    for (const userInteressado of usersInteressados) {
      // O autor não pode se interessar pelo próprio pedido
      if (userInteressado.id === pedido.authorId) {
        continue;
      }

      // Verificar se já não existe um interesse
      const interesseExistente = await prisma.interesse.findUnique({
        where: {
          pedidoId_userId: {
            userId: userInteressado.id,
            pedidoId: pedido.id,
          },
        },
      });

      if (!interesseExistente) {
        // Cria o interesse
        await prisma.interesse.create({
          data: {
            userId: userInteressado.id,
            pedidoId: pedido.id,
          },
        });

        // Cria a notificação para o autor do pedido
        await prisma.notificacao.create({
          data: {
            tipo: 'INTERESSE_RECEBIDO',
            mensagem: `${userInteressado.name} demonstrou interesse no seu pedido "${pedido.titulo}".`,
            userId: pedido.authorId, // Notificação para o autor do pedido
            remetenteId: userInteressado.id, // Quem demonstrou interesse
            pedidoId: pedido.id,
          },
        });
        interacoesCriadas++;
      }
    }

    // 25% de chance de um pedido com interessados já ter um ajudante escolhido
    if (usersInteressados.length > 0 && Math.random() < 0.25) {
      const ajudanteEscolhido = usersInteressados[0]; // Escolhe o primeiro interessado como ajudante
      if (ajudanteEscolhido.id !== pedido.authorId) {
        await prisma.pedido.update({
          where: { id: pedido.id },
          data: {
            ajudanteId: ajudanteEscolhido.id,
            status: 'EM_ANDAMENTO',
          },
        });
        console.log(`  -> 🙋‍♂️ Usuário ${ajudanteEscolhido.name} escolhido para o pedido "${pedido.titulo.substring(0, 20)}..."`);

        // Cria um chat e algumas mensagens de exemplo
        const [p1, p2] = [pedido.authorId, ajudanteEscolhido.id].sort();
        const chat = await prisma.chat.create({
          data: {
            pedidoId: pedido.id,
            participante1Id: p1,
            participante2Id: p2,
          },
        });

        await prisma.mensagem.createMany({
          data: [
            {
              chatId: chat.id,
              senderId: pedido.authorId,
              conteudo: `Olá ${ajudanteEscolhido.name}, obrigado por se oferecer para ajudar!`,
            },
            { chatId: chat.id, senderId: ajudanteEscolhido.id, conteudo: `De nada! Quando podemos combinar?` },
            { chatId: chat.id, senderId: pedido.authorId, conteudo: `Pode ser amanhã à tarde?` },
          ],
        });
        console.log(`    -> 💬 Chat iniciado para o pedido "${pedido.titulo.substring(0, 20)}..."`);
      }
    }
  }
  console.log(`✅ ${interacoesCriadas} interações criadas.`);

  // 5. Finalizar alguns pedidos e criar avaliações
  console.log('⭐ Finalizando pedidos e criando avaliações...');
  const pedidosEmAndamento = await prisma.pedido.findMany({
    where: { status: 'EM_ANDAMENTO' },
  });

  let avaliacoesCriadas = 0;
  for (const pedido of pedidosEmAndamento) {
    // 50% de chance de finalizar e avaliar
    if (Math.random() < 0.5 && pedido.ajudanteId) {
      await prisma.pedido.update({
        where: { id: pedido.id },
        data: { status: 'FINALIZADO' },
      });

      await prisma.avaliacao.create({
        data: {
          pedidoId: pedido.id,
          avaliadorId: pedido.authorId,
          avaliadoId: pedido.ajudanteId,
          nota: faker.number.int({ min: 4, max: 5 }), // Gerar notas altas
          comentario: faker.lorem.sentence(),
        },
      });
      avaliacoesCriadas++;
      console.log(`  -> 🏁 Pedido "${pedido.titulo.substring(0, 20)}..." finalizado e avaliado.`);
    }
  }
  if (avaliacoesCriadas > 0) {
    console.log(`✅ ${avaliacoesCriadas} avaliações criadas.`);
  }

  console.log('\n' + '-'.repeat(50));
  console.log('🎉 Seeding finalizado com sucesso! 🎉');
  console.log('\n' + '-'.repeat(50));
  console.log('🔑 Credenciais do usuário de teste:');
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Senha: ${TEST_USER_PASSWORD}`);
  console.log('-'.repeat(50) + '\n');
}

main()
  .catch((e) => {
    console.error('❌ Ocorreu um erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
