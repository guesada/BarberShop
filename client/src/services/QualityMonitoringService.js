/**
 * Serviço de Monitoramento de Qualidade
 * Análise de código, métricas de qualidade e relatórios automáticos
 */
class QualityMonitoringService {
  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENABLE_QUALITY_MONITORING === 'true';
    this.metrics = {
      performance: new Map(),
      errors: [],
      warnings: [],
      accessibility: [],
      seo: [],
      security: []
    };
    this.thresholds = {
      performance: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        fcp: 1800,
        ttfb: 600
      },
      bundle: {
        maxSize: 1024 * 1024, // 1MB
        maxChunks: 10
      },
      accessibility: {
        minContrast: 4.5,
        maxTabIndex: 0
      }
    };
    this.rules = new Map();
    this.violations = [];
    
    if (this.isEnabled) {
      this.init();
    }
  }

  /**
   * Inicializar serviço
   */
  init() {
    this.setupQualityRules();
    this.startPerformanceMonitoring();
    this.startAccessibilityMonitoring();
    this.startSecurityMonitoring();
    this.startCodeQualityAnalysis();
    this.scheduleQualityReports();
    
    console.log('[QualityMonitoring] Serviço inicializado');
  }

  /**
   * Configurar regras de qualidade
   */
  setupQualityRules() {
    // Regras de Performance
    this.addRule('performance', 'large-contentful-paint', {
      check: (lcp) => lcp <= this.thresholds.performance.lcp,
      message: 'LCP deve ser menor que 2.5s',
      severity: 'error'
    });

    this.addRule('performance', 'first-input-delay', {
      check: (fid) => fid <= this.thresholds.performance.fid,
      message: 'FID deve ser menor que 100ms',
      severity: 'error'
    });

    this.addRule('performance', 'cumulative-layout-shift', {
      check: (cls) => cls <= this.thresholds.performance.cls,
      message: 'CLS deve ser menor que 0.1',
      severity: 'warning'
    });

    // Regras de Acessibilidade
    this.addRule('accessibility', 'alt-text', {
      check: () => this.checkImageAltText(),
      message: 'Todas as imagens devem ter alt text',
      severity: 'error'
    });

    this.addRule('accessibility', 'color-contrast', {
      check: () => this.checkColorContrast(),
      message: 'Contraste de cores deve ser adequado',
      severity: 'warning'
    });

    this.addRule('accessibility', 'keyboard-navigation', {
      check: () => this.checkKeyboardNavigation(),
      message: 'Navegação por teclado deve estar disponível',
      severity: 'error'
    });

    // Regras de SEO
    this.addRule('seo', 'meta-description', {
      check: () => !!document.querySelector('meta[name="description"]'),
      message: 'Meta description é obrigatória',
      severity: 'error'
    });

    this.addRule('seo', 'title-length', {
      check: () => {
        const title = document.title;
        return title.length >= 30 && title.length <= 60;
      },
      message: 'Título deve ter entre 30-60 caracteres',
      severity: 'warning'
    });

    // Regras de Segurança
    this.addRule('security', 'https-only', {
      check: () => location.protocol === 'https:' || location.hostname === 'localhost',
      message: 'Site deve usar HTTPS',
      severity: 'error'
    });

    this.addRule('security', 'external-links', {
      check: () => this.checkExternalLinks(),
      message: 'Links externos devem ter rel="noopener noreferrer"',
      severity: 'warning'
    });
  }

  /**
   * Adicionar regra de qualidade
   */
  addRule(category, name, rule) {
    if (!this.rules.has(category)) {
      this.rules.set(category, new Map());
    }
    this.rules.get(category).set(name, rule);
  }

  /**
   * Executar verificação de qualidade
   */
  async runQualityCheck() {
    const results = {
      timestamp: Date.now(),
      passed: 0,
      failed: 0,
      warnings: 0,
      violations: []
    };

    for (const [category, rules] of this.rules) {
      for (const [name, rule] of rules) {
        try {
          const passed = await rule.check();
          
          if (!passed) {
            const violation = {
              category,
              rule: name,
              message: rule.message,
              severity: rule.severity,
              timestamp: Date.now()
            };
            
            results.violations.push(violation);
            this.violations.push(violation);
            
            if (rule.severity === 'error') {
              results.failed++;
            } else {
              results.warnings++;
            }
          } else {
            results.passed++;
          }
        } catch (error) {
          console.error(`[QualityMonitoring] Erro ao executar regra ${category}:${name}:`, error);
        }
      }
    }

    this.logQualityResults(results);
    return results;
  }

  /**
   * Monitoramento de performance
   */
  startPerformanceMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    // Web Vitals
    const vitalsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordPerformanceMetric(entry.name, entry.startTime || entry.value);
      });
    });

    try {
      vitalsObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      console.warn('[QualityMonitoring] Web Vitals observer não suportado');
    }

    // Resource timing
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.analyzeResourcePerformance(entry);
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('[QualityMonitoring] Resource observer não suportado');
    }
  }

  /**
   * Registrar métrica de performance
   */
  recordPerformanceMetric(name, value) {
    if (!this.metrics.performance.has(name)) {
      this.metrics.performance.set(name, []);
    }
    
    this.metrics.performance.get(name).push({
      value,
      timestamp: Date.now()
    });

    // Verificar thresholds
    this.checkPerformanceThreshold(name, value);
  }

  /**
   * Verificar threshold de performance
   */
  checkPerformanceThreshold(metric, value) {
    const threshold = this.thresholds.performance[metric];
    if (threshold && value > threshold) {
      this.recordViolation('performance', metric, `${metric} excedeu threshold: ${value}ms > ${threshold}ms`, 'warning');
    }
  }

  /**
   * Analisar performance de recursos
   */
  analyzeResourcePerformance(entry) {
    // Recursos lentos
    if (entry.duration > 3000) {
      this.recordViolation('performance', 'slow-resource', `Recurso lento: ${entry.name} (${entry.duration}ms)`, 'warning');
    }

    // Recursos grandes
    if (entry.transferSize > 1024 * 1024) { // 1MB
      this.recordViolation('performance', 'large-resource', `Recurso grande: ${entry.name} (${this.formatBytes(entry.transferSize)})`, 'warning');
    }

    // TTFB alto
    if (entry.responseStart - entry.requestStart > 1000) {
      this.recordViolation('performance', 'high-ttfb', `TTFB alto: ${entry.name}`, 'warning');
    }
  }

  /**
   * Monitoramento de acessibilidade
   */
  startAccessibilityMonitoring() {
    // Verificar periodicamente
    setInterval(() => {
      this.runAccessibilityChecks();
    }, 30000); // A cada 30 segundos

    // Verificar em mudanças do DOM
    const observer = new MutationObserver(() => {
      clearTimeout(this.accessibilityTimeout);
      this.accessibilityTimeout = setTimeout(() => {
        this.runAccessibilityChecks();
      }, 1000);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Executar verificações de acessibilidade
   */
  runAccessibilityChecks() {
    this.checkImageAltText();
    this.checkColorContrast();
    this.checkKeyboardNavigation();
    this.checkAriaLabels();
    this.checkHeadingStructure();
  }

  /**
   * Verificar alt text em imagens
   */
  checkImageAltText() {
    const images = document.querySelectorAll('img');
    let violations = 0;

    images.forEach(img => {
      if (!img.alt || img.alt.trim() === '') {
        violations++;
        this.recordViolation('accessibility', 'missing-alt-text', `Imagem sem alt text: ${img.src}`, 'error');
      }
    });

    return violations === 0;
  }

  /**
   * Verificar contraste de cores
   */
  checkColorContrast() {
    const elements = document.querySelectorAll('*');
    let violations = 0;

    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;

      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrast(color, backgroundColor);
        if (contrast < this.thresholds.accessibility.minContrast) {
          violations++;
          this.recordViolation('accessibility', 'low-contrast', `Contraste baixo: ${contrast.toFixed(2)}`, 'warning');
        }
      }
    });

    return violations === 0;
  }

  /**
   * Calcular contraste entre cores
   */
  calculateContrast(color1, color2) {
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    if (!rgb1 || !rgb2) return 21; // Assumir contraste máximo se não conseguir calcular

    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Parsear cor
   */
  parseColor(color) {
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    const computed = window.getComputedStyle(div).color;
    document.body.removeChild(div);

    const match = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
  }

  /**
   * Calcular luminância
   */
  getLuminance([r, g, b]) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Verificar navegação por teclado
   */
  checkKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    let violations = 0;

    focusableElements.forEach(element => {
      const tabIndex = parseInt(element.tabIndex);
      if (tabIndex > this.thresholds.accessibility.maxTabIndex) {
        violations++;
        this.recordViolation('accessibility', 'high-tabindex', `TabIndex muito alto: ${tabIndex}`, 'warning');
      }
    });

    return violations === 0;
  }

  /**
   * Verificar labels ARIA
   */
  checkAriaLabels() {
    const interactiveElements = document.querySelectorAll('button, input, select, textarea');
    let violations = 0;

    interactiveElements.forEach(element => {
      const hasLabel = element.labels?.length > 0 || 
                      element.getAttribute('aria-label') || 
                      element.getAttribute('aria-labelledby');
      
      if (!hasLabel && element.type !== 'hidden') {
        violations++;
        this.recordViolation('accessibility', 'missing-label', `Elemento sem label: ${element.tagName}`, 'error');
      }
    });

    return violations === 0;
  }

  /**
   * Verificar estrutura de headings
   */
  checkHeadingStructure() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let violations = 0;
    let previousLevel = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (level > previousLevel + 1) {
        violations++;
        this.recordViolation('accessibility', 'heading-skip', `Heading pulou nível: ${heading.tagName}`, 'warning');
      }
      
      previousLevel = level;
    });

    return violations === 0;
  }

  /**
   * Monitoramento de segurança
   */
  startSecurityMonitoring() {
    this.checkSecurityHeaders();
    this.checkExternalLinks();
    this.checkFormSecurity();
  }

  /**
   * Verificar headers de segurança
   */
  checkSecurityHeaders() {
    // Esta verificação seria mais efetiva no servidor
    // Aqui fazemos verificações básicas do lado cliente
    
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      this.recordViolation('security', 'no-https', 'Site não está usando HTTPS', 'error');
    }
  }

  /**
   * Verificar links externos
   */
  checkExternalLinks() {
    const externalLinks = document.querySelectorAll(`a[href^="http"]:not([href*="${location.hostname}"])`);
    let violations = 0;

    externalLinks.forEach(link => {
      const rel = link.getAttribute('rel') || '';
      if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
        violations++;
        this.recordViolation('security', 'unsafe-external-link', `Link externo inseguro: ${link.href}`, 'warning');
      }
    });

    return violations === 0;
  }

  /**
   * Verificar segurança de formulários
   */
  checkFormSecurity() {
    const forms = document.querySelectorAll('form');
    let violations = 0;

    forms.forEach(form => {
      // Verificar se formulários de senha usam HTTPS
      const passwordInputs = form.querySelectorAll('input[type="password"]');
      if (passwordInputs.length > 0 && location.protocol !== 'https:') {
        violations++;
        this.recordViolation('security', 'password-over-http', 'Formulário de senha sobre HTTP', 'error');
      }
    });

    return violations === 0;
  }

  /**
   * Análise de qualidade de código
   */
  startCodeQualityAnalysis() {
    this.analyzeJavaScriptErrors();
    this.analyzeCSSUsage();
    this.analyzeHTMLStructure();
  }

  /**
   * Analisar erros JavaScript
   */
  analyzeJavaScriptErrors() {
    window.addEventListener('error', (event) => {
      this.recordViolation('code-quality', 'javascript-error', event.message, 'error');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordViolation('code-quality', 'unhandled-promise', event.reason, 'error');
    });
  }

  /**
   * Analisar uso de CSS
   */
  analyzeCSSUsage() {
    // Verificar CSS não utilizado (implementação básica)
    const stylesheets = document.querySelectorAll('style, link[rel="stylesheet"]');
    // Esta análise seria mais complexa em uma implementação real
  }

  /**
   * Analisar estrutura HTML
   */
  analyzeHTMLStructure() {
    // Verificar elementos obsoletos
    const deprecatedElements = document.querySelectorAll('center, font, marquee');
    if (deprecatedElements.length > 0) {
      this.recordViolation('code-quality', 'deprecated-html', `${deprecatedElements.length} elementos obsoletos encontrados`, 'warning');
    }

    // Verificar IDs duplicados
    const ids = new Set();
    const duplicateIds = new Set();
    document.querySelectorAll('[id]').forEach(element => {
      if (ids.has(element.id)) {
        duplicateIds.add(element.id);
      }
      ids.add(element.id);
    });

    if (duplicateIds.size > 0) {
      this.recordViolation('code-quality', 'duplicate-ids', `IDs duplicados: ${Array.from(duplicateIds).join(', ')}`, 'error');
    }
  }

  /**
   * Registrar violação
   */
  recordViolation(category, rule, message, severity) {
    const violation = {
      category,
      rule,
      message,
      severity,
      timestamp: Date.now(),
      url: location.href
    };

    this.violations.push(violation);
    
    if (severity === 'error') {
      console.error(`[QualityMonitoring] ${category}:${rule} - ${message}`);
    } else {
      console.warn(`[QualityMonitoring] ${category}:${rule} - ${message}`);
    }
  }

  /**
   * Agendar relatórios de qualidade
   */
  scheduleQualityReports() {
    // Relatório a cada 10 minutos
    setInterval(() => {
      this.generateQualityReport();
    }, 600000);

    // Relatório ao sair da página
    window.addEventListener('beforeunload', () => {
      this.generateQualityReport();
    });
  }

  /**
   * Gerar relatório de qualidade
   */
  generateQualityReport() {
    const report = {
      timestamp: Date.now(),
      url: location.href,
      metrics: {
        performance: Object.fromEntries(this.metrics.performance),
        violations: this.violations.length,
        errors: this.violations.filter(v => v.severity === 'error').length,
        warnings: this.violations.filter(v => v.severity === 'warning').length
      },
      violations: this.violations.slice(-50), // Últimas 50 violações
      summary: this.generateQualitySummary()
    };

    console.log('[QualityMonitoring] Relatório gerado:', report);
    
    // Integrar com analytics se disponível
    if (window.analyticsService) {
      window.analyticsService.track('quality_report', report);
    }

    return report;
  }

  /**
   * Gerar resumo de qualidade
   */
  generateQualitySummary() {
    const categories = {};
    this.violations.forEach(violation => {
      if (!categories[violation.category]) {
        categories[violation.category] = { errors: 0, warnings: 0 };
      }
      categories[violation.category][violation.severity === 'error' ? 'errors' : 'warnings']++;
    });

    const score = this.calculateQualityScore();

    return {
      score,
      grade: this.getQualityGrade(score),
      categories,
      totalViolations: this.violations.length
    };
  }

  /**
   * Calcular pontuação de qualidade
   */
  calculateQualityScore() {
    let score = 100;
    
    this.violations.forEach(violation => {
      if (violation.severity === 'error') {
        score -= 5;
      } else {
        score -= 2;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Obter nota de qualidade
   */
  getQualityGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Log dos resultados de qualidade
   */
  logQualityResults(results) {
    const { passed, failed, warnings } = results;
    const total = passed + failed + warnings;
    
    console.group('[QualityMonitoring] Resultados da Verificação');
    console.log(`✅ Passou: ${passed}/${total}`);
    console.log(`❌ Falhou: ${failed}/${total}`);
    console.log(`⚠️ Avisos: ${warnings}/${total}`);
    
    if (results.violations.length > 0) {
      console.log('Violações encontradas:');
      results.violations.forEach(violation => {
        const icon = violation.severity === 'error' ? '❌' : '⚠️';
        console.log(`${icon} [${violation.category}] ${violation.message}`);
      });
    }
    
    console.groupEnd();
  }

  /**
   * Formatar bytes
   */
  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Exportar relatório de qualidade
   */
  exportQualityReport() {
    const report = this.generateQualityReport();
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quality_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Limpar dados de qualidade
   */
  clearQualityData() {
    this.violations = [];
    this.metrics.performance.clear();
    
    console.log('[QualityMonitoring] Dados de qualidade limpos');
  }
}

// Instância singleton
const qualityMonitoringService = new QualityMonitoringService();

export default qualityMonitoringService;
