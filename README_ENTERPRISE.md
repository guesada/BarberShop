# 🚀 BarberShop Elite – Sistema Enterprise-Grade de Gerenciamento

> Aplicação full-stack moderna (Node.js 18 + React 18) para gestão completa de barbearias, com arquitetura profissional, segurança avançada e UX premium.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=flat&logo=node.js)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.x-blue?style=flat&logo=mysql)
![License](https://img.shields.io/badge/License-MIT-brightgreen)

---

## ✨ Destaques

| Área | Funcionalidades |
|------|-----------------|
| **Backend** | Arquitetura MVC, JWT + Refresh, Roles (Client/Barber/Admin), CRUD completo, Scheduler (node-cron), Email (Nodemailer), Logs (Winston), Rate Limit, Helmet, XSS-Clean |
| **Banco** | MySQL 8 com índices otimizados, migrations + seed automáticos, relacionamentos e FKs |
| **Frontend** | React 18, React-Router v6, Zustand, Styled-Components, Framer Motion, React-Hook-Form, React-Hot-Toast, PWA support |
| **Dev Ops** | Scripts `migrate`, `seed`, `setup`, `dev:full`, Health-check, ESLint/Jest + Supertest |
| **UX** | Tema Dark/Light, responsividade avançada, animações fluidas, acessibilidade WCAG 2.1 |

---

## 📂 Estrutura de Pastas

```txt
BarberShop/
├── client/               # Frontend React
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── store/
│       └── styles/
├── src/                  # Backend Node.js
│   ├── config/           # database.js, …
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/         # EmailService, SchedulerService
│   └── scripts/          # migrate.js, seed.js
├── .env                  # Variáveis de ambiente (backend)
├── server.js             # Servidor Express principal
└── README_ENTERPRISE.md  # Este arquivo
```

---

## ⚡ Instalação Rápida (5 passos)

```bash
# 1) Clone
$ git clone https://github.com/leogu/BarberShop.git && cd BarberShop

# 2) Dependências backend
$ npm install

# 3) Dependências frontend
$ npm run client:install

# 4) Banco de dados
$ npm run migrate && npm run seed   # cria esquema + dados demo

# 5) Inicie full-stack
$ npm run dev:full                  # http://localhost:3001 (React) / 3000 (API)
```

> 📑 **.env** já preenchido com valores default; altere apenas `DB_PASSWORD` se necessário.

---

## 🔐 Credenciais Demo

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@barbershop.com | admin123456 |
| Barbeiro | joao@barbershop.com | 123456 |
| Cliente | maria@cliente.com | 123456 |

---

## 🔧 Scripts NPM Principais

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Backend com Nodemon |
| `npm run client` | Frontend React (porta 3001) |
| `npm run dev:full` | Backend + Frontend simultâneos |
| `npm run migrate` | Cria/atualiza tabelas MySQL |
| `npm run seed` | Popula dados de exemplo |
| `npm test` | Testes Jest/Supertest |

---

## 📚 Endpoints Principais

```http
# Auth
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me

# Users
GET  /api/users
GET  /api/users/:id

# Barbers
GET  /api/barbers
GET  /api/barbers/:id
GET  /api/barbers/:id/availability

# Services
GET  /api/services
GET  /api/services/popular

# Appointments
GET  /api/appointments
POST /api/appointments
PATCH /api/appointments/:id/cancel

# Notifications
GET  /api/notifications/status-public
POST /api/notifications/test-email-public
```

---

## 🛡️ Segurança

- JWT + Refresh Tokens
- Hash bcrypt (12 rounds)
- Helmet + CORS + Rate-Limit
- Sanitização (xss-clean, HPP, express-validator)

---

## 🖌️ Design / UX

- Tema Dark/Light persistente
- Paleta preto + dourado profissional
- Animações Framer Motion (< 60 fps)
- Layout mobile-first (6 breakpoints)

---

## 🏎️ Performance

- Code Splitting & Lazy Loading
- Gzip Compression (backend)
- Índices MySQL otimizados
- Cache React Query (5 min stale)

---

## 📈 Roadmap

- [ ] Integração Stripe (pagamentos)
- [ ] Notificações Push /Web Sockets
- [ ] Painel de relatórios avançados
- [ ] Internacionalização (i18n)

---

## 🤝 Contribuição

1. Fork → Branch → Commit → PR
2. Siga padrão ESLint/Prettier (`npm run lint:fix`)
3. Atualize testes se necessário

---

## 📄 Licença

[MIT](LICENSE) © 2025 Leo Guesada
