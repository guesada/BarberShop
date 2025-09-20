// Elite Barber App - JavaScript (Final Fixed Version)
let currentUser = null;
let currentUserType = null;

// Data from the application_data_json
const appData = {
  "barbeiros": [
    {
      "id": 1,
      "nome": "Carlos Mendes",
      "foto": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      "especialidades": ["Corte Clássico", "Barba", "Bigode"],
      "avaliacao": 4.9,
      "preco_base": 35,
      "disponibilidade": ["09:00", "10:30", "14:00", "15:30", "17:00"]
    },
    {
      "id": 2,
      "nome": "Roberto Silva",
      "foto": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      "especialidades": ["Degradê", "Barba Moderna", "Sobrancelha"],
      "avaliacao": 4.8,
      "preco_base": 40,
      "disponibilidade": ["08:00", "09:30", "11:00", "13:30", "16:00"]
    },
    {
      "id": 3,
      "nome": "André Costa",
      "foto": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      "especialidades": ["Corte Social", "Barba Clássica", "Tratamentos"],
      "avaliacao": 4.7,
      "preco_base": 30,
      "disponibilidade": ["10:00", "11:30", "14:30", "16:30", "18:00"]
    }
  ],
  "servicos": [
    {
      "id": 1,
      "nome": "Corte + Barba",
      "preco": 45,
      "duracao": 60,
      "descricao": "Corte personalizado + acabamento de barba"
    },
    {
      "id": 2,
      "nome": "Corte Simples",
      "preco": 25,
      "duracao": 30,
      "descricao": "Corte básico com máquina e tesoura"
    },
    {
      "id": 3,
      "nome": "Barba Completa",
      "preco": 20,
      "duracao": 30,
      "descricao": "Aparar, modelar e hidratar a barba"
    },
    {
      "id": 4,
      "nome": "Tratamento Capilar",
      "preco": 35,
      "duracao": 45,
      "descricao": "Lavagem, hidratação e finalização"
    }
  ],
  "agendamentos_cliente": [
    {
      "id": 1,
      "barbeiro": "Carlos Mendes",
      "servico": "Corte + Barba",
      "data": "2025-09-20",
      "hora": "14:00",
      "status": "confirmado",
      "preco": 45
    },
    {
      "id": 2,
      "barbeiro": "Roberto Silva",
      "servico": "Corte Simples",
      "data": "2025-09-15",
      "hora": "10:30",
      "status": "concluido",
      "preco": 25,
      "avaliacao": 5
    }
  ],
  "historico_barbeiro": [
    {
      "id": 1,
      "cliente": "João Silva",
      "servico": "Corte + Barba",
      "data": "2025-09-18",
      "hora": "15:30",
      "valor": 45,
      "status": "concluido"
    },
    {
      "id": 2,
      "cliente": "Pedro Santos",
      "servico": "Barba Completa",
      "data": "2025-09-18",
      "hora": "17:00",
      "valor": 20,
      "status": "concluido"
    }
  ],
  "estoque": [
    {
      "id": 1,
      "produto": "Shampoo Profissional",
      "quantidade": 12,
      "preco_custo": 15.50,
      "fornecedor": "Beauty Supply"
    },
    {
      "id": 2,
      "produto": "Óleo para Barba",
      "quantidade": 8,
      "preco_custo": 22.00,
      "fornecedor": "Barber Products"
    },
    {
      "id": 3,
      "produto": "Pomada Modeladora",
      "quantidade": 15,
      "preco_custo": 18.90,
      "fornecedor": "Hair Style Co."
    }
  ],
  "notificacoes": [
    {
      "id": 1,
      "tipo": "agendamento",
      "mensagem": "Novo agendamento para amanhã às 14:00",
      "data": "2025-09-19",
      "lida": false
    },
    {
      "id": 2,
      "tipo": "confirmacao",
      "mensagem": "Agendamento confirmado para 20/09 às 14:00",
      "data": "2025-09-19",
      "lida": false
    },
    {
      "id": 3,
      "tipo": "estoque",
      "mensagem": "Óleo para Barba com estoque baixo",
      "data": "2025-09-18",
      "lida": true
    }
  ]
};

// Utility Functions
function showScreen(screenId) {
  console.log('Showing screen:', screenId);
  
  // Hide all screens
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show target screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    console.log('Screen shown successfully:', screenId);
  } else {
    console.error('Screen not found:', screenId);
  }
}

// Global function declarations (available to onclick handlers)
window.selectUserType = function(userType) {
  console.log('🔄 Selecting user type:', userType);
  currentUserType = userType;
  
  if (userType === 'cliente') {
    console.log('📱 Redirecting to cliente login');
    showScreen('login-cliente');
  } else if (userType === 'barbeiro') {
    console.log('✂️ Redirecting to barbeiro login');
    showScreen('login-barbeiro');
  }
};

console.log('🚀 App.js carregado!');
console.log('📋 selectUserType disponível:', typeof window.selectUserType);

// Função para atualizar data e hora
function updateDateTime() {
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  const dateTimeElement = document.getElementById('current-datetime');
  if (dateTimeElement) {
    dateTimeElement.textContent = now.toLocaleDateString('pt-BR', options);
  }
}

// Função para agendar com barbeiro específico
window.agendarComBarbeiro = function(barbeiroId) {
  console.log('📅 Agendando com barbeiro ID:', barbeiroId);
  // Aqui você pode implementar a lógica específica
  showAgendamento();
};

// Sistema de alternância de tema
window.toggleTheme = function() {
  const body = document.body;
  
  // Alternar classe do tema
  body.classList.toggle('dark-theme');
  
  // Salvar preferência e atualizar ícone
  if (body.classList.contains('dark-theme')) {
    localStorage.setItem('theme', 'dark');
    console.log('🌙 Tema escuro ativado');
  } else {
    localStorage.setItem('theme', 'light');
    console.log('☀️ Tema claro ativado');
  }
  
  // Atualizar ícone
  updateThemeIcon();
};

// Carregar tema salvo
function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  
  if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
    console.log('🌙 Tema escuro carregado');
  } else {
    body.classList.remove('dark-theme');
    console.log('☀️ Tema claro carregado');
  }
  
  // Atualizar ícone após um pequeno delay para garantir que o elemento existe
  setTimeout(updateThemeIcon, 100);
}

// Atualizar ícone do tema
function updateThemeIcon() {
  const themeIcon = document.getElementById('theme-icon');
  const body = document.body;
  
  if (themeIcon) {
    if (body.classList.contains('dark-theme')) {
      themeIcon.className = 'fas fa-sun';
    } else {
      themeIcon.className = 'fas fa-moon';
    }
    console.log('🎨 Ícone do tema atualizado');
  } else {
    console.log('⚠️ Ícone do tema não encontrado');
  }
}

window.goBack = function() {
  console.log('Going back to user selection');
  showScreen('user-selection');
  currentUserType = null;
};

window.loginCliente = function(event) {
  if (event) event.preventDefault();
  console.log('🔑 Executando login do cliente...');
  
  // Pegar dados do formulário
  const form = document.getElementById('login-cliente-form');
  const formData = new FormData(form);
  const email = formData.get('email');
  const name = email ? email.split('@')[0] : 'João Silva';
  
  // Simular login (em produção, aqui faria a validação real)
  currentUser = { 
    type: 'cliente', 
    name: name.charAt(0).toUpperCase() + name.slice(1),
    email: email || 'joao@email.com'
  };
  
  // Salvar dados do usuário para lembrar login
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('loginTime', Date.now().toString());
  
  console.log('👤 Usuário logado:', currentUser);
  console.log('💾 Login salvo no localStorage');
  console.log('🔄 Redirecionando para dashboard...');
  
  showScreen('dashboard-cliente');
  setTimeout(() => {
    loadClienteDashboard();
    updateNotificationBadge();
    updateDateTime();
    updateThemeIcon();
    // Atualizar data/hora a cada minuto
    setInterval(updateDateTime, 60000);
  }, 100);
};

// Função para carregar dados do dashboard do cliente
function loadClienteDashboard() {
  console.log('📊 Loading cliente dashboard');
  
  // Atualizar nome do usuário
  const userNameElement = document.getElementById('user-name');
  if (userNameElement && currentUser) {
    userNameElement.textContent = currentUser.name;
  }
  
  // Carregar dados dinâmicos
  loadUpcomingAppointments();
  loadFavoriteBarbers();
  updateStats();
}

// Carregar próximos agendamentos
function loadUpcomingAppointments() {
  const container = document.getElementById('upcoming-appointments-list');
  if (!container) return;
  
  // Dados simulados - em produção viriam da API
  const appointments = [
    {
      id: 1,
      service: 'Corte + Barba',
      barber: 'Carlos Mendes',
      date: 'Amanhã',
      time: '14:00',
      status: 'confirmed',
      location: 'Elite Barber - Centro'
    },
    {
      id: 2,
      service: 'Corte Simples',
      barber: 'Roberto Silva',
      date: 'Sex, 22',
      time: '16:30',
      status: 'pending',
      location: 'Elite Barber - Centro'
    }
  ];
  
  container.innerHTML = appointments.map(apt => `
    <div class="appointment-card ${apt.status === 'confirmed' ? 'featured' : ''}">
      <div class="appointment-time">
        <div class="time-day">${apt.date}</div>
        <div class="time-hour">${apt.time}</div>
      </div>
      <div class="appointment-details">
        <h3>${apt.service}</h3>
        <p class="barber-name">
          <i class="fas fa-user"></i>
          ${apt.barber}
        </p>
        <p class="appointment-location">
          <i class="fas fa-map-marker-alt"></i>
          ${apt.location}
        </p>
      </div>
      <div class="appointment-actions">
        <button class="btn-small primary" title="Direções">
          <i class="fas fa-directions"></i>
        </button>
        <button class="btn-small secondary" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
      </div>
      <div class="appointment-status ${apt.status}">
        <i class="fas fa-${apt.status === 'confirmed' ? 'check-circle' : 'clock'}"></i>
        ${apt.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
      </div>
    </div>
  `).join('');
}

// Carregar barbeiros favoritos
function loadFavoriteBarbers() {
  const container = document.getElementById('favorite-barbers-list');
  if (!container) return;
  
  // Usar dados do appData
  const favoriteBarbers = appData.barbeiros.slice(0, 2);
  
  container.innerHTML = favoriteBarbers.map((barbeiro, index) => `
    <div class="barber-card ${index === 0 ? 'premium' : ''}">
      <div class="barber-avatar">
        <img src="${barbeiro.foto}" alt="${barbeiro.nome}">
        <div class="online-status ${index === 0 ? 'online' : 'offline'}"></div>
      </div>
      <div class="barber-info">
        <h3>${barbeiro.nome}</h3>
        <div class="barber-rating">
          <div class="stars">
            ${Array(Math.floor(barbeiro.avaliacao)).fill('<i class="fas fa-star"></i>').join('')}
            ${barbeiro.avaliacao % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
          </div>
          <span class="rating-value">${barbeiro.avaliacao}</span>
        </div>
        <p class="barber-specialty">Especialista em ${barbeiro.especialidades[0]}</p>
        <div class="barber-price">A partir de <strong>R$ ${barbeiro.preco_base}</strong></div>
      </div>
      <div class="barber-actions">
        <button class="btn-small primary" onclick="agendarComBarbeiro(${barbeiro.id})">
          <i class="fas fa-calendar-plus"></i>
          Agendar
        </button>
      </div>
    </div>
  `).join('');
}

// Atualizar estatísticas
function updateStats() {
  // Simular dados dinâmicos
  const stats = {
    proximosAgendamentos: 2,
    servicosConcluidos: 12,
    avaliacaoMedia: 4.9,
    gastoTotal: 340
  };
  
  // Atualizar números nas estatísticas se necessário
  console.log('📈 Stats updated:', stats);
}

window.loginBarbeiro = function(event) {
  if (event) event.preventDefault();
  console.log('✂️ Executando login do barbeiro...');
  
  // Pegar dados do formulário
  const form = document.getElementById('login-barbeiro-form');
  const formData = new FormData(form);
  const email = formData.get('email');
  const name = email ? email.split('@')[0] : 'Carlos Mendes';
  
  // Simular login (em produção, aqui faria a validação real)
  currentUser = { 
    type: 'barbeiro', 
    name: name.charAt(0).toUpperCase() + name.slice(1),
    email: email || 'carlos@elitebarber.com'
  };
  
  // Salvar dados do usuário para lembrar login
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('loginTime', Date.now().toString());
  
  console.log('👤 Barbeiro logado:', currentUser);
  console.log('💾 Login salvo no localStorage');
  console.log('🔄 Redirecionando para dashboard...');
  
  showScreen('dashboard-barbeiro');
  setTimeout(() => {
    loadBarbeiroData();
    updateNotificationBadge();
    updateThemeIcon();
  }, 100);
};

window.logout = function() {
  console.log('🚪 Fazendo logout...');
  
  // Limpar dados do usuário
  currentUser = null;
  currentUserType = null;
  
  // Limpar localStorage
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('loginTime');
  
  console.log('🗑️ Dados de login removidos');
  
  // Close any open modals
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => modal.classList.add('hidden'));
  
  showScreen('user-selection');
  showNotificationToast('Logout realizado com sucesso!');
};

// Navigation Functions
window.showSection = function(sectionId) {
  console.log('📍 Showing section:', sectionId);
  
  // Update nav items active state (novo design)
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  
  const activeNavItem = document.querySelector(`[onclick*="${sectionId}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }
  
  // Update old menu items (fallback)
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => item.classList.remove('active'));
  
  const activeMenuItem = document.querySelector(`[onclick*="${sectionId}"]`);
  if (activeMenuItem) {
    activeMenuItem.classList.add('active');
  }
  
  // Show section content
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => section.classList.remove('active'));
  
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    
    // Carregar dados específicos da seção
    loadSectionData(sectionId);
  }
};

// Carregar dados específicos de cada seção
function loadSectionData(sectionId) {
  switch(sectionId) {
    case 'home-cliente':
      loadClienteDashboard();
      break;
    case 'agendamentos-cliente':
      loadAgendamentosCliente();
      break;
    case 'historico-cliente':
      loadHistoricoCliente();
      break;
    case 'perfil-cliente':
      loadPerfilCliente();
      break;
    case 'favoritos-cliente':
      loadFavoritosCliente();
      break;
    default:
      console.log('📄 Seção carregada:', sectionId);
  }
}

// Funções para carregar dados das seções
function loadAgendamentosCliente() {
  console.log('📅 Loading agendamentos cliente');
  // Implementar carregamento de agendamentos
}

function loadHistoricoCliente() {
  console.log('📜 Loading histórico cliente');
  // Implementar carregamento de histórico
}

function loadPerfilCliente() {
  console.log('👤 Loading perfil cliente');
  // Implementar carregamento de perfil
}

function loadFavoritosCliente() {
  console.log('❤️ Loading favoritos cliente');
  // Implementar carregamento de favoritos
}

// Modal Functions
window.showModal = function(modalId) {
  console.log('Showing modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
};

window.closeModal = function(modalId) {
  console.log('Closing modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restore scrolling
  }
};

// Cliente Functions
function loadClienteData() {
  console.log('Loading cliente data');
  loadBarbeiros();
  loadAgendamentosCliente();
  loadHistoricoCliente();
}

function loadBarbeiros() {
  const container = document.getElementById('barbeiros-lista');
  if (!container) return;
  
  container.innerHTML = appData.barbeiros.map(barbeiro => `
    <div class="barbeiro-card" onclick="selecionarBarbeiro(${barbeiro.id})">
      <div class="barbeiro-header">
        <img src="${barbeiro.foto}" alt="${barbeiro.nome}" class="barbeiro-avatar">
        <div class="barbeiro-info">
          <h4>${barbeiro.nome}</h4>
          <div class="barbeiro-rating">
            <i class="fas fa-star"></i>
            <span>${barbeiro.avaliacao}</span>
          </div>
        </div>
      </div>
      <div class="barbeiro-especialidades">
        ${barbeiro.especialidades.map(esp => 
          `<span class="especialidade-tag">${esp}</span>`
        ).join('')}
      </div>
      <div class="barbeiro-preco">A partir de R$ ${barbeiro.preco_base}</div>
    </div>
  `).join('');
}

function loadAgendamentosCliente() {
  const container = document.getElementById('agendamentos-lista');
  if (!container) return;
  
  container.innerHTML = appData.agendamentos_cliente.map(agendamento => `
    <div class="agendamento-card">
      <div class="agendamento-info">
        <h4>${agendamento.servico}</h4>
        <div class="agendamento-details">
          <p><strong>Barbeiro:</strong> ${agendamento.barbeiro}</p>
          <p><strong>Data:</strong> ${formatDate(agendamento.data)} às ${agendamento.hora}</p>
          <p><strong>Valor:</strong> R$ ${agendamento.preco}</p>
        </div>
      </div>
      <div class="agendamento-actions">
        <span class="status status--${agendamento.status === 'confirmado' ? 'success' : 'info'}">
          ${agendamento.status}
        </span>
        ${agendamento.status === 'confirmado' ? 
          `<button class="btn btn--outline btn--sm" onclick="cancelarAgendamento(${agendamento.id})">
            Cancelar
          </button>` : ''}
      </div>
    </div>
  `).join('');
}

function loadHistoricoCliente() {
  const container = document.getElementById('historico-lista');
  if (!container) return;
  
  const historicoConcluido = appData.agendamentos_cliente.filter(a => a.status === 'concluido');
  
  container.innerHTML = historicoConcluido.map(item => `
    <div class="agendamento-card">
      <div class="agendamento-info">
        <h4>${item.servico}</h4>
        <div class="agendamento-details">
          <p><strong>Barbeiro:</strong> ${item.barbeiro}</p>
          <p><strong>Data:</strong> ${formatDate(item.data)} às ${item.hora}</p>
          <p><strong>Valor:</strong> R$ ${item.preco}</p>
        </div>
      </div>
      <div class="agendamento-actions">
        ${item.avaliacao ? 
          `<div class="barbeiro-rating">
            ${Array(item.avaliacao).fill('<i class="fas fa-star"></i>').join('')}
          </div>` :
          `<button class="btn btn--primary btn--sm" onclick="avaliarServico(${item.id})">
            Avaliar
          </button>`
        }
      </div>
    </div>
  `).join('');
}

// Barbeiro Functions
function loadBarbeiroData() {
  console.log('Loading barbeiro data');
  loadProximosAgendamentos();
  loadEstoque();
  loadHistoricoBarbeiro();
  loadAgenda();
}

function loadProximosAgendamentos() {
  const container = document.getElementById('proximos-agendamentos');
  if (!container) return;
  
  // Simular próximos agendamentos para hoje
  const proximosAgendamentos = [
    {
      cliente: "Maria Santos",
      servico: "Corte + Barba",
      hora: "15:30",
      valor: 45,
      status: "confirmado"
    },
    {
      cliente: "Pedro Oliveira",
      servico: "Corte Simples",
      hora: "16:00",
      valor: 25,
      status: "pendente"
    }
  ];
  
  container.innerHTML = proximosAgendamentos.map((agendamento, index) => `
    <div class="agendamento-card">
      <div class="agendamento-info">
        <h4>${agendamento.cliente}</h4>
        <div class="agendamento-details">
          <p><strong>Serviço:</strong> ${agendamento.servico}</p>
          <p><strong>Horário:</strong> ${agendamento.hora}</p>
          <p><strong>Valor:</strong> R$ ${agendamento.valor}</p>
        </div>
      </div>
      <div class="agendamento-actions">
        <span class="status status--${agendamento.status === 'confirmado' ? 'success' : 'warning'}">
          ${agendamento.status}
        </span>
        ${agendamento.status === 'pendente' ? 
          `<button class="btn btn--primary btn--sm" onclick="confirmarAgendamentoBarbeiro(${index})">
            Confirmar
          </button>` : ''}
      </div>
    </div>
  `).join('');
}

function loadEstoque() {
  const container = document.getElementById('estoque-lista');
  if (!container) return;
  
  container.innerHTML = appData.estoque.map(item => `
    <div class="estoque-item">
      <div class="produto-info">
        <h4>${item.produto}</h4>
        <div class="produto-details">
          <p><strong>Fornecedor:</strong> ${item.fornecedor}</p>
          <p><strong>Custo:</strong> R$ ${item.preco_custo.toFixed(2)}</p>
        </div>
      </div>
      <div class="quantidade-badge ${item.quantidade < 10 ? 'quantidade-baixa' : 'quantidade-normal'}">
        ${item.quantidade} un
      </div>
    </div>
  `).join('');
}

function loadHistoricoBarbeiro() {
  const container = document.getElementById('historico-barbeiro-lista');
  if (!container) return;
  
  container.innerHTML = appData.historico_barbeiro.map(item => `
    <div class="agendamento-card">
      <div class="agendamento-info">
        <h4>${item.cliente}</h4>
        <div class="agendamento-details">
          <p><strong>Serviço:</strong> ${item.servico}</p>
          <p><strong>Data:</strong> ${formatDate(item.data)} às ${item.hora}</p>
          <p><strong>Valor:</strong> R$ ${item.valor}</p>
        </div>
      </div>
      <div class="agendamento-actions">
        <span class="status status--success">${item.status}</span>
      </div>
    </div>
  `).join('');
}

// Agendamento Functions
window.showAgendamento = function() {
  console.log('Showing agendamento modal');
  showModal('modal-agendamento');
  // Load form data after modal is shown
  setTimeout(() => {
    loadAgendamentoForm();
  }, 100);
};

function loadAgendamentoForm() {
  console.log('Loading agendamento form data');
  
  // Populate barbeiros
  const selectBarbeiro = document.getElementById('select-barbeiro');
  if (selectBarbeiro) {
    const options = '<option value="">Selecione um barbeiro</option>' +
      appData.barbeiros.map(barbeiro => 
        `<option value="${barbeiro.id}">${barbeiro.nome} - A partir de R$ ${barbeiro.preco_base}</option>`
      ).join('');
    selectBarbeiro.innerHTML = options;
    console.log('Barbeiros loaded:', appData.barbeiros.length);
  }
  
  // Populate servicos
  const selectServico = document.getElementById('select-servico');
  if (selectServico) {
    const options = '<option value="">Selecione um serviço</option>' +
      appData.servicos.map(servico => 
        `<option value="${servico.id}">${servico.nome} - R$ ${servico.preco} (${servico.duracao}min)</option>`
      ).join('');
    selectServico.innerHTML = options;
    console.log('Servicos loaded:', appData.servicos.length);
  }
  
  // Set minimum date to today
  const inputData = document.getElementById('input-data');
  if (inputData) {
    const today = new Date().toISOString().split('T')[0];
    inputData.min = today;
    inputData.value = today;
  }
  
  // Load initial horarios
  loadHorariosDisponiveis();
  
  // Add event listener for barbeiro selection
  if (selectBarbeiro) {
    selectBarbeiro.addEventListener('change', loadHorariosDisponiveis);
  }
}

function loadHorariosDisponiveis() {
  const selectBarbeiro = document.getElementById('select-barbeiro');
  const selectHorario = document.getElementById('select-horario');
  
  if (!selectBarbeiro || !selectHorario) return;
  
  const barbeiroId = selectBarbeiro.value;
  
  if (!barbeiroId) {
    selectHorario.innerHTML = '<option value="">Selecione um horário</option>';
    return;
  }
  
  const barbeiro = appData.barbeiros.find(b => b.id == barbeiroId);
  
  if (barbeiro) {
    selectHorario.innerHTML = '<option value="">Selecione um horário</option>' +
      barbeiro.disponibilidade.map(horario => 
        `<option value="${horario}">${horario}</option>`
      ).join('');
  }
}

window.confirmarAgendamento = function() {
  console.log('Confirming agendamento');
  
  const selectBarbeiro = document.getElementById('select-barbeiro');
  const selectServico = document.getElementById('select-servico');
  const inputData = document.getElementById('input-data');
  const selectHorario = document.getElementById('select-horario');
  
  if (!selectBarbeiro.value || !selectServico.value || !inputData.value || !selectHorario.value) {
    alert('Por favor, preencha todos os campos');
    return;
  }
  
  // Simulate booking
  const barbeiro = appData.barbeiros.find(b => b.id == selectBarbeiro.value);
  const servico = appData.servicos.find(s => s.id == selectServico.value);
  
  const novoAgendamento = {
    id: Date.now(),
    barbeiro: barbeiro.nome,
    servico: servico.nome,
    data: inputData.value,
    hora: selectHorario.value,
    status: 'confirmado',
    preco: servico.preco
  };
  
  appData.agendamentos_cliente.push(novoAgendamento);
  
  closeModal('modal-agendamento');
  showNotificationToast('Agendamento confirmado com sucesso!');
  
  // Reload agendamentos if on that section
  if (document.getElementById('agendamentos-cliente') && document.getElementById('agendamentos-cliente').classList.contains('active')) {
    loadAgendamentosCliente();
  }
};

// Notification Functions
window.showNotifications = function() {
  console.log('Showing notifications modal');
  showModal('modal-notificacoes');
  setTimeout(() => {
    loadNotifications();
  }, 100);
};

function loadNotifications() {
  console.log('Loading notifications data');
  const container = document.getElementById('notifications-list');
  if (!container) {
    console.error('Notifications container not found');
    return;
  }
  
  const notificationsHtml = appData.notificacoes.map(notif => `
    <div class="notification-item ${!notif.lida ? 'unread' : ''}" onclick="markAsRead(${notif.id})">
      <div class="notification-header">
        <span class="notification-type">${notif.tipo}</span>
        <span class="notification-date">${formatDate(notif.data)}</span>
      </div>
      <p class="notification-message">${notif.mensagem}</p>
    </div>
  `).join('');
  
  container.innerHTML = notificationsHtml;
  console.log('Notifications loaded:', appData.notificacoes.length);
}

window.markAsRead = function(notifId) {
  console.log('Marking notification as read:', notifId);
  const notif = appData.notificacoes.find(n => n.id === notifId);
  if (notif) {
    notif.lida = true;
    loadNotifications();
    updateNotificationBadge();
  }
};

function updateNotificationBadge() {
  const unreadCount = appData.notificacoes.filter(n => !n.lida).length;
  const badges = document.querySelectorAll('.notification-badge');
  
  badges.forEach(badge => {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  });
  
  console.log('Notification badge updated:', unreadCount);
}

function showNotificationToast(message) {
  // Create toast notification
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add toast styles
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-success);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

window.selecionarBarbeiro = function(barbeiroId) {
  console.log('Selecting barbeiro:', barbeiroId);
  showAgendamento();
  // Pre-select the barbeiro
  setTimeout(() => {
    const selectBarbeiro = document.getElementById('select-barbeiro');
    if (selectBarbeiro) {
      selectBarbeiro.value = barbeiroId;
      loadHorariosDisponiveis();
    }
  }, 200);
};

window.cancelarAgendamento = function(agendamentoId) {
  if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
    const index = appData.agendamentos_cliente.findIndex(a => a.id === agendamentoId);
    if (index !== -1) {
      appData.agendamentos_cliente[index].status = 'cancelado';
      showNotificationToast('Agendamento cancelado com sucesso');
      loadAgendamentosCliente();
    }
  }
};

window.avaliarServico = function(agendamentoId) {
  const rating = prompt('Avalie o serviço de 1 a 5 estrelas:');
  if (rating && rating >= 1 && rating <= 5) {
    const agendamento = appData.agendamentos_cliente.find(a => a.id === agendamentoId);
    if (agendamento) {
      agendamento.avaliacao = parseInt(rating);
      showNotificationToast('Avaliação enviada com sucesso!');
      loadHistoricoCliente();
    }
  }
};

window.confirmarAgendamentoBarbeiro = function(index) {
  showNotificationToast('Agendamento confirmado!');
  loadProximosAgendamentos();
};

window.showAddProduto = function() {
  const produto = prompt('Nome do produto:');
  const quantidade = prompt('Quantidade:');
  const preco = prompt('Preço de custo:');
  const fornecedor = prompt('Fornecedor:');
  
  if (produto && quantidade && preco && fornecedor) {
    appData.estoque.push({
      id: Date.now(),
      produto: produto,
      quantidade: parseInt(quantidade),
      preco_custo: parseFloat(preco),
      fornecedor: fornecedor
    });
    
    showNotificationToast('Produto adicionado ao estoque!');
    loadEstoque();
  }
};

window.showProfile = function(userType) {
  if (userType === 'cliente') {
    showSection('perfil-cliente');
  } else {
    showSection('perfil-barbeiro');
  }
};

window.loadAgenda = function() {
  console.log('Loading agenda');
  // Simulate agenda loading
  const container = document.getElementById('agenda-grid');
  if (!container) return;
  
  const agendaItems = [
    { hora: "09:00", cliente: "João Silva", servico: "Corte + Barba", status: "confirmado" },
    { hora: "10:30", cliente: "Maria Santos", servico: "Corte Simples", status: "confirmado" },
    { hora: "14:00", cliente: "", servico: "", status: "livre" },
    { hora: "15:30", cliente: "Pedro Costa", servico: "Barba Completa", status: "pendente" },
    { hora: "17:00", cliente: "", servico: "", status: "livre" }
  ];
  
  container.innerHTML = `
    <div class="agenda-timeline">
      ${agendaItems.map(item => `
        <div class="agenda-slot ${item.status}">
          <div class="agenda-time">${item.hora}</div>
          <div class="agenda-content">
            ${item.cliente ? `
              <h4>${item.cliente}</h4>
              <p>${item.servico}</p>
              <span class="status status--${item.status === 'confirmado' ? 'success' : 'warning'}">
                ${item.status}
              </span>
            ` : `
              <p class="agenda-free">Horário livre</p>
            `}
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

// Registration Functions
window.showRegister = function(userType) {
  console.log('📝 Showing registration for:', userType);
  currentUserType = userType;
  
  if (userType === 'cliente') {
    showScreen('register-cliente');
    // Limpar formulário
    const form = document.getElementById('register-cliente-form');
    if (form) form.reset();
  } else if (userType === 'barbeiro') {
    showScreen('register-barbeiro');
    // Limpar formulário
    const form = document.getElementById('register-barbeiro-form');
    if (form) form.reset();
  }
};

window.showLogin = function(userType) {
  console.log('🔑 Showing login for:', userType);
  currentUserType = userType;
  
  if (userType === 'cliente') {
    showScreen('login-cliente');
  } else if (userType === 'barbeiro') {
    showScreen('login-barbeiro');
  }
};

// Debug: Verificar se todas as funções estão disponíveis
console.log('🔍 Funções disponíveis:');
console.log('- selectUserType:', typeof window.selectUserType);
console.log('- showRegister:', typeof window.showRegister);
console.log('- showLogin:', typeof window.showLogin);
console.log('- goBack:', typeof window.goBack);

// Password validation
function validatePassword(password) {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };
  
  const score = Object.values(requirements).filter(Boolean).length;
  return { requirements, score, isValid: score === 5 };
}

function updatePasswordStrength(passwordInput, strengthContainer) {
  const password = passwordInput.value;
  const validation = validatePassword(password);
  
  if (!strengthContainer) return;
  
  const bars = strengthContainer.querySelectorAll('.strength-bar');
  const text = strengthContainer.querySelector('.strength-text');
  
  // Reset bars
  bars.forEach(bar => {
    bar.className = 'strength-bar';
  });
  
  if (password.length === 0) {
    if (text) text.textContent = '';
    return;
  }
  
  // Update bars based on score
  const score = validation.score;
  let strengthLevel = 'weak';
  let strengthText = 'Fraca';
  
  if (score >= 4) {
    strengthLevel = 'strong';
    strengthText = 'Forte';
  } else if (score >= 3) {
    strengthLevel = 'medium';
    strengthText = 'Média';
  }
  
  // Fill bars
  for (let i = 0; i < Math.min(score, bars.length); i++) {
    bars[i].classList.add(strengthLevel);
  }
  
  if (text) {
    text.textContent = `Força da senha: ${strengthText}`;
  }
}

function showFieldError(field, message) {
  // Remove existing error
  const existingError = field.parentNode.querySelector('.form-error');
  if (existingError) {
    existingError.remove();
  }
  
  // Add error class
  field.classList.add('error');
  field.classList.remove('success');
  
  // Add error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'form-error';
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  field.parentNode.appendChild(errorDiv);
}

function showFieldSuccess(field) {
  // Remove existing error
  const existingError = field.parentNode.querySelector('.form-error');
  if (existingError) {
    existingError.remove();
  }
  
  // Add success class
  field.classList.remove('error');
  field.classList.add('success');
}

function clearFieldValidation(field) {
  const existingError = field.parentNode.querySelector('.form-error');
  if (existingError) {
    existingError.remove();
  }
  
  field.classList.remove('error', 'success');
}

// Registration form handlers
function handleClienteRegistration(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  // Validation
  let isValid = true;
  
  // Clear previous validations
  form.querySelectorAll('.form-control').forEach(field => {
    clearFieldValidation(field);
  });
  
  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    showFieldError(form.querySelector('[name="name"]'), 'Nome deve ter pelo menos 2 caracteres');
    isValid = false;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    showFieldError(form.querySelector('[name="email"]'), 'E-mail inválido');
    isValid = false;
  }
  
  // Password validation
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    showFieldError(form.querySelector('[name="password"]'), 'Senha deve conter: maiúscula, minúscula, número e símbolo');
    isValid = false;
  }
  
  // Confirm password
  if (data.password !== data.confirmPassword) {
    showFieldError(form.querySelector('[name="confirmPassword"]'), 'Senhas não coincidem');
    isValid = false;
  }
  
  // Terms acceptance
  if (!data.terms) {
    showFieldError(form.querySelector('[name="terms"]').parentNode, 'Você deve aceitar os termos de uso');
    isValid = false;
  }
  
  if (!isValid) {
    return;
  }
  
  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando conta...';
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  
  // Prepare data for API
  const registrationData = {
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    password: data.password,
    userType: 'cliente',
    phone: data.phone || null
  };
  
  // Call registration API
  registerUser(registrationData)
    .then(response => {
      if (response.success) {
        showSuccessMessage(form, 'Conta criada com sucesso! Redirecionando para login...');
        setTimeout(() => {
          showLogin('cliente');
        }, 2000);
      } else {
        throw new Error(response.message || 'Erro ao criar conta');
      }
    })
    .catch(error => {
      console.error('Registration error:', error);
      showErrorMessage(form, error.message || 'Erro ao criar conta. Tente novamente.');
    })
    .finally(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    });
}

function handleBarbeiroRegistration(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  // Get selected specialties
  const specialties = Array.from(form.querySelectorAll('[name="specialties"]:checked'))
    .map(checkbox => checkbox.value);
  
  // Validation
  let isValid = true;
  
  // Clear previous validations
  form.querySelectorAll('.form-control').forEach(field => {
    clearFieldValidation(field);
  });
  
  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    showFieldError(form.querySelector('[name="name"]'), 'Nome deve ter pelo menos 2 caracteres');
    isValid = false;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    showFieldError(form.querySelector('[name="email"]'), 'E-mail inválido');
    isValid = false;
  }
  
  // Phone validation (required for barbers)
  if (!data.phone || data.phone.trim().length < 10) {
    showFieldError(form.querySelector('[name="phone"]'), 'Telefone é obrigatório');
    isValid = false;
  }
  
  // Password validation
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    showFieldError(form.querySelector('[name="password"]'), 'Senha deve conter: maiúscula, minúscula, número e símbolo');
    isValid = false;
  }
  
  // Confirm password
  if (data.password !== data.confirmPassword) {
    showFieldError(form.querySelector('[name="confirmPassword"]'), 'Senhas não coincidem');
    isValid = false;
  }
  
  // Experience validation
  if (!data.experience) {
    showFieldError(form.querySelector('[name="experience"]'), 'Selecione sua experiência');
    isValid = false;
  }
  
  // Specialties validation
  if (specialties.length === 0) {
    const checkboxGroup = form.querySelector('.checkbox-group');
    showFieldError(checkboxGroup, 'Selecione pelo menos uma especialidade');
    isValid = false;
  }
  
  // Terms acceptance
  if (!data.terms) {
    showFieldError(form.querySelector('[name="terms"]').parentNode, 'Você deve aceitar os termos de uso');
    isValid = false;
  }
  
  if (!isValid) {
    return;
  }
  
  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  
  // Prepare data for API
  const registrationData = {
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    password: data.password,
    userType: 'barbeiro',
    phone: data.phone.trim(),
    experienceYears: parseInt(data.experience),
    specialties: specialties
  };
  
  // Call registration API
  registerUser(registrationData)
    .then(response => {
      if (response.success) {
        showSuccessMessage(form, 'Conta profissional criada com sucesso! Redirecionando para login...');
        setTimeout(() => {
          showLogin('barbeiro');
        }, 2000);
      } else {
        throw new Error(response.message || 'Erro ao criar conta');
      }
    })
    .catch(error => {
      console.error('Registration error:', error);
      showErrorMessage(form, error.message || 'Erro ao criar conta. Tente novamente.');
    })
    .finally(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    });
}

// API call function
async function registerUser(userData) {
  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

function showSuccessMessage(form, message) {
  // Remove existing messages
  const existingMessage = form.querySelector('.success-message, .error-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'success-message';
  messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  
  form.insertBefore(messageDiv, form.firstChild);
}

function showErrorMessage(form, message) {
  // Remove existing messages
  const existingMessage = form.querySelector('.success-message, .error-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'error-message';
  messageDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
  
  form.insertBefore(messageDiv, form.firstChild);
}

// Utility functions for terms and privacy
window.showTerms = function() {
  alert('Termos de Uso:\n\nAo usar nossos serviços, você concorda em:\n- Fornecer informações verdadeiras\n- Respeitar outros usuários\n- Cumprir horários agendados\n- Não usar o serviço para fins ilegais');
};

window.showPrivacy = function() {
  alert('Política de Privacidade:\n\nSeus dados são protegidos e usados apenas para:\n- Prestação dos serviços\n- Comunicação sobre agendamentos\n- Melhorias na plataforma\n\nNão compartilhamos seus dados com terceiros.');
};

// Verificar se usuário já está logado
function checkSavedLogin() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const savedUser = localStorage.getItem('currentUser');
  const loginTime = localStorage.getItem('loginTime');
  
  if (isLoggedIn === 'true' && savedUser && loginTime) {
    // Verificar se o login não expirou (7 dias)
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const currentTime = Date.now();
    const timeDiff = currentTime - parseInt(loginTime);
    
    if (timeDiff < sevenDays) {
      // Login ainda válido
      currentUser = JSON.parse(savedUser);
      console.log('🔄 Login automático:', currentUser);
      
      // Redirecionar para o dashboard apropriado
      if (currentUser.type === 'cliente') {
        showScreen('dashboard-cliente');
        setTimeout(() => {
          loadClienteDashboard();
          updateNotificationBadge();
          updateDateTime();
          updateThemeIcon();
          setInterval(updateDateTime, 60000);
        }, 100);
      } else if (currentUser.type === 'barbeiro') {
        showScreen('dashboard-barbeiro');
        setTimeout(() => {
          loadBarbeiroData();
          updateNotificationBadge();
          updateThemeIcon();
        }, 100);
      }
      
      return true; // Usuário logado automaticamente
    } else {
      // Login expirado, limpar dados
      console.log('⏰ Login expirado, limpando dados...');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loginTime');
    }
  }
  
  return false; // Usuário não logado
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Elite Barber App Initialized');
  
  // Carregar tema salvo
  loadSavedTheme();
  
  // Verificar login salvo
  const isAutoLoggedIn = checkSavedLogin();
  
  // Se não foi logado automaticamente, mostrar tela de seleção
  if (!isAutoLoggedIn) {
    showScreen('user-selection');
  }
  
  // Add click listeners for user cards as backup
  const clienteCard = document.querySelector('.user-card[onclick*="cliente"]');
  const barbeiroCard = document.querySelector('.user-card[onclick*="barbeiro"]');
  
  if (clienteCard) {
    clienteCard.addEventListener('click', function() {
      console.log('🖱️ Cliente card clicked via event listener');
      selectUserType('cliente');
    });
  }
  
  if (barbeiroCard) {
    barbeiroCard.addEventListener('click', function() {
      console.log('🖱️ Barbeiro card clicked via event listener');
      selectUserType('barbeiro');
    });
  }
  
  // Add click listeners for register links as backup
  const registerLinks = document.querySelectorAll('a[onclick*="showRegister"]');
  registerLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const onclick = this.getAttribute('onclick');
      const userType = onclick.match(/showRegister\('(.+?)'\)/)[1];
      console.log('📝 Register link clicked for:', userType);
      showRegister(userType);
    });
  });
  
  // Add click listener for theme toggle button as backup
  const themeToggleBtn = document.querySelector('.theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🎨 Theme toggle clicked via event listener');
      toggleTheme();
    });
  }
  
  // Update notification badge on load
  updateNotificationBadge();
  
  // Close modals when clicking outside
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  });
  
  // Add event listeners for login forms
  const loginClienteForm = document.getElementById('login-cliente-form');
  const loginBarbeiroForm = document.getElementById('login-barbeiro-form');
  
  if (loginClienteForm) {
    loginClienteForm.addEventListener('submit', function(event) {
      event.preventDefault();
      console.log('🔑 Login cliente form submitted');
      loginCliente(event);
    });
  }
  
  if (loginBarbeiroForm) {
    loginBarbeiroForm.addEventListener('submit', function(event) {
      event.preventDefault();
      console.log('✂️ Login barbeiro form submitted');
      loginBarbeiro(event);
    });
  }

  // Add event listeners for registration forms
  const clienteForm = document.getElementById('register-cliente-form');
  const barbeiroForm = document.getElementById('register-barbeiro-form');
  
  if (clienteForm) {
    clienteForm.addEventListener('submit', handleClienteRegistration);
    
    // Add real-time validation for cliente form
    const emailField = clienteForm.querySelector('[name="email"]');
    const passwordField = clienteForm.querySelector('[name="password"]');
    const confirmPasswordField = clienteForm.querySelector('[name="confirmPassword"]');
    
    if (emailField) {
      emailField.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
          showFieldError(this, 'E-mail inválido');
        } else if (this.value) {
          showFieldSuccess(this);
        }
      });
    }
    
    if (passwordField) {
      passwordField.addEventListener('input', function() {
        const validation = validatePassword(this.value);
        if (this.value && !validation.isValid) {
          showFieldError(this, 'Senha deve conter: maiúscula, minúscula, número e símbolo');
        } else if (this.value && validation.isValid) {
          showFieldSuccess(this);
        }
      });
    }
    
    if (confirmPasswordField && passwordField) {
      confirmPasswordField.addEventListener('input', function() {
        if (this.value && this.value !== passwordField.value) {
          showFieldError(this, 'Senhas não coincidem');
        } else if (this.value && this.value === passwordField.value) {
          showFieldSuccess(this);
        }
      });
    }
  }
  
  if (barbeiroForm) {
    barbeiroForm.addEventListener('submit', handleBarbeiroRegistration);
  }
  
  // Prevent form default submission for other forms
  document.addEventListener('submit', function(e) {
    // Only prevent default for forms that don't have specific handlers
    if (!e.target.id || (e.target.id !== 'register-cliente-form' && e.target.id !== 'register-barbeiro-form')) {
      e.preventDefault();
    }
  });
  
  console.log('Application ready with', appData.barbeiros.length, 'barbeiros and', appData.servicos.length, 'servicos');
});