/**
 * Elite Barber Shop - Storage Service
 * Handles local storage, session storage, and IndexedDB operations
 * @version 2.0.0
 */

class StorageService {
  constructor() {
    this.prefix = 'elitebarber_';
    this.dbName = 'EliteBarberDB';
    this.dbVersion = 1;
    this.db = null;
    
    this.init();
  }

  async init() {
    await this.initIndexedDB();
  }

  /**
   * Initialize IndexedDB for complex data storage
   */
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB failed to open');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('appointments')) {
          const appointmentStore = db.createObjectStore('appointments', { keyPath: 'id' });
          appointmentStore.createIndex('userId', 'userId', { unique: false });
          appointmentStore.createIndex('date', 'date', { unique: false });
          appointmentStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('barbers')) {
          const barberStore = db.createObjectStore('barbers', { keyPath: 'id' });
          barberStore.createIndex('name', 'name', { unique: false });
          barberStore.createIndex('rating', 'rating', { unique: false });
        }

        if (!db.objectStoreNames.contains('services')) {
          const serviceStore = db.createObjectStore('services', { keyPath: 'id' });
          serviceStore.createIndex('category', 'category', { unique: false });
          serviceStore.createIndex('price', 'price', { unique: false });
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('offline_queue')) {
          db.createObjectStore('offline_queue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  // LocalStorage methods with prefix
  setItem(key, value) {
    try {
      const serializedValue = JSON.stringify({
        value,
        timestamp: Date.now(),
        type: typeof value
      });
      localStorage.setItem(this.prefix + key, serializedValue);
      return true;
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
      return false;
    }
  }

  getItem(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      return parsed.value;
    } catch (error) {
      console.error('Failed to get localStorage item:', error);
      return null;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Failed to remove localStorage item:', error);
      return false;
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.prefix)
      );
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  // SessionStorage methods
  setSessionItem(key, value) {
    try {
      const serializedValue = JSON.stringify({
        value,
        timestamp: Date.now()
      });
      sessionStorage.setItem(this.prefix + key, serializedValue);
      return true;
    } catch (error) {
      console.error('Failed to set sessionStorage item:', error);
      return false;
    }
  }

  getSessionItem(key) {
    try {
      const item = sessionStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      return parsed.value;
    } catch (error) {
      console.error('Failed to get sessionStorage item:', error);
      return null;
    }
  }

  removeSessionItem(key) {
    try {
      sessionStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Failed to remove sessionStorage item:', error);
      return false;
    }
  }

  // IndexedDB methods
  async storeData(storeName, data) {
    if (!this.db) {
      console.error('IndexedDB not initialized');
      return false;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async getData(storeName, key) {
    if (!this.db) {
      console.error('IndexedDB not initialized');
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllData(storeName) {
    if (!this.db) {
      console.error('IndexedDB not initialized');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteData(storeName, key) {
    if (!this.db) {
      console.error('IndexedDB not initialized');
      return false;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async clearStore(storeName) {
    if (!this.db) {
      console.error('IndexedDB not initialized');
      return false;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Cache methods with expiration
  async setCache(key, data, expirationMinutes = 60) {
    const cacheData = {
      key,
      data,
      timestamp: Date.now(),
      expiration: Date.now() + (expirationMinutes * 60 * 1000)
    };

    return this.storeData('cache', cacheData);
  }

  async getCache(key) {
    const cached = await this.getData('cache', key);
    
    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.expiration) {
      await this.deleteData('cache', key);
      return null;
    }

    return cached.data;
  }

  async clearExpiredCache() {
    const allCache = await this.getAllData('cache');
    const now = Date.now();

    for (const item of allCache) {
      if (now > item.expiration) {
        await this.deleteData('cache', item.key);
      }
    }
  }

  // Offline queue methods
  async addToOfflineQueue(action, data) {
    const queueItem = {
      action,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    return this.storeData('offline_queue', queueItem);
  }

  async getOfflineQueue() {
    return this.getAllData('offline_queue');
  }

  async removeFromOfflineQueue(id) {
    return this.deleteData('offline_queue', id);
  }

  async clearOfflineQueue() {
    return this.clearStore('offline_queue');
  }

  // User data methods
  async saveUserData(userData) {
    // Save to localStorage for quick access
    this.setItem('currentUser', userData);
    
    // Also save to IndexedDB for offline access
    return this.storeData('users', { ...userData, id: userData.id || 'current' });
  }

  async getUserData() {
    // Try localStorage first
    let userData = this.getItem('currentUser');
    
    if (!userData) {
      // Fallback to IndexedDB
      userData = await this.getData('users', 'current');
    }

    return userData;
  }

  async clearUserData() {
    this.removeItem('currentUser');
    this.removeItem('authToken');
    this.removeItem('refreshToken');
    this.removeItem('loginTime');
    this.removeItem('isLoggedIn');
    
    return this.deleteData('users', 'current');
  }

  // Appointment methods
  async saveAppointments(appointments) {
    if (!Array.isArray(appointments)) {
      appointments = [appointments];
    }

    const promises = appointments.map(appointment => 
      this.storeData('appointments', appointment)
    );

    return Promise.all(promises);
  }

  async getAppointments(userId = null) {
    const allAppointments = await this.getAllData('appointments');
    
    if (userId) {
      return allAppointments.filter(apt => apt.userId === userId);
    }

    return allAppointments;
  }

  async getAppointmentsByDate(date) {
    const allAppointments = await this.getAllData('appointments');
    return allAppointments.filter(apt => apt.date === date);
  }

  // Barber methods
  async saveBarbers(barbers) {
    if (!Array.isArray(barbers)) {
      barbers = [barbers];
    }

    const promises = barbers.map(barber => 
      this.storeData('barbers', barber)
    );

    return Promise.all(promises);
  }

  async getBarbers() {
    return this.getAllData('barbers');
  }

  async getBarber(id) {
    return this.getData('barbers', id);
  }

  // Service methods
  async saveServices(services) {
    if (!Array.isArray(services)) {
      services = [services];
    }

    const promises = services.map(service => 
      this.storeData('services', service)
    );

    return Promise.all(promises);
  }

  async getServices() {
    return this.getAllData('services');
  }

  // Preferences methods
  setPreference(key, value) {
    const preferences = this.getItem('preferences') || {};
    preferences[key] = value;
    return this.setItem('preferences', preferences);
  }

  getPreference(key, defaultValue = null) {
    const preferences = this.getItem('preferences') || {};
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  }

  getAllPreferences() {
    return this.getItem('preferences') || {};
  }

  // Storage usage methods
  getStorageUsage() {
    let totalSize = 0;
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith(this.prefix)) {
        totalSize += localStorage[key].length;
      }
    }

    return {
      localStorage: totalSize,
      unit: 'characters',
      maxSize: 5 * 1024 * 1024 // 5MB typical limit
    };
  }

  async getIndexedDBUsage() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { error: 'Storage API not supported' };
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage,
        available: estimate.quota,
        percentage: (estimate.usage / estimate.quota) * 100
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Backup and restore methods
  async exportData() {
    const data = {
      localStorage: {},
      indexedDB: {},
      timestamp: Date.now(),
      version: '2.0.0'
    };

    // Export localStorage data
    for (let key in localStorage) {
      if (key.startsWith(this.prefix)) {
        data.localStorage[key] = localStorage[key];
      }
    }

    // Export IndexedDB data
    try {
      data.indexedDB.appointments = await this.getAllData('appointments');
      data.indexedDB.barbers = await this.getAllData('barbers');
      data.indexedDB.services = await this.getAllData('services');
      data.indexedDB.cache = await this.getAllData('cache');
    } catch (error) {
      console.error('Failed to export IndexedDB data:', error);
    }

    return data;
  }

  async importData(data) {
    try {
      // Import localStorage data
      if (data.localStorage) {
        for (let key in data.localStorage) {
          localStorage.setItem(key, data.localStorage[key]);
        }
      }

      // Import IndexedDB data
      if (data.indexedDB) {
        const { appointments, barbers, services } = data.indexedDB;
        
        if (appointments) await this.saveAppointments(appointments);
        if (barbers) await this.saveBarbers(barbers);
        if (services) await this.saveServices(services);
      }

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Cleanup methods
  async cleanup() {
    // Clear expired cache
    await this.clearExpiredCache();
    
    // Remove old offline queue items (older than 7 days)
    const queue = await this.getOfflineQueue();
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const item of queue) {
      if (item.timestamp < weekAgo) {
        await this.removeFromOfflineQueue(item.id);
      }
    }
  }

  // Event handlers for storage events
  onStorageChange(callback) {
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith(this.prefix)) {
        callback({
          key: event.key.replace(this.prefix, ''),
          oldValue: event.oldValue,
          newValue: event.newValue,
          url: event.url
        });
      }
    });
  }
}

// Export for use in other modules
window.StorageService = StorageService;
