import { User, Endereco } from '@prisma/client'

export type UserPublic = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  cpf: string | null;
  telefone: string | null;
  dataDeNascimento: Date | null;
  sexo: string | null;
  createdAt: Date;
  endereco: Endereco | null;
};

export type UserWithProfileStatus = UserPublic & {
  isProfileComplete: boolean;
};

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        name: string;
      }
    }
  }
}
