// src/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Vizinhança Solidária',
      version: '1.0.0',
      description: 'Documentação da API para o projeto Vizinhança Solidária.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
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
      },
    },
    
    paths: {
      '/users/register': {
        post: {
          tags: ['Users'],
          summary: 'Registra um novo usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserRegister' } },
            },
          },
          responses: {
            '201': { description: 'Usuário criado com sucesso', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
            '409': { description: 'Conflito, o email já está em uso' },
            '400': { description: 'Dados inválidos fornecidos' },
          },
        },
      },
      '/users/login': {
        post: {
          tags: ['Users'],
          summary: 'Autentica um usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'joao@example.com' },
                    password: { type: 'string', example: 'senhaForte123' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login bem-sucedido', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
            '401': { description: 'Não autorizado, credenciais inválidas' },
          },
        },
      },
    },
  },
  
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;