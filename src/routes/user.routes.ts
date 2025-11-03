import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadConfig as upload } from '../services/upload.service';

const userRouter = Router();

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags: [Usuários]
 *     summary: Registra um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       '201':
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Dados inválidos
 *       '409':
 *         description: Email já existe
 */
userRouter.post('/register', UserController.create);

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags: [Usuários]
 *     summary: Realiza login do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: 'string', format: 'email' }
 *               password: { type: 'string' }
 *     responses:
 *       '200':
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '401':
 *         description: Credenciais inválidas
 */
userRouter.post('/login', UserController.login);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Usuários]
 *     summary: Retorna o perfil do usuário logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Não autorizado
 */
userRouter.get('/profile', authMiddleware, UserController.getMyProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [Usuários]
 *     summary: Atualiza o perfil do usuário
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: 'string' }
 *               cpf: { type: 'string' }
 *               telefone: { type: 'string' }
 *               dataDeNascimento: { type: 'string', format: 'date' }
 *               sexo: { type: 'string' }
 *               'endereco[rua]': { type: 'string' }
 *               'endereco[numero]': { type: 'string' }
 *               'endereco[complemento]': { type: 'string' }
 *               'endereco[bairro]': { type: 'string' }
 *               'endereco[cidade]': { type: 'string' }
 *               'endereco[estado]': { type: 'string' }
 *               'endereco[cep]': { type: 'string' }
 *               avatar: { type: 'string', format: 'binary' }
 *     responses:
 *       '200':
 *         description: Perfil atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autorizado
 */
userRouter.put('/profile', authMiddleware, upload.single('avatar'), UserController.updateProfile);

/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     tags: [Usuários]
 *     summary: Solicita redefinição de senha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: 'string', format: 'email' }
 *     responses:
 *       '200':
 *         description: Email de redefinição enviado
 *       '404':
 *         description: Email não encontrado
 */
userRouter.post('/forgot-password', UserController.forgotPassword);

/**
 * @swagger
 * /users/reset-password/{token}:
 *   post:
 *     tags: [Usuários]
 *     summary: Redefine a senha usando token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: 'string' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: 'string' }
 *     responses:
 *       '200':
 *         description: Senha redefinida com sucesso
 *       '400':
 *         description: Token inválido ou expirado
 */
userRouter.post('/reset-password/:token', UserController.resetPassword);

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Usuários]
 *     summary: Lista todos os usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
userRouter.get('/', authMiddleware, UserController.findAll);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Usuários]
 *     summary: Busca um usuário por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: Usuário não encontrado
 */
userRouter.get('/:id', authMiddleware, UserController.findById);

/**
 * @swagger
 * /users/{id}/pedidos:
 *   get:
 *     tags: [Usuários]
 *     summary: Busca todos os pedidos de um usuário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Lista de pedidos do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 *       '404':
 *         description: Usuário não encontrado
 */
userRouter.get('/:id/pedidos', authMiddleware, UserController.findPedidosByAuthor);

/**
 * @swagger
 * /users/{id}/avaliacoes:
 *   get:
 *     tags: [Usuários]
 *     summary: Busca todas as avaliações recebidas por um usuário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Lista de avaliações recebidas pelo usuário
 *       '404':
 *         description: Usuário não encontrado
 */
userRouter.get('/:id/avaliacoes', authMiddleware, UserController.findAvaliacoesRecebidas);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: ['Usuários (Admin)']
 *     summary: Deleta um usuário por ID (funcionalidade de admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: 'uuid'
 *     responses:
 *       '204':
 *         description: Usuário deletado com sucesso
 *       '404':
 *         description: Usuário não encontrado
 */
userRouter.delete('/:id', authMiddleware, UserController.delete);

export default userRouter;