/**
 * Serviço de Otimização de Performance
 * Monitoramento, otimização e relatórios de performance em tempo real
 */
class PerformanceService {
  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true';
    this.metrics = new Map();
    this.observers = new Map();
    this.thresholds = {
      lcp: 2500, // Largest Contentful Paint
      fid: 100,  // First Input Delay
      cls: 0.1,  // Cumulative Layout Shift
      fcp: 1800, // First Contentful Paint
      ttfb: 600  // Time to First Byte
    };
    this.resourceTimings = [];
    this.userTimings = [];
    this.memoryUsage = [];
    
    if (this.isEnabled) {
      this.init();
    }
  }

  /**
   * Inicializar serviço de performance
   */
  init() {
    this.setupWebVitalsMonitoring();
    this.setupResourceMonitoring();
    this.setupMemoryMonitoring();
    this.setupNetworkMonitoring();
    this.setupRenderingMonitoring();
    this.startPerformanceReporting();
    
    console.log('[Performance] Serviço inicializado');
  }

  /**
   * Configurar monitoramento de Web Vitals
   */
  setupWebVitalsMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.startTime;
      
      this.recordMetric('lcp', lcp);
      this.checkThreshold('lcp', lcp);
      
      if (lcp > this.thresholds.lcp) {
        this.reportPerformanceIssue('lcp', lcp, 'Largest Contentful Paint muito alto');
      }
    });
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
    } catch (e) {
      console.warn('[Performance] LCP observer não suportado');
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        this.recordMetric('fid', fid);
        this.checkThreshold('fid', fid);
        
        if (fid > this.thresholds.fid) {
          this.reportPerformanceIssue('fid', fid, 'First Input Delay muito alto');
        }
      });
    });
    
    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
    } catch (e) {
      console.warn('[Performance] FID observer não suportado');
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.recordMetric('cls', clsValue);
      this.checkThreshold('cls', clsValue);
      
      if (clsValue > this.thresholds.cls) {
        this.reportPerformanceIssue('cls', clsValue, 'Cumulative Layout Shift muito alto');
      }
    });
    
    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    } catch (e) {
      console.warn('[Performance] CLS observer não suportado');
    }

    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          const fcp = entry.startTime;
          this.recordMetric('fcp', fcp);
          this.checkThreshold('fcp', fcp);
          
          if (fcp > this.thresholds.fcp) {
            this.reportPerformanceIssue('fcp', fcp, 'First Contentful Paint muito alto');
          }
        }
      });
    });
    
    try {
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.set('fcp', fcpObserver);
    } catch (e) {
      console.warn('[Performance] FCP observer não suportado');
    }
  }

  /**
   * Configurar monitoramento de recursos
   */
  setupResourceMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const resourceTiming = {
          name: entry.name,
          type: this.getResourceType(entry.name),
          duration: entry.duration,
          size: entry.transferSize || 0,
          startTime: entry.startTime,
          dns: entry.domainLookupEnd - entry.domainLookupStart,
          tcp: entry.connectEnd - entry.connectStart,
          ssl: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
          ttfb: entry.responseStart - entry.requestStart,
          download: entry.responseEnd - entry.responseStart,
          cached: entry.transferSize === 0 && entry.decodedBodySize > 0
        };
        
        this.resourceTimings.push(resourceTiming);
        this.analyzeResourcePerformance(resourceTiming);
      });
    });
    
    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (e) {
      console.warn('[Performance] Resource observer não suportado');
    }
  }

  /**
   * Configurar monitoramento de memória
   */
  setupMemoryMonitoring() {
    if (!('memory' in performance)) return;

    const recordMemoryUsage = () => {
      const memory = performance.memory;
      const memoryInfo = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        timestamp: Date.now(),
        usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
      
      this.memoryUsage.push(memoryInfo);
      
      // Manter apenas os últimos 100 registros
      if (this.memoryUsage.length > 100) {
        this.memoryUsage.shift();
      }
      
      // Alertar se uso de memória estiver alto
      if (memoryInfo.usage > 80) {
        this.reportPerformanceIssue('memory', memoryInfo.usage, 'Alto uso de memória detectado');
      }
    };

    // Registrar uso de memória a cada 30 segundos
    setInterval(recordMemoryUsage, 30000);
    recordMemoryUsage(); // Registro inicial
  }

  /**
   * Configurar monitoramento de rede
   */
  setupNetworkMonitoring() {
    if (!('connection' in navigator)) return;

    const connection = navigator.connection;
    
    const recordNetworkInfo = () => {
      const networkInfo = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
        timestamp: Date.now()
      };
      
      this.recordMetric('network', networkInfo);
    };

    connection.addEventListener('change', recordNetworkInfo);
    recordNetworkInfo(); // Registro inicial
  }

  /**
   * Configurar monitoramento de renderização
   */
  setupRenderingMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;

    const measureFPS = (currentTime) => {
      frameCount++;
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.recordMetric('fps', fps);
        
        if (fps < 30) {
          this.reportPerformanceIssue('fps', fps, 'FPS baixo detectado');
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Iniciar relatórios periódicos de performance
   */
  startPerformanceReporting() {
    // Relatório a cada 5 minutos
    setInterval(() => {
      this.generatePerformanceReport();
    }, 300000);

    // Relatório ao sair da página
    window.addEventListener('beforeunload', () => {
      this.generatePerformanceReport();
    });
  }

  /**
   * Registrar métrica de performance
   */
  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push({
      value,
      timestamp: Date.now()
    });
    
    // Manter apenas os últimos 50 registros por métrica
    const values = this.metrics.get(name);
    if (values.length > 50) {
      values.shift();
    }
  }

  /**
   * Verificar se métrica excede threshold
   */
  checkThreshold(metric, value) {
    if (this.thresholds[metric] && value > this.thresholds[metric]) {
      console.warn(`[Performance] ${metric.toUpperCase()} threshold exceeded:`, value, 'ms');
      return false;
    }
    return true;
  }

  /**
   * Reportar problema de performance
   */
  reportPerformanceIssue(metric, value, description) {
    const issue = {
      metric,
      value,
      description,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.warn('[Performance] Issue detected:', issue);
    
    // Integrar com serviço de analytics se disponível
    if (window.analyticsService) {
      window.analyticsService.track('performance_issue', issue);
    }
  }

  /**
   * Obter tipo de recurso
   */
  getResourceType(url) {
    if (url.match(/\.(js|mjs)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    if (url.match(/\.(json|xml)$/)) return 'data';
    return 'other';
  }

  /**
   * Analisar performance de recursos
   */
  analyzeResourcePerformance(resource) {
    // Recursos lentos
    if (resource.duration > 3000) {
      this.reportPerformanceIssue('slow_resource', resource.duration, `Recurso lento: ${resource.name}`);
    }
    
    // Recursos grandes
    if (resource.size > 1024 * 1024) { // 1MB
      this.reportPerformanceIssue('large_resource', resource.size, `Recurso grande: ${resource.name}`);
    }
    
    // TTFB alto
    if (resource.ttfb > 1000) {
      this.reportPerformanceIssue('high_ttfb', resource.ttfb, `TTFB alto: ${resource.name}`);
    }
  }

  /**
   * Marcar início de operação personalizada
   */
  markStart(name) {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(`${name}-start`);
    }
  }

  /**
   * Marcar fim de operação personalizada
   */
  markEnd(name) {
    if ('performance' in window && 'mark' in performance && 'measure' in performance) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      if (measure) {
        this.userTimings.push({
          name,
          duration: measure.duration,
          timestamp: Date.now()
        });
        
        this.recordMetric(`custom_${name}`, measure.duration);
      }
    }
  }

  /**
   * Medir tempo de execução de função
   */
  async measureFunction(name, fn) {
    this.markStart(name);
    try {
      const result = await fn();
      this.markEnd(name);
      return result;
    } catch (error) {
      this.markEnd(name);
      throw error;
    }
  }

  /**
   * Obter métricas atuais
   */
  getCurrentMetrics() {
    const metrics = {};
    
    this.metrics.forEach((values, name) => {
      if (values.length > 0) {
        const latest = values[values.length - 1];
        const average = values.reduce((sum, v) => sum + v.value, 0) / values.length;
        
        metrics[name] = {
          current: latest.value,
          average: Math.round(average * 100) / 100,
          count: values.length,
          timestamp: latest.timestamp
        };
      }
    });
    
    return metrics;
  }

  /**
   * Gerar relatório de performance
   */
  generatePerformanceReport() {
    const report = {
      timestamp: Date.now(),
      url: window.location.href,
      metrics: this.getCurrentMetrics(),
      resources: {
        total: this.resourceTimings.length,
        byType: this.getResourcesByType(),
        slowest: this.getSlowestResources(5),
        largest: this.getLargestResources(5)
      },
      memory: this.getMemoryStats(),
      userTimings: this.userTimings.slice(-10),
      issues: this.getRecentIssues()
    };
    
    console.log('[Performance] Report generated:', report);
    
    // Integrar com serviço de analytics
    if (window.analyticsService) {
      window.analyticsService.track('performance_report', report);
    }
    
    return report;
  }

  /**
   * Obter recursos por tipo
   */
  getResourcesByType() {
    const byType = {};
    this.resourceTimings.forEach(resource => {
      if (!byType[resource.type]) {
        byType[resource.type] = { count: 0, totalSize: 0, totalDuration: 0 };
      }
      byType[resource.type].count++;
      byType[resource.type].totalSize += resource.size;
      byType[resource.type].totalDuration += resource.duration;
    });
    return byType;
  }

  /**
   * Obter recursos mais lentos
   */
  getSlowestResources(limit = 5) {
    return this.resourceTimings
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
      .map(r => ({ name: r.name, duration: r.duration, size: r.size }));
  }

  /**
   * Obter recursos maiores
   */
  getLargestResources(limit = 5) {
    return this.resourceTimings
      .sort((a, b) => b.size - a.size)
      .slice(0, limit)
      .map(r => ({ name: r.name, size: r.size, duration: r.duration }));
  }

  /**
   * Obter estatísticas de memória
   */
  getMemoryStats() {
    if (this.memoryUsage.length === 0) return null;
    
    const latest = this.memoryUsage[this.memoryUsage.length - 1];
    const peak = Math.max(...this.memoryUsage.map(m => m.used));
    const average = this.memoryUsage.reduce((sum, m) => sum + m.used, 0) / this.memoryUsage.length;
    
    return {
      current: latest.used,
      peak,
      average: Math.round(average),
      limit: latest.limit,
      usage: latest.usage
    };
  }

  /**
   * Obter problemas recentes
   */
  getRecentIssues() {
    // Implementar lógica para rastrear problemas
    return [];
  }

  /**
   * Otimizar performance automaticamente
   */
  optimizePerformance() {
    // Limpar métricas antigas
    this.metrics.forEach((values, name) => {
      if (values.length > 20) {
        this.metrics.set(name, values.slice(-20));
      }
    });
    
    // Limpar timings de recursos antigos
    if (this.resourceTimings.length > 100) {
      this.resourceTimings = this.resourceTimings.slice(-100);
    }
    
    // Limpar user timings antigos
    if (this.userTimings.length > 50) {
      this.userTimings = this.userTimings.slice(-50);
    }
    
    console.log('[Performance] Otimização automática executada');
  }

  /**
   * Exportar dados de performance
   */
  exportPerformanceData() {
    const data = {
      metrics: Object.fromEntries(this.metrics),
      resources: this.resourceTimings,
      memory: this.memoryUsage,
      userTimings: this.userTimings,
      report: this.generatePerformanceReport()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Limpar dados de performance
   */
  clearPerformanceData() {
    this.metrics.clear();
    this.resourceTimings = [];
    this.userTimings = [];
    this.memoryUsage = [];
    
    console.log('[Performance] Dados limpos');
  }

  /**
   * Destruir serviço
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.clearPerformanceData();
    
    console.log('[Performance] Serviço destruído');
  }
}

// Instância singleton
const performanceService = new PerformanceService();

export default performanceService;
