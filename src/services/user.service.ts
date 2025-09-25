import { prisma } from '../database/prismaClient';
import { User, Pedido } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/mailer';

export type UserPublic = Omit<User, 'password' | 'resetPasswordToken' | 'resetPasswordExpires'>;

export type UserWithProfileStatus = UserPublic & {
  isProfileComplete: boolean;
  endereco: {} | null;
};

type UserCreateDTO = Omit<User, 'id' | 'createdAt' | 'resetPasswordToken' | 'resetPasswordExpires'>;

type UserProfileDTO = {
  name?: string;
  cpf?: string;
  telefone?: string;
  dataDeNascimento?: Date | string;
  sexo?: string;
  endereco?: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  cpf: true,
  telefone: true,
  dataDeNascimento: true,
  sexo: true,
  createdAt: true,
  endereco: true,
} as const;

class UserService {

  private async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async getProfile(userId: string): Promise<UserWithProfileStatus> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userPublicSelect
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isProfileComplete = Boolean(
      user.cpf &&
      user.telefone &&
      user.endereco
    );

    return {
      ...user,
      isProfileComplete
    };
  }

  async findById(userId: string): Promise<UserPublic> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userPublicSelect
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async findPedidosByAuthor(authorId: string, requesterId?: string): Promise<any[]> {
    const pedidos = await prisma.pedido.findMany({
      where: { authorId: authorId },
      orderBy: { createdAt: 'desc' },
      include: {
        interesses: { select: { userId: true } }
      }
    });

    // Se um requesterId for fornecido, mapeia os pedidos para incluir a flag de interesse
    if (requesterId) {
      return pedidos.map(pedido => {
        const usuarioJaDemonstrouInteresse = pedido.interesses.some(interesse => interesse.userId === requesterId);
        // Omitir a lista completa de interesses da resposta final para economizar dados
        const { interesses, ...pedidoSemInteresses } = pedido;
        return { ...pedidoSemInteresses, usuarioJaDemonstrouInteresse };
      });
    }
    return pedidos;
  }

  async create(data: UserCreateDTO): Promise<UserPublic> {
    const userExists = await this.findByEmail(data.email);
    if (userExists) {
      throw new Error('Este email já está em uso.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    const { password, ...userPublic } = user;
    return userPublic;
  }

  async login(email: string, plainPassword: string): Promise<UserPublic> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Email ou senha inválidos.');
    }

    const isPasswordValid = await bcrypt.compare(plainPassword, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Email ou senha inválidos.');
    }

    const { password, ...userPublic } = user;
    return userPublic;
  }

  async updateProfile(userId: string, data: UserProfileDTO): Promise<UserPublic> {
    // Check if CPF is already in use by another user
    if (data.cpf) {
      const existingUser = await prisma.user.findFirst({
        where: {
          cpf: data.cpf,
          NOT: {
            id: userId
          }
        }
      });

      if (existingUser) {
        throw new Error('CPF já está em uso por outro usuário');
      }
    }

    const { endereco, ...userData } = data;

    const dataToUpdate: any = { ...userData };

    // --- Início da correção ---
    // Verifica se a data de nascimento é uma string e tenta convertê-la.
    // Adiciona uma verificação para garantir que o resultado seja uma data válida.
    if (dataToUpdate.dataDeNascimento && typeof dataToUpdate.dataDeNascimento === 'string') {
      const dateObject = new Date(dataToUpdate.dataDeNascimento);
      if (!isNaN(dateObject.getTime())) { // Checa se a data é válida
        dataToUpdate.dataDeNascimento = dateObject;
      } else {
        // Se a data for inválida, remove-a do objeto de atualização
        delete dataToUpdate.dataDeNascimento;
      }
    }
    // --- Fim da correção ---

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...dataToUpdate,
        endereco: endereco ? {
          upsert: {
            create: endereco,
            update: endereco,
          }
        } : undefined,
      },
      include: {
        endereco: true,
      }
    });

    const { password, ...userPublic } = updatedUser;
    return userPublic;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.findByEmail(email);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000);

      await prisma.user.update({
        where: { email },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpires,
        },
      });

      await sendPasswordResetEmail(user.email, resetToken);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<UserPublic> {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error('Token inválido ou expirado.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    const { password, ...userPublic } = updatedUser;
    return userPublic;
  }

  async findAll(): Promise<UserPublic[]> {
    const users = await prisma.user.findMany();
    return users.map(({ password, ...userPublic }) => userPublic);
  }

  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}

export default new UserService();