# Elite Barber Shop 💈

Sistema profissional de gerenciamento para barbearias com agendamento online, gestão de clientes e barbeiros.

## 🚀 Funcionalidades

### Para Clientes
- ✅ Cadastro e autenticação segura
- ✅ Visualização de barbeiros e serviços disponíveis
- ✅ Agendamento online com verificação de disponibilidade
- ✅ Histórico de agendamentos
- ✅ Avaliação de serviços

### Para Barbeiros
- ✅ Painel de controle personalizado
- ✅ Gestão de agenda e horários
- ✅ Visualização de agendamentos
- ✅ Atualização de status dos serviços
- ✅ Perfil profissional com especialidades

### Para Administradores
- ✅ Gestão completa de usuários
- ✅ Cadastro e edição de serviços
- ✅ Relatórios e analytics
- ✅ Configurações do sistema

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **bcryptjs** - Hash de senhas
- **Winston** - Sistema de logs
- **Joi** - Validação de dados
- **Helmet** - Segurança HTTP
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização moderna
- **JavaScript ES6+** - Interatividade
- **Font Awesome** - Ícones

### Ferramentas de Desenvolvimento
- **Nodemon** - Hot reload
- **ESLint** - Linting de código
- **Jest** - Testes unitários
- **Supertest** - Testes de API

## 📋 Pré-requisitos

- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL >= 8.0

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/leogu/BarberShop.git
cd BarberShop
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=barbershop_auth

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=sua_chave_secreta_jwt_aqui
JWT_EXPIRES_IN=24h
```

4. **Execute as migrações do banco de dados**
```bash
npm run migrate
```

5. **Popule o banco com dados de exemplo (opcional)**
```bash
npm run seed
```

6. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📚 API Endpoints

### Autenticação
- `POST /api/users/register` - Cadastro de usuário
- `POST /api/users/login` - Login

### Usuários
- `GET /api/users` - Listar usuários (admin)
- `GET /api/users/:id` - Buscar usuário por ID
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário (admin)

### Serviços
- `GET /api/services` - Listar serviços
- `GET /api/services/:id` - Buscar serviço por ID
- `POST /api/services` - Criar serviço (admin)
- `PUT /api/services/:id` - Atualizar serviço (admin)
- `DELETE /api/services/:id` - Deletar serviço (admin)

### Agendamentos
- `POST /api/appointments` - Criar agendamento (cliente)
- `GET /api/appointments` - Listar agendamentos
- `GET /api/appointments/:id` - Buscar agendamento por ID
- `PATCH /api/appointments/:id/status` - Atualizar status (barbeiro/admin)
- `DELETE /api/appointments/:id` - Cancelar agendamento
- `GET /api/appointments/barber/:barberId/availability` - Verificar disponibilidade

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento com hot reload
- `npm test` - Executa os testes
- `npm run lint` - Executa o linting do código
- `npm run lint:fix` - Corrige automaticamente problemas de linting
- `npm run migrate` - Executa as migrações do banco de dados
- `npm run seed` - Popula o banco com dados de exemplo

## 🔐 Segurança

- ✅ Hash de senhas com bcrypt (salt rounds: 12)
- ✅ Autenticação JWT com expiração
- ✅ Rate limiting para prevenir ataques
- ✅ Validação e sanitização de inputs
- ✅ Headers de segurança com Helmet
- ✅ CORS configurado
- ✅ Logs de segurança

## 📊 Estrutura do Projeto

```
BarberShop/
├── controllers/          # Controladores da aplicação
├── middleware/           # Middlewares customizados
├── routes/              # Definição das rotas
├── config/              # Configurações
├── utils/               # Utilitários
├── scripts/             # Scripts de migração e seed
├── public/              # Arquivos estáticos (frontend)
├── logs/                # Arquivos de log
├── tests/               # Testes automatizados
├── .env.example         # Exemplo de variáveis de ambiente
├── .gitignore           # Arquivos ignorados pelo Git
├── package.json         # Dependências e scripts
└── README.md           # Este arquivo
```

## 🚀 Deploy

### Variáveis de Ambiente para Produção
```env
NODE_ENV=production
DB_HOST=seu_host_mysql
DB_USER=seu_usuario
DB_PASSWORD=sua_senha_segura
DB_NAME=barbershop_prod
JWT_SECRET=sua_chave_jwt_super_secreta
PORT=3000
```

### Comandos para Deploy
```bash
# Build e otimização
npm install --production

# Executar migrações
npm run migrate

# Iniciar aplicação
npm start
```

## 👥 Usuários de Teste

Após executar `npm run seed`, os seguintes usuários estarão disponíveis:

**Administrador:**
- Email: `admin@elitebarber.com`
- Senha: `123456789`

**Barbeiros:**
- Email: `carlos@elitebarber.com` / Senha: `123456789`
- Email: `roberto@elitebarber.com` / Senha: `123456789`
- Email: `andre@elitebarber.com` / Senha: `123456789`

**Clientes:**
- Email: `joao@cliente.com` / Senha: `123456789`
- Email: `maria@cliente.com` / Senha: `123456789`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para leo@elitebarber.com ou abra uma issue no GitHub.

---

Desenvolvido com ❤️ por [Leo Guesada](https://github.com/leogu)
