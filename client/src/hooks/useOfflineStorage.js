import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar armazenamento offline usando IndexedDB
 * Permite sincronização de dados quando a conexão for restaurada
 */
export const useOfflineStorage = (dbName = 'BarberShopDB', version = 1) => {
  const [db, setDb] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Inicializar IndexedDB
  const initDB = useCallback(() => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);

      request.onerror = () => {
        const error = new Error('Erro ao abrir IndexedDB');
        setError(error);
        reject(error);
      };

      request.onsuccess = (event) => {
        const database = event.target.result;
        setDb(database);
        setIsReady(true);
        setError(null);
        resolve(database);
      };

      request.onupgradeneeded = (event) => {
        const database = event.target.result;

        // Criar object stores se não existirem
        const stores = [
          'appointments',
          'barbers',
          'services',
          'users',
          'pendingSync',
          'cache'
        ];

        stores.forEach(storeName => {
          if (!database.objectStoreNames.contains(storeName)) {
            const store = database.createObjectStore(storeName, { 
              keyPath: 'id', 
              autoIncrement: true 
            });
            
            // Adicionar índices conforme necessário
            if (storeName === 'appointments') {
              store.createIndex('userId', 'userId', { unique: false });
              store.createIndex('barberId', 'barberId', { unique: false });
              store.createIndex('date', 'date', { unique: false });
              store.createIndex('status', 'status', { unique: false });
            }
            
            if (storeName === 'pendingSync') {
              store.createIndex('timestamp', 'timestamp', { unique: false });
              store.createIndex('type', 'type', { unique: false });
            }
            
            if (storeName === 'cache') {
              store.createIndex('key', 'key', { unique: true });
              store.createIndex('expiry', 'expiry', { unique: false });
            }
          }
        });
      };
    });
  }, [dbName, version]);

  // Salvar dados
  const saveData = useCallback(async (storeName, data) => {
    if (!db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Adicionar timestamp
      const dataWithTimestamp = {
        ...data,
        updatedAt: new Date().toISOString(),
        synced: navigator.onLine
      };
      
      const request = store.put(dataWithTimestamp);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Buscar dados
  const getData = useCallback(async (storeName, id = null) => {
    if (!db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = id ? store.get(id) : store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Deletar dados
  const deleteData = useCallback(async (storeName, id) => {
    if (!db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Buscar por índice
  const getByIndex = useCallback(async (storeName, indexName, value) => {
    if (!db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      
      const request = index.getAll(value);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Adicionar à fila de sincronização
  const addToSyncQueue = useCallback(async (type, data, method = 'POST', url = '') => {
    const syncItem = {
      type,
      data,
      method,
      url,
      timestamp: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3
    };

    return saveData('pendingSync', syncItem);
  }, [saveData]);

  // Processar fila de sincronização
  const processSyncQueue = useCallback(async () => {
    if (!navigator.onLine) return;

    try {
      const pendingItems = await getData('pendingSync');
      
      for (const item of pendingItems) {
        if (item.attempts >= item.maxAttempts) {
          await deleteData('pendingSync', item.id);
          continue;
        }

        try {
          const response = await fetch(item.url, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(item.data)
          });

          if (response.ok) {
            // Sucesso - remover da fila
            await deleteData('pendingSync', item.id);
            
            // Atualizar dados locais se necessário
            if (item.type === 'appointment') {
              const responseData = await response.json();
              await saveData('appointments', { ...item.data, ...responseData, synced: true });
            }
          } else {
            // Erro - incrementar tentativas
            await saveData('pendingSync', { ...item, attempts: item.attempts + 1 });
          }
        } catch (error) {
          console.error('Erro ao sincronizar item:', error);
          await saveData('pendingSync', { ...item, attempts: item.attempts + 1 });
        }
      }
    } catch (error) {
      console.error('Erro ao processar fila de sincronização:', error);
    }
  }, [getData, deleteData, saveData]);

  // Cache com expiração
  const setCache = useCallback(async (key, data, ttl = 3600000) => { // TTL padrão: 1 hora
    const cacheItem = {
      key,
      data,
      expiry: Date.now() + ttl,
      createdAt: new Date().toISOString()
    };

    return saveData('cache', cacheItem);
  }, [saveData]);

  // Buscar do cache
  const getCache = useCallback(async (key) => {
    try {
      const cacheItems = await getByIndex('cache', 'key', key);
      
      if (cacheItems.length === 0) return null;
      
      const item = cacheItems[0];
      
      // Verificar se expirou
      if (Date.now() > item.expiry) {
        await deleteData('cache', item.id);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error('Erro ao buscar cache:', error);
      return null;
    }
  }, [getByIndex, deleteData]);

  // Limpar cache expirado
  const clearExpiredCache = useCallback(async () => {
    try {
      const allCache = await getData('cache');
      const now = Date.now();
      
      for (const item of allCache) {
        if (now > item.expiry) {
          await deleteData('cache', item.id);
        }
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }, [getData, deleteData]);

  // Obter estatísticas de armazenamento
  const getStorageStats = useCallback(async () => {
    if (!db) return null;

    try {
      const stats = {};
      const storeNames = ['appointments', 'barbers', 'services', 'users', 'pendingSync', 'cache'];
      
      for (const storeName of storeNames) {
        const data = await getData(storeName);
        stats[storeName] = Array.isArray(data) ? data.length : 0;
      }
      
      // Calcular tamanho aproximado
      const totalItems = Object.values(stats).reduce((sum, count) => sum + count, 0);
      
      return {
        ...stats,
        totalItems,
        isOnline: navigator.onLine,
        lastSync: localStorage.getItem('lastSync') || 'Nunca'
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return null;
    }
  }, [db, getData]);

  // Limpar todos os dados
  const clearAllData = useCallback(async () => {
    if (!db) return;

    const storeNames = ['appointments', 'barbers', 'services', 'users', 'pendingSync', 'cache'];
    
    for (const storeName of storeNames) {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
  }, [db]);

  // Inicializar quando o componente montar
  useEffect(() => {
    initDB().catch(console.error);
  }, [initDB]);

  // Processar fila quando voltar online
  useEffect(() => {
    const handleOnline = () => {
      processSyncQueue();
      localStorage.setItem('lastSync', new Date().toISOString());
    };

    window.addEventListener('online', handleOnline);
    
    // Processar fila se já estiver online
    if (navigator.onLine && isReady) {
      processSyncQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [processSyncQueue, isReady]);

  // Limpar cache expirado periodicamente
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(() => {
      clearExpiredCache();
    }, 300000); // A cada 5 minutos

    return () => clearInterval(interval);
  }, [isReady, clearExpiredCache]);

  return {
    // Estados
    isReady,
    error,
    
    // Operações básicas
    saveData,
    getData,
    deleteData,
    getByIndex,
    
    // Sincronização
    addToSyncQueue,
    processSyncQueue,
    
    // Cache
    setCache,
    getCache,
    clearExpiredCache,
    
    // Utilitários
    getStorageStats,
    clearAllData,
    
    // Verificações
    isSupported: 'indexedDB' in window
  };
};

export default useOfflineStorage;
