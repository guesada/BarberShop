/**
 * Elite Barber Shop - API Service
 * Handles all API communications with advanced error handling and caching
 * @version 2.0.0
 */

class APIService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cache = new Map();
    this.requestQueue = [];
    this.isOnline = navigator.onLine;
    this.retryAttempts = 3;
    this.timeout = 10000; // 10 seconds
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Generic HTTP request method with advanced features
   */
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

    // Add authentication token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `${config.method}:${url}`;

    // Check cache for GET requests
    if (config.method === 'GET' && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
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
        throw new APIError(
          response.status,
          response.statusText,
          await response.text()
        );
      }

      const data = await response.json();

      // Cache successful GET requests
      if (config.method === 'GET') {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;

    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Handle network errors with retry logic
      if (options.retry !== false) {
        return this.retryRequest(url, config, options.retryCount || 0);
      }
      
      throw new APIError(0, 'Network Error', error.message);
    }
  }

  /**
   * Fetch with timeout support
   */
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

  /**
   * Retry failed requests
   */
  async retryRequest(url, config, retryCount) {
    if (retryCount >= this.retryAttempts) {
      throw new APIError(0, 'Max Retries Exceeded', 'Request failed after maximum retry attempts');
    }

    // Exponential backoff
    const delay = Math.pow(2, retryCount) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    return this.request(url.replace(this.baseUrl, ''), {
      ...config,
      retryCount: retryCount + 1
    });
  }

  /**
   * Queue requests for offline processing
   */
  queueRequest(url, config) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        url,
        config,
        resolve,
        reject,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Process queued requests when back online
   */
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
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile(endpoint, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new APIError(xhr.status, xhr.statusText, xhr.responseText));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new APIError(0, 'Network Error', 'Upload failed'));
      });

      xhr.open('POST', `${this.baseUrl}${endpoint}`);
      
      Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key]);
      });

      xhr.send(formData);
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
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

// Export for use in other modules
window.APIService = APIService;
window.APIError = APIError;
