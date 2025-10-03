# 🚀 BarberShop - Sistema de Gerenciamento para Barbearias

[![CI/CD](https://github.com/leogu/BarberShop/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/leogu/BarberShop/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://node.js.org/)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

Sistema completo de gerenciamento para barbearias com backend Node.js/TypeScript e frontend React/TypeScript, incluindo agendamentos, gerenciamento de barbeiros, serviços e muito mais.

## ✨ Funcionalidades

### 🎯 Principais
- **Sistema de Agendamentos**: Agendamento online com calendário interativo
- **Gerenciamento de Barbeiros**: Perfis, especialidades, disponibilidade e avaliações
- **Catálogo de Serviços**: Serviços personalizáveis com preços e duração
- **Sistema de Usuários**: Clientes, barbeiros e administradores
- **Avaliações e Comentários**: Sistema de feedback para barbeiros
- **Notificações**: Alertas em tempo real para agendamentos
- **Dashboard Analytics**: Métricas e relatórios detalhados

### 🔧 Técnicas
- **TypeScript**: Tipagem estática para maior segurança e produtividade
- **Arquitetura RESTful**: API bem estruturada e documentada
- **Autenticação JWT**: Sistema seguro com refresh tokens
- **Validação Robusta**: Validação de dados em frontend e backend
- **Monitoramento**: Métricas, logs e health checks
- **Testes Automatizados**: Cobertura de testes unitários e de integração
- **Containerização**: Docker e Docker Compose para desenvolvimento e produção
- **CI/CD**: Pipeline automatizado com GitHub Actions

## 🏗️ Arquitetura

```
BarberShop/
├── 📁 client/                 # Frontend React/TypeScript
│   ├── 📁 src/
│   │   ├── 📁 components/     # Componentes reutilizáveis
│   │   ├── 📁 pages/         # Páginas da aplicação
│   │   ├── 📁 services/      # Serviços de API
│   │   ├── 📁 store/         # Gerenciamento de estado (Zustand)
│   │   ├── 📁 styles/        # Estilos globais
│   │   └── 📁 types/         # Definições TypeScript
│   └── 📄 package.json
├── 📁 src/                    # Backend Node.js/TypeScript
│   ├── 📁 config/            # Configurações do banco e app
│   ├── 📁 controllers/       # Controladores da API
│   ├── 📁 middleware/        # Middlewares customizados
│   ├── 📁 models/            # Modelos de dados
│   ├── 📁 routes/            # Rotas da API
│   ├── 📁 scripts/           # Scripts de migração e seed
│   ├── 📁 types/             # Definições TypeScript
│   └── 📁 utils/             # Utilitários
├── 📁 docker/                # Configurações Docker
├── 📁 .github/workflows/     # CI/CD Pipeline
└── 📄 docker-compose.yml     # Orquestração de containers
```

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+ 
- npm 9+
- MySQL 8.0+
- Docker e Docker Compose (opcional)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/leogu/BarberShop.git
cd BarberShop
```

2. **Instale as dependências**
```bash
# Backend
npm install

# Frontend
cd client && npm install && cd ..
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**
```bash
# Crie o banco de dados
mysql -u root -p < docker/mysql/init/01-init.sql

# Execute as migrações
npm run migrate

# Popule com dados de exemplo
npm run seed
```

5. **Inicie a aplicação**
```bash
# Desenvolvimento
npm run dev:full

# Produção
npm run build
npm start
```

### 🐳 Com Docker

```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Produção
docker-compose up -d
```

## 📚 Documentação da API

### Autenticação
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
```

### Usuários
```http
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Agendamentos
```http
GET    /api/appointments
POST   /api/appointments
GET    /api/appointments/:id
PUT    /api/appointments/:id
DELETE /api/appointments/:id
```

### Serviços
```http
GET    /api/services
POST   /api/services
GET    /api/services/:id
PUT    /api/services/:id
DELETE /api/services/:id
```

### Barbeiros
```http
GET    /api/barbers
GET    /api/barbers/:id
GET    /api/barbers/:id/availability
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch

# Testes do frontend
cd client && npm test
```

## 🔧 Scripts Disponíveis

### Backend
```bash
npm run dev          # Desenvolvimento
npm run dev:watch    # Desenvolvimento com watch
npm run build        # Build para produção
npm start            # Iniciar em produção
npm run migrate      # Executar migrações
npm run seed         # Popular banco com dados
npm run lint         # Linter
npm run type-check   # Verificação de tipos
```

### Frontend
```bash
npm run client       # Iniciar frontend
npm run client:build # Build do frontend
```

### Docker
```bash
docker-compose up -d              # Produção
docker-compose -f docker-compose.dev.yml up -d  # Desenvolvimento
```

## 🛡️ Segurança

- **Autenticação JWT** com refresh tokens
- **Rate Limiting** para prevenir ataques
- **Validação de dados** robusta
- **Sanitização** de inputs
- **Headers de segurança** (Helmet.js)
- **CORS** configurado
- **Logs de auditoria** para ações sensíveis

## 📊 Monitoramento

- **Health Checks** em `/health`
- **Métricas Prometheus** em `/metrics`
- **Logs estruturados** com Winston
- **Dashboard Grafana** (opcional)
- **Alertas** configuráveis

## 🚀 Deploy

### Heroku
```bash
# Configure as variáveis de ambiente
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your-db-host
# ... outras variáveis

# Deploy
git push heroku main
```

### Docker
```bash
# Build da imagem
docker build -t barbershop .

# Executar container
docker run -p 3000:3000 barbershop
```

### VPS/Cloud
```bash
# Clone e configure
git clone https://github.com/leogu/BarberShop.git
cd BarberShop
npm install
npm run build

# Configure PM2
npm install -g pm2
pm2 start dist/server.js --name barbershop
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Leo Guesada**
- Email: leoguesada08@gmail.com
- GitHub: [@leogu](https://github.com/leogu)

## 🙏 Agradecimentos

- Comunidade React e Node.js
- Contribuidores do projeto
- Bibliotecas open source utilizadas

---

⭐ Se este projeto te ajudou, considere dar uma estrela!