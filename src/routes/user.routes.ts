// src/routes/user.routes.ts

import { Router } from 'express';
import UserController from '../controllers/user.controller';

const userRouter = Router();

// @ts-ignore
// prettier-ignore
/**
 * @swagger
 * /users/register:
 * post:
 * tags:
 * - Users
 * summary: Registra um novo usuário
 * description: Cria uma nova conta de usuário no sistema.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UserRegister'
 * responses:
 * '201':
 * description: Usuário criado com sucesso.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/User'
 * '409':
 * description: Conflito, o email já está em uso.
 * '400':
 * description: Dados inválidos fornecidos.
 */
userRouter.post('/register', UserController.create);

// @ts-ignore
// prettier-ignore
/**
 * @swagger
 * /users/login:
 * post:
 * tags:
 * - Users
 * summary: Autentica um usuário
 * description: Realiza o login de um usuário com email e senha.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * format: email
 * example: joao.silva@example.com
 * password:
 * type: string
 * example: senhaForte123
 * responses:
 * '200':
 * description: Login bem-sucedido.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/User'
 * '401':
 * description: Não autorizado, credenciais inválidas.
 */
userRouter.post('/login', UserController.login);

export default userRouter;