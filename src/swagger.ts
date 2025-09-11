import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Vizinhança Solidária',
      version: '1.0.0',
      description: 'Documentação da API para o projeto Vizinhança Solidária. Utilize o botão "Authorize" e insira o seu token JWT no formato "Bearer {seu_token}" para testar os endpoints protegidos.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      schemas: {
        // --- Schemas de Utilizador ---
        User: {
          type: 'object',
          properties: { id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' }, createdAt: { type: 'string' } },
        },
        UserRegister: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } },
        },
        LoginSuccessResponse: {
          type: 'object',
          properties: { user: { $ref: '#/components/schemas/User' }, token: { type: 'string' } },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }, name: { type: 'string' }, email: { type: 'string', format: 'email' }, cpf: { type: 'string', nullable: true }, telefone: { type: 'string', nullable: true }, dataDeNascimento: { type: 'string', format: 'date-time', nullable: true }, sexo: { type: 'string', nullable: true }, createdAt: { type: 'string', format: 'date-time' }, isProfileComplete: { type: 'boolean' }, endereco: { type: 'object', nullable: true, properties: { rua: { type: 'string' }, numero: { type: 'string' }, bairro: { type: 'string' }, cidade: { type: 'string' }, estado: { type: 'string' }, cep: { type: 'string' } } }
          }
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            cpf: { type: 'string' }, telefone: { type: 'string' }, dataDeNascimento: { type: 'string', format: 'date-time' }, sexo: { type: 'string' }, endereco: { type: 'object', properties: { rua: { type: 'string' }, numero: { type: 'string' }, bairro: { type: 'string' }, cidade: { type: 'string' }, estado: { type: 'string' }, cep: { type: 'string' } } }
          }
        },
        // --- Schemas para Redefinição de Senha ---
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'utilizador@exemplo.com' }
          }
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['password'],
          properties: {
            password: { type: 'string', example: 'novaSenhaSuperSegura123' }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        // --- Schemas para Pedidos ---
        Pedido: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }, titulo: { type: 'string' }, descricao: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' }, author: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } }
          }
        },
        CreatePedidoRequest: {
          type: 'object',
          required: ['titulo', 'descricao'],
          properties: {
            titulo: { type: 'string', example: 'Preciso de ajuda com compras' },
            descricao: { type: 'string', example: 'Sou do grupo de risco e preciso que alguém me ajude a ir ao supermercado esta semana.' },
          }
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    paths: {
      // --- Endpoints de Autenticação e Perfil ---
      '/users/register': {
        post: {
          tags: ['Autenticação e Perfil'],
          summary: 'Registra um novo utilizador',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UserRegister' } } } },
          responses: { '201': { description: 'Utilizador criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, '409': { description: 'Email já em uso' }, '400': { description: 'Dados inválidos' } },
        },
      },
      '/users/login': {
        post: {
          tags: ['Autenticação e Perfil'],
          summary: 'Autentica um utilizador e retorna um token JWT',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
          responses: { '200': { description: 'Login bem-sucedido', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginSuccessResponse' } } } }, '401': { description: 'Credenciais inválidas' } },
        },
      },
      '/users/profile': {
        get: {
          tags: ['Autenticação e Perfil'],
          summary: 'Busca o perfil completo do utilizador autenticado',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Perfil do utilizador', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserProfile' } } } }, '401': { description: 'Não autorizado' }, '404': { description: 'Utilizador não encontrado' } }
        },
        put: {
          tags: ['Autenticação e Perfil'],
          summary: 'Atualiza o perfil do utilizador autenticado',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } } } },
          responses: { '200': { description: 'Perfil atualizado com sucesso', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, '400': { description: 'Dados inválidos' }, '401': { description: 'Não autorizado' } }
        }
      },
      // --- NOVOS ENDPOINTS PARA REDEFINIÇÃO DE SENHA ---
      '/users/forgot-password': {
        post: {
          tags: ['Autenticação e Perfil'],
          summary: 'Inicia o processo de redefinição de senha',
          description: 'Envia um e-mail com um link de redefinição para o utilizador, se o e-mail existir no sistema.',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } } },
          responses: {
            '200': { description: 'Resposta de sucesso genérica por razões de segurança.', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
          }
        }
      },
      '/users/reset-password/{token}': {
        post: {
          tags: ['Autenticação e Perfil'],
          summary: 'Redefine a senha utilizando um token válido',
          parameters: [
            {
              in: 'path',
              name: 'token',
              required: true,
              schema: { type: 'string' },
              description: 'O token de redefinição recebido por e-mail.'
            }
          ],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } } },
          responses: {
            '200': { description: 'Senha redefinida com sucesso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            '400': { description: 'Token inválido ou expirado, ou nova senha não fornecida.' }
          }
        }
      },
      // --- Endpoints de Pedidos ---
      '/pedidos': {
        get: {
          tags: ['Pedidos'],
          summary: 'Lista todos os pedidos de ajuda',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Lista de pedidos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Pedido' } } } } }, '401': { description: 'Não autorizado' } },
        },
        post: {
          tags: ['Pedidos'],
          summary: 'Cria um novo pedido de ajuda',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePedidoRequest' } } } },
          responses: { '201': { description: 'Pedido criado com sucesso', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pedido' } } } }, '400': { description: 'Dados inválidos' }, '401': { description: 'Não autorizado' } },
        }
      },
      // --- NOVO ENDPOINT DE INTERESSE ---
      '/pedidos/{id}/interesse': {
        post: {
          tags: ['Pedidos'],
          summary: 'Manifesta interesse em ajudar em um pedido específico',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'O ID do pedido no qual o utilizador quer manifestar interesse.'
            }
          ],
          responses: {
            '201': { description: 'Interesse registado com sucesso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            '400': { description: 'Pedido não encontrado, ou o utilizador já manifestou interesse, ou está a tentar manifestar interesse no seu próprio pedido.' },
            '401': { description: 'Não autorizado.' }
          }
        }
      }
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
