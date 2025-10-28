import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import userRouter from './routes/user.routes';
import pedidoRouter from './routes/pedido.routes';
import avaliacaoRouter from './routes/avaliacao.routes';
import notificacaoRouter from './routes/notificacao.routes';
import chatRouter from './routes/chat.routes';
import logger from './utils/logger';
import { initializeSocket } from './socket';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});


app.use(express.json());

app.use(cors()); // O CORS deve vir antes das rotas

// Script para extrair o token do login e aplicar no Swagger UI
const swaggerLoginScript = `
  const interval = setInterval(() => {
    const loginWrapper = document.querySelector('#operations-Usuários-post_users_login');
    if (loginWrapper) {
      clearInterval(interval);

      const tryOutButton = loginWrapper.querySelector('.try-out__btn');
      if (tryOutButton) {
        tryOutButton.addEventListener('click', () => {
          const executeButton = loginWrapper.querySelector('.execute');
          if (executeButton) {
            executeButton.addEventListener('click', () => {
              const observer = new MutationObserver((mutations, obs) => {
                const responseBody = loginWrapper.querySelector('.microlight .language-json');
                if (responseBody && responseBody.innerText) {
                  try {
                    const jsonResponse = JSON.parse(responseBody.innerText);
                    if (jsonResponse.token) {
                      const token = jsonResponse.token;
                      const ui = window.ui;
                      ui.preauthorizeApiKey("bearerAuth", token);
                    }
                    obs.disconnect(); // Parar de observar após pegar o token
                  } catch (e) { /* Ignorar erros de parse se a resposta não for JSON */ }
                }
              });
              observer.observe(loginWrapper, { childList: true, subtree: true });
            });
          }
        });
      }
    }
  }, 100);
`;

app.use('/users', userRouter); 
app.use('/pedidos', pedidoRouter); 
app.use('/avaliacoes', avaliacaoRouter);
app.use('/notificacoes', notificacaoRouter); 
app.use('/chats', chatRouter);

// Servir arquivos estáticos da pasta 'uploads' DEPOIS das rotas da API
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customJs: [swaggerLoginScript],
  customCss: '.swagger-ui .topbar { display: none }' // Opcional: esconde a barra superior do Swagger
}));

const PORT = 3000;

// Inicializa a lógica do Socket.IO
initializeSocket(io);

server.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});