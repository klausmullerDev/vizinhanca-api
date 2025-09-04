API Vizinhança SolidáriaEsta é a API para o projeto Vizinhança Solidária, uma plataforma para conectar pessoas que precisam de ajuda com voluntários em sua comunidade.✨ Tecnologias UtilizadasEste projeto foi construído utilizando as seguintes tecnologias:Backend: Node.js, TypeScript, Express.jsORM: PrismaBanco de Dados: PostgreSQLAutenticação: Passport.js (Estratégia Local), JSON Web Tokens (JWT)Documentação da API: Swagger (OpenAPI)Containerização: DockerLogger: Winston🚀 Como Rodar o ProjetoSiga os passos abaixo para configurar e executar o ambiente de desenvolvimento localmente.1. Pré-requisitosAntes de começar, garanta que você tenha as seguintes ferramentas instaladas em sua máquina:Node.js (versão 18.x ou superior)Docker e Docker ComposeGit2. Clonar o Repositóriogit clone [https://github.com/klausmullerDev/vizinhanca-api.git](https://github.com/klausmullerDev/vizinhanca-api.git)
cd vizinhanca-api

3. Instalar as Dependênciasnpm install

4. Configurar Variáveis de AmbienteO projeto precisa de um arquivo .env para armazenar variáveis sensíveis. Crie uma cópia do arquivo de exemplo:cp .env.example .env

O arquivo .env.example deve conter as seguintes chaves. Certifique-se de que seu .env tenha a JWT_SECRET preenchida com um valor seguro e aleatório.# String de conexão com o banco de dados PostgreSQL
DATABASE_URL="postgresql://docker:docker@localhost:5432/meu_projeto?schema=public"

# Chave secreta para assinar os tokens JWT
JWT_SECRET="sua-chave-secreta-super-longa-e-aleatoria-aqui"

5. Iniciar o Banco de Dados com DockerEste comando irá iniciar o container do PostgreSQL em segundo plano.docker-compose up -d

6. Aplicar as Migrations do Banco de DadosCom o banco de dados rodando, este comando irá criar todas as tabelas necessárias.npx prisma migrate dev

7. Iniciar a AplicaçãoAgora você pode iniciar o servidor de desenvolvimento.npm run dev

Dica: Para uma melhor experiência de desenvolvimento, use dois terminais: um para manter o banco de dados rodando (docker-compose up -d) e outro para rodar a aplicação (npm run dev), que reiniciará automaticamente a cada alteração no código.Após executar o último comando, a API estará rodando em http://localhost:3000.📚 Documentação da API (Swagger)A documentação completa dos endpoints, incluindo modelos de dados e a possibilidade de testar as rotas, está disponível e é gerada automaticamente pelo Swagger.URL da Documentação: http://localhost:3000/api-docsEndpoints Disponíveis| Método | Rota | Descrição || POST | /users/register | Cria uma nova conta de usuário. || POST | /users/login | Autentica um usuário e retorna um token JWT. || PATCH | /users/profile | (Exemplo) Atualiza o perfil do usuário logado. |📜 Scripts NPMnpm run dev: Inicia o servidor em modo de desenvolvimento com ts-node-dev.npm run build: Compila o código TypeScript para JavaScript (para produção).npm start: Executa o código JavaScript compilado (para produção).
