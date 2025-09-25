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
    paths: {
      '/users/register': {
        post: {
          tags: ['Usuários'],
          summary: 'Registra um novo usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserRegister' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Usuário criado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            },
            '400': { description: 'Dados inválidos' },
            '409': { description: 'Email já existe' }
          }
        }
      },
      '/users/login': {
        post: {
          tags: ['Usuários'],
          summary: 'Realiza login do usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login realizado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' }
                }
              }
            },
            '401': { description: 'Credenciais inválidas' }
          }
        }
      },
      '/users': {
        get: {
          tags: ['Usuários'],
          summary: 'Lista todos os usuários',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Lista de usuários',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } }
            }
          }
        }
      },
      '/users/profile': {
        get: {
          tags: ['Usuários'],
          summary: 'Retorna o perfil do usuário logado',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Perfil do usuário',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            },
            '401': { description: 'Não autorizado' }
          }
        },
        put: {
          tags: ['Usuários'],
          summary: 'Atualiza o perfil do usuário',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object', 
                  properties: { 
                    name: { type: 'string' }, 
                    cpf: { type: 'string' }, 
                    telefone: { type: 'string' }, 
                    dataDeNascimento: { type: 'string', format: 'date' }, 
                    sexo: { type: 'string' }, 
                    'endereco[rua]': { type: 'string' },
                    'endereco[numero]': { type: 'string' },
                    'endereco[complemento]': { type: 'string' },
                    'endereco[bairro]': { type: 'string' },
                    'endereco[cidade]': { type: 'string' },
                    'endereco[estado]': { type: 'string' },
                    'endereco[cep]': { type: 'string' },
                    avatar: { type: 'string', format: 'binary' } 
                  } 
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Perfil atualizado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            },
            '400': { description: 'Dados inválidos' },
            '401': { description: 'Não autorizado' }
          }
        }
      },
      '/users/{id}': {
        get: {
          tags: ['Usuários'],
          summary: 'Busca um usuário por ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '200': {
              description: 'Dados do usuário',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
            },
            '404': { description: 'Usuário não encontrado' }
          }
        },
        delete: {
          tags: ['Usuários (Admin)'],
          summary: 'Deleta um usuário por ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '204': { description: 'Usuário deletado com sucesso' },
            '404': { description: 'Usuário não encontrado' }
          }
        }
      },
      '/users/{id}/pedidos': {
        get: {
          tags: ['Usuários'],
          summary: 'Busca todos os pedidos de um usuário',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '200': { description: 'Lista de pedidos do usuário', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Pedido' } } } } },
            '404': { description: 'Usuário não encontrado' }
          }
        }
      },
      '/users/forgot-password': {
        post: {
          tags: ['Usuários'],
          summary: 'Solicita redefinição de senha',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', format: 'email' }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Email de redefinição enviado' },
            '404': { description: 'Email não encontrado' }
          }
        }
      },
      '/users/reset-password/{token}': {
        post: {
          tags: ['Usuários'],
          summary: 'Redefine a senha usando token',
          parameters: [
            {
              in: 'path',
              name: 'token',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['password'],
                  properties: {
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Senha redefinida com sucesso' },
            '400': { description: 'Token inválido ou expirado' }
          }
        }
      },
      '/pedidos': {
        post: {
          tags: ['Pedidos'],
          summary: 'Cria um novo pedido',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    titulo: { type: 'string' },
                    descricao: { type: 'string' },
                    imagem: { type: 'string', format: 'binary' }
                  },
                  required: ['titulo', 'descricao']
                }
              }
            }
          },
          responses: { '201': { description: 'Pedido criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pedido' } } } } }
        },
        get: {
          tags: ['Pedidos'],
          summary: 'Lista todos os pedidos',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Lista de pedidos',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Pedido' }
                  }
                }
              }
            }
          },
        }
      },
      '/pedidos/{id}': {
        get: {
          tags: ['Pedidos'],
          summary: 'Busca um pedido por ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '200': { description: 'Dados do pedido', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pedido' } } } },
            '404': { description: 'Pedido não encontrado' }
          }
        },
        patch: {
          tags: ['Pedidos'],
          summary: 'Atualiza um pedido',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { titulo: { type: 'string' }, descricao: { type: 'string' }, status: { type: 'string' } } }
              }
            }
          },
          responses: {
            '200': { description: 'Pedido atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pedido' } } } }
          }
        },
        delete: {
          tags: ['Pedidos'],
          summary: 'Deleta um pedido',
          description: 'Permite que o autor do pedido o delete.',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '204': { description: 'Pedido deletado com sucesso' },
            '403': { description: 'Acesso negado' },
            '404': { description: 'Pedido não encontrado' }
          }
        }
      },
      '/notificacoes': {
        get: {
          tags: ['Notificações'],
          summary: 'Lista notificações do usuário',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Lista de notificações',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Notificacao' }
                  }
                }
              }
            }
          }
        }
      },
      '/notificacoes/nao-lidas/quantidade': {
        get: {
          tags: ['Notificações'],
          summary: 'Retorna quantidade de notificações não lidas',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Quantidade de notificações não lidas',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      quantidade: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/notificacoes/{id}/lida': {
        patch: {
          tags: ['Notificações'],
          summary: 'Marca notificação como lida',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '204': { description: 'Notificação marcada como lida' }
          }
        }
      },
      '/pedidos/{id}/interesse': {
        post: {
          tags: ['Pedidos'],
          summary: 'Manifesta interesse em um pedido',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Interesse registrado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      pedido: { $ref: '#/components/schemas/Pedido' },
                      interesse: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          userId: { type: 'string', format: 'uuid' },
                          pedidoId: { type: 'string', format: 'uuid' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
