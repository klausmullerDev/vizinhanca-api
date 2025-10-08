import { Server, Socket } from 'socket.io';
import logger from './utils/logger';

let ioInstance: Server;

export const initializeSocket = (io: Server) => {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    logger.info(`🔌 Novo cliente conectado: ${socket.id}`);

    // Evento para um usuário entrar em uma sala de chat
    socket.on('join-chat', (chatId: string) => {
      socket.join(chatId);
      logger.info(`Cliente ${socket.id} entrou na sala de chat: ${chatId}`);
    });

    // Evento para um usuário sair de uma sala de chat
    socket.on('leave-chat', (chatId: string) => {
      socket.leave(chatId);
      logger.info(`Cliente ${socket.id} saiu da sala de chat: ${chatId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });
};

/**
 * Emite um evento para uma sala de chat específica.
 * @param room - O ID da sala (chatId).
 * @param event - O nome do evento.
 * @param data - Os dados a serem enviados.
 */
export const emitToRoom = (room: string, event: string, data: any) => {
  if (ioInstance) {
    ioInstance.to(room).emit(event, data);
  }
};