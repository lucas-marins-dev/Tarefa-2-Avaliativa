# Tarefa Avaliativa 2 - Sistema Corporativo Fullstack

Este repositório contém a solução completa para o projeto integrando um Backend em **Node.js + Express** com persistência híbrida e um Frontend em **React + Tailwind CSS**. A aplicação é totalmente conteinerizada usando Docker e orquestrada por meio de Docker Compose.

---

## 🛠️ Tecnologias Utilizadas

### Backend:
- **Node.js & Express**: Framework minimalista para criação das APIs REST.
- **MySQL & mysql2**: Banco de dados relacional SQL para o CRUD e controle de acesso de **Usuários**.
- **MongoDB & Mongoose**: Banco de dados NoSQL para os catálogos de **Carros**, **Motos** e **Marcas de Roupas**.
- **JWT (JSON Web Tokens)**: Implementação de autenticação stateless e controle de autorização baseado em perfis (RBAC).
- **bcryptjs**: Criptografia de senhas com algoritmo Blowfish para proteção das credenciais.
- **Helmet**: Middleware Express para definição de cabeçalhos HTTP focados em segurança.
- **Express Rate Limit**: Proteção contra ataques de força bruta e Denial of Service (DoS).
- **Swagger (swagger-ui-express & swagger-jsdoc)**: Geração de documentação interativa automatizada a partir de JSDoc.
- **Jest & Supertest**: Framework de testes e biblioteca de simulação HTTP para testes de integração de ponta a ponta.

### Frontend:
- **React (Vite)**: Biblioteca para construção de interfaces SPA modernas e rápidas.
- **Tailwind CSS**: Estilização baseada em utilitários de CSS para design ágil e responsivo.
- **React Router DOM**: Gerenciamento de rotas do lado do cliente com autenticação e proteção de acessos.
- **Axios**: Cliente HTTP integrado com interceptadores de requisição para injetar automaticamente os tokens JWT armazenados.
- **Lucide React**: Conjunto de ícones vetoriais modernos.
- **Nginx**: Servidor web de alto desempenho utilizado no estágio final do container Docker do frontend para servir os arquivos estáticos e lidar com o histórico de rotas.

---

## 🛡️ Segurança (OWASP Top 10)
O desenvolvimento da API backend adotou diversas práticas recomendadas pela OWASP:
1. **Broken Access Control (Acesso Não Autorizado)**: Implementação de rotas protegidas pelo middleware de verificação JWT e proteção de rotas administrativas (`/api/users`) através de validação de papéis (`roleMiddleware(['admin'])`).
2. **Cryptographic Failures (Falhas de Criptografia)**: Senhas de usuários nunca são armazenadas em texto plano; elas são hasheadas usando `bcryptjs` com custo de sal de `10`.
3. **Injection (Injeção SQL/NoSQL)**: Consultas ao MySQL utilizam exclusivamente Prepared Statements (parameterized queries) fornecidas pelo `mysql2`, anulando ataques de SQL Injection. As consultas NoSQL utilizam a sanitização automática do `Mongoose`.
4. **Security Misconfiguration (Configuração Incorreta)**: Utilização de arquivos `.env` para centralizar credenciais e portas de comunicação. Além disso, o middleware global de tratamento de erros oculta stack-traces detalhados em ambiente de produção para evitar vazamento de dados.
5. **Identification and Authentication Failures**: Mensagens de erro no login são genéricas (ex: "Usuário ou senha incorretos") para impedir a enumeração de usuários na base de dados. O backend também implementa rate-limiting por IP para impedir ataques de força bruta.

---

## 🐳 Instruções de Execução via Docker

Certifique-se de possuir o **Docker** e o **Docker Compose** instalados em sua máquina.

1. **Clonar o Repositório**:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd Tarefa-2-Avaliativa
   ```

2. **Subir os Containers**:
   Execute o comando abaixo na raiz do projeto para fazer o build e iniciar todos os serviços (MySQL, MongoDB, API Backend e Frontend):
   ```bash
   docker compose up --build
   ```

3. **Credenciais Padrão de Teste**:
   Na primeira inicialização, o banco SQL é inicializado e populado automaticamente com uma conta administrativa:
   - **Usuário**: `admin`
   - **Senha**: `admin123`
   - **Nível**: Administrador (pode acessar o menu de gerenciar usuários e gerenciar itens)

   Você também pode se registrar com um usuário comum clicando em "Cadastre-se" na tela de login. Usuários comuns (Operadores) possuem permissão para CRUD de itens, mas têm acesso negado ao menu de usuários.

---

## 🌐 Portas e Acessos Rápidos

- **Frontend (Painel Web)**: [http://localhost](http://localhost) (Porta `80`)
- **Backend (API REST)**: [http://localhost:3000/api](http://localhost:3000/api) (Porta `3000`)
- **Documentação Swagger**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Banco de Dados MySQL**: Exposto localmente na porta `3307` para ferramentas externas (ex: DBeaver).
- **Banco de Dados MongoDB**: Exposto localmente na porta `27019` para ferramentas externas (ex: MongoDB Compass).

---

## 🧪 Como Rodar os Testes Locais
Se desejar rodar a suíte de testes de integração localmente (fora do Docker), certifique-se de instalar as dependências e rodar o script de testes:
```bash
cd backend
npm install
npm test
```
