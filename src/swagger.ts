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
      // --- Modelos de Dados (Schemas) ---
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        UserRegister: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'João da Silva' },
            email: { type: 'string', format: 'email', example: 'joao@example.com' },
            password: { type: 'string', example: 'senhaForte123' },
          },
        },
        LoginSuccessResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            cpf: { type: 'string', nullable: true, example: '123.456.789-00' },
            telefone: { type: 'string', nullable: true, example: '11987654321' },
            dataDeNascimento: { type: 'string', format: 'date-time', nullable: true },
            sexo: { type: 'string', nullable: true, example: 'Masculino' },
            createdAt: { type: 'string', format: 'date-time' },
            isProfileComplete: { type: 'boolean' },
            endereco: {
              type: 'object',
              nullable: true,
              properties: { rua: { type: 'string' }, numero: { type: 'string' }, bairro: { type: 'string' }, cidade: { type: 'string' }, estado: { type: 'string' }, cep: { type: 'string' } }
            }
          }
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            cpf: { type: 'string', example: '123.456.789-00' },
            telefone: { type: 'string', example: '11987654321' },
            dataDeNascimento: { type: 'string', format: 'date-time', example: '1990-05-25T00:00:00.000Z' },
            sexo: { type: 'string', example: 'Feminino' },
            endereco: {
              type: 'object',
              properties: { rua: { type: 'string', example: 'Rua dos Devs' }, numero: { type: 'string', example: '101' }, bairro: { type: 'string', example: 'Código Fonte' }, cidade: { type: 'string', example: 'São Paulo' }, estado: { type: 'string', example: 'SP' }, cep: { type: 'string', example: '01001-000' } }
            }
          }
        },
      },
      // --- Esquema de Segurança (Autenticação com Token) ---
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    // --- Definição dos Endpoints ---
    paths: {
      // --- Endpoints de Autenticação e Perfil ---
      '/register': {
        post: {
          tags: ['Autenticação e Perfil'],
          summary: 'Registra um novo utilizador',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UserRegister' } } } },
          responses: {
            '201': { description: 'Utilizador criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
            '409': { description: 'Email já em uso' }, '400': { description: 'Dados inválidos' },
          },
        },
      },
      '/login': {
        post: {
          tags: ['Autenticação e Perfil'],
          summary: 'Autentica um utilizador e retorna um token JWT',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } } } } },
          responses: {
            '200': { description: 'Login bem-sucedido', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginSuccessResponse' } } } },
            '401': { description: 'Credenciais inválidas' },
          },
        },
      },
      '/profile': {
        get: {
          tags: ['Autenticação e Perfil'],
          summary: 'Busca o perfil completo do utilizador autenticado',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Perfil do utilizador', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserProfile' } } } },
            '401': { description: 'Não autorizado' },
            '404': { description: 'Utilizador não encontrado' },
          }
        },
        put: {
          tags: ['Autenticação e Perfil'],
          summary: 'Atualiza o perfil do utilizador autenticado',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } } } },
          responses: {
            '200': { description: 'Perfil atualizado com sucesso', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
            '400': { description: 'Dados inválidos' },
            '401': { description: 'Não autorizado' },
          }
        }
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;

