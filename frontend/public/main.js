// Main application entry point
document.addEventListener('DOMContentLoaded', function() {
    console.log('BarberShop application started');
    
    // Show the initial screen
    showScreen('welcome');
    
    // Set up event listeners
    setupEventListeners();
    
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }, 500);
});

// Show a specific screen
function showScreen(screenId) {
    console.log('Showing screen:', screenId);
    
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.style.display = 'none';
    });
    
    // Show the requested screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
    } else {
        console.error('Screen not found:', screenId);
    }
}

// Set up event listeners
function setupEventListeners() {
    // User type selection
    document.addEventListener('click', function(e) {
        if (e.target.closest('.user-type-btn')) {
            const userType = e.target.closest('.user-type-btn').dataset.userType;
            selectUserType(userType);
        }
        
        // Back button
        if (e.target.closest('.back-btn')) {
            goBack();
        }
        
        // Login buttons
        if (e.target.closest('#login-cliente-btn')) {
            loginCliente();
        }
        
        if (e.target.closest('#login-barbeiro-btn')) {
            loginBarbeiro();
        }
    });
}

// User type selection
function selectUserType(userType) {
    console.log('Selected user type:', userType);
    currentUserType = userType;
    showScreen(userType + '-login');
}

// Go back to previous screen
function goBack() {
    const currentScreen = document.querySelector('.screen[style*="display: block"]');
    if (currentScreen) {
        const previousScreen = currentScreen.dataset.previousScreen || 'welcome';
        showScreen(previousScreen);
    } else {
        showScreen('welcome');
    }
}

// Login functions
async function loginCliente() {
    console.log('Attempting client login...');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, just show the dashboard
    showScreen('cliente-dashboard');
}

async function loginBarbeiro() {
    console.log('Attempting barber login...');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, just show the dashboard
    showScreen('barbeiro-dashboard');
}

// Initialize the application
console.log('BarberShop application initialized');
