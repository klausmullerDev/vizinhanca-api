import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import userRouter from './routes/user.routes';
import pedidoRouter from './routes/pedido.routes';
import notificacaoRouter from './routes/notificacao.routes';
import logger from './utils/logger';
import path from 'path';

const app = express();


app.use(express.json());

app.use(cors()); // O CORS deve vir antes das rotas

app.use('/users', userRouter); 
app.use('/pedidos', pedidoRouter); 
app.use('/notificacoes', notificacaoRouter); 

// Servir arquivos estáticos da pasta 'uploads' DEPOIS das rotas da API
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});