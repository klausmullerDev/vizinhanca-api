import { prisma } from '../database/prismaClient';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';

export type UserPublic = Omit<User, 'password'>;
type UserCreateDTO = Omit<User, 'id' | 'createdAt'>;

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
}

export default new UserService();