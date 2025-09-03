
# API Vizinhança Solidária

Esta é a API para o projeto Vizinhança Solidária, uma plataforma para conectar pessoas que precisam de ajuda com voluntários em sua comunidade.

-----

## Pré-requisitos

Antes de começar, garanta que você tenha as seguintes ferramentas instaladas em sua máquina:

  - **Node.js** (versão 18.x ou superior)
  - **Docker** e **Docker Compose**
  - **Git**

-----

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento localmente.

### 1\. Clonar o Repositório

```bash
git clone https://github.com/klausmullerDev/vizinhanca-api.git
cd vizinhanca-api
```

### 2\. Instalar as Dependências

Este comando irá instalar todas as dependências do projeto listadas no `package.json`.

```bash
npm install
```

### 3\. Configurar Variáveis de Ambiente

O projeto precisa de um arquivo `.env` com a string de conexão do banco de dados. Você pode copiar o arquivo de exemplo:

```bash
cp .env.example .env
```

> **Nota:** O valor padrão no `.env.example` já está configurado para funcionar com o ambiente Docker deste projeto.

### 4\. Iniciar o Banco de Dados com Docker

Este comando irá iniciar um container com o banco de dados PostgreSQL em segundo plano.

```bash
docker-compose up -d
```

### 5\. Aplicar as Migrations do Banco de Dados

Com o banco de dados rodando, este comando irá criar todas as tabelas necessárias com base no schema do Prisma.

```bash
npx prisma migrate dev
```

### 6\. Iniciar a Aplicação

Agora você pode iniciar o servidor de desenvolvimento.

```bash
npm run dev
```

Após executar este comando, a API estará rodando em `http://localhost:3333` (ou a porta que você definir).
