# Vizinhança Solidária API

Esta é a API para o projeto Vizinhança Solidária, uma plataforma desenhada para ser o coração de uma comunidade fechada, conectando pessoas que precisam de ajuda com voluntários dispostos a colaborar.

## ✨ Tecnologias Utilizadas

Este projeto foi construído com foco em robustez, escalabilidade e manutenibilidade, utilizando as seguintes tecnologias:

- **Backend**: Node.js, TypeScript, Express.js
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JSON Web Tokens (JWT)
- **Documentação da API**: Swagger (OpenAPI) com swagger-ui-express e swagger-autogen
- **Containerização**: Docker
- **Logger**: Winston
- **Envio de E-mail**: Nodemailer com Ethereal para testes

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento localmente.

### 1. Pré-requisitos

Antes de começar, garanta que você tenha as seguintes ferramentas instaladas na sua máquina:

- Node.js (versão 18.x ou superior)
- Docker e Docker Compose
- Git

### 2. Clonar o Repositório

```bash
git clone https://github.com/klausmullerDev/vizinhanca-api.git
cd vizinhanca-api
```

### 3. Instalar as Dependências

Execute o comando abaixo para instalar todas as dependências do projeto.

```bash
npm install
```

### 4. Configurar Variáveis de Ambiente

O projeto precisa de um ficheiro `.env` para armazenar variáveis sensíveis. Crie uma cópia do ficheiro de exemplo:

```bash
cp .env.example .env
```

O ficheiro `.env.example` contém as chaves necessárias. Certifique-se de que o seu `.env` tem a `JWT_SECRET` preenchida com um valor seguro e aleatório.

```env
# String de conexão com o banco de dados PostgreSQL
DATABASE_URL="postgresql://docker:docker@localhost:5432/meu_projeto?schema=public"

# Chave secreta para assinar os tokens JWT
JWT_SECRET="sua-chave-secreta-super-longa-e-aleatoria-aqui"
```

### 5. Iniciar o Banco de Dados com Docker

Este comando irá iniciar o container do PostgreSQL em segundo plano.

```bash
docker-compose up -d
```

### 6. Aplicar as Migrations do Banco de Dados

Com o banco de dados a rodar, este comando irá criar todas as tabelas e estruturas necessárias.

```bash
npx prisma migrate dev
```

### 7. Iniciar a Aplicação

Agora você pode iniciar o servidor de desenvolvimento. O servidor irá reiniciar automaticamente a cada alteração no código.

```bash
npm run dev
```

Após executar o último comando, a API estará a rodar em `http://localhost:3000`.

## 📚 Documentação da API (Swagger)

A documentação completa dos endpoints, incluindo modelos de dados e a possibilidade de testar as rotas, está disponível e é gerada automaticamente pelo Swagger.

- **URL da Documentação**: http://localhost:3000/api-docs
- **Nota Importante**: Sempre que você adicionar ou alterar rotas nos ficheiros `*.routes.ts`, execute o comando `npm run swagger-autogen` para manter o ficheiro `swagger-output.json` atualizado.

## Endpoints Disponíveis

### Autenticação e Perfil

| Método | Rota | Descrição | Autenticação Necessária |
|--------|------|-----------|-------------------------|
| POST | `/users/register` | Cria uma nova conta de utilizador. | Não |
| POST | `/users/login` | Autentica um utilizador e retorna um token JWT. | Não |
| GET | `/users/profile` | Busca o perfil completo do utilizador logado. | Sim (Bearer Token) |
| PUT | `/users/profile` | Atualiza o perfil do utilizador logado. | Sim (Bearer Token) |
| POST | `/users/forgot-password` | Inicia o processo de redefinição de senha. | Não |
| POST | `/users/reset-password/:token` | Redefine a senha utilizando um token válido. | Não |

### Pedidos de Ajuda (Comunidade Fechada)

| Método | Rota | Descrição | Autenticação Necessária |
|--------|------|-----------|-------------------------|
| POST | `/pedidos` | Cria um novo pedido de ajuda. | Sim (Bearer Token) |
| GET | `/pedidos` | Lista todos os pedidos de ajuda. | Sim (Bearer Token) |
| GET | `/pedidos/:id` | Busca um pedido por ID. | Sim (Bearer Token) |

### Chat

| Método | Rota | Descrição | Autenticação Necessária |
|--------|------|-----------|-------------------------|
| POST | `/chats` | Cria ou obtém um chat entre o usuário logado e outro usuário sobre um pedido. | Sim (Bearer Token) |
| GET | `/chats/pedido/{pedidoId}` | Lista os chats de um pedido para o usuário logado. | Sim (Bearer Token) |
| GET | `/chats/{chatId}/mensagens` | Lista todas as mensagens de um chat específico. | Sim (Bearer Token) |
| POST | `/chats/{chatId}/mensagens` | Envia uma nova mensagem para um chat. | Sim (Bearer Token) |

### Notificações

| Método | Rota | Descrição | Autenticação Necessária |
|--------|------|-----------|-------------------------|
| GET | `/notificacoes` | Lista as notificações do usuário logado. | Sim (Bearer Token) |
| GET | `/notificacoes/nao-lidas` | Conta o número de notificações não lidas. | Sim (Bearer Token) |
| PATCH | `/notificacoes/{id}/lida` | Marca uma notificação como lida. | Sim (Bearer Token) |

## 📜 Scripts NPM

- `npm run dev`: Inicia o servidor em modo de desenvolvimento com ts-node-dev.
- `npm run swagger-autogen`: Gera/atualiza o ficheiro `swagger-output.json` com base nas rotas.
- `npm run build`: Compila o código TypeScript para JavaScript (para produção).
- `npm start`: Executa o código JavaScript compilado (para produção).