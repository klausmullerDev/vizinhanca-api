import { PrismaClient, User, Pedido, Categoria } from '@prisma/client';
import bcrypt from 'bcrypt';
import { pt_BR, faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// --- Configurações ---
const TOTAL_RANDOM_USERS = 9; // 9 aleatórios + 2 de teste = 11 total
const TOTAL_PEDIDOS = 20;
const PEDIDOS_POR_USUARIO_TESTE = 5;
const TEST_USER_PASSWORD = 'password123';
// ---------------------

async function main() {
  console.log('🚀 Iniciando o processo de seeding...');
  await cleanDatabase();
  const users = await createUsers();
  const categorias = await createCategorias();
  await createPedidos(users, categorias);
  await createInteractionsAndChats(users, categorias);

  printSummary(users[0], users[1]);
}

async function cleanDatabase() {
  console.log('🧹 Limpando o banco de dados...');
  await prisma.mensagem.deleteMany({});
  await prisma.chat.deleteMany({});
  await prisma.notificacao.deleteMany({});
  await prisma.interesse.deleteMany({});
  await prisma.avaliacao.deleteMany({});
  await prisma.pedido.deleteMany({});
  await prisma.categoria.deleteMany({});
  await prisma.endereco.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Banco de dados limpo.');
}

async function createUsers(): Promise<User[]> {
  console.log(`👤 Criando ${TOTAL_RANDOM_USERS + 2} usuários...`);
  const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 10);

  const users = [];

  // Criar usuário de teste
  const testUser = await prisma.user.create({
    data: {
      name: 'Usuário de Teste',
      email: 'test@example.com',
      password: hashedPassword,
      telefone: faker.string.numeric(11),
      cpf: faker.string.numeric({ length: 11, allowLeadingZeros: true }),
      avatar: `https://i.pravatar.cc/150?u=test@example.com`,
      endereco: {
        create: {
          rua: faker.location.street(),
          numero: faker.location.buildingNumber(),
          bairro: faker.location.county(),
          cidade: faker.location.city(),
          estado: faker.location.state({ abbreviated: true }),
          cep: faker.location.zipCode(),
        },
      },
    },
  });
  users.push(testUser);

  // Criar segundo usuário de teste
  const testUser2 = await prisma.user.create({
    data: {
      name: 'Usuário de Teste 2',
      email: 'test2@example.com',
      password: hashedPassword,
      telefone: faker.string.numeric(11),
      cpf: faker.string.numeric({ length: 11, allowLeadingZeros: true }),
      avatar: `https://i.pravatar.cc/150?u=test2@example.com`,
      endereco: {
        create: {
          rua: faker.location.street(),
          numero: faker.location.buildingNumber(),
          bairro: faker.location.county(),
          cidade: faker.location.city(),
          estado: faker.location.state({ abbreviated: true }),
          cep: faker.location.zipCode(),
        },
      },
    },
  });
  users.push(testUser2);

  for (let i = 0; i < TOTAL_RANDOM_USERS; i++) {
    const name = faker.person.fullName();
    const email = faker.internet.email({ firstName: name.split(' ')[0] });
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        telefone: faker.string.numeric(11),
        cpf: faker.string.numeric({ length: 11, allowLeadingZeros: true }),
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        endereco: {
          create: {
            rua: faker.location.street(),
            numero: faker.location.buildingNumber(),
            bairro: faker.location.county(),
            cidade: faker.location.city(),
            estado: faker.location.state({ abbreviated: true }),
            cep: faker.location.zipCode(),
          },
        },
      },
    });
    users.push(user);
  }
  console.log(`✅ ${users.length} usuários criados.`);
  return users;
}

async function createCategorias(): Promise<Categoria[]> {
  console.log('📚 Criando categorias...');
  const categoriasData = [
    { name: 'Pequenos Reparos', iconUrl: 'https://img.icons8.com/ios/50/maintenance.png' },
    { name: 'Transporte/Carona', iconUrl: 'https://img.icons8.com/ios/50/car.png' },
    { name: 'Cuidados com Pets', iconUrl: 'https://img.icons8.com/ios/50/pet-commands-train.png' },
    { name: 'Doações', iconUrl: 'https://img.icons8.com/ios/50/donate.png' },
    { name: 'Aulas/Conhecimento', iconUrl: 'https://img.icons8.com/ios/50/learning.png' },
    { name: 'Ajuda com Tecnologia', iconUrl: 'https://img.icons8.com/ios/50/laptop-settings.png' },
    { name: 'Eventos Comunitários', iconUrl: 'https://img.icons8.com/ios/50/confetti.png' },
    { name: 'Outros Favores', iconUrl: 'https://img.icons8.com/ios/50/generic-sorting.png' },
  ];

  const categorias = [];
  for (const cat of categoriasData) {
    categorias.push(await prisma.categoria.create({ data: cat }));
  }

  console.log(`✅ ${categorias.length} categorias criadas.`);
  return categorias;
}

async function createPedidos(users: User[], categorias: Categoria[]) {
  console.log(`📝 Criando ${TOTAL_PEDIDOS} pedidos (feeds)...`);
  const pedidos = [];
  const testUser = users[0];

  // Cenários específicos para o usuário de teste
  // 1. Pedido FINALIZADO e AVALIADO (feito pelo testUser)
  pedidos.push(
    await prisma.pedido.create({
      data: {
        titulo: 'Preciso de ajuda para montar um móvel (Finalizado)',
        descricao: 'Comprei um guarda-roupa e preciso de ajuda para montar. Já tenho as ferramentas!',
        authorId: testUser.id,
        status: 'FINALIZADO',
        categoriaId: categorias.find(c => c.name === 'Pequenos Reparos')!.id,
        imagem: `https://picsum.photos/seed/${faker.string.uuid()}/400/300`,
      },
    }),
  );

  // 2. Pedido EM ANDAMENTO (feito pelo testUser)
  pedidos.push(
    await prisma.pedido.create({
      data: {
        titulo: 'Ajuda para passear com meu cachorro (Em Andamento)',
        descricao: 'Vou viajar no fim de semana e preciso que alguém passeie com meu golden retriever.',
        authorId: testUser.id,
        status: 'EM_ANDAMENTO',
        categoriaId: categorias.find(c => c.name === 'Cuidados com Pets')!.id,
      },
    }),
  );

  // 3. Pedido ABERTO com interessados (feito pelo testUser)
  pedidos.push(
    await prisma.pedido.create({
      data: {
        titulo: 'Doação de roupas de inverno (Aberto)',
        descricao: 'Tenho algumas roupas de inverno em bom estado para doar.',
        authorId: testUser.id,
        status: 'ABERTO',
        categoriaId: categorias.find(c => c.name === 'Doações')!.id,
        imagem: `https://picsum.photos/seed/${faker.string.uuid()}/400/300`,
      },
    }),
  );

  // 4. Pedido CANCELADO (feito pelo testUser)
  pedidos.push(
    await prisma.pedido.create({
      data: {
        titulo: 'Carona para o aeroporto (Cancelado)',
        descricao: 'Preciso de uma carona para o aeroporto na sexta-feira. (Pedido foi cancelado)',
        authorId: testUser.id,
        status: 'CANCELADO',
        categoriaId: categorias.find(c => c.name === 'Transporte/Carona')!.id,
      },
    }),
  );

  // 5. Pedido ABERTO sem interessados (feito pelo testUser)
  pedidos.push(
    await prisma.pedido.create({
      data: {
        titulo: 'Alguém tem uma furadeira para emprestar?',
        descricao: 'Preciso fazer um furo na parede e não tenho furadeira. É rápido!',
        authorId: testUser.id,
        status: 'ABERTO',
        categoriaId: categorias.find(c => c.name === 'Pequenos Reparos')!.id,
      },
    }),
  );

  // Cria o restante dos pedidos aleatórios
  for (let i = 0; i < TOTAL_PEDIDOS; i++) {
    // Pega um usuário aleatório que não seja os de teste (índices 2 em diante)
    const randomUser = users[faker.number.int({ min: 2, max: users.length - 1 })];
    const pedido = await prisma.pedido.create({
      data: {
        titulo: faker.lorem.sentence(5),
        descricao: faker.lorem.paragraph(2),
        authorId: randomUser.id,
        categoriaId: faker.helpers.arrayElement(categorias).id,
        status: faker.helpers.arrayElement(['ABERTO', 'ABERTO', 'ABERTO', 'EM_ANDAMENTO', 'FINALIZADO']),
        imagem: Math.random() > 0.5 ? `https://picsum.photos/seed/${faker.string.uuid()}/400/300` : null,
      },
    });
    pedidos.push(pedido);
  }
  console.log(`✅ ${pedidos.length} pedidos criados.`);
}

async function createInteractionsAndChats(users: User[], categorias: Categoria[]) {
  console.log('❤️  Simulando interações, chats e avaliações...');
  const testUser = users[0];
  const testUser2 = users[1];
  const otherUsers = users.slice(2);
  
  // Usaremos uma cópia mutável para remover os pedidos já utilizados
  let pedidosDisponiveis = await prisma.pedido.findMany();

  // Cenário 1: Pedido do testUser que foi FINALIZADO.
  // Um usuário aleatório (ajudante) demonstrou interesse, foi escolhido, e o pedido foi finalizado e avaliado.
  const pedidoFinalizado = pedidosDisponiveis.find(p => p.authorId === testUser.id && p.status === 'FINALIZADO')!;
  const ajudanteFinalizado = faker.helpers.arrayElement(otherUsers);
  await createInterest(pedidoFinalizado, ajudanteFinalizado);
  await prisma.pedido.update({ where: { id: pedidoFinalizado.id }, data: { ajudanteId: ajudanteFinalizado.id } });
  await createChat(pedidoFinalizado, testUser, ajudanteFinalizado);
  await createAvaliacao(pedidoFinalizado, testUser, ajudanteFinalizado);
  pedidosDisponiveis = pedidosDisponiveis.filter(p => p.id !== pedidoFinalizado.id);

  // Cenário 2: Pedido do testUser que está EM ANDAMENTO.
  // Um usuário aleatório (ajudante) demonstrou interesse, foi escolhido e um chat foi iniciado.
  const pedidoEmAndamento = pedidosDisponiveis.find(p => p.authorId === testUser.id && p.status === 'EM_ANDAMENTO')!;
  const ajudanteEmAndamento = faker.helpers.arrayElement(otherUsers.filter(u => u.id !== ajudanteFinalizado.id));
  await createInterest(pedidoEmAndamento, ajudanteEmAndamento);
  await prisma.pedido.update({ where: { id: pedidoEmAndamento.id }, data: { ajudanteId: ajudanteEmAndamento.id } });
  await createChat(pedidoEmAndamento, testUser, ajudanteEmAndamento);
  await NotificacaoService.criar({
    userId: ajudanteEmAndamento.id,
    tipo: 'AJUDANTE_ESCOLHIDO',
    mensagem: `Você foi escolhido para ajudar no pedido "${pedidoEmAndamento.titulo}"!`,
    pedidoId: pedidoEmAndamento.id,
    remetenteId: testUser.id,
  });
  pedidosDisponiveis = pedidosDisponiveis.filter(p => p.id !== pedidoEmAndamento.id);

  // Cenário 3: Pedido do testUser que está ABERTO.
  // Vários usuários demonstram interesse, mas ninguém foi escolhido ainda.
  const pedidoAberto = pedidosDisponiveis.find(p => p.authorId === testUser.id && p.status === 'ABERTO' && p.titulo.includes('Doação'))!;
  const interessadosPedidoAberto = faker.helpers.arrayElements(otherUsers, 3);
  for (const interessado of interessadosPedidoAberto) {
    await createInterest(pedidoAberto, interessado);
  }
  pedidosDisponiveis = pedidosDisponiveis.filter(p => p.id !== pedidoAberto.id);

  // Cenário 4: Pedido de outro usuário onde o testUser é o AJUDANTE.
  const pedidoParaAjudar = pedidosDisponiveis.find(p => p.authorId !== testUser.id && p.status === 'ABERTO')!;
  await createInterest(pedidoParaAjudar, testUser);
  await prisma.pedido.update({ where: { id: pedidoParaAjudar.id }, data: { ajudanteId: testUser.id, status: 'EM_ANDAMENTO' } });
  const autorPedidoParaAjudar = users.find(u => u.id === pedidoParaAjudar.authorId)!;
  await createChat(pedidoParaAjudar, autorPedidoParaAjudar, testUser);
  await NotificacaoService.criar({
    userId: testUser.id,
    tipo: 'AJUDANTE_ESCOLHIDO',
    mensagem: `Você foi escolhido para ajudar no pedido "${pedidoParaAjudar.titulo}"!`,
    pedidoId: pedidoParaAjudar.id,
    remetenteId: autorPedidoParaAjudar.id,
  });
  pedidosDisponiveis = pedidosDisponiveis.filter(p => p.id !== pedidoParaAjudar.id);

  // Cenário 4.1: Mais pedidos onde o testUser é o ajudante e é avaliado.
  const outrosPedidosParaAjudar = pedidosDisponiveis.filter(p => p.authorId !== testUser.id && p.status === 'ABERTO').slice(0, 2);
  for (const pedido of outrosPedidosParaAjudar) {
    const autor = users.find(u => u.id === pedido.authorId)!;
    await createInterest(pedido, testUser);
    await prisma.pedido.update({ where: { id: pedido.id }, data: { ajudanteId: testUser.id, status: 'FINALIZADO' } });
    await createChat(pedido, autor, testUser);
    await createAvaliacao(pedido, autor, testUser, {
      nota: faker.number.int({ min: 3, max: 5 }),
      comentario: faker.lorem.sentence({ min: 5, max: 15 })
    });
    console.log(`  -> ⭐ testUser avaliado por ${autor.name.split(' ')[0]} no pedido "${pedido.titulo.substring(0, 20)}..."`);
    pedidosDisponiveis = pedidosDisponiveis.filter(p => p.id !== pedido.id);
  }


  // Cenário 5: Pedido de outro usuário onde o testUser demonstra interesse mas NÃO é escolhido.
  const pedidoNaoEscolhido = pedidosDisponiveis.find(p => p.authorId !== testUser.id && p.status === 'ABERTO')!;
  await createInterest(pedidoNaoEscolhido, testUser); // testUser se interessa
  const outroInteressado = faker.helpers.arrayElement(otherUsers.filter(u => u.id !== testUser.id));
  await createInterest(pedidoNaoEscolhido, outroInteressado); // Outro usuário também se interessa
  pedidosDisponiveis = pedidosDisponiveis.filter(p => p.id !== pedidoNaoEscolhido.id);

  // Cenário 6: Notificar sobre pedido cancelado
  const pedidoCancelado = pedidosDisponiveis.find(p => p.status === 'CANCELADO')!;
  const ajudanteDoCancelado = faker.helpers.arrayElement(otherUsers);
  await createInterest(pedidoCancelado, ajudanteDoCancelado);
  await prisma.pedido.update({ where: { id: pedidoCancelado.id }, data: { ajudanteId: ajudanteDoCancelado.id } });
  await NotificacaoService.criar({
    userId: ajudanteDoCancelado.id,
    tipo: 'PEDIDO_CANCELADO',
    mensagem: `O pedido "${pedidoCancelado.titulo}" foi cancelado pelo autor.`,
    pedidoId: pedidoCancelado.id,
    remetenteId: pedidoCancelado.authorId,
  });

  // Cenário 7: Interação direta entre os dois usuários de teste.
  // testUser2 cria um pedido, testUser se interessa, é escolhido e avaliado.
  const pedidoTestUser2 = await prisma.pedido.create({
    data: {
      titulo: 'Pedido do Usuário de Teste 2',
      descricao: 'Este é um pedido criado pelo segundo usuário de teste para ser ajudado pelo primeiro.',
      authorId: testUser2.id,
      status: 'ABERTO',
      categoriaId: categorias.find(c => c.name === 'Ajuda com Tecnologia')!.id,
    },
  });
  await createInterest(pedidoTestUser2, testUser);
  await prisma.pedido.update({ where: { id: pedidoTestUser2.id }, data: { ajudanteId: testUser.id, status: 'FINALIZADO' } });
  await createChat(pedidoTestUser2, testUser2, testUser);
  await createAvaliacao(pedidoTestUser2, testUser2, testUser);
  console.log(`  -> ⭐ testUser2 avaliou testUser no pedido "${pedidoTestUser2.titulo.substring(0, 20)}..."`);
  pedidosDisponiveis = pedidosDisponiveis.filter(p => p.id !== pedidoTestUser2.id);

  console.log('✅ Interações, chats e avaliações simulados com sucesso.');
}

async function createInterest(pedido: Pedido, user: User) {
  await prisma.interesse.create({ data: { pedidoId: pedido.id, userId: user.id } });
  await NotificacaoService.criar({
    userId: pedido.authorId,
    tipo: 'INTERESSE_RECEBIDO',
    mensagem: `${user.name} demonstrou interesse no seu pedido "${pedido.titulo}".`,
    pedidoId: pedido.id,
    remetenteId: user.id,
  });
}

async function createChat(pedido: Pedido, user1: User, user2: User) {
  const [p1, p2] = [user1.id, user2.id].sort();
  const chat = await prisma.chat.create({
    data: {
      pedidoId: pedido.id,
      participante1Id: p1,
      participante2Id: p2,
    },
  });

  await prisma.mensagem.createMany({
    data: [
      { chatId: chat.id, senderId: user1.id, conteudo: `Olá ${user2.name}, obrigado por se oferecer para ajudar!` },
      { chatId: chat.id, senderId: user2.id, conteudo: `De nada, ${user1.name}! Quando podemos combinar?` },
      { chatId: chat.id, senderId: user1.id, conteudo: `Pode ser amanhã à tarde?` },
    ],
  });
  console.log(`  -> 💬 Chat criado para o pedido "${pedido.titulo.substring(0, 20)}..."`);
}

async function createAvaliacao(pedido: Pedido, avaliador: User, avaliado: User, override: { nota?: number, comentario?: string } = {}) {
  await prisma.avaliacao.create({
    data: {
      pedidoId: pedido.id,
      avaliadorId: avaliador.id,
      avaliadoId: avaliado.id,
      nota: override.nota ?? faker.number.int({ min: 4, max: 5 }),
      comentario: override.comentario ?? faker.lorem.sentence(),
    },
  });
  await NotificacaoService.criar({
    userId: avaliado.id,
    tipo: 'PEDIDO_FINALIZADO', // Reutilizando, poderia ser AVALIACAO_RECEBIDA
    mensagem: `O pedido "${pedido.titulo}" foi finalizado e você recebeu uma avaliação!`,
    pedidoId: pedido.id,
    remetenteId: avaliador.id,
  });
  console.log(`  -> ⭐ Pedido "${pedido.titulo.substring(0, 20)}..." avaliado.`);
}

function printSummary(testUser: User, testUser2: User) {
  console.log('\n' + '-'.repeat(50));
  console.log('🎉 Seeding finalizado com sucesso! 🎉');
  console.log('\n' + '-'.repeat(50));
  console.log('🔑 Credenciais do Usuário de Teste 1:');
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Senha: ${TEST_USER_PASSWORD}`);
  console.log('-'.repeat(50));
  console.log('🔑 Credenciais do Usuário de Teste 2:');
  console.log(`   Email: ${testUser2.email}`);
  console.log(`   Senha: ${TEST_USER_PASSWORD}`);
  console.log('-'.repeat(50) + '\n');
}

// --- Importando o serviço de notificação para o seed ---
const NotificacaoService = {
  criar: async (data: any) => {
    return prisma.notificacao.create({
      data: { ...data, lida: false },
    });
  },
};

main()
  .catch((e) => {
    console.error('❌ Ocorreu um erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
