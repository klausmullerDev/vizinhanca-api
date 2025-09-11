import { prisma } from '../database/prismaClient';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/mailer';

export type UserPublic = Omit<User, 'password'>;

export type UserWithProfileStatus = UserPublic & {
  isProfileComplete: boolean;
  endereco: {} | null;
};

type UserCreateDTO = Omit<User, 'id' | 'createdAt'>;

type UserProfileDTO = {
  name?: string;
  cpf?: string;
  telefone?: string;
  dataDeNascimento?: Date;
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

class UserService {

  private async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async getProfile(userId: string): Promise<UserWithProfileStatus> {
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        endereco: true,
      },
    });

    if (!userProfile) {
      throw new Error('Utilizador não encontrado.');
    }

    const isProfileComplete =
      !!userProfile.cpf &&
      !!userProfile.telefone &&
      !!userProfile.dataDeNascimento &&
      !!userProfile.endereco;

    const { password, ...userPublic } = userProfile;

    return {
      ...userPublic,
      isProfileComplete,
    };
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
    const { endereco, ...userData } = data;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...userData,
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
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

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
}

export default new UserService();

