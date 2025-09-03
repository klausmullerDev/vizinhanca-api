import { prisma } from '../database/prismaClient';
import { User } from '@prisma/client';

// DTO - Data Transfer Object para a criação de usuário
type UserCreateDTO = Omit<User, 'id' | 'createdAt'>;

class UserService {
  async create(data: UserCreateDTO): Promise<User> {
    const userExists = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (userExists) {
      throw new Error('Este email já está em uso.');
    }

    //
    //adicionar criptografia de senha aqui
    // const hashedPassword = await bcrypt.hash(data.password, 10);


    const user = await prisma.user.create({
      data: {
        ...data,
        // password: hashedPassword, // Usaria a senha criptografada
      },
    });

    return user;
  }
}

export default new UserService();