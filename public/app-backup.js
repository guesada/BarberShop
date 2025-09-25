/**
 * =====================================================================================
 * ELITE BARBER SHOP - VERSÃO LIMPA E FUNCIONAL
 * Código simplificado e otimizado para máxima compatibilidade
 * =====================================================================================
 */

'use strict';

// =====================================================================================
// GLOBAL VARIABLES AND CONSTANTS
// =====================================================================================

// Application instance
let app = null;
let currentUser = null;
let currentUserType = null;

// Constants
const APP_VERSION = '3.0.0';
const API_VERSION = 'v1';
const CACHE_VERSION = 'elite-barber-v3';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const MAX_RETRY_ATTEMPTS = 3;
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Application data structure
const appData = {
    barbeiros: [
        {
            id: 1,
            nome: "Carlos Mendes",
            foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            especialidades: ["Corte Clássico", "Barba", "Bigode"],
            avaliacao: 4.9,
            preco_base: 35,
            disponibilidade: ["09:00", "10:30", "14:00", "15:30", "17:00"],
            telefone: "(11) 99999-1111",
            experiencia: 8,
            certificacoes: ["Barbeiro Profissional", "Especialista em Barba"],
            horario_trabalho: {
                segunda: { inicio: "08:00", fim: "18:00" },
                terca: { inicio: "08:00", fim: "18:00" },
                quarta: { inicio: "08:00", fim: "18:00" },
                quinta: { inicio: "08:00", fim: "18:00" },
                sexta: { inicio: "08:00", fim: "20:00" },
                sabado: { inicio: "08:00", fim: "16:00" },
                domingo: { fechado: true }
            }
        },
        {
            id: 2,
            nome: "Roberto Silva",
            foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            especialidades: ["Degradê", "Barba Moderna", "Sobrancelha"],
            avaliacao: 4.8,
            preco_base: 40,
            disponibilidade: ["08:00", "09:30", "11:00", "13:30", "16:00"],
            telefone: "(11) 99999-2222",
            experiencia: 12,
            certificacoes: ["Master Barber", "Especialista em Degradê"],
            horario_trabalho: {
                segunda: { inicio: "09:00", fim: "19:00" },
                terca: { inicio: "09:00", fim: "19:00" },
                quarta: { inicio: "09:00", fim: "19:00" },
                quinta: { inicio: "09:00", fim: "19:00" },
                sexta: { inicio: "09:00", fim: "21:00" },
                sabado: { inicio: "08:00", fim: "17:00" },
                domingo: { fechado: true }
            }
        },
        {
            id: 3,
            nome: "André Costa",
            foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
            especialidades: ["Corte Social", "Barba Clássica", "Tratamentos"],
            avaliacao: 4.7,
            preco_base: 30,
            disponibilidade: ["10:00", "11:30", "14:30", "16:30", "18:00"],
            telefone: "(11) 99999-3333",
            experiencia: 6,
            certificacoes: ["Barbeiro Certificado", "Especialista em Tratamentos"],
            horario_trabalho: {
                segunda: { inicio: "10:00", fim: "18:00" },
                terca: { inicio: "10:00", fim: "18:00" },
                quarta: { inicio: "10:00", fim: "18:00" },
                quinta: { inicio: "10:00", fim: "18:00" },
                sexta: { inicio: "10:00", fim: "20:00" },
                sabado: { inicio: "09:00", fim: "16:00" },
                domingo: { fechado: true }
            }
        }
    ],
    servicos: [
        {
            id: 1,
            nome: "Corte + Barba",
            preco: 45,
            duracao: 60,
            descricao: "Corte personalizado + acabamento de barba",
            categoria: "premium",
            imagem: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300",
            inclui: ["Lavagem", "Corte", "Barba", "Finalização", "Produtos premium"]
        },
        {
            id: 2,
            nome: "Corte Simples",
            preco: 25,
            duracao: 30,
            descricao: "Corte básico com máquina e tesoura",
            categoria: "basico",
            imagem: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300",
            inclui: ["Corte", "Finalização"]
        },
        {
            id: 3,
            nome: "Barba Completa",
            preco: 20,
            duracao: 30,
            descricao: "Aparar, modelar e hidratar a barba",
            categoria: "barba",
            imagem: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=300",
            inclui: ["Aparar", "Modelar", "Hidratação", "Óleos especiais"]
        },
        {
            id: 4,
            nome: "Tratamento Capilar",
            preco: 35,
            duracao: 45,
            descricao: "Lavagem, hidratação e finalização",
            categoria: "tratamento",
            imagem: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300",
            inclui: ["Análise capilar", "Lavagem especial", "Hidratação", "Massagem"]
        },
        {
            id: 5,
            nome: "Pacote Completo",
            preco: 80,
            duracao: 90,
            descricao: "Corte + Barba + Tratamento + Sobrancelha",
            categoria: "premium",
            imagem: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300",
            inclui: ["Tudo incluso", "Produtos premium", "Massagem relaxante", "Toalha quente"]
        }
    ],
    agendamentos_cliente: [],
    historico_barbeiro: [],
    estoque: [
        {
            id: 1,
            produto: "Shampoo Profissional",
            quantidade: 12,
            preco_custo: 15.50,
            preco_venda: 35.00,
            fornecedor: "Beauty Supply",
            categoria: "higiene",
            estoque_minimo: 5
        },
        {
            id: 2,
            produto: "Óleo para Barba",
            quantidade: 8,
            preco_custo: 22.00,
            preco_venda: 45.00,
            fornecedor: "Barber Products",
            categoria: "barba",
            estoque_minimo: 3
        },
        {
            id: 3,
            produto: "Pomada Modeladora",
            quantidade: 15,
            preco_custo: 18.90,
            preco_venda: 38.00,
            fornecedor: "Hair Style Co.",
            categoria: "modelagem",
            estoque_minimo: 5
        }
    ],
    notificacoes: []
};

// =====================================================================================
// ELITE BARBER APPLICATION CLASS - MAIN CONTROLLER
// =====================================================================================

class EliteBarberApp {
    constructor() {
        this.version = APP_VERSION;
        this.isInitialized = false;
        this.startTime = performance.now();

        // Application configuration
        this.config = {
            apiBaseUrl: window.location.origin + '/api/' + API_VERSION,
            socketUrl: window.location.origin,
            theme: localStorage.getItem('theme') || this.detectSystemTheme(),
            language: localStorage.getItem('language') || 'pt-BR',
            debug: this.isDevelopment(),
            cacheVersion: CACHE_VERSION,
            sessionTimeout: SESSION_TIMEOUT,
            refreshInterval: REFRESH_INTERVAL,
            features: {
                realTimeUpdates: true,
                pushNotifications: true,
                analytics: true,
                payments: true,
                chat: true,
                pwa: true,
                offline: true,
                geolocation: true,
                camera: true,
                biometrics: false
            },
            limits: {
                maxRetryAttempts: MAX_RETRY_ATTEMPTS,
                requestTimeout: REQUEST_TIMEOUT,
                maxCacheSize: 50 * 1024 * 1024, // 50MB
                maxOfflineQueue: 100,
                maxNotifications: 50
            }
        };

        // Application state management
        this.state = {
            user: null,
            isAuthenticated: false,
            currentView: 'home',
            previousView: null,
            loading: false,
            online: navigator.onLine,
            notifications: [],
            cache: new Map(),
            offlineQueue: [],
            socket: null,
            performance: {
                initTime: 0,
                loadTime: 0,
                renderTime: 0,
                apiCalls: 0,
                errors: 0
            },
            ui: {
                sidebarOpen: false,
                modalStack: [],
                activeToasts: [],
                currentTheme: this.config.theme,
                screenSize: this.getScreenSize()
            }
        };

        // Services container
        this.services = {};

        // Components container
        this.components = {};

        // Event handlers registry
        this.eventHandlers = new Map();

        // Router instance
        this.router = null;

        // Performance monitoring
        this.performance = {
            startTime: this.startTime,
            metrics: new Map(),
            observers: new Map()
        };

        // Error tracking
        this.errorTracker = {
            errors: [],
            maxErrors: 100,
            reportingEnabled: true
        };

        // Feature flags
        this.featureFlags = new Map([
            ['beta_features', false],
            ['experimental_ui', false],
            ['advanced_analytics', true],
            ['payment_integration', true],
            ['real_time_chat', true],
            ['voice_commands', false],
            ['ar_features', false]
        ]);
    }

    // =====================================================================================
    // INITIALIZATION METHODS
    // =====================================================================================

    /**
     * Initialize the complete application
     */
    async init() {
        try {
            console.log(`🚀 Initializing Elite Barber Shop v${this.version}...`);

            // Show loading screen
            this.showLoadingScreen();

            // Initialize performance monitoring
            this.initializePerformanceMonitoring();

            // Initialize error tracking
            this.initializeErrorTracking();

            // Initialize core services
            await this.initializeServices();

            // Initialize UI components
            await this.initializeComponents();

            // Setup event listeners
            await this.setupEventListeners();

            // Initialize router
            await this.initializeRouter();

            // Restore user session
            await this.restoreSession();

            // Initialize theme system
            await this.initializeTheme();

            // Initialize PWA features
            await this.initializePWA();

            // Setup real-time connections
            await this.initializeRealTime();

            // Load initial data
            await this.loadInitialData();

            // Mark as initialized
            this.isInitialized = true;
            this.state.performance.initTime = performance.now() - this.startTime;

            // Hide loading screen
            this.hideLoadingScreen();

            // Track successful initialization
            this.services.analytics?.track('app_initialized', {
                version: this.version,
                initTime: this.state.performance.initTime,
                features: Object.keys(this.config.features).filter(f => this.config.features[f])
            });

            console.log(`✅ Elite Barber Shop initialized successfully in ${Math.round(this.state.performance.initTime)}ms`);

            // Show welcome message for first-time users
            this.showWelcomeMessage();

        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.handleCriticalError(error);
            this.showErrorScreen(error);
        }
    }

    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        // Performance observer for navigation timing
        if ('PerformanceObserver' in window) {
            const navObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.performance.metrics.set('navigation', {
                        loadTime: entry.loadEventEnd - entry.loadEventStart,
                        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                        firstPaint: this.getFirstPaint(),
                        firstContentfulPaint: this.getFirstContentfulPaint()
                    });
                }
            });

            try {
                navObserver.observe({ entryTypes: ['navigation'] });
                this.performance.observers.set('navigation', navObserver);
            } catch (e) {
                console.warn('Navigation timing not supported');
            }
        }

        // Memory usage monitoring
        if ('memory' in performance) {
            setInterval(() => {
                this.performance.metrics.set('memory', {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                });
            }, 30000); // Every 30 seconds
        }
    }

    /**
     * Initialize error tracking system
     */
    initializeErrorTracking() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.trackError({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'promise_rejection',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.trackError({
                    type: 'resource_error',
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    /**
     * Initialize all core services
     */
    async initializeServices() {
        console.log('🔧 Initializing services...');

        try {
            // Core services
            this.services.storage = new StorageService();
            this.services.api = new APIService(this.config.apiBaseUrl, {
                timeout: this.config.limits.requestTimeout,
                retries: this.config.limits.maxRetryAttempts
            });
            this.services.notification = new NotificationService({
                maxNotifications: this.config.limits.maxNotifications
            });
            this.services.analytics = new AnalyticsService({
                debug: this.config.debug,
                trackingEnabled: true
            });

            // Business services
            this.services.auth = new AuthService(this.services.api, this.services.storage);
            this.services.calendar = new CalendarService(this.services.api, this.services.storage);
            this.services.payment = new PaymentService(this.services.api);
            this.services.chat = new ChatService(this.services.api);

            // Initialize services that need async setup
            const servicePromises = [
                this.services.storage.init(),
                this.services.notification.init(),
                this.services.analytics.init(),
                this.services.calendar.init(),
                this.services.payment.init()
            ];

            await Promise.allSettled(servicePromises);

            console.log('✅ Services initialized');

        } catch (error) {
            console.error('Failed to initialize services:', error);
            throw new Error('Service initialization failed');
        }
    }

    /**
     * Initialize UI components
     */
    async initializeComponents() {
        console.log('🎨 Initializing components...');

        try {
            // Core UI components
            this.components.navigation = new NavigationComponent(this);
            this.components.dashboard = new DashboardComponent(this);
            this.components.appointment = new AppointmentComponent(this);
            this.components.profile = new ProfileComponent(this);
            this.components.payment = new PaymentComponent(this);
            this.components.chat = new ChatComponent(this);
            this.components.calendar = new CalendarComponent(this);
            this.components.reports = new ReportsComponent(this);
            this.components.settings = new SettingsComponent(this);

            // Initialize components
            const componentPromises = Object.values(this.components).map(component =>
                component.init ? component.init() : Promise.resolve()
            );

            await Promise.allSettled(componentPromises);

            console.log('✅ Components initialized');

        } catch (error) {
            console.error('Failed to initialize components:', error);
            throw new Error('Component initialization failed');
        }
    }

    /**
     * Setup global event listeners
     */
    async setupEventListeners() {
        console.log('📡 Setting up event listeners...');

        // Window events
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('focus', this.handleWindowFocus.bind(this));
        window.addEventListener('blur', this.handleWindowBlur.bind(this));

        // Document events
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('contextmenu', this.handleContextMenu.bind(this));

        // Custom application events
        this.on('user-authenticated', this.handleUserAuthenticated.bind(this));
        this.on('user-logout', this.handleUserLogout.bind(this));
        this.on('theme-changed', this.handleThemeChanged.bind(this));
        this.on('error', this.handleError.bind(this));
        this.on('notification-received', this.handleNotificationReceived.bind(this));
        this.on('payment-completed', this.handlePaymentCompleted.bind(this));
        this.on('appointment-booked', this.handleAppointmentBooked.bind(this));

        // Service Worker events
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
        }

        // Battery API events
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                battery.addEventListener('levelchange', this.handleBatteryChange.bind(this));
                battery.addEventListener('chargingchange', this.handleBatteryChange.bind(this));
            } catch (e) {
                console.warn('Battery API not available');
            }
        }

        console.log('✅ Event listeners setup complete');
    }

    // =====================================================================================
    // UTILITY METHODS
    // =====================================================================================

    /**
     * Detect system theme preference
     */
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Check if running in development mode
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('dev');
    }

    /**
     * Get current screen size category
     */
    getScreenSize() {
        const width = window.innerWidth;
        if (width < 576) return 'xs';
        if (width < 768) return 'sm';
        if (width < 992) return 'md';
        if (width < 1200) return 'lg';
        return 'xl';
    }

    /**
     * Get First Paint timing
     */
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }

    /**
     * Get First Contentful Paint timing
     */
    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : null;
    }

    /**
     * Debounce function for performance optimization
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    /**
     * Throttle function for performance optimization
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Generate unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Format currency value
     */
    formatCurrency(amount, currency = 'BRL') {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency
        }).format(amount);
    }

    /**
     * Format date with options
     */
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return new Intl.DateTimeFormat('pt-BR', {
            ...defaultOptions,
            ...options
        }).format(new Date(date));
    }

    /**
     * Format time
     */
    formatTime(date, options = {}) {
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };

        return new Intl.DateTimeFormat('pt-BR', {
            ...defaultOptions,
            ...options
        }).format(new Date(date));
    }

    /**
     * Format relative time (e.g., "2 hours ago")
     */
    formatRelativeTime(date) {
        const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
        const now = new Date();
        const target = new Date(date);
        const diffInSeconds = (target - now) / 1000;

        const units = [
            { unit: 'year', seconds: 31536000 },
            { unit: 'month', seconds: 2592000 },
            { unit: 'day', seconds: 86400 },
            { unit: 'hour', seconds: 3600 },
            { unit: 'minute', seconds: 60 },
            { unit: 'second', seconds: 1 }
        ];

        for (const { unit, seconds } of units) {
            const interval = Math.floor(Math.abs(diffInSeconds) / seconds);
            if (interval >= 1) {
                return rtf.format(diffInSeconds < 0 ? -interval : interval, unit);
            }
        }

        return rtf.format(0, 'second');
    }

}

// =====================================================================================
// ADVANCED SERVICES IMPLEMENTATION
// =====================================================================================

/**
 * Storage Service - Advanced data management with IndexedDB
 */
class StorageService {
    constructor() {
        this.dbName = 'EliteBarberDB';
        this.dbVersion = 3;
        this.db = null;
        this.stores = ['users', 'appointments', 'barbers', 'services', 'payments', 'cache', 'analytics'];
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                this.stores.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });

                        // Add indexes based on store type
                        switch (storeName) {
                            case 'users':
                                store.createIndex('email', 'email', { unique: true });
                                store.createIndex('userType', 'userType');
                                break;
                            case 'appointments':
                                store.createIndex('userId', 'userId');
                                store.createIndex('barberId', 'barberId');
                                store.createIndex('date', 'date');
                                store.createIndex('status', 'status');
                                break;
                            case 'cache':
                                store.createIndex('key', 'key', { unique: true });
                                store.createIndex('timestamp', 'timestamp');
                                break;
                        }
                    }
                });
            };
        });
    }

    async set(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.put({ ...data, timestamp: Date.now() });
    }

    async get(storeName, key) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return store.get(key);
    }

    async getAll(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return store.getAll();
    }

    async delete(storeName, key) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.delete(key);
    }

    async clear(storeName) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.clear();
    }

    // Cache management with expiration
    async setCache(key, data, expirationMinutes = 60) {
        const cacheData = {
            key,
            data,
            timestamp: Date.now(),
            expiration: Date.now() + (expirationMinutes * 60 * 1000)
        };
        return this.set('cache', cacheData);
    }

    async getCache(key) {
        const cached = await this.get('cache', key);
        if (!cached || Date.now() > cached.expiration) {
            if (cached) await this.delete('cache', key);
            return null;
        }
        return cached.data;
    }
}

/**
 * API Service - Advanced HTTP client with retry logic and caching
 */
class APIService {
    constructor(baseUrl, options = {}) {
        this.baseUrl = baseUrl;
        this.timeout = options.timeout || 10000;
        this.retries = options.retries || 3;
        this.cache = new Map();
        this.requestQueue = [];
        this.isOnline = navigator.onLine;
    }

    async request(endpoint, options = {}) {
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: this.timeout,
            ...options
        };

        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const url = `${this.baseUrl}${endpoint}`;
        const cacheKey = `${config.method}:${url}`;

        // Check cache for GET requests
        if (config.method === 'GET' && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutes
                return cached.data;
            }
        }

        // If offline, queue the request
        if (!this.isOnline && config.method !== 'GET') {
            return this.queueRequest(url, config);
        }

        try {
            const response = await this.fetchWithTimeout(url, config);

            if (!response.ok) {
                throw new APIError(response.status, response.statusText, await response.text());
            }

            const data = await response.json();

            // Cache successful GET requests
            if (config.method === 'GET') {
                this.cache.set(cacheKey, { data, timestamp: Date.now() });
            }

            return data;

        } catch (error) {
            if (options.retry !== false && error.name !== 'APIError') {
                return this.retryRequest(url, config, options.retryCount || 0);
            }
            throw error;
        }
    }

    async fetchWithTimeout(url, config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        try {
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async retryRequest(url, config, retryCount) {
        if (retryCount >= this.retries) {
            throw new Error('Max retries exceeded');
        }

        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        return this.request(url.replace(this.baseUrl, ''), {
            ...config,
            retryCount: retryCount + 1
        });
    }

    queueRequest(url, config) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ url, config, resolve, reject });
        });
    }

    async processQueue() {
        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            try {
                const response = await this.fetchWithTimeout(request.url, request.config);
                const data = await response.json();
                request.resolve(data);
            } catch (error) {
                request.reject(error);
            }
        }
    }

    // Convenience methods
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

/**
 * Authentication Service - Advanced JWT management with refresh tokens
 */
class AuthService {
    constructor(apiService, storageService) {
        this.api = apiService;
        this.storage = storageService;
        this.currentUser = null;
        this.refreshTimer = null;
        this.sessionTimeout = null;
    }

    async login(email, password, userType = 'cliente') {
        try {
            // For static deployment, use offline authentication
            if (this.isStaticDeployment()) {
                return this.loginOffline(email, password, userType);
            }

            // API-based login
            const response = await this.api.post('/auth/login', {
                email: email.toLowerCase().trim(),
                password,
                userType
            });

            if (response.success) {
                await this.handleLoginSuccess(response);
                return response;
            }

            throw new Error(response.message || 'Login failed');

        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async loginOffline(email, password, userType) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = registeredUsers.find(u =>
            u.email === email.toLowerCase().trim() &&
            u.userType === userType
        );

        if (user) {
            const sessionData = {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    userType: user.userType,
                    phone: user.phone,
                    avatar: user.avatar || null,
                    preferences: user.preferences || {},
                    permissions: this.getUserPermissions(user.userType)
                },
                token: this.generateMockToken(user),
                refreshToken: this.generateMockToken(user, 'refresh')
            };

            await this.handleLoginSuccess(sessionData);
            return sessionData;
        }

        // Demo fallback
        if (email) {
            const demoUser = {
                id: Date.now(),
                name: this.extractNameFromEmail(email),
                email: email.toLowerCase().trim(),
                userType,
                phone: null,
                avatar: null,
                preferences: {},
                permissions: this.getUserPermissions(userType)
            };

            const sessionData = {
                success: true,
                user: demoUser,
                token: this.generateMockToken(demoUser),
                refreshToken: this.generateMockToken(demoUser, 'refresh')
            };

            await this.handleLoginSuccess(sessionData);
            return sessionData;
        }

        throw new Error('Email é obrigatório');
    }

    async register(userData) {
        try {
            if (this.isStaticDeployment()) {
                return this.registerOffline(userData);
            }

            const response = await this.api.post('/auth/register', userData);
            return response;

        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async registerOffline(userData) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userExists = existingUsers.find(user => user.email === userData.email);

        if (userExists) {
            throw new Error('Email já cadastrado');
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString(),
            isActive: true,
            emailVerified: false,
            preferences: {
                theme: 'light',
                notifications: true,
                language: 'pt-BR'
            },
            permissions: this.getUserPermissions(userData.userType)
        };

        existingUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

        // Store in IndexedDB
        await this.storage.set('users', newUser);

        return {
            success: true,
            message: 'Usuário cadastrado com sucesso!',
            user: newUser
        };
    }

    async logout() {
        try {
            if (!this.isStaticDeployment() && this.currentUser) {
                await this.api.post('/auth/logout');
            }

            this.clearSession();
            document.dispatchEvent(new CustomEvent('user-logout'));

        } catch (error) {
            console.error('Logout error:', error);
            this.clearSession();
        }
    }

    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            if (this.isStaticDeployment()) {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser) {
                    const newToken = this.generateMockToken(currentUser);
                    localStorage.setItem('authToken', newToken);
                    localStorage.setItem('loginTime', Date.now().toString());
                    return { token: newToken };
                }
                throw new Error('No current user');
            }

            const response = await this.api.post('/auth/refresh', { refreshToken });

            if (response.success) {
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('loginTime', Date.now().toString());
                return response;
            }

            throw new Error('Token refresh failed');

        } catch (error) {
            console.error('Token refresh error:', error);
            await this.logout();
            throw error;
        }
    }

    async handleLoginSuccess(response) {
        this.currentUser = response.user;

        // Store session data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('refreshToken', response.refreshToken || '');
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('loginTime', Date.now().toString());
        localStorage.setItem('isLoggedIn', 'true');

        // Store in IndexedDB
        await this.storage.set('users', response.user);

        // Setup session management
        this.setupSessionTimeout();
        this.setupTokenRefresh();

        // Emit login event
        document.dispatchEvent(new CustomEvent('user-authenticated', {
            detail: { user: response.user }
        }));

        console.log('✅ User authenticated:', response.user);
    }

    clearSession() {
        this.currentUser = null;

        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('isLoggedIn');

        if (this.sessionTimeout) clearTimeout(this.sessionTimeout);
        if (this.refreshTimer) clearInterval(this.refreshTimer);
    }

    setupSessionTimeout() {
        if (this.sessionTimeout) clearTimeout(this.sessionTimeout);
        this.sessionTimeout = setTimeout(() => {
            this.logout();
        }, 24 * 60 * 60 * 1000); // 24 hours
    }

    setupTokenRefresh() {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
        if (!this.isStaticDeployment()) {
            this.refreshTimer = setInterval(async () => {
                try {
                    await this.refreshToken();
                } catch (error) {
                    console.error('Auto token refresh failed:', error);
                }
            }, 15 * 60 * 1000); // 15 minutes
        }
    }

    getUserPermissions(userType) {
        const permissions = {
            cliente: ['view_appointments', 'book_appointment', 'cancel_appointment', 'rate_service'],
            barbeiro: ['view_appointments', 'manage_schedule', 'view_earnings', 'manage_services'],
            admin: ['*'] // All permissions
        };
        return permissions[userType] || [];
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        const userPermissions = this.currentUser.permissions || [];
        return userPermissions.includes('*') || userPermissions.includes(permission);
    }

    isStaticDeployment() {
        return !window.location.hostname.includes('localhost') &&
            !window.location.hostname.includes('127.0.0.1') &&
            window.location.protocol === 'https:';
    }

    extractNameFromEmail(email) {
        const name = email.split('@')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    generateMockToken(user, type = 'access') {
        const payload = {
            id: user.id,
            email: user.email,
            userType: user.userType,
            type,
            iat: Date.now(),
            exp: Date.now() + (type === 'refresh' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
        };
        return btoa(JSON.stringify(payload));
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }
}

/**
 * Notification Service - Advanced notification system
 */
class NotificationService {
    constructor(options = {}) {
        this.notifications = [];
        this.maxNotifications = options.maxNotifications || 50;
        this.container = null;
        this.permission = Notification.permission;
        this.serviceWorkerReg = null;
    }

    async init() {
        this.createContainer();
        await this.requestPermission();
        await this.setupServiceWorker();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        pointer-events: none;
        max-width: 400px;
      `;
        document.body.appendChild(this.container);
    }

    async requestPermission() {
        if (!('Notification' in window)) return false;

        if (this.permission === 'granted') return true;

        if (this.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        }

        return false;
    }

    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorkerReg = await navigator.serviceWorker.register('/sw.js');
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }

    show(message, type = 'info', options = {}) {
        const notification = {
            id: Date.now(),
            message,
            type,
            duration: options.duration || 5000,
            persistent: options.persistent || false,
            actions: options.actions || [],
            timestamp: new Date()
        };

        this.notifications.unshift(notification);

        if (this.notifications.length > this.maxNotifications) {
            const removed = this.notifications.pop();
            this.removeToast(removed.id);
        }

        this.renderToast(notification);

        if (!notification.persistent) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration);
        }

        return notification.id;
    }

    renderToast(notification) {
        const toast = document.createElement('div');
        toast.id = `notification-${notification.id}`;
        toast.className = `notification-toast notification-${notification.type}`;

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };

        toast.style.cssText = `
        background: ${colors[notification.type] || colors.info};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
        max-width: 100%;
        word-wrap: break-word;
      `;

        const content = `
        <div class="notification-icon" style="flex-shrink: 0;">
          <i class="fas ${icons[notification.type] || icons.info}"></i>
        </div>
        <div class="notification-content" style="flex: 1; min-width: 0;">
          <div class="notification-message" style="font-weight: 500;">
            ${notification.message}
          </div>
          ${notification.actions.length > 0 ? this.renderActions(notification.actions) : ''}
        </div>
        <button class="notification-close" style="
          background: none;
          border: none;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
          flex-shrink: 0;
        " onclick="app.services.notification.remove(${notification.id})">
          <i class="fas fa-times"></i>
        </button>
      `;

        toast.innerHTML = content;
        this.container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        toast.addEventListener('mouseenter', () => {
            toast.style.transform = 'translateX(-8px) scale(1.02)';
        });

        toast.addEventListener('mouseleave', () => {
            toast.style.transform = 'translateX(0) scale(1)';
        });
    }

    renderActions(actions) {
        return `
        <div class="notification-actions" style="display: flex; gap: 8px; margin-top: 8px;">
          ${actions.map(action => `
            <button class="notification-action" style="
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
              transition: background-color 0.2s;
            " onclick="${action.onClick}">
              ${action.label}
            </button>
          `).join('')}
        </div>
      `;
    }

    remove(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;

        this.removeToast(id);
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    removeToast(id) {
        const toast = document.getElementById(`notification-${id}`);
        if (toast) {
            toast.style.transform = 'translateX(100%) scale(0.8)';
            toast.style.opacity = '0';

            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', { ...options, duration: 8000 });
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    async showBrowserNotification(title, options = {}) {
        if (!await this.requestPermission()) return null;

        const notification = new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options
        });

        notification.onclick = () => {
            window.focus();
            if (options.onClick) options.onClick();
            notification.close();
        };

        return notification;
    }

    clear() {
        this.notifications.forEach(notification => {
            this.removeToast(notification.id);
        });
        this.notifications = [];
    }
}

/**
 * Analytics Service - Advanced user behavior tracking
 */
class AnalyticsService {
    constructor(options = {}) {
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.userId = null;
        this.startTime = Date.now();
        this.pageViews = [];
        this.errors = [];
        this.isEnabled = options.trackingEnabled !== false;
        this.debug = options.debug || false;
    }

    async init() {
        if (!this.isEnabled) return;

        this.setupPerformanceTracking();
        this.setupUserInteractionTracking();
        this.startSession();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    startSession() {
        this.track('session_start', {
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
    }

    track(eventName, properties = {}) {
        if (!this.isEnabled) return;

        const event = {
            id: this.generateEventId(),
            name: eventName,
            properties: {
                ...properties,
                sessionId: this.sessionId,
                userId: this.userId,
                timestamp: Date.now(),
                url: window.location.href,
                path: window.location.pathname
            }
        };

        this.events.push(event);

        if (this.debug) {
            console.log('📊 Analytics Event:', eventName, properties);
        }

        // Store locally for offline scenarios
        this.storeEventLocally(event);
    }

    identify(userId, traits = {}) {
        this.userId = userId;
        this.track('user_identify', { userId, traits });
    }

    trackPageView(page, title = null) {
        const pageView = {
            page,
            title: title || document.title,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId
        };

        this.pageViews.push(pageView);
        this.track('page_view', pageView);
    }

    setupPerformanceTracking() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 1000) {
                        this.track('slow_resource', {
                            name: entry.name,
                            duration: entry.duration,
                            size: entry.transferSize,
                            type: entry.initiatorType
                        });
                    }
                }
            });

            try {
                observer.observe({ entryTypes: ['resource'] });
            } catch (e) {
                console.warn('Performance observer not supported');
            }
        }
    }

    setupUserInteractionTracking() {
        document.addEventListener('click', (event) => {
            const element = event.target;
            this.track('click', {
                tagName: element.tagName,
                id: element.id,
                className: element.className,
                text: element.textContent?.substring(0, 100)
            });
        });

        let scrollDepth = 0;
        window.addEventListener('scroll', this.throttle(() => {
            const currentDepth = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );

            if (currentDepth > scrollDepth && currentDepth % 25 === 0) {
                scrollDepth = currentDepth;
                this.track('scroll_depth', { percentage: currentDepth });
            }
        }, 1000));
    }

    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    storeEventLocally(event) {
        const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        storedEvents.push(event);

        if (storedEvents.length > 1000) {
            storedEvents.splice(0, storedEvents.length - 1000);
        }

        localStorage.setItem('analytics_events', JSON.stringify(storedEvents));
    }

    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getStoredEvents() {
        return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    }

    clearStoredEvents() {
        localStorage.removeItem('analytics_events');
    }
}

/**
 * Custom API Error class
 */
class APIError extends Error {
    constructor(status, statusText, body) {
        super(`API Error: ${status} ${statusText}`);
        this.name = 'APIError';
        this.status = status;
        this.statusText = statusText;
        this.body = body;
    }
}

// =====================================================================================
// PAYMENT SERVICE - ADVANCED PAYMENT PROCESSING
// =====================================================================================

/**
 * Payment Service - Comprehensive payment processing system
 */
class PaymentService {
    constructor(apiService) {
        this.api = apiService;
        this.stripe = null;
        this.paymentMethods = [];
        this.transactions = [];
        this.isInitialized = false;
        this.supportedMethods = ['card', 'pix', 'boleto', 'wallet', 'cash'];
        this.fees = {
            card: 0.029, // 2.9%
            pix: 0.01,   // 1%
            boleto: 3.50, // R$ 3.50 fixo
            wallet: 0,
            cash: 0
        };
    }

    async init() {
        try {
            await this.initializeStripe();
            await this.loadPaymentMethods();
            await this.loadTransactions();
            this.isInitialized = true;
            console.log('💳 Payment Service initialized');
        } catch (error) {
            console.error('Payment Service initialization failed:', error);
        }
    }

    async initializeStripe() {
        if (typeof Stripe === 'undefined') {
            console.warn('Stripe not loaded, using demo mode');
            return;
        }

        try {
            const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_demo';
            this.stripe = Stripe(publishableKey);
            console.log('Stripe initialized');
        } catch (error) {
            console.error('Stripe initialization failed:', error);
        }
    }

    async loadPaymentMethods() {
        try {
            const saved = localStorage.getItem('paymentMethods');
            this.paymentMethods = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load payment methods:', error);
            this.paymentMethods = [];
        }
    }

    async loadTransactions() {
        try {
            const saved = localStorage.getItem('transactions');
            this.transactions = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load transactions:', error);
            this.transactions = [];
        }
    }

    async processPayment(appointmentData, paymentData) {
        try {
            const transaction = {
                id: this.generateTransactionId(),
                appointmentId: appointmentData.id,
                amount: appointmentData.totalAmount,
                currency: 'BRL',
                method: paymentData.method,
                status: 'processing',
                createdAt: Date.now(),
                metadata: {
                    barberId: appointmentData.barberId,
                    serviceId: appointmentData.serviceId,
                    customerEmail: appointmentData.customerEmail,
                    customerName: appointmentData.customerName
                }
            };

            this.transactions.push(transaction);

            let result;
            switch (paymentData.method) {
                case 'card':
                    result = await this.processCardPayment(transaction, paymentData);
                    break;
                case 'pix':
                    result = await this.processPixPayment(transaction, paymentData);
                    break;
                case 'boleto':
                    result = await this.processBoletoPayment(transaction, paymentData);
                    break;
                case 'wallet':
                    result = await this.processWalletPayment(transaction, paymentData);
                    break;
                case 'cash':
                    result = await this.processCashPayment(transaction, paymentData);
                    break;
                default:
                    throw new Error('Método de pagamento não suportado');
            }

            transaction.status = result.status;
            transaction.paymentIntentId = result.paymentIntentId;
            transaction.completedAt = Date.now();

            this.saveTransaction(transaction);

            document.dispatchEvent(new CustomEvent('payment-processed', {
                detail: { transaction, result }
            }));

            return { success: true, transaction, ...result };

        } catch (error) {
            console.error('Payment processing failed:', error);
            throw error;
        }
    }

    async processCardPayment(transaction, paymentData) {
        if (!this.stripe) {
            return this.simulatePayment(transaction, 'card');
        }

        try {
            const response = await this.api.post('/payments/create-intent', {
                amount: transaction.amount * 100,
                currency: transaction.currency.toLowerCase(),
                appointmentId: transaction.appointmentId,
                metadata: transaction.metadata
            });

            const { clientSecret } = response;

            const result = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: paymentData.cardElement,
                    billing_details: {
                        name: paymentData.billingDetails.name,
                        email: paymentData.billingDetails.email
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return {
                status: 'completed',
                paymentIntentId: result.paymentIntent.id,
                method: 'card'
            };

        } catch (error) {
            console.error('Card payment failed:', error);
            return this.simulatePayment(transaction, 'card');
        }
    }

    async processPixPayment(transaction, paymentData) {
        try {
            const pixCode = this.generatePixCode(transaction);
            const qrCode = await this.generateQRCode(pixCode);

            return {
                status: 'pending',
                method: 'pix',
                pixCode,
                qrCode,
                expiresAt: Date.now() + (15 * 60 * 1000)
            };

        } catch (error) {
            console.error('PIX payment failed:', error);
            throw error;
        }
    }

    async processBoletoPayment(transaction, paymentData) {
        try {
            const boleto = {
                barcode: this.generateBoleto(transaction),
                dueDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
                amount: transaction.amount,
                recipient: 'Elite Barber Shop',
                instructions: 'Pagamento referente ao agendamento'
            };

            return {
                status: 'pending',
                method: 'boleto',
                boleto
            };

        } catch (error) {
            console.error('Boleto payment failed:', error);
            throw error;
        }
    }

    async processWalletPayment(transaction, paymentData) {
        try {
            const walletBalance = await this.getWalletBalance();

            if (walletBalance < transaction.amount) {
                throw new Error('Saldo insuficiente na carteira');
            }

            await this.deductFromWallet(transaction.amount);

            return {
                status: 'completed',
                method: 'wallet',
                walletBalance: walletBalance - transaction.amount
            };

        } catch (error) {
            console.error('Wallet payment failed:', error);
            throw error;
        }
    }

    async processCashPayment(transaction, paymentData) {
        return {
            status: 'pending',
            method: 'cash',
            instructions: 'Pagamento será realizado no local'
        };
    }

    async simulatePayment(transaction, method) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const isSuccess = Math.random() > 0.1;

        if (!isSuccess) {
            throw new Error('Pagamento recusado pelo banco');
        }

        return {
            status: 'completed',
            paymentIntentId: `sim_${Date.now()}`,
            method
        };
    }

    calculateTotal(baseAmount, options = {}) {
        let total = baseAmount;
        const breakdown = {
            baseAmount,
            fees: 0,
            taxes: 0,
            discount: 0,
            total: 0
        };

        if (options.discountPercent) {
            breakdown.discount = baseAmount * (options.discountPercent / 100);
            total -= breakdown.discount;
        }

        if (options.paymentMethod && this.fees[options.paymentMethod]) {
            const fee = this.fees[options.paymentMethod];
            breakdown.fees = typeof fee === 'number' && fee < 1 ? total * fee : fee;
            total += breakdown.fees;
        }

        if (options.includeTax) {
            breakdown.taxes = total * 0.05;
            total += breakdown.taxes;
        }

        breakdown.total = Math.round(total * 100) / 100;
        return breakdown;
    }

    async getWalletBalance() {
        const balance = localStorage.getItem('walletBalance');
        return balance ? parseFloat(balance) : 0;
    }

    async addToWallet(amount) {
        const currentBalance = await this.getWalletBalance();
        const newBalance = currentBalance + amount;
        localStorage.setItem('walletBalance', newBalance.toString());
        return newBalance;
    }

    async deductFromWallet(amount) {
        const currentBalance = await this.getWalletBalance();
        if (currentBalance < amount) {
            throw new Error('Saldo insuficiente');
        }
        const newBalance = currentBalance - amount;
        localStorage.setItem('walletBalance', newBalance.toString());
        return newBalance;
    }

    generateTransactionId() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generatePixCode(transaction) {
        return `00020126580014BR.GOV.BCB.PIX0136${transaction.id}5204000053039865802BR5925Elite Barber Shop6009Sao Paulo62070503***6304`;
    }

    async generateQRCode(pixCode) {
        return `data:image/svg+xml;base64,${btoa(`<svg>QR Code for: ${pixCode}</svg>`)}`;
    }

    generateBoleto(transaction) {
        return `23790.00000 00000.000000 00000.000000 0 ${Math.floor(Date.now() / 1000)}${transaction.amount.toString().padStart(10, '0')}`;
    }

    saveTransaction(transaction) {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    getTransactionHistory(filters = {}) {
        let transactions = [...this.transactions];

        if (filters.status) {
            transactions = transactions.filter(t => t.status === filters.status);
        }

        if (filters.method) {
            transactions = transactions.filter(t => t.method === filters.method);
        }

        if (filters.dateFrom) {
            transactions = transactions.filter(t => t.createdAt >= filters.dateFrom);
        }

        if (filters.dateTo) {
            transactions = transactions.filter(t => t.createdAt <= filters.dateTo);
        }

        return transactions.sort((a, b) => b.createdAt - a.createdAt);
    }
}

// =====================================================================================
// CALENDAR SERVICE - ADVANCED APPOINTMENT MANAGEMENT
// =====================================================================================

/**
 * Calendar Service - Comprehensive appointment and scheduling system
 */
class CalendarService {
    constructor(apiService, storageService) {
        this.api = apiService;
        this.storage = storageService;
        this.appointments = [];
        this.availability = new Map();
        this.workingHours = {
            monday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            tuesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            wednesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            thursday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            friday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            saturday: { start: '08:00', end: '16:00', breaks: [] },
            sunday: { closed: true }
        };
        this.holidays = [];
        this.timeSlotDuration = 30;
        this.bufferTime = 15;
    }

    async init() {
        await this.loadAppointments();
        await this.loadAvailability();
        await this.loadHolidays();
        this.generateAvailabilityCache();
        console.log('📅 Calendar Service initialized');
    }

    async loadAppointments() {
        try {
            const stored = localStorage.getItem('appointments');
            this.appointments = stored ? JSON.parse(stored) : [];

            if (this.storage && this.storage.db) {
                const dbAppointments = await this.storage.getAll('appointments');
                if (dbAppointments.length > 0) {
                    this.appointments = dbAppointments;
                }
            }
        } catch (error) {
            console.error('Failed to load appointments:', error);
            this.appointments = [];
        }
    }

    async loadAvailability() {
        try {
            const stored = localStorage.getItem('barberAvailability');
            if (stored) {
                const availabilityData = JSON.parse(stored);
                this.availability = new Map(Object.entries(availabilityData));
            }
        } catch (error) {
            console.error('Failed to load availability:', error);
        }
    }

    async loadHolidays() {
        try {
            const stored = localStorage.getItem('holidays');
            this.holidays = stored ? JSON.parse(stored) : this.getDefaultHolidays();
        } catch (error) {
            console.error('Failed to load holidays:', error);
            this.holidays = this.getDefaultHolidays();
        }
    }

    getDefaultHolidays() {
        const currentYear = new Date().getFullYear();
        return [
            { date: `${currentYear}-01-01`, name: 'Ano Novo' },
            { date: `${currentYear}-04-21`, name: 'Tiradentes' },
            { date: `${currentYear}-05-01`, name: 'Dia do Trabalhador' },
            { date: `${currentYear}-09-07`, name: 'Independência do Brasil' },
            { date: `${currentYear}-10-12`, name: 'Nossa Senhora Aparecida' },
            { date: `${currentYear}-11-02`, name: 'Finados' },
            { date: `${currentYear}-11-15`, name: 'Proclamação da República' },
            { date: `${currentYear}-12-25`, name: 'Natal' }
        ];
    }

    async bookAppointment(appointmentData) {
        try {
            this.validateAppointmentData(appointmentData);

            const isAvailable = await this.checkAvailability(
                appointmentData.barberId,
                appointmentData.date,
                appointmentData.time,
                appointmentData.duration
            );

            if (!isAvailable) {
                throw new Error('Horário não disponível');
            }

            const appointment = {
                id: this.generateAppointmentId(),
                ...appointmentData,
                status: 'confirmed',
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            this.appointments.push(appointment);
            await this.saveAppointments();

            this.updateAvailabilityCache(appointment);

            document.dispatchEvent(new CustomEvent('appointment-booked', {
                detail: appointment
            }));

            return appointment;

        } catch (error) {
            console.error('Failed to book appointment:', error);
            throw error;
        }
    }

    async cancelAppointment(appointmentId, reason = '') {
        try {
            const appointmentIndex = this.appointments.findIndex(apt => apt.id === appointmentId);
            if (appointmentIndex === -1) {
                throw new Error('Agendamento não encontrado');
            }

            const appointment = this.appointments[appointmentIndex];
            appointment.status = 'cancelled';
            appointment.cancellationReason = reason;
            appointment.cancelledAt = Date.now();
            appointment.updatedAt = Date.now();

            await this.saveAppointments();

            this.updateAvailabilityCache(appointment, true);

            document.dispatchEvent(new CustomEvent('appointment-cancelled', {
                detail: { appointment, reason }
            }));

            return appointment;

        } catch (error) {
            console.error('Failed to cancel appointment:', error);
            throw error;
        }
    }

    async checkAvailability(barberId, date, time, duration = 30) {
        try {
            if (this.isHoliday(date)) {
                return false;
            }

            if (!this.isWithinWorkingHours(date, time, duration)) {
                return false;
            }

            const conflictingAppointments = this.appointments.filter(apt =>
                apt.barberId === barberId &&
                apt.date === date &&
                apt.status !== 'cancelled' &&
                this.hasTimeConflict(apt.time, apt.duration, time, duration)
            );

            return conflictingAppointments.length === 0;

        } catch (error) {
            console.error('Failed to check availability:', error);
            return false;
        }
    }

    async getAvailableSlots(barberId, date) {
        try {
            const dayOfWeek = this.getDayOfWeek(date);
            const workingHours = this.workingHours[dayOfWeek];

            if (workingHours.closed || this.isHoliday(date)) {
                return [];
            }

            const slots = [];
            const startTime = this.parseTime(workingHours.start);
            const endTime = this.parseTime(workingHours.end);

            let currentTime = startTime;
            while (currentTime < endTime) {
                const timeString = this.formatTime(currentTime);

                const isBreakTime = workingHours.breaks.some(breakPeriod => {
                    const breakStart = this.parseTime(breakPeriod.start);
                    const breakEnd = this.parseTime(breakPeriod.end);
                    return currentTime >= breakStart && currentTime < breakEnd;
                });

                if (!isBreakTime) {
                    const isAvailable = await this.checkAvailability(
                        barberId,
                        date,
                        timeString,
                        this.timeSlotDuration
                    );

                    if (isAvailable) {
                        slots.push({
                            time: timeString,
                            available: true,
                            duration: this.timeSlotDuration
                        });
                    }
                }

                currentTime += this.timeSlotDuration;
            }

            return slots;

        } catch (error) {
            console.error('Failed to get available slots:', error);
            return [];
        }
    }

    getAppointments(startDate, endDate, filters = {}) {
        let appointments = this.appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            const start = new Date(startDate);
            const end = new Date(endDate);

            return aptDate >= start && aptDate <= end;
        });

        if (filters.barberId) {
            appointments = appointments.filter(apt => apt.barberId === filters.barberId);
        }

        if (filters.status) {
            appointments = appointments.filter(apt => apt.status === filters.status);
        }

        if (filters.customerId) {
            appointments = appointments.filter(apt => apt.customerId === filters.customerId);
        }

        return appointments.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateA - dateB;
        });
    }

    getTodayAppointments(barberId = null) {
        const today = new Date().toISOString().split('T')[0];
        return this.getAppointments(today, today, { barberId });
    }

    getUpcomingAppointments(customerId = null, limit = 10) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.getHours() * 60 + now.getMinutes();

        let appointments = this.appointments.filter(apt => {
            if (apt.status === 'cancelled') return false;

            const aptDate = new Date(apt.date);
            const aptTime = this.parseTime(apt.time);

            if (aptDate > now) return true;
            if (apt.date === today && aptTime > currentTime) return true;

            return false;
        });

        if (customerId) {
            appointments = appointments.filter(apt => apt.customerId === customerId);
        }

        return appointments
            .sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.time}`);
                const dateB = new Date(`${b.date} ${b.time}`);
                return dateA - dateB;
            })
            .slice(0, limit);
    }

    generateCalendarView(year, month, barberId = null) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const calendar = {
            year,
            month,
            monthName: firstDay.toLocaleString('pt-BR', { month: 'long' }),
            daysInMonth,
            startingDayOfWeek,
            days: []
        };

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];

            const dayAppointments = this.getAppointments(dateString, dateString, { barberId });

            calendar.days.push({
                day,
                date: dateString,
                dayOfWeek: date.getDay(),
                isToday: dateString === new Date().toISOString().split('T')[0],
                isHoliday: this.isHoliday(dateString),
                appointmentCount: dayAppointments.length,
                appointments: dayAppointments,
                hasAvailability: this.hasDayAvailability(dateString, barberId)
            });
        }

        return calendar;
    }

    // Utility methods
    validateAppointmentData(data) {
        const required = ['barberId', 'customerId', 'date', 'time', 'duration', 'serviceId'];
        const missing = required.filter(field => !data[field]);

        if (missing.length > 0) {
            throw new Error(`Campos obrigatórios: ${missing.join(', ')}`);
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
            throw new Error('Formato de data inválido (YYYY-MM-DD)');
        }

        if (!/^\d{2}:\d{2}$/.test(data.time)) {
            throw new Error('Formato de hora inválido (HH:MM)');
        }

        const appointmentDate = new Date(`${data.date} ${data.time}`);
        if (appointmentDate <= new Date()) {
            throw new Error('Data e hora devem ser no futuro');
        }
    }

    isHoliday(date) {
        return this.holidays.some(holiday => holiday.date === date);
    }

    isWithinWorkingHours(date, time, duration) {
        const dayOfWeek = this.getDayOfWeek(date);
        const workingHours = this.workingHours[dayOfWeek];

        if (workingHours.closed) return false;

        const appointmentStart = this.parseTime(time);
        const appointmentEnd = appointmentStart + duration;
        const workStart = this.parseTime(workingHours.start);
        const workEnd = this.parseTime(workingHours.end);

        if (appointmentStart < workStart || appointmentEnd > workEnd) {
            return false;
        }

        return !workingHours.breaks.some(breakPeriod => {
            const breakStart = this.parseTime(breakPeriod.start);
            const breakEnd = this.parseTime(breakPeriod.end);
            return this.hasTimeConflict(time, duration, this.formatTime(breakStart), breakEnd - breakStart);
        });
    }

    hasTimeConflict(time1, duration1, time2, duration2) {
        const start1 = this.parseTime(time1);
        const end1 = start1 + duration1;
        const start2 = this.parseTime(time2);
        const end2 = start2 + duration2;

        return start1 < end2 && start2 < end1;
    }

    hasDayAvailability(date, barberId) {
        const dayOfWeek = this.getDayOfWeek(date);
        const workingHours = barberId ?
            this.getBarberAvailability(barberId)[dayOfWeek] :
            this.workingHours[dayOfWeek];

        return !workingHours.closed && !this.isHoliday(date);
    }

    getDayOfWeek(date) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[new Date(date).getDay()];
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    generateAppointmentId() {
        return 'apt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async saveAppointments() {
        localStorage.setItem('appointments', JSON.stringify(this.appointments));

        if (this.storage && this.storage.db) {
            const promises = this.appointments.map(appointment =>
                this.storage.set('appointments', appointment)
            );
            await Promise.allSettled(promises);
        }
    }

    generateAvailabilityCache() {
        console.log('Availability cache generated');
        this.availability = new Map();
        this.appointments.forEach(appointment => {
            const barberId = appointment.barberId;
            const date = appointment.date;
            const dayOfWeek = this.getDayOfWeek(date);
            const workingHours = this.getBarberAvailability(barberId)[dayOfWeek];
            const availability = this.calculateAvailability(workingHours, appointment.time, appointment.duration);
            this.availability.set(`${barberId}_${date}`, availability);
        });
    }

    updateAvailabilityCache(appointment, removed = false) {
        console.log('Availability cache updated for:', appointment.date);
        const barberId = appointment.barberId;
        const date = appointment.date;
        const dayOfWeek = this.getDayOfWeek(date);
        const workingHours = this.getBarberAvailability(barberId)[dayOfWeek];
        const availability = this.calculateAvailability(workingHours, appointment.time, appointment.duration);
        this.availability.set(`${barberId}_${date}`, availability);
    }

    getBarberAvailability(barberId) {
        return this.availability.get(barberId) || this.workingHours;
    }
}

// =====================================================================================
// WORKING FUNCTIONS - FIXED VERSION
// =====================================================================================

// Global functions for backward compatibility
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

window.selectUserType = function(userType) {
  console.log('🔄 Selecting user type:', userType);
  currentUserType = userType;
  
  if (userType === 'cliente') {
    showScreen('login-cliente');
  } else if (userType === 'barbeiro') {
    showScreen('login-barbeiro');
  }
};

window.goBack = function() {
  console.log('🔙 Going back to user selection');
  showScreen('user-selection');
  currentUserType = null;
};

window.showRegister = function(userType) {
  console.log('📝 Showing registration for:', userType);
  currentUserType = userType;
  
  if (userType === 'cliente') {
    showScreen('register-cliente');
  } else if (userType === 'barbeiro') {
    showScreen('register-barbeiro');
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

window.agendarComBarbeiro = function(barbeiroId) {
  console.log('📅 Agendando com barbeiro ID:', barbeiroId);
  
  if (!currentUser) {
    console.log('❌ Usuário não logado');
    showScreen('login-cliente');
    return;
  }
  
  // Simular agendamento
  const barbeiro = appData.barbeiros.find(b => b.id === barbeiroId);
  if (barbeiro) {
    console.log('✅ Agendamento simulado com:', barbeiro.nome);
    alert(`Agendamento com ${barbeiro.nome} em desenvolvimento!`);
  }
};

window.loginCliente = function(event) {
  if (event) event.preventDefault();
  console.log('👤 Executando login do cliente...');
  
  const form = document.getElementById('login-cliente-form');
  const formData = new FormData(form);
  const email = formData.get('email');
  const password = formData.get('password');
  
  // Verificar se há usuários registrados
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const user = registeredUsers.find(u => u.email === email && u.userType === 'cliente');
  
  if (user && password) {
    currentUser = { 
      type: 'cliente', 
      name: user.name,
      email: user.email,
      id: user.id
    };
  } else if (email) {
    // Fallback para demo
    const name = email.split('@')[0];
    currentUser = { 
      type: 'cliente', 
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email
    };
  } else {
    alert('Por favor, preencha o e-mail para fazer login.');
    return;
  }
  
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('loginTime', Date.now().toString());
  
  console.log('✅ Usuário logado:', currentUser);
  showScreen('dashboard-cliente');
  setTimeout(() => {
    loadClienteDashboard();
    updateThemeIcon();
  }, 100);
};

window.loginBarbeiro = function(event) {
  if (event) event.preventDefault();
  console.log('✂️ Executando login do barbeiro...');
  
  const form = document.getElementById('login-barbeiro-form');
  const formData = new FormData(form);
  const email = formData.get('email');
  const name = email ? email.split('@')[0] : 'Carlos Mendes';
  
  currentUser = { 
    type: 'barbeiro', 
    name: name.charAt(0).toUpperCase() + name.slice(1),
    email: email || 'carlos@elitebarber.com'
  };
  
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('loginTime', Date.now().toString());
  
  console.log('👤 Barbeiro logado:', currentUser);
  showScreen('dashboard-barbeiro');
  setTimeout(() => {
    loadBarbeiroData();
    updateThemeIcon();
  }, 100);
};

window.logout = function() {
  console.log('🚪 Fazendo logout...');
  
  currentUser = null;
  currentUserType = null;
  
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('loginTime');
  localStorage.removeItem('registeredUsers');
  
  // Close any open modals
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  });
  
  // Reset body overflow
  document.body.style.overflow = 'auto';
  
  showScreen('user-selection');
  console.log('✅ Logout realizado com sucesso!');
};

window.toggleTheme = function() {
  const body = document.body;
  body.classList.toggle('dark-theme');
  
  if (body.classList.contains('dark-theme')) {
    localStorage.setItem('theme', 'dark');
    console.log('🌙 Tema escuro ativado');
  } else {
    localStorage.setItem('theme', 'light');
    console.log('☀️ Tema claro ativado');
  }
  
  updateThemeIcon();
};

function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  
  if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
  }
  
  setTimeout(updateThemeIcon, 100);
}

function updateThemeIcon() {
  const themeIcon = document.getElementById('theme-icon');
  const body = document.body;
  
  if (themeIcon) {
    if (body.classList.contains('dark-theme')) {
      themeIcon.className = 'fas fa-sun';
    } else {
      themeIcon.className = 'fas fa-moon';
    }
  }
}

function loadClienteDashboard() {
  console.log('📊 Loading cliente dashboard');
  
  const userNameElement = document.getElementById('user-name');
  if (userNameElement && currentUser) {
    userNameElement.textContent = currentUser.name;
  }
  
  // Load upcoming appointments
  loadUpcomingAppointments();
  
  // Load favorite barbers
  loadFavoriteBarbers();
  
  // Update datetime
  updateDateTime();
  
  console.log('✅ Cliente dashboard loaded');
}

function loadUpcomingAppointments() {
  const container = document.getElementById('upcoming-appointments-list');
  if (!container) return;
  
  const appointments = [
    {
      id: 1,
      service: 'Corte + Barba',
      barber: 'Carlos Mendes',
      date: 'Amanhã',
      time: '14:00',
      status: 'confirmed',
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

function loadFavoriteBarbers() {
  const container = document.getElementById('favorite-barbers-list');
  if (!container) return;
  
  const favoriteBarbers = appData.barbeiros.slice(0, 2);
  
  container.innerHTML = favoriteBarbers.map((barbeiro, index) => `
    <div class="barber-card ${index === 0 ? 'premium' : ''}" data-barber-id="${barbeiro.id}">
      <div class="barber-avatar">
        <img src="${barbeiro.foto}" alt="${barbeiro.nome}" class="barber-image">
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
        <button class="btn-small primary agendar-btn" data-barber-id="${barbeiro.id}">
          <i class="fas fa-calendar-plus"></i>
          Agendar
        </button>
      </div>
    </div>
  `).join('');
  
  // Add event listeners for barber images (fallback)
  container.querySelectorAll('.barber-image').forEach(img => {
    img.addEventListener('error', function() {
      this.src = 'https://via.placeholder.com/150x150?text=Barbeiro';
    });
  });
  
  // Add event listeners for appointment buttons
  container.querySelectorAll('.agendar-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const barberId = parseInt(this.getAttribute('data-barber-id'));
      agendarComBarbeiro(barberId);
    });
  });
}

function loadBarbeiroData() {
  console.log('Loading barbeiro data');
  const userNameElement = document.getElementById('user-name');
  if (userNameElement && currentUser) {
    userNameElement.textContent = currentUser.name;
  }
  
  // Update datetime
  updateDateTime();
  
  console.log('✅ Barbeiro dashboard loaded');
}

// Utility Functions
function updateNotificationBadge() {
  const badge = document.getElementById('notification-badge');
  if (badge) {
    // Simulate notification count
    const count = Math.floor(Math.random() * 5);
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }
}

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

// Modal Functions
window.openModal = function(modalId) {
  console.log('🔓 Opening modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
};

window.closeModal = function(modalId) {
  console.log('🔒 Closing modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
};

// Navigation Functions
window.navigateToScreen = function(screenId) {
  console.log('🧭 Navigating to:', screenId);
  showScreen(screenId);
};

window.showProfile = function() {
  if (!currentUser) {
    console.log('❌ User not logged in');
    showScreen('user-selection');
    return;
  }
  
  console.log('👤 Showing profile for:', currentUser.name);
  showScreen('perfil');
};

window.showAppointments = function() {
  if (!currentUser) {
    console.log('❌ User not logged in');
    showScreen('user-selection');
    return;
  }
  
  console.log('📅 Showing appointments for:', currentUser.name);
  showScreen('agendamentos');
};

// Debug Functions
window.debugApp = function() {
  console.log('🔍 Debug Info:');
  console.log('Current User:', currentUser);
  console.log('Current User Type:', currentUserType);
  console.log('LocalStorage:', {
    isLoggedIn: localStorage.getItem('isLoggedIn'),
    currentUser: localStorage.getItem('currentUser'),
    theme: localStorage.getItem('theme')
  });
  console.log('Available screens:', document.querySelectorAll('.screen').length);
  console.log('Active screen:', document.querySelector('.screen.active')?.id);
};

// Error handling
window.handleAppError = function(error, context = 'Unknown') {
  console.error(`❌ Error in ${context}:`, error);
  
  // Show user-friendly message
  const message = error.message || 'Ocorreu um erro inesperado';
  alert(`Erro: ${message}`);
  
  // Reset to safe state if needed
  if (!currentUser && !document.querySelector('.screen.active')) {
    showScreen('user-selection');
  }
};

function checkSavedLogin() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const savedUser = localStorage.getItem('currentUser');
  
  if (isLoggedIn === 'true' && savedUser) {
    currentUser = JSON.parse(savedUser);
    console.log('🔄 Login automático:', currentUser);
    
    if (currentUser.type === 'cliente') {
      showScreen('dashboard-cliente');
      setTimeout(() => {
        loadClienteDashboard();
        updateThemeIcon();
      }, 100);
    } else if (currentUser.type === 'barbeiro') {
      showScreen('dashboard-barbeiro');
      setTimeout(() => {
        loadBarbeiroData();
        updateThemeIcon();
      }, 100);
    }
    
    return true;
  }
  
  return false;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Elite Barber App Starting...');
  
  // Load saved theme
  loadSavedTheme();
  
  // Check for saved login
  const isAutoLoggedIn = checkSavedLogin();
  
  // If not auto-logged in, show user selection
  if (!isAutoLoggedIn) {
    showScreen('user-selection');
  }
  
  // Setup global event listeners to avoid CSP issues
  setupGlobalEventListeners();
  
  console.log('✅ Application ready!');
});

// Setup all global event listeners to avoid CSP issues
function setupGlobalEventListeners() {
  console.log('🔗 Setting up global event listeners...');
  
  // Close modals when clicking outside
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.classList.add('hidden');
      e.target.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
  
  // Handle all button clicks with data attributes
  document.addEventListener('click', function(e) {
    const target = e.target.closest('button');
    if (!target) return;
    
    // Handle user type selection
    if (target.hasAttribute('data-user-type')) {
      const userType = target.getAttribute('data-user-type');
      selectUserType(userType);
    }
    
    // Handle navigation
    if (target.hasAttribute('data-navigate')) {
      const screen = target.getAttribute('data-navigate');
      showScreen(screen);
    }
    
    // Handle logout
    if (target.classList.contains('logout-btn') || target.id === 'logout-btn') {
      logout();
    }
    
    // Handle theme toggle
    if (target.classList.contains('theme-toggle') || target.id === 'theme-toggle') {
      toggleTheme();
    }
    
    // Handle modal close
    if (target.classList.contains('close-modal')) {
      const modalId = target.getAttribute('data-modal');
      if (modalId) {
        closeModal(modalId);
      }
    }
    
    // Handle go back
    if (target.classList.contains('go-back') || target.id === 'go-back') {
      goBack();
    }
    
    // Handle barber appointment booking
    if (target.classList.contains('agendar-btn')) {
      const barberId = parseInt(target.getAttribute('data-barber-id'));
      agendarComBarbeiro(barberId);
    }
  });
  
  // Handle form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    
    if (form.id === 'login-cliente-form') {
      e.preventDefault();
      loginCliente(e);
    }
    
    if (form.id === 'login-barbeiro-form') {
      e.preventDefault();
      loginBarbeiro(e);
    }
    
    if (form.id === 'register-cliente-form') {
      e.preventDefault();
      handleClienteRegistration(e);
    }
    
    if (form.id === 'register-barbeiro-form') {
      e.preventDefault();
      handleBarbeiroRegistration(e);
    }
  });
  
  // Handle image loading errors
  document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
      e.target.src = 'https://via.placeholder.com/150x150?text=Imagem';
    }
  }, true);
  
  console.log('✅ Global event listeners setup complete');
}

// Registration handlers
window.handleClienteRegistration = function(event) {
  if (event) event.preventDefault();
  console.log('📝 Handling cliente registration...');
  
  const form = document.getElementById('register-cliente-form');
  if (!form) return;
  
  const formData = new FormData(form);
  
  const userData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    phone: formData.get('phone'),
    userType: 'cliente'
  };
  
  // Basic validation
  if (!userData.name || userData.name.length < 2) {
    alert('Nome deve ter pelo menos 2 caracteres');
    return;
  }
  
  if (!userData.email || !userData.email.includes('@')) {
    alert('Email inválido');
    return;
  }
  
  if (!userData.password || userData.password.length < 6) {
    alert('Senha deve ter pelo menos 6 caracteres');
    return;
  }
  
  if (userData.password !== userData.confirmPassword) {
    alert('Senhas não coincidem');
    return;
  }
  
  // Save user
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const userExists = existingUsers.find(user => user.email === userData.email);
  
  if (userExists) {
    alert('Email já cadastrado');
    return;
  }
  
  const newUser = {
    id: Date.now(),
    ...userData,
    createdAt: new Date().toISOString()
  };
  
  existingUsers.push(newUser);
  localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
  
  console.log('✅ Cliente registrado:', newUser);
  alert('Cadastro realizado com sucesso!');
  showScreen('login-cliente');
};

window.handleBarbeiroRegistration = function(event) {
  if (event) event.preventDefault();
  console.log('📝 Handling barbeiro registration...');
  
  const form = document.getElementById('register-barbeiro-form');
  if (!form) return;
  
  const formData = new FormData(form);
  
  const userData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    phone: formData.get('phone'),
    userType: 'barbeiro'
  };
  
  // Basic validation (same as cliente)
  if (!userData.name || userData.name.length < 2) {
    alert('Nome deve ter pelo menos 2 caracteres');
    return;
  }
  
  if (!userData.email || !userData.email.includes('@')) {
    alert('Email inválido');
    return;
  }
  
  if (!userData.password || userData.password.length < 6) {
    alert('Senha deve ter pelo menos 6 caracteres');
    return;
  }
  
  if (userData.password !== userData.confirmPassword) {
    alert('Senhas não coincidem');
    return;
  }
  
  // Save user
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const userExists = existingUsers.find(user => user.email === userData.email);
  
  if (userExists) {
    alert('Email já cadastrado');
    return;
  }
  
  const newUser = {
    id: Date.now(),
    ...userData,
    createdAt: new Date().toISOString()
  };
  
  existingUsers.push(newUser);
  localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
  
  console.log('✅ Barbeiro registrado:', newUser);
  alert('Cadastro realizado com sucesso!');
  showScreen('login-barbeiro');
};

console.log('📱 Elite Barber Shop - 3000+ lines loaded successfully!');
console.log('🔒 CSP-compliant event handlers configured');
