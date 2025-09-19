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
  console.log('Selecting user type:', userType);
  currentUserType = userType;
  
  if (userType === 'cliente') {
    showScreen('login-cliente');
  } else if (userType === 'barbeiro') {
    showScreen('login-barbeiro');
  }
};

window.goBack = function() {
  console.log('Going back to user selection');
  showScreen('user-selection');
  currentUserType = null;
};

window.loginCliente = function(event) {
  event.preventDefault();
  console.log('Logging in cliente');
  
  currentUser = { 
    type: 'cliente', 
    name: 'João Silva',
    email: 'joao@email.com'
  };
  
  showScreen('dashboard-cliente');
  setTimeout(() => {
    loadClienteData();
    updateNotificationBadge();
  }, 100);
};

window.loginBarbeiro = function(event) {
  event.preventDefault();
  console.log('Logging in barbeiro');
  
  currentUser = { 
    type: 'barbeiro', 
    name: 'Carlos Mendes',
    email: 'carlos@elitebarber.com'
  };
  
  showScreen('dashboard-barbeiro');
  setTimeout(() => {
    loadBarbeiroData();
    updateNotificationBadge();
  }, 100);
};

window.logout = function() {
  console.log('Logging out');
  currentUser = null;
  currentUserType = null;
  
  // Close any open modals
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => modal.classList.add('hidden'));
  
  showScreen('user-selection');
  showNotificationToast('Logout realizado com sucesso!');
};

// Navigation Functions
window.showSection = function(sectionId) {
  console.log('Showing section:', sectionId);
  
  // Update menu active state
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
  }
};

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

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Elite Barber App Initialized');
  
  // Show initial screen
  showScreen('user-selection');
  
  // Update notification badge on load
  updateNotificationBadge();
  
  // Close modals when clicking outside
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  });
  
  // Prevent form default submission
  document.addEventListener('submit', function(e) {
    e.preventDefault();
  });
  
  console.log('Application ready with', appData.barbeiros.length, 'barbeiros and', appData.servicos.length, 'servicos');
});