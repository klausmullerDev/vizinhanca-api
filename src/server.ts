import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import userRouter from './routes/user.routes';
import pedidoRouter from './routes/pedido.routes';
import logger from './utils/logger';

const app = express();


app.use(express.json());

app.use(cors());



app.use('/users', userRouter); 
app.use('/pedidos', pedidoRouter); 



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});