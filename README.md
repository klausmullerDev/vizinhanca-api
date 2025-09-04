````markdown
# API Vizinhança Solidária

Esta é a API para o projeto Vizinhança Solidária, uma plataforma para conectar pessoas que precisam de ajuda com voluntários em sua comunidade.

---

## ✨ Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias:

-   **Backend:** Node.js, TypeScript, Express.js
-   **ORM:** Prisma
-   **Banco de Dados:** PostgreSQL
-   **Autenticação:** Passport.js (Estratégia Local), JSON Web Tokens (JWT)
-   **Documentação da API:** Swagger (OpenAPI)
-   **Containerização:** Docker
-   **Logger:** Winston

---

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento localmente.

### 1. Pré-requisitos

Antes de começar, garanta que você tenha as seguintes ferramentas instaladas em sua máquina:

-   **Node.js** (versão 18.x ou superior)
-   **Docker** e **Docker Compose**
-   **Git**

### 2. Clonar o Repositório

```bash
git clone [https://github.com/klausmullerDev/vizinhanca-api.git](https://github.com/klausmullerDev/vizinhanca-api.git)
cd vizinhanca-api
````

### 3\. Instalar as Dependências

```bash
npm install
```

### 4\. Configurar Variáveis de Ambiente

O projeto precisa de um arquivo `.env` para armazenar variáveis sensíveis. Crie uma cópia do arquivo de exemplo:

```bash
cp .env.example .env
```

O arquivo `.env.example` deve conter as seguintes chaves. Certifique-se de que seu `.env` tenha a `JWT_SECRET` preenchida com um valor seguro e aleatório.

```env
# String de conexão com o banco de dados PostgreSQL
DATABASE_URL="postgresql://docker:docker@localhost:5432/meu_projeto?schema=public"

# Chave secreta para assinar os tokens JWT
JWT_SECRET="sua-chave-secreta-super-longa-e-aleatoria-aqui"
```

### 5\. Iniciar o Banco de Dados com Docker

Este comando irá iniciar o container do PostgreSQL em segundo plano.

```bash
docker-compose up -d
```

### 6\. Aplicar as Migrations do Banco de Dados

Com o banco de dados rodando, este comando irá criar todas as tabelas necessárias.

```bash
npx prisma migrate dev
```

### 7\. Iniciar a Aplicação

Agora você pode iniciar o servidor de desenvolvimento.

```bash
npm run dev
```

> **Dica:** Para uma melhor experiência de desenvolvimento, use dois terminais: um para manter o banco de dados rodando (`docker-compose up -d`) e outro para rodar a aplicação (`npm run dev`), que reiniciará automaticamente a cada alteração no código.

Após executar o último comando, a API estará rodando em **`http://localhost:3000`**.

-----

## 📚 Documentação da API (Swagger)

A documentação completa dos endpoints, incluindo modelos de dados e a possibilidade de testar as rotas, está disponível e é gerada automaticamente pelo Swagger.

  - **URL da Documentação:** [http://localhost:3000/api-docs](https://www.google.com/search?q=http://localhost:3000/api-docs)

-----

## Endpoints Disponíveis

| Método | Rota               | Descrição                                         |
| :----- | :----------------- | :------------------------------------------------ |
| `POST` | `/users/register`  | Cria uma nova conta de usuário.                   |
| `POST` | `/users/login`     | Autentica um usuário e retorna um token JWT.      |
| `PATCH`| `/users/profile`   | (Exemplo) Atualiza o perfil do usuário logado. |

-----

## 📜 Scripts NPM

  - `npm run dev`: Inicia o servidor em modo de desenvolvimento com `ts-node-dev`.
  - `npm run build`: Compila o código TypeScript para JavaScript (para produção).
  - `npm start`: Executa o código JavaScript compilado (para produção).

<!-- end list -->

```
```