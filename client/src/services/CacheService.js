/**
 * Serviço de Cache Inteligente
 * Sistema avançado de cache com estratégias diferenciadas e otimização automática
 */
class CacheService {
  constructor() {
    this.isEnabled = true;
    this.caches = new Map();
    this.strategies = {
      MEMORY: 'memory',
      LOCAL_STORAGE: 'localStorage',
      SESSION_STORAGE: 'sessionStorage',
      INDEXED_DB: 'indexedDB'
    };
    this.defaultTTL = 300000; // 5 minutos
    this.maxMemorySize = 50 * 1024 * 1024; // 50MB
    this.currentMemoryUsage = 0;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
    
    if (this.isEnabled) {
      this.init();
    }
  }

  /**
   * Inicializar serviço de cache
   */
  init() {
    this.setupMemoryCache();
    this.setupStorageCache();
    this.setupIndexedDBCache();
    this.startCleanupInterval();
    this.monitorMemoryUsage();
    
    console.log('[Cache] Serviço inicializado');
  }

  /**
   * Configurar cache em memória
   */
  setupMemoryCache() {
    this.memoryCache = new Map();
    this.memoryMetadata = new Map();
  }

  /**
   * Configurar cache de storage
   */
  setupStorageCache() {
    this.storagePrefix = 'barbershop_cache_';
    this.cleanExpiredStorageItems();
  }

  /**
   * Configurar cache IndexedDB
   */
  async setupIndexedDBCache() {
    if (!('indexedDB' in window)) return;

    try {
      this.db = await this.openIndexedDB();
    } catch (error) {
      console.warn('[Cache] IndexedDB não disponível:', error);
    }
  }

  /**
   * Abrir IndexedDB
   */
  openIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BarberShopCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('expiry', 'expiry', { unique: false });
          store.createIndex('strategy', 'strategy', { unique: false });
        }
      };
    });
  }

  /**
   * Definir item no cache
   */
  async set(key, value, options = {}) {
    const {
      ttl = this.defaultTTL,
      strategy = this.strategies.MEMORY,
      priority = 'normal',
      compress = false,
      tags = []
    } = options;

    const expiry = Date.now() + ttl;
    const metadata = {
      key,
      expiry,
      strategy,
      priority,
      size: this.calculateSize(value),
      tags,
      createdAt: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now()
    };

    let processedValue = value;
    if (compress && typeof value === 'string') {
      processedValue = this.compress(value);
      metadata.compressed = true;
    }

    try {
      switch (strategy) {
        case this.strategies.MEMORY:
          await this.setMemoryCache(key, processedValue, metadata);
          break;
        case this.strategies.LOCAL_STORAGE:
          await this.setStorageCache(key, processedValue, metadata, localStorage);
          break;
        case this.strategies.SESSION_STORAGE:
          await this.setStorageCache(key, processedValue, metadata, sessionStorage);
          break;
        case this.strategies.INDEXED_DB:
          await this.setIndexedDBCache(key, processedValue, metadata);
          break;
        default:
          await this.setMemoryCache(key, processedValue, metadata);
      }

      this.stats.sets++;
      console.log(`[Cache] Set: ${key} (${strategy}, ${this.formatSize(metadata.size)})`);
      
      return true;
    } catch (error) {
      console.error('[Cache] Erro ao definir cache:', error);
      return false;
    }
  }

  /**
   * Obter item do cache
   */
  async get(key, options = {}) {
    const { strategy, fallbackStrategies = [] } = options;
    
    // Tentar estratégia específica primeiro
    if (strategy) {
      const result = await this.getFromStrategy(key, strategy);
      if (result !== null) {
        this.updateAccessMetadata(key, strategy);
        this.stats.hits++;
        return result;
      }
    }

    // Tentar todas as estratégias
    const strategies = [
      this.strategies.MEMORY,
      this.strategies.SESSION_STORAGE,
      this.strategies.LOCAL_STORAGE,
      this.strategies.INDEXED_DB,
      ...fallbackStrategies
    ];

    for (const strat of strategies) {
      const result = await this.getFromStrategy(key, strat);
      if (result !== null) {
        this.updateAccessMetadata(key, strat);
        this.stats.hits++;
        return result;
      }
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Obter de estratégia específica
   */
  async getFromStrategy(key, strategy) {
    try {
      switch (strategy) {
        case this.strategies.MEMORY:
          return this.getMemoryCache(key);
        case this.strategies.LOCAL_STORAGE:
          return this.getStorageCache(key, localStorage);
        case this.strategies.SESSION_STORAGE:
          return this.getStorageCache(key, sessionStorage);
        case this.strategies.INDEXED_DB:
          return await this.getIndexedDBCache(key);
        default:
          return null;
      }
    } catch (error) {
      console.error(`[Cache] Erro ao obter de ${strategy}:`, error);
      return null;
    }
  }

  /**
   * Cache em memória - Set
   */
  async setMemoryCache(key, value, metadata) {
    // Verificar limite de memória
    if (this.currentMemoryUsage + metadata.size > this.maxMemorySize) {
      await this.evictMemoryCache(metadata.size);
    }

    this.memoryCache.set(key, value);
    this.memoryMetadata.set(key, metadata);
    this.currentMemoryUsage += metadata.size;
  }

  /**
   * Cache em memória - Get
   */
  getMemoryCache(key) {
    const metadata = this.memoryMetadata.get(key);
    if (!metadata || Date.now() > metadata.expiry) {
      this.deleteMemoryCache(key);
      return null;
    }

    return this.memoryCache.get(key);
  }

  /**
   * Cache em storage - Set
   */
  async setStorageCache(key, value, metadata, storage) {
    const cacheKey = this.storagePrefix + key;
    const cacheData = {
      value: metadata.compressed ? value : JSON.stringify(value),
      metadata
    };

    try {
      storage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        await this.evictStorageCache(storage);
        storage.setItem(cacheKey, JSON.stringify(cacheData));
      } else {
        throw error;
      }
    }
  }

  /**
   * Cache em storage - Get
   */
  getStorageCache(key, storage) {
    const cacheKey = this.storagePrefix + key;
    const cached = storage.getItem(cacheKey);
    
    if (!cached) return null;

    try {
      const { value, metadata } = JSON.parse(cached);
      
      if (Date.now() > metadata.expiry) {
        storage.removeItem(cacheKey);
        return null;
      }

      return metadata.compressed 
        ? this.decompress(value)
        : JSON.parse(value);
    } catch (error) {
      storage.removeItem(cacheKey);
      return null;
    }
  }

  /**
   * Cache IndexedDB - Set
   */
  async setIndexedDBCache(key, value, metadata) {
    if (!this.db) return;

    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    const cacheData = {
      key,
      value: JSON.stringify(value),
      metadata
    };

    await new Promise((resolve, reject) => {
      const request = store.put(cacheData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cache IndexedDB - Get
   */
  async getIndexedDBCache(key) {
    if (!this.db) return null;

    const transaction = this.db.transaction(['cache'], 'readonly');
    const store = transaction.objectStore('cache');

    return new Promise((resolve) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (!result || Date.now() > result.metadata.expiry) {
          if (result) this.deleteIndexedDBCache(key);
          resolve(null);
          return;
        }

        try {
          resolve(JSON.parse(result.value));
        } catch (error) {
          this.deleteIndexedDBCache(key);
          resolve(null);
        }
      };
      
      request.onerror = () => resolve(null);
    });
  }

  /**
   * Deletar item do cache
   */
  async delete(key, strategy = null) {
    if (strategy) {
      await this.deleteFromStrategy(key, strategy);
    } else {
      // Deletar de todas as estratégias
      await Promise.all([
        this.deleteMemoryCache(key),
        this.deleteStorageCache(key, localStorage),
        this.deleteStorageCache(key, sessionStorage),
        this.deleteIndexedDBCache(key)
      ]);
    }

    this.stats.deletes++;
  }

  /**
   * Deletar de estratégia específica
   */
  async deleteFromStrategy(key, strategy) {
    switch (strategy) {
      case this.strategies.MEMORY:
        this.deleteMemoryCache(key);
        break;
      case this.strategies.LOCAL_STORAGE:
        this.deleteStorageCache(key, localStorage);
        break;
      case this.strategies.SESSION_STORAGE:
        this.deleteStorageCache(key, sessionStorage);
        break;
      case this.strategies.INDEXED_DB:
        await this.deleteIndexedDBCache(key);
        break;
    }
  }

  /**
   * Deletar cache em memória
   */
  deleteMemoryCache(key) {
    const metadata = this.memoryMetadata.get(key);
    if (metadata) {
      this.currentMemoryUsage -= metadata.size;
    }
    
    this.memoryCache.delete(key);
    this.memoryMetadata.delete(key);
  }

  /**
   * Deletar cache em storage
   */
  deleteStorageCache(key, storage) {
    const cacheKey = this.storagePrefix + key;
    storage.removeItem(cacheKey);
  }

  /**
   * Deletar cache IndexedDB
   */
  async deleteIndexedDBCache(key) {
    if (!this.db) return;

    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    await new Promise((resolve) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  }

  /**
   * Limpar cache por tags
   */
  async clearByTags(tags) {
    const keysToDelete = [];

    // Memory cache
    for (const [key, metadata] of this.memoryMetadata) {
      if (metadata.tags.some(tag => tags.includes(tag))) {
        keysToDelete.push({ key, strategy: this.strategies.MEMORY });
      }
    }

    // Storage caches
    [localStorage, sessionStorage].forEach(storage => {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(this.storagePrefix)) {
          try {
            const cached = JSON.parse(storage.getItem(key));
            if (cached.metadata?.tags?.some(tag => tags.includes(tag))) {
              const originalKey = key.replace(this.storagePrefix, '');
              keysToDelete.push({ 
                key: originalKey, 
                strategy: storage === localStorage ? this.strategies.LOCAL_STORAGE : this.strategies.SESSION_STORAGE 
              });
            }
          } catch (error) {
            // Remover item corrompido
            storage.removeItem(key);
          }
        }
      }
    });

    // Deletar todos os itens encontrados
    await Promise.all(
      keysToDelete.map(({ key, strategy }) => this.deleteFromStrategy(key, strategy))
    );

    console.log(`[Cache] Limpos ${keysToDelete.length} itens por tags:`, tags);
  }

  /**
   * Limpar cache expirado
   */
  async clearExpired() {
    const now = Date.now();
    let expiredCount = 0;

    // Memory cache
    for (const [key, metadata] of this.memoryMetadata) {
      if (now > metadata.expiry) {
        this.deleteMemoryCache(key);
        expiredCount++;
      }
    }

    // Storage caches
    [localStorage, sessionStorage].forEach(storage => {
      this.cleanExpiredStorageItems(storage);
    });

    // IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expiry');
      const range = IDBKeyRange.upperBound(now);
      
      await new Promise((resolve) => {
        const request = index.openCursor(range);
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            expiredCount++;
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => resolve();
      });
    }

    if (expiredCount > 0) {
      console.log(`[Cache] Limpos ${expiredCount} itens expirados`);
    }
  }

  /**
   * Limpar itens expirados do storage
   */
  cleanExpiredStorageItems(storage = localStorage) {
    const now = Date.now();
    const keysToRemove = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        try {
          const cached = JSON.parse(storage.getItem(key));
          if (now > cached.metadata?.expiry) {
            keysToRemove.push(key);
          }
        } catch (error) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => storage.removeItem(key));
  }

  /**
   * Evicção de cache em memória (LRU)
   */
  async evictMemoryCache(requiredSpace) {
    const entries = Array.from(this.memoryMetadata.entries())
      .sort((a, b) => {
        // Prioridade: low < normal < high
        const priorityWeight = { low: 1, normal: 2, high: 3 };
        const aPriority = priorityWeight[a[1].priority] || 2;
        const bPriority = priorityWeight[b[1].priority] || 2;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        // Se mesma prioridade, usar LRU
        return a[1].lastAccessed - b[1].lastAccessed;
      });

    let freedSpace = 0;
    for (const [key, metadata] of entries) {
      this.deleteMemoryCache(key);
      freedSpace += metadata.size;
      this.stats.evictions++;
      
      if (freedSpace >= requiredSpace) {
        break;
      }
    }

    console.log(`[Cache] Evictados ${freedSpace} bytes da memória`);
  }

  /**
   * Evicção de cache em storage
   */
  async evictStorageCache(storage) {
    const items = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        try {
          const cached = JSON.parse(storage.getItem(key));
          items.push({ key, metadata: cached.metadata });
        } catch (error) {
          storage.removeItem(key);
        }
      }
    }

    // Ordenar por prioridade e último acesso
    items.sort((a, b) => {
      const priorityWeight = { low: 1, normal: 2, high: 3 };
      const aPriority = priorityWeight[a.metadata?.priority] || 2;
      const bPriority = priorityWeight[b.metadata?.priority] || 2;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return (a.metadata?.lastAccessed || 0) - (b.metadata?.lastAccessed || 0);
    });

    // Remover 25% dos itens
    const toRemove = Math.ceil(items.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      storage.removeItem(items[i].key);
      this.stats.evictions++;
    }

    console.log(`[Cache] Evictados ${toRemove} itens do storage`);
  }

  /**
   * Atualizar metadados de acesso
   */
  updateAccessMetadata(key, strategy) {
    const now = Date.now();
    
    if (strategy === this.strategies.MEMORY) {
      const metadata = this.memoryMetadata.get(key);
      if (metadata) {
        metadata.lastAccessed = now;
        metadata.accessCount++;
      }
    }
  }

  /**
   * Comprimir string
   */
  compress(str) {
    // Implementação simples de compressão
    // Em produção, usar bibliotecas como pako ou lz-string
    return btoa(str);
  }

  /**
   * Descomprimir string
   */
  decompress(compressed) {
    try {
      return atob(compressed);
    } catch (error) {
      return compressed;
    }
  }

  /**
   * Calcular tamanho do objeto
   */
  calculateSize(obj) {
    const str = JSON.stringify(obj);
    return new Blob([str]).size;
  }

  /**
   * Formatar tamanho
   */
  formatSize(bytes) {
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
   * Iniciar limpeza automática
   */
  startCleanupInterval() {
    // Limpeza a cada 5 minutos
    setInterval(() => {
      this.clearExpired();
    }, 300000);

    // Limpeza ao sair da página
    window.addEventListener('beforeunload', () => {
      this.clearExpired();
    });
  }

  /**
   * Monitorar uso de memória
   */
  monitorMemoryUsage() {
    setInterval(() => {
      const usage = (this.currentMemoryUsage / this.maxMemorySize) * 100;
      if (usage > 80) {
        console.warn(`[Cache] Alto uso de memória: ${usage.toFixed(1)}%`);
        this.evictMemoryCache(this.maxMemorySize * 0.2); // Liberar 20%
      }
    }, 60000); // A cada minuto
  }

  /**
   * Obter estatísticas do cache
   */
  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100 || 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: {
        current: this.currentMemoryUsage,
        max: this.maxMemorySize,
        percentage: (this.currentMemoryUsage / this.maxMemorySize) * 100
      },
      cacheSize: {
        memory: this.memoryCache.size,
        localStorage: this.getStorageSize(localStorage),
        sessionStorage: this.getStorageSize(sessionStorage)
      }
    };
  }

  /**
   * Obter tamanho do storage
   */
  getStorageSize(storage) {
    let count = 0;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Limpar todo o cache
   */
  async clearAll() {
    // Memory
    this.memoryCache.clear();
    this.memoryMetadata.clear();
    this.currentMemoryUsage = 0;

    // Storage
    [localStorage, sessionStorage].forEach(storage => {
      const keysToRemove = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(this.storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => storage.removeItem(key));
    });

    // IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await new Promise((resolve) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    }

    // Reset stats
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };

    console.log('[Cache] Todo cache limpo');
  }

  /**
   * Exportar dados do cache
   */
  async exportCache() {
    const data = {
      memory: Object.fromEntries(this.memoryCache),
      memoryMetadata: Object.fromEntries(this.memoryMetadata),
      stats: this.getStats(),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cache_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Instância singleton
const cacheService = new CacheService();

export default cacheService;
