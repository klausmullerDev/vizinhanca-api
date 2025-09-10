import { prisma } from '../database/prismaClient';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';

export type UserPublic = Omit<User, 'password'>;


export type UserWithProfileStatus = UserPublic & {
  isProfileComplete: boolean;
  endereco: {} | null; 
};
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}



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
      throw new Error('Usuário não encontrado.');
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
}

export default new UserService();