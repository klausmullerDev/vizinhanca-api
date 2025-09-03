// src/swagger.ts

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Vizinhança Solidária',
      version: '1.0.0',
      description: 'Documentação da API para o projeto Vizinhança Solidária, uma plataforma para conectar vizinhos.',
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
            id: {
              type: 'string',
              description: 'ID único do usuário (UUID)',
              example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
            },
            name: {
              type: 'string',
              description: 'Nome do usuário',
              example: 'João da Silva'
            },
            email: {
              type: 'string',
              description: 'Email do usuário',
              example: 'joao.silva@example.com'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do usuário'
            }
          }
        },
        UserRegister: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'Nome do usuário',
              example: 'João da Silva'
            },
            email: {
              type: 'string',
              description: 'Email para cadastro',
              example: 'joao.silva@example.com'
            },
            password: {
              type: 'string',
              description: 'Senha do usuário (mínimo 8 caracteres)',
              example: 'senhaForte123'
            }
          }
        }
      }
    }
  },

  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;