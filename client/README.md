# Elite Barber Shop - React Frontend 💈

Aplicação React moderna e responsiva para o sistema de gerenciamento de barbearias, baseada no design Figma com arquitetura profissional.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca moderna para UI
- **React Router v6** - Roteamento SPA
- **Styled Components** - CSS-in-JS
- **Framer Motion** - Animações fluidas
- **Zustand** - Gerenciamento de estado
- **React Query** - Cache e sincronização de dados
- **React Hook Form** - Formulários performáticos
- **React Hot Toast** - Notificações elegantes
- **Lucide React** - Ícones modernos
- **Axios** - Cliente HTTP

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm start

# Build para produção
npm run build

# Executar testes
npm test
```

## 🌐 URLs

- **Desenvolvimento**: http://localhost:3001
- **Backend API**: http://localhost:3000 (se disponível)

## 🎨 Design System

### Cores (Baseado no Figma)
```css
--color-primary-dark: #2D2720    /* Background principal */
--color-secondary-dark: #3A322A  /* Background secundário */
--color-primary-orange: #FF6B35  /* Cor primária laranja */
--color-secondary-orange: #FF5722 /* Laranja escuro */
```

### Tipografia
- **Font Family**: 'Inter', sans-serif
- **Títulos**: 24px-32px, peso 600
- **Subtítulos**: 14px-16px, peso 400
- **Botões**: 16px, peso 500-600

## 📱 Funcionalidades

### ✅ Implementadas
- **Tela de Boas-vindas** - Seleção Cliente/Barbeiro
- **Login Responsivo** - Validação React Hook Form
- **Registro** - Cadastro com validação completa
- **Dashboard Interativo** - Stats animadas
- **Agendamentos** - Lista dinâmica com status
- **Barbeiros Favoritos** - Cards com ratings
- **Bottom Navigation** - Navegação mobile
- **Animações Fluidas** - Framer Motion
- **Estado Global** - Zustand
- **Notificações** - Toast elegantes
- **API Integration** - Axios + fallback offline

### 🔄 Modo Demo
A aplicação funciona em modo demo quando o backend não está disponível:
- Dados salvos no localStorage
- Simulação de API com delays realísticos
- Validações funcionais
- Banner informativo

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   ├── LoadingScreen.js    # Tela de carregamento
│   └── DemoBanner.js       # Banner modo demo
├── pages/
│   ├── WelcomePage.js      # Tela inicial
│   ├── LoginPage.js        # Login
│   ├── RegisterPage.js     # Registro
│   └── DashboardPage.js    # Dashboard principal
├── store/
│   ├── authStore.js        # Estado autenticação
│   └── appStore.js         # Estado aplicação
├── services/
│   └── apiService.js       # Cliente API
├── styles/
│   └── GlobalStyles.js     # Estilos globais
└── App.js                  # Roteamento principal
```

## 🔐 Autenticação

### Login
- Validação em tempo real
- Estados de loading
- Persistência de sessão
- Auto-login na inicialização
- Fallback para modo demo

### Registro
- Formulário completo com validação
- Confirmação de senha
- Termos de uso
- Integração com API real

## 📊 Estado Global (Zustand)

### AuthStore
```javascript
// Estado
user, token, isAuthenticated, isLoading, error

// Ações
login(credentials)
register(userData)
logout()
checkAuth()
```

### AppStore
```javascript
// Dados
stats, appointments, barbers, services

// Ações
addAppointment()
updateAppointment()
getFavoriteBarbers()
```

## 🎯 Rotas

- `/` - Tela de boas-vindas
- `/login` - Login (público)
- `/register` - Registro (público)
- `/dashboard` - Dashboard (protegido)

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_APP_NAME=Elite Barber Shop
REACT_APP_VERSION=2.0.0
REACT_APP_ENABLE_MOCK_API=true
```

## 📱 Responsividade

- **Mobile-First**: Otimizado para dispositivos móveis
- **Breakpoints**: 480px, 768px, 1024px
- **Touch Optimization**: Botões 44px+ para acessibilidade
- **Bottom Navigation**: Navegação nativa mobile

## 🎨 Animações

### Framer Motion
- Transições de página suaves
- Hover effects nos botões
- Contadores animados
- Loading states
- Entrada escalonada de elementos

### Performance
- GPU acceleration
- Lazy loading de componentes
- Memoização React
- Bundle optimization

## 🧪 Como Testar

### 1. Modo Completo (com Backend)
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run client
```

### 2. Modo Demo (apenas Frontend)
```bash
npm run client
```

### 3. Credenciais de Teste
- **Email**: qualquer email válido
- **Senha**: mínimo 6 caracteres
- **Admin**: admin@admin.com / 123456

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Netlify/Vercel
- Build command: `npm run build`
- Publish directory: `build`
- Redirects configurados para SPA

## 📈 Performance

- **Lighthouse Score**: 90+ em todas as métricas
- **Bundle Size**: Otimizado com tree shaking
- **Loading Time**: < 3s em 3G
- **Accessibility**: WCAG 2.1 compliant

## 🐛 Debugging

### Console Commands
```javascript
// Estado da autenticação
console.log(useAuthStore.getState())

// Estado da aplicação
console.log(useAppStore.getState())

// Limpar localStorage
localStorage.clear()
```

## 📝 Scripts Disponíveis

- `npm start` - Desenvolvimento
- `npm run build` - Build produção
- `npm test` - Executar testes
- `npm run eject` - Ejetar configuração

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo [LICENSE](../LICENSE) para detalhes.

---

**Elite Barber Shop React** - Interface moderna e profissional para gerenciamento de barbearias 💈
