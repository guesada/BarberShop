/**
 * Serviço de Analytics Avançado
 * Tracking completo de eventos, performance, erros e comportamento do usuário
 */
class AnalyticsService {
  constructor() {
    this.isEnabled = process.env.REACT_APP_ENABLE_ANALYTICS === 'true';
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.startTime = Date.now();
    this.events = [];
    this.performanceMetrics = {};
    this.userJourney = [];
    this.errors = [];
    
    if (this.isEnabled) {
      this.init();
    }
  }

  /**
   * Inicializar serviço de analytics
   */
  init() {
    this.setupPerformanceTracking();
    this.setupErrorTracking();
    this.setupUserInteractionTracking();
    this.setupPageViewTracking();
    this.setupConnectionTracking();
    this.startSessionTracking();
    
    console.log('[Analytics] Serviço inicializado', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Gerar ID único de sessão
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Definir usuário atual
   */
  setUser(userId, userProperties = {}) {
    this.userId = userId;
    this.track('user_identified', {
      userId,
      ...userProperties,
      sessionId: this.sessionId
    });
  }

  /**
   * Rastrear evento personalizado
   */
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
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connection: this.getConnectionInfo()
      }
    };

    this.events.push(event);
    this.sendEvent(event);
    
    console.log('[Analytics] Event tracked:', eventName, properties);
  }

  /**
   * Rastrear visualização de página
   */
  trackPageView(pageName, properties = {}) {
    const pageViewData = {
      page: pageName,
      title: document.title,
      referrer: document.referrer,
      loadTime: this.getPageLoadTime(),
      ...properties
    };

    this.userJourney.push({
      type: 'page_view',
      page: pageName,
      timestamp: Date.now()
    });

    this.track('page_view', pageViewData);
  }

  /**
   * Rastrear interação do usuário
   */
  trackUserInteraction(element, action, properties = {}) {
    const interactionData = {
      element: element.tagName || 'unknown',
      elementId: element.id || null,
      elementClass: element.className || null,
      action,
      ...properties
    };

    this.track('user_interaction', interactionData);
  }

  /**
   * Rastrear erro
   */
  trackError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      userJourney: this.userJourney.slice(-5) // Últimas 5 ações
    };

    this.errors.push(errorData);
    this.track('error', errorData);
    
    console.error('[Analytics] Error tracked:', error, context);
  }

  /**
   * Rastrear performance
   */
  trackPerformance(metricName, value, properties = {}) {
    const performanceData = {
      metric: metricName,
      value,
      unit: properties.unit || 'ms',
      ...properties
    };

    this.performanceMetrics[metricName] = value;
    this.track('performance', performanceData);
  }

  /**
   * Rastrear conversão/objetivo
   */
  trackConversion(goalName, value = 0, properties = {}) {
    const conversionData = {
      goal: goalName,
      value,
      currency: properties.currency || 'BRL',
      ...properties
    };

    this.track('conversion', conversionData);
  }

  /**
   * Rastrear tempo gasto em página
   */
  trackTimeOnPage(pageName, timeSpent) {
    this.track('time_on_page', {
      page: pageName,
      timeSpent,
      unit: 'seconds'
    });
  }

  /**
   * Configurar tracking de performance
   */
  setupPerformanceTracking() {
    // Performance Observer para métricas web vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackPerformance('largest_contentful_paint', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.trackPerformance('first_input_delay', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.trackPerformance('cumulative_layout_shift', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Navigation Timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
          this.trackPerformance('load_complete', navigation.loadEventEnd - navigation.loadEventStart);
          this.trackPerformance('total_load_time', navigation.loadEventEnd - navigation.fetchStart);
        }
      }, 0);
    });
  }

  /**
   * Configurar tracking de erros
   */
  setupErrorTracking() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), {
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection'
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.trackError(new Error(`Resource failed to load: ${event.target.src || event.target.href}`), {
          type: 'resource_error',
          element: event.target.tagName,
          source: event.target.src || event.target.href
        });
      }
    }, true);
  }

  /**
   * Configurar tracking de interações do usuário
   */
  setupUserInteractionTracking() {
    // Clicks
    document.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
        this.trackUserInteraction(event.target, 'click', {
          text: event.target.textContent?.trim().substring(0, 100)
        });
      }
    });

    // Form submissions
    document.addEventListener('submit', (event) => {
      this.trackUserInteraction(event.target, 'form_submit', {
        formId: event.target.id,
        formAction: event.target.action
      });
    });

    // Scroll tracking
    let scrollTimeout;
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
      maxScroll = Math.max(maxScroll, scrollPercent);
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.track('scroll_depth', { maxScroll });
      }, 1000);
    });
  }

  /**
   * Configurar tracking de visualizações de página
   */
  setupPageViewTracking() {
    // Initial page view
    this.trackPageView(window.location.pathname);

    // SPA navigation tracking
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => {
        this.trackPageView(window.location.pathname);
      }, 0);
    }.bind(this);

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => {
        this.trackPageView(window.location.pathname);
      }, 0);
    }.bind(this);

    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname);
    });
  }

  /**
   * Configurar tracking de conexão
   */
  setupConnectionTracking() {
    window.addEventListener('online', () => {
      this.track('connection_status', { status: 'online' });
    });

    window.addEventListener('offline', () => {
      this.track('connection_status', { status: 'offline' });
    });
  }

  /**
   * Iniciar tracking de sessão
   */
  startSessionTracking() {
    this.track('session_start', {
      timestamp: this.startTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform
    });

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.track('session_end', {
        duration: Date.now() - this.startTime,
        events_count: this.events.length,
        errors_count: this.errors.length
      });
    });

    // Heartbeat para sessões longas
    setInterval(() => {
      this.track('session_heartbeat', {
        duration: Date.now() - this.startTime,
        events_count: this.events.length
      });
    }, 300000); // A cada 5 minutos
  }

  /**
   * Obter informações de conexão
   */
  getConnectionInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }

  /**
   * Obter tempo de carregamento da página
   */
  getPageLoadTime() {
    if (performance.timing) {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    }
    return null;
  }

  /**
   * Gerar ID único para evento
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enviar evento para servidor/serviço de analytics
   */
  async sendEvent(event) {
    try {
      // Aqui você pode integrar com Google Analytics, Mixpanel, etc.
      // Por enquanto, vamos armazenar localmente
      this.storeEventLocally(event);
      
      // Exemplo de envio para API própria
      if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
        await fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        });
      }
    } catch (error) {
      console.error('[Analytics] Failed to send event:', error);
    }
  }

  /**
   * Armazenar evento localmente
   */
  storeEventLocally(event) {
    try {
      const stored = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      stored.push(event);
      
      // Manter apenas os últimos 1000 eventos
      if (stored.length > 1000) {
        stored.splice(0, stored.length - 1000);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(stored));
    } catch (error) {
      console.error('[Analytics] Failed to store event locally:', error);
    }
  }

  /**
   * Obter relatório de analytics
   */
  getAnalyticsReport() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      sessionDuration: Date.now() - this.startTime,
      eventsCount: this.events.length,
      errorsCount: this.errors.length,
      performanceMetrics: this.performanceMetrics,
      userJourney: this.userJourney,
      recentEvents: this.events.slice(-10),
      recentErrors: this.errors.slice(-5)
    };
  }

  /**
   * Limpar dados de analytics
   */
  clearAnalyticsData() {
    this.events = [];
    this.errors = [];
    this.userJourney = [];
    this.performanceMetrics = {};
    localStorage.removeItem('analytics_events');
    
    console.log('[Analytics] Data cleared');
  }

  /**
   * Exportar dados para análise
   */
  exportData() {
    const data = {
      session: {
        id: this.sessionId,
        userId: this.userId,
        startTime: this.startTime,
        duration: Date.now() - this.startTime
      },
      events: this.events,
      errors: this.errors,
      performance: this.performanceMetrics,
      userJourney: this.userJourney
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${this.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Instância singleton
const analyticsService = new AnalyticsService();

export default analyticsService;
