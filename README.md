# Microcrédito API

API RESTful completa para SaaS de Microcrédito desenvolvida com Node.js, TypeScript, Express, Prisma e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express** - Framework web minimalista
- **Prisma** - ORM moderno para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **Zod** - Validação de esquemas TypeScript-first
- **JWT** - Autenticação baseada em tokens
- **Swagger** - Documentação automática da API

## 📋 Funcionalidades

- ✅ Sistema de autenticação com JWT
- ✅ Gestão de usuários e perfis
- ✅ Cadastro e gestão de clientes (borrowers)
- ✅ Sistema completo de empréstimos
- ✅ Controle de pagamentos e parcelas
- ✅ Dashboard administrativo
- ✅ Documentação automática com Swagger
- ✅ Validação robusta com Zod
- ✅ Rate limiting e segurança
- ✅ Paginação e filtros

## 🛠️ Instalação

1. Clone o repositório:
\`\`\`bash
git clone <repository-url>
cd microcredito-api
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Configure as variáveis de ambiente:
\`\`\`bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
\`\`\`

4. Configure o banco de dados:
\`\`\`bash
npm run db:generate
npm run db:push
npm run db:seed
\`\`\`

5. Inicie o servidor de desenvolvimento:
\`\`\`bash
npm run dev
\`\`\`

## 📚 Documentação

A documentação da API está disponível em: `http://localhost:3000/api-docs`

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Inicia o servidor em produção
- `npm run db:generate` - Gera o cliente Prisma
- `npm run db:push` - Sincroniza o schema com o banco
- `npm run db:migrate` - Executa migrações
- `npm run db:studio` - Abre o Prisma Studio
- `npm run db:seed` - Popula o banco com dados iniciais

## 🏗️ Estrutura do Projeto

\`\`\`
src/
├── config/          # Configurações da aplicação
├── controllers/     # Controladores das rotas
├── middleware/      # Middlewares customizados
├── models/          # Modelos de dados
├── routes/          # Definição das rotas
├── types/           # Tipos TypeScript
├── utils/           # Utilitários e helpers
└── server.ts        # Arquivo principal do servidor
\`\`\`

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

\`\`\`
Authorization: Bearer <seu-jwt-token>
\`\`\`

## 📊 Banco de Dados

O schema do banco inclui as seguintes entidades principais:

- **Users** - Usuários do sistema
- **Borrowers** - Clientes que solicitam empréstimos
- **Loans** - Empréstimos concedidos
- **Payments** - Pagamentos das parcelas

## 🚦 Status da API

Verifique o status da API em: `http://localhost:3000/health`

## 📝 Licença

Este projeto está sob a licença MIT.
