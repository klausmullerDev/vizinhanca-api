import { prisma } from '../database/prismaClient';
import { User, Pedido } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/mailer';

export type UserPublic = Omit<User, 'password' | 'resetPasswordToken' | 'resetPasswordExpires'> & { mediaAvaliacoes?: number | null };

export type UserWithProfileStatus = UserPublic & {
  mediaAvaliacoes?: number | null;
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

    const agregacaoAvaliacoes = await prisma.avaliacao.aggregate({
      where: { avaliadoId: userId },
      _avg: {
        nota: true,
      },
    });

    const isProfileComplete = Boolean(
      user.cpf &&
      user.telefone &&
      user.endereco
    );

    return {
      ...user,
      isProfileComplete,
      mediaAvaliacoes: agregacaoAvaliacoes._avg.nota,
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
    
    const agregacaoAvaliacoes = await prisma.avaliacao.aggregate({
      where: { avaliadoId: userId },
      _avg: {
        nota: true,
      },
    });

    return {
      ...user,
      mediaAvaliacoes: agregacaoAvaliacoes._avg.nota,
    };
  }

  async findPedidosByAuthor(authorId: string, requesterId?: string): Promise<any[]> {
    const pedidos = await prisma.pedido.findMany({
      where: { authorId: authorId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        _count: {
          select: { interesses: true }
        },
        interesses: {
          take: 4,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      }
    });

    return pedidos.map(pedido => {
      const { _count, ...rest } = pedido;
      const usuarioJaDemonstrouInteresse = requesterId
        ? pedido.interesses.some(interesse => interesse.user.id === requesterId)
        : false;
      return { ...rest, usuarioJaDemonstrouInteresse, interessesCount: _count.interesses };
    });
  }

  async findAvaliacoesRecebidas(userId: string) {
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new Error('Usuário não encontrado');
    }

    return prisma.avaliacao.findMany({
      where: { avaliadoId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        avaliador: {
          select: { id: true, name: true, avatar: true },
        },
        pedido: { select: { id: true, titulo: true } },
      },
    });
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

    if (data.dataDeNascimento) {
      const birthDate = new Date(data.dataDeNascimento);
      if (isNaN(birthDate.getTime())) {
        throw new Error('Formato de data de nascimento inválido.');
      }

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18 || age > 100) {
        throw new Error('A idade deve estar entre 18 e 100 anos.');
      } else {
        dataToUpdate.dataDeNascimento = birthDate;
      }
    }

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