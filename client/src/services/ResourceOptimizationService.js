/**
 * Serviço de Otimização de Recursos
 * Lazy loading, compressão de imagens, minificação e otimizações automáticas
 */
class ResourceOptimizationService {
  constructor() {
    this.isEnabled = true;
    this.imageCache = new Map();
    this.lazyImages = new Set();
    this.observers = new Map();
    this.compressionRatio = 0.8;
    this.webpSupported = null;
    this.intersectionObserver = null;
    
    if (this.isEnabled) {
      this.init();
    }
  }

  /**
   * Inicializar serviço
   */
  init() {
    this.detectWebPSupport();
    this.setupIntersectionObserver();
    this.setupImageOptimization();
    this.setupFontOptimization();
    this.setupScriptOptimization();
    this.preloadCriticalResources();
    
    console.log('[ResourceOptimization] Serviço inicializado');
  }

  /**
   * Detectar suporte WebP
   */
  detectWebPSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    this.webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Configurar Intersection Observer
   */
  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadLazyImage(entry.target);
              this.intersectionObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '50px' }
      );
    }
  }

  /**
   * Otimizar imagem
   */
  async optimizeImage(src, options = {}) {
    const {
      width,
      height,
      quality = this.compressionRatio,
      format = 'auto'
    } = options;

    if (this.imageCache.has(src)) {
      return this.imageCache.get(src);
    }

    try {
      const optimizedSrc = await this.processImage(src, {
        width,
        height,
        quality,
        format
      });
      
      this.imageCache.set(src, optimizedSrc);
      return optimizedSrc;
    } catch (error) {
      console.warn('[ResourceOptimization] Erro ao otimizar imagem:', error);
      return src;
    }
  }

  /**
   * Processar imagem
   */
  async processImage(src, options) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calcular dimensões
        const { width: targetWidth, height: targetHeight } = this.calculateDimensions(
          img.width, 
          img.height, 
          options.width, 
          options.height
        );
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Converter para formato otimizado
        const format = this.getOptimalFormat(options.format);
        const optimizedDataUrl = canvas.toDataURL(format, options.quality);
        
        resolve(optimizedDataUrl);
      };
      
      img.onerror = () => resolve(src);
      img.src = src;
    });
  }

  /**
   * Calcular dimensões otimizadas
   */
  calculateDimensions(originalWidth, originalHeight, targetWidth, targetHeight) {
    if (!targetWidth && !targetHeight) {
      return { width: originalWidth, height: originalHeight };
    }
    
    const aspectRatio = originalWidth / originalHeight;
    
    if (targetWidth && !targetHeight) {
      return { width: targetWidth, height: targetWidth / aspectRatio };
    }
    
    if (!targetWidth && targetHeight) {
      return { width: targetHeight * aspectRatio, height: targetHeight };
    }
    
    return { width: targetWidth, height: targetHeight };
  }

  /**
   * Obter formato otimizado
   */
  getOptimalFormat(requestedFormat) {
    if (requestedFormat === 'auto') {
      return this.webpSupported ? 'image/webp' : 'image/jpeg';
    }
    return requestedFormat;
  }

  /**
   * Configurar lazy loading de imagens
   */
  setupImageOptimization() {
    // Observar imagens existentes
    this.observeExistingImages();
    
    // Observar novas imagens
    this.observeNewImages();
  }

  /**
   * Observar imagens existentes
   */
  observeExistingImages() {
    const images = document.querySelectorAll('img[data-lazy], img[loading="lazy"]');
    images.forEach(img => this.observeImage(img));
  }

  /**
   * Observar novas imagens
   */
  observeNewImages() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const images = node.querySelectorAll ? 
              node.querySelectorAll('img[data-lazy], img[loading="lazy"]') : 
              [];
            images.forEach(img => this.observeImage(img));
            
            if (node.tagName === 'IMG' && (node.hasAttribute('data-lazy') || node.loading === 'lazy')) {
              this.observeImage(node);
            }
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Observar imagem específica
   */
  observeImage(img) {
    if (this.lazyImages.has(img) || !this.intersectionObserver) return;
    
    this.lazyImages.add(img);
    this.intersectionObserver.observe(img);
  }

  /**
   * Carregar imagem lazy
   */
  async loadLazyImage(img) {
    const src = img.dataset.src || img.dataset.lazy;
    if (!src) return;

    // Mostrar placeholder enquanto carrega
    this.showImagePlaceholder(img);
    
    try {
      // Otimizar imagem se necessário
      const optimizedSrc = await this.optimizeImage(src, {
        width: img.dataset.width,
        height: img.dataset.height,
        quality: img.dataset.quality
      });
      
      // Preload da imagem
      await this.preloadImage(optimizedSrc);
      
      // Aplicar imagem com fade-in
      this.applyImageWithTransition(img, optimizedSrc);
      
    } catch (error) {
      console.error('[ResourceOptimization] Erro ao carregar imagem lazy:', error);
      img.src = src; // Fallback
    }
    
    this.lazyImages.delete(img);
  }

  /**
   * Mostrar placeholder da imagem
   */
  showImagePlaceholder(img) {
    if (!img.src && !img.style.backgroundColor) {
      img.style.backgroundColor = '#f0f0f0';
      img.style.backgroundImage = 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.5) 25%, rgba(255,255,255,0.5) 75%, transparent 75%)';
      img.style.backgroundSize = '20px 20px';
      img.style.animation = 'shimmer 1.5s infinite linear';
    }
  }

  /**
   * Preload de imagem
   */
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Aplicar imagem com transição
   */
  applyImageWithTransition(img, src) {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    
    img.onload = () => {
      img.style.opacity = '1';
      img.style.backgroundColor = '';
      img.style.backgroundImage = '';
      img.style.animation = '';
    };
    
    img.src = src;
  }

  /**
   * Otimização de fontes
   */
  setupFontOptimization() {
    // Preload de fontes críticas
    this.preloadFonts([
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
    ]);
    
    // Font display swap
    this.optimizeFontDisplay();
  }

  /**
   * Preload de fontes
   */
  preloadFonts(fontUrls) {
    fontUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = url;
      document.head.appendChild(link);
      
      // Carregar stylesheet após preload
      setTimeout(() => {
        const stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = url;
        document.head.appendChild(stylesheet);
      }, 100);
    });
  }

  /**
   * Otimizar display de fontes
   */
  optimizeFontDisplay() {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Otimização de scripts
   */
  setupScriptOptimization() {
    this.deferNonCriticalScripts();
    this.loadScriptsOnInteraction();
  }

  /**
   * Defer scripts não críticos
   */
  deferNonCriticalScripts() {
    const scripts = document.querySelectorAll('script[data-defer]');
    scripts.forEach(script => {
      if (!script.defer && !script.async) {
        script.defer = true;
      }
    });
  }

  /**
   * Carregar scripts na interação
   */
  loadScriptsOnInteraction() {
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    const scriptsToLoad = document.querySelectorAll('script[data-on-interaction]');
    
    if (scriptsToLoad.length === 0) return;
    
    const loadScripts = () => {
      scriptsToLoad.forEach(script => {
        const newScript = document.createElement('script');
        newScript.src = script.dataset.src || script.src;
        newScript.async = true;
        document.head.appendChild(newScript);
      });
      
      // Remover listeners após carregar
      interactionEvents.forEach(event => {
        document.removeEventListener(event, loadScripts);
      });
    };
    
    interactionEvents.forEach(event => {
      document.addEventListener(event, loadScripts, { once: true, passive: true });
    });
  }

  /**
   * Preload de recursos críticos
   */
  preloadCriticalResources() {
    const criticalResources = [
      { href: '/icons/icon-192x192.png', as: 'image' },
      { href: '/manifest.json', as: 'fetch', crossorigin: 'anonymous' }
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
      document.head.appendChild(link);
    });
  }

  /**
   * Comprimir CSS
   */
  compressCSS(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários
      .replace(/\s+/g, ' ') // Remove espaços extras
      .replace(/;\s*}/g, '}') // Remove ; antes de }
      .replace(/\s*{\s*/g, '{') // Remove espaços ao redor de {
      .replace(/}\s*/g, '}') // Remove espaços após }
      .replace(/:\s*/g, ':') // Remove espaços após :
      .replace(/;\s*/g, ';') // Remove espaços após ;
      .trim();
  }

  /**
   * Comprimir JavaScript
   */
  compressJS(js) {
    return js
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários de bloco
      .replace(/\/\/.*$/gm, '') // Remove comentários de linha
      .replace(/\s+/g, ' ') // Remove espaços extras
      .replace(/;\s*}/g, '}') // Remove ; desnecessários
      .trim();
  }

  /**
   * Otimizar recursos automaticamente
   */
  async optimizePageResources() {
    // Otimizar imagens
    const images = document.querySelectorAll('img:not([data-optimized])');
    for (const img of images) {
      if (img.src && !img.src.startsWith('data:')) {
        try {
          const optimizedSrc = await this.optimizeImage(img.src);
          if (optimizedSrc !== img.src) {
            img.src = optimizedSrc;
            img.dataset.optimized = 'true';
          }
        } catch (error) {
          console.warn('[ResourceOptimization] Erro ao otimizar:', img.src, error);
        }
      }
    }
    
    // Otimizar CSS inline
    const styles = document.querySelectorAll('style:not([data-optimized])');
    styles.forEach(style => {
      style.textContent = this.compressCSS(style.textContent);
      style.dataset.optimized = 'true';
    });
  }

  /**
   * Monitorar performance de recursos
   */
  monitorResourcePerformance() {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.duration > 1000) { // Recursos lentos (>1s)
          console.warn('[ResourceOptimization] Recurso lento detectado:', {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Obter estatísticas de otimização
   */
  getOptimizationStats() {
    return {
      imagesOptimized: this.imageCache.size,
      lazyImagesLoaded: this.lazyImages.size,
      webpSupported: this.webpSupported,
      cacheSize: this.imageCache.size,
      memoryUsage: this.calculateCacheMemoryUsage()
    };
  }

  /**
   * Calcular uso de memória do cache
   */
  calculateCacheMemoryUsage() {
    let totalSize = 0;
    this.imageCache.forEach(src => {
      if (src.startsWith('data:')) {
        totalSize += src.length;
      }
    });
    return totalSize;
  }

  /**
   * Limpar cache de imagens
   */
  clearImageCache() {
    this.imageCache.clear();
    console.log('[ResourceOptimization] Cache de imagens limpo');
  }

  /**
   * Exportar configurações de otimização
   */
  exportOptimizationConfig() {
    const config = {
      compressionRatio: this.compressionRatio,
      webpSupported: this.webpSupported,
      stats: this.getOptimizationStats(),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimization_config_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Instância singleton
const resourceOptimizationService = new ResourceOptimizationService();

export default resourceOptimizationService;
