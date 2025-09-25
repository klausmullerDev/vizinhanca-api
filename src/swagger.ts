import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Vizinhança Solidária',
      version: '1.0.0',
      description: 'API para conectar vizinhos que precisam de ajuda com aqueles que podem ajudar.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      schemas: {
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            avatar: { type: 'string', nullable: true },
            cpf: { type: 'string', nullable: true },
            telefone: { type: 'string', nullable: true },
            dataDeNascimento: { type: 'string', format: 'date-time', nullable: true },
            sexo: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            endereco: { $ref: '#/components/schemas/Endereco' }
          }
        },
        UserRegister: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            cpf: { type: 'string' },
            telefone: { type: 'string' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string' }
          }
        },
        Endereco: {
          type: 'object',
          properties: {
            rua: { type: 'string' },
            numero: { type: 'string' },
            complemento: { type: 'string', nullable: true },
            bairro: { type: 'string' },
            cidade: { type: 'string' },
            estado: { type: 'string' },
            cep: { type: 'string' }
          }
        },
        Pedido: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            titulo: { type: 'string' },
            descricao: { type: 'string' },
            imagem: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['ABERTO', 'FINALIZADO', 'CANCELADO'] },
            createdAt: { type: 'string', format: 'date-time' },
            author: { $ref: '#/components/schemas/User' }
          }
        },
        Notificacao: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tipo: { type: 'string', enum: ['INTERESSE_RECEBIDO', 'PEDIDO_ACEITO'] },
            mensagem: { type: 'string' },
            lida: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            pedido: { $ref: '#/components/schemas/Pedido' },
            remetente: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string', format: 'uuid' }, name: { type: 'string' }, avatar: { type: 'string', nullable: true }
              }
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
  },
  apis: ['./src/routes/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
