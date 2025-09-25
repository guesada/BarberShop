/**
 * =====================================================================================
 * ELITE BARBER SHOP - VERSÃO LIMPA E FUNCIONAL
 * Código simplificado e otimizado para máxima compatibilidade
 * =====================================================================================
 */

'use strict';

// Global variables
let app = null;
let currentUser = null;
let currentUserType = null;

// Application data
const appData = {
  barbeiros: [
    {
      id: 1,
      nome: "Carlos Mendes",
      foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      especialidades: ["Corte Clássico", "Barba", "Bigode"],
      avaliacao: 4.9,
      preco_base: 35
    },
    {
      id: 2,
      nome: "Roberto Silva",
      foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      especialidades: ["Degradê", "Barba Moderna", "Sobrancelha"],
      avaliacao: 4.8,
      preco_base: 40
    },
    {
      id: 3,
      nome: "André Costa",
      foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      especialidades: ["Corte Social", "Barba Clássica", "Tratamentos"],
      avaliacao: 4.7,
      preco_base: 30
    }
  ]
};

// =====================================================================================
// CORE FUNCTIONS - CLEAN VERSION
// =====================================================================================

function showScreen(screenId) {
  console.log('📱 Showing screen:', screenId);
  
  // Hide all screens
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show target screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    console.log('✅ Screen shown:', screenId);
  } else {
    console.error('❌ Screen not found:', screenId);
  }
}

// User Selection
window.selectUserType = function(userType) {
  console.log('👤 User type selected:', userType);
  currentUserType = userType;
  
  if (userType === 'cliente') {
    showScreen('login-cliente');
  } else if (userType === 'barbeiro') {
    showScreen('login-barbeiro');
  }
};

// Go Back
window.goBack = function() {
  console.log('🔙 Going back');
  showScreen('user-selection');
  currentUserType = null;
};

// Login Cliente
window.loginCliente = function(event) {
  if (event) event.preventDefault();
  console.log('🔑 Cliente login...');
  
  const form = document.getElementById('login-cliente-form');
  if (!form) {
    console.error('Form not found');
    return;
  }
  
  const formData = new FormData(form);
  const email = formData.get('email');
  const password = formData.get('password');
  
  if (!email) {
    alert('Por favor, digite seu e-mail');
    return;
  }
  
  // Check registered users first
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const user = registeredUsers.find(u => u.email === email && u.userType === 'cliente');
  
  if (user) {
    currentUser = {
      type: 'cliente',
      name: user.name,
      email: user.email,
      id: user.id
    };
  } else {
    // Demo fallback
    const name = email.split('@')[0];
    currentUser = {
      type: 'cliente',
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email
    };
  }
  
  // Save login
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('isLoggedIn', 'true');
  
  console.log('✅ Cliente logged in:', currentUser);
  showScreen('dashboard-cliente');
  
  // Load dashboard after screen change
  setTimeout(() => {
    loadClienteDashboard();
  }, 100);
};

// Login Barbeiro
window.loginBarbeiro = function(event) {
  if (event) event.preventDefault();
  console.log('✂️ Barbeiro login...');
  
  const form = document.getElementById('login-barbeiro-form');
  if (!form) {
    console.error('Form not found');
    return;
  }
  
  const formData = new FormData(form);
  const email = formData.get('email');
  
  if (!email) {
    alert('Por favor, digite seu e-mail');
    return;
  }
  
  const name = email.split('@')[0];
  currentUser = {
    type: 'barbeiro',
    name: name.charAt(0).toUpperCase() + name.slice(1),
    email: email
  };
  
  // Save login
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('isLoggedIn', 'true');
  
  console.log('✅ Barbeiro logged in:', currentUser);
  showScreen('dashboard-barbeiro');
  
  // Load dashboard after screen change
  setTimeout(() => {
    loadBarbeiroData();
  }, 100);
};

// Logout
window.logout = function() {
  console.log('🚪 Logout...');
  
  currentUser = null;
  currentUserType = null;
  
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isLoggedIn');
  
  showScreen('user-selection');
  console.log('✅ Logged out successfully');
};

// Theme Toggle
window.toggleTheme = function() {
  const body = document.body;
  body.classList.toggle('dark-theme');
  
  const isDark = body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  console.log('🎨 Theme:', isDark ? 'dark' : 'light');
  updateThemeIcon();
};

function updateThemeIcon() {
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    const isDark = document.body.classList.contains('dark-theme');
    themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
  updateThemeIcon();
}

// Dashboard Functions
function loadClienteDashboard() {
  console.log('📊 Loading cliente dashboard...');
  
  const userNameElement = document.getElementById('user-name');
  if (userNameElement && currentUser) {
    userNameElement.textContent = currentUser.name;
  }
  
  loadFavoriteBarbers();
  console.log('✅ Cliente dashboard loaded');
}

function loadBarbeiroData() {
  console.log('💼 Loading barbeiro data...');
  
  const userNameElement = document.getElementById('user-name');
  if (userNameElement && currentUser) {
    userNameElement.textContent = currentUser.name;
  }
  
  console.log('✅ Barbeiro dashboard loaded');
}

function loadFavoriteBarbers() {
  const container = document.getElementById('favorite-barbers-list');
  if (!container) return;
  
  const favoriteBarbers = appData.barbeiros.slice(0, 2);
  
  container.innerHTML = favoriteBarbers.map((barbeiro, index) => `
    <div class="barber-card ${index === 0 ? 'premium' : ''}">
      <div class="barber-avatar">
        <img src="${barbeiro.foto}" alt="${barbeiro.nome}" 
             onerror="this.src='https://via.placeholder.com/150x150?text=Barbeiro'">
        <div class="online-status ${index === 0 ? 'online' : 'offline'}"></div>
      </div>
      <div class="barber-info">
        <h3>${barbeiro.nome}</h3>
        <div class="barber-rating">
          <div class="stars">
            ${Array(Math.floor(barbeiro.avaliacao)).fill('<i class="fas fa-star"></i>').join('')}
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

// Registration Functions
window.showRegister = function(userType) {
  console.log('📝 Show register:', userType);
  currentUserType = userType;
  
  if (userType === 'cliente') {
    showScreen('register-cliente');
  } else if (userType === 'barbeiro') {
    showScreen('register-barbeiro');
  }
};

window.showLogin = function(userType) {
  console.log('🔑 Show login:', userType);
  currentUserType = userType;
  
  if (userType === 'cliente') {
    showScreen('login-cliente');
  } else if (userType === 'barbeiro') {
    showScreen('login-barbeiro');
  }
};

// Registration Handlers
window.registerCliente = function(event) {
  if (event) event.preventDefault();
  console.log('📝 Registering cliente...');
  
  const form = document.getElementById('register-cliente-form');
  if (!form) return;
  
  const formData = new FormData(form);
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  
  // Validation
  if (!name || name.length < 2) {
    alert('Nome deve ter pelo menos 2 caracteres');
    return;
  }
  
  if (!email || !email.includes('@')) {
    alert('Email inválido');
    return;
  }
  
  if (!password || password.length < 6) {
    alert('Senha deve ter pelo menos 6 caracteres');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Senhas não coincidem');
    return;
  }
  
  // Check if user exists
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const userExists = existingUsers.find(user => user.email === email);
  
  if (userExists) {
    alert('Email já cadastrado');
    return;
  }
  
  // Save user
  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    userType: 'cliente',
    createdAt: new Date().toISOString()
  };
  
  existingUsers.push(newUser);
  localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
  
  console.log('✅ Cliente registered:', newUser);
  alert('Cadastro realizado com sucesso!');
  showScreen('login-cliente');
};

window.registerBarbeiro = function(event) {
  if (event) event.preventDefault();
  console.log('📝 Registering barbeiro...');
  
  const form = document.getElementById('register-barbeiro-form');
  if (!form) return;
  
  const formData = new FormData(form);
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  
  // Validation (same as cliente)
  if (!name || name.length < 2) {
    alert('Nome deve ter pelo menos 2 caracteres');
    return;
  }
  
  if (!email || !email.includes('@')) {
    alert('Email inválido');
    return;
  }
  
  if (!password || password.length < 6) {
    alert('Senha deve ter pelo menos 6 caracteres');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Senhas não coincidem');
    return;
  }
  
  // Check if user exists
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const userExists = existingUsers.find(user => user.email === email);
  
  if (userExists) {
    alert('Email já cadastrado');
    return;
  }
  
  // Save user
  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    userType: 'barbeiro',
    createdAt: new Date().toISOString()
  };
  
  existingUsers.push(newUser);
  localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
  
  console.log('✅ Barbeiro registered:', newUser);
  alert('Cadastro realizado com sucesso!');
  showScreen('login-barbeiro');
};

// Utility Functions
window.agendarComBarbeiro = function(barbeiroId) {
  console.log('📅 Booking with barbeiro:', barbeiroId);
  
  if (!currentUser) {
    alert('Faça login para agendar');
    showScreen('login-cliente');
    return;
  }
  
  const barbeiro = appData.barbeiros.find(b => b.id === barbeiroId);
  if (barbeiro) {
    alert(`Agendamento com ${barbeiro.nome} - Funcionalidade em desenvolvimento!`);
  }
};

// Auto-login check
function checkSavedLogin() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const savedUser = localStorage.getItem('currentUser');
  
  if (isLoggedIn === 'true' && savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      console.log('🔄 Auto-login:', currentUser);
      
      if (currentUser.type === 'cliente') {
        showScreen('dashboard-cliente');
        setTimeout(loadClienteDashboard, 100);
      } else if (currentUser.type === 'barbeiro') {
        showScreen('dashboard-barbeiro');
        setTimeout(loadBarbeiroData, 100);
      }
      
      return true;
    } catch (error) {
      console.error('Error parsing saved user:', error);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedIn');
    }
  }
  
  return false;
}

// =====================================================================================
// INITIALIZATION - CLEAN VERSION
// =====================================================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Elite Barber App - Clean Version Starting...');
  
  // Load saved theme
  loadSavedTheme();
  
  // Check for saved login
  const isAutoLoggedIn = checkSavedLogin();
  
  // If not auto-logged in, show user selection
  if (!isAutoLoggedIn) {
    showScreen('user-selection');
  }
  
  console.log('✅ Application ready - Clean Version!');
});

console.log('📱 Elite Barber Shop - Clean Version Loaded Successfully!');
