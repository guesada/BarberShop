import axios from 'axios';
import { store } from '../../store';
import { authActions, uiActions } from '../../store';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for performance monitoring
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = Date.now() - response.config.metadata.startTime;
    
    // Log performance metrics
    if (duration > 5000) {
      console.warn(`Slow API request: ${response.config.url} took ${duration}ms`);
    }
    
    // Update online status
    store.dispatch(uiActions.setOnlineStatus(true));
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      store.dispatch(uiActions.setOnlineStatus(false));
      store.dispatch(uiActions.addToast({
        type: 'error',
        title: 'Conexão perdida',
        message: 'Verifique sua conexão com a internet',
      }));
      return Promise.reject(error);
    }
    
    // Handle 401 errors (unauthorized)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Simple logout on 401
      store.dispatch(authActions.logout());
      store.dispatch(uiActions.addToast({
        type: 'error',
        title: 'Sessão expirada',
        message: 'Faça login novamente',
      }));
      return Promise.reject(error);
    }
    
    // Handle 403 errors (forbidden)
    if (error.response.status === 403) {
      store.dispatch(uiActions.addToast({
        type: 'error',
        title: 'Acesso negado',
        message: 'Você não tem permissão para esta ação',
      }));
    }
    
    // Handle 429 errors (rate limit)
    if (error.response.status === 429) {
      store.dispatch(uiActions.addToast({
        type: 'warning',
        title: 'Muitas tentativas',
        message: 'Aguarde um momento antes de tentar novamente',
      }));
    }
    
    // Handle 500 errors (server error)
    if (error.response.status >= 500) {
      store.dispatch(uiActions.addToast({
        type: 'error',
        title: 'Erro do servidor',
        message: 'Tente novamente em alguns minutos',
      }));
    }
    
    return Promise.reject(error);
  }
);

// API Service Classes
class BaseAPIService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }
  
  async get(id = '', params = {}) {
    const url = id ? `${this.endpoint}/${id}` : this.endpoint;
    const response = await apiClient.get(url, { params });
    return response.data;
  }
  
  async post(data, config = {}) {
    const response = await apiClient.post(this.endpoint, data, config);
    return response.data;
  }
  
  async put(id, data, config = {}) {
    const response = await apiClient.put(`${this.endpoint}/${id}`, data, config);
    return response.data;
  }
  
  async patch(id, data, config = {}) {
    const response = await apiClient.patch(`${this.endpoint}/${id}`, data, config);
    return response.data;
  }
  
  async delete(id, config = {}) {
    const response = await apiClient.delete(`${this.endpoint}/${id}`, config);
    return response.data;
  }
}

// Auth API
class AuthAPI extends BaseAPIService {
  constructor() {
    super('/auth');
  }
  
  async login(credentials) {
    return this.post('/login', credentials);
  }
  
  async register(userData) {
    return this.post('/register', userData);
  }
  
  async logout(refreshToken) {
    return this.post('/logout', { refreshToken });
  }
  
  async refreshToken(refreshToken) {
    return this.post('/refresh', { refreshToken });
  }
  
  async forgotPassword(email) {
    return this.post('/forgot-password', { email });
  }
  
  async resetPassword(token, password) {
    return this.post('/reset-password', { token, password });
  }
  
  async verifyEmail(token) {
    return this.post('/verify-email', { token });
  }
  
  async changePassword(currentPassword, newPassword) {
    return this.post('/change-password', { currentPassword, newPassword });
  }
  
  async enable2FA() {
    return this.post('/2fa/enable');
  }
  
  async disable2FA(code) {
    return this.post('/2fa/disable', { code });
  }
  
  async verify2FA(code) {
    return this.post('/2fa/verify', { code });
  }
  
  async verifyToken(token) {
    return this.post('/verify-token', { token });
  }
}

// User API
class UserAPI extends BaseAPIService {
  constructor() {
    super('/users');
  }
  
  async getProfile() {
    return this.get('profile');
  }
  
  async updateProfile(data) {
    return this.patch('profile', data);
  }
  
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.post('/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  
  async deleteAvatar() {
    return this.delete('avatar');
  }
  
  async getPreferences() {
    return this.get('preferences');
  }
  
  async updatePreferences(preferences) {
    return this.patch('preferences', preferences);
  }
  
  async deleteAccount() {
    return this.delete('account');
  }
  
  async exportData() {
    return this.get('export');
  }
}

// Barber API
class BarberAPI extends BaseAPIService {
  constructor() {
    super('/barbers');
  }
  
  async getAll(params = {}) {
    return this.get('', params);
  }
  
  async getById(id) {
    return this.get(id);
  }
  
  async getFeatured() {
    return this.get('featured');
  }
  
  async getTopRated() {
    return this.get('top-rated');
  }
  
  async getNearby(lat, lng, radius = 10) {
    return this.get('nearby', { lat, lng, radius });
  }
  
  async getAvailability(id, date) {
    return this.get(`${id}/availability`, { date });
  }
  
  async getReviews(id, params = {}) {
    return this.get(`${id}/reviews`, params);
  }
  
  async addToFavorites(id) {
    return this.post(`${id}/favorite`);
  }
  
  async removeFromFavorites(id) {
    return this.delete(`${id}/favorite`);
  }
  
  async getFavorites() {
    return this.get('favorites');
  }
  
  async search(query, filters = {}) {
    return this.get('search', { query, ...filters });
  }
}

// Service API
class ServiceAPI extends BaseAPIService {
  constructor() {
    super('/services');
  }
  
  async getAll(params = {}) {
    return this.get('', params);
  }
  
  async getById(id) {
    return this.get(id);
  }
  
  async getByCategory(category) {
    return this.get('category', { category });
  }
  
  async getPopular() {
    return this.get('popular');
  }
  
  async getCategories() {
    return this.get('categories');
  }
  
  async search(query, filters = {}) {
    return this.get('search', { query, ...filters });
  }
}

// Appointment API
class AppointmentAPI extends BaseAPIService {
  constructor() {
    super('/appointments');
  }
  
  async getAll(params = {}) {
    return this.get('', params);
  }
  
  async getById(id) {
    return this.get(id);
  }
  
  async create(appointmentData) {
    return this.post('', appointmentData);
  }
  
  async update(id, data) {
    return this.patch(id, data);
  }
  
  async cancel(id, reason) {
    return this.patch(`${id}/cancel`, { reason });
  }
  
  async confirm(id) {
    return this.patch(`${id}/confirm`);
  }
  
  async reschedule(id, newDateTime) {
    return this.patch(`${id}/reschedule`, { dateTime: newDateTime });
  }
  
  async getUpcoming(limit = 5) {
    return this.get('upcoming', { limit });
  }
  
  async getHistory(params = {}) {
    return this.get('history', params);
  }
  
  async checkAvailability(barberId, date, duration) {
    return this.get('check-availability', { barberId, date, duration });
  }
  
  async addReview(id, review) {
    return this.post(`${id}/review`, review);
  }
  
  async updateReview(id, reviewId, review) {
    return this.patch(`${id}/review/${reviewId}`, review);
  }
  
  async deleteReview(id, reviewId) {
    return this.delete(`${id}/review/${reviewId}`);
  }
}

// Payment API
class PaymentAPI extends BaseAPIService {
  constructor() {
    super('/payments');
  }
  
  async createPaymentIntent(amount, currency = 'BRL') {
    return this.post('/intent', { amount, currency });
  }
  
  async confirmPayment(paymentIntentId, paymentMethodId) {
    return this.post('/confirm', { paymentIntentId, paymentMethodId });
  }
  
  async getPaymentMethods() {
    return this.get('/methods');
  }
  
  async addPaymentMethod(paymentMethod) {
    return this.post('/methods', paymentMethod);
  }
  
  async deletePaymentMethod(id) {
    return this.delete(`/methods/${id}`);
  }
  
  async getTransactions(params = {}) {
    return this.get('/transactions', params);
  }
  
  async refund(transactionId, amount) {
    return this.post(`/transactions/${transactionId}/refund`, { amount });
  }
  
  async generatePixQR(amount, description) {
    return this.post('/pix/qr', { amount, description });
  }
  
  async checkPixPayment(pixId) {
    return this.get(`/pix/${pixId}/status`);
  }
}

// Notification API
class NotificationAPI extends BaseAPIService {
  constructor() {
    super('/notifications');
  }
  
  async getAll(params = {}) {
    return this.get('', params);
  }
  
  async markAsRead(id) {
    return this.patch(`${id}/read`);
  }
  
  async markAllAsRead() {
    return this.patch('read-all');
  }
  
  async delete(id) {
    return this.delete(id);
  }
  
  async clearAll() {
    return this.delete('clear-all');
  }
  
  async updateSettings(settings) {
    return this.patch('settings', settings);
  }
  
  async getSettings() {
    return this.get('settings');
  }
  
  async subscribeToPush(subscription) {
    return this.post('/push/subscribe', subscription);
  }
  
  async unsubscribeFromPush() {
    return this.post('/push/unsubscribe');
  }
}

// Analytics API
class AnalyticsAPI extends BaseAPIService {
  constructor() {
    super('/analytics');
  }
  
  async trackEvent(event, properties = {}) {
    return this.post('/events', { event, properties, timestamp: Date.now() });
  }
  
  async trackPageView(page, properties = {}) {
    return this.post('/pageviews', { page, properties, timestamp: Date.now() });
  }
  
  async getDashboardStats() {
    return this.get('/dashboard');
  }
  
  async getAppointmentStats(period = '30d') {
    return this.get('/appointments', { period });
  }
  
  async getRevenueStats(period = '30d') {
    return this.get('/revenue', { period });
  }
  
  async getBarberStats(period = '30d') {
    return this.get('/barbers', { period });
  }
  
  async getUserBehavior(period = '30d') {
    return this.get('/behavior', { period });
  }
}

// Chat API
class ChatAPI extends BaseAPIService {
  constructor() {
    super('/chat');
  }
  
  async getConversations() {
    return this.get('/conversations');
  }
  
  async getConversation(id) {
    return this.get(`/conversations/${id}`);
  }
  
  async sendMessage(conversationId, message) {
    return this.post(`/conversations/${conversationId}/messages`, { message });
  }
  
  async markAsRead(conversationId, messageId) {
    return this.patch(`/conversations/${conversationId}/messages/${messageId}/read`);
  }
  
  async uploadFile(conversationId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.post(`/conversations/${conversationId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  
  async deleteMessage(conversationId, messageId) {
    return this.delete(`/conversations/${conversationId}/messages/${messageId}`);
  }
}

// Export API instances
export const authAPI = new AuthAPI();
export const userAPI = new UserAPI();
export const barberAPI = new BarberAPI();
export const serviceAPI = new ServiceAPI();
export const appointmentAPI = new AppointmentAPI();
export const paymentAPI = new PaymentAPI();
export const notificationAPI = new NotificationAPI();
export const analyticsAPI = new AnalyticsAPI();
export const chatAPI = new ChatAPI();

// Export axios instance for custom requests
export { apiClient };

// Export utility functions
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const isOnline = () => {
  return navigator.onLine;
};

export const handleOfflineRequest = (request) => {
  // Store request for later retry when online
  const offlineRequests = JSON.parse(localStorage.getItem('offlineRequests') || '[]');
  offlineRequests.push({
    ...request,
    timestamp: Date.now(),
  });
  localStorage.setItem('offlineRequests', JSON.stringify(offlineRequests));
};

export const retryOfflineRequests = async () => {
  const offlineRequests = JSON.parse(localStorage.getItem('offlineRequests') || '[]');
  
  for (const request of offlineRequests) {
    try {
      await apiClient(request);
    } catch (error) {
      console.warn('Failed to retry offline request:', error);
    }
  }
  
  // Clear successful requests
  localStorage.removeItem('offlineRequests');
};

// Setup online/offline event listeners
window.addEventListener('online', () => {
  store.dispatch(uiActions.setOnlineStatus(true));
  retryOfflineRequests();
});

window.addEventListener('offline', () => {
  store.dispatch(uiActions.setOnlineStatus(false));
});

export default {
  auth: authAPI,
  user: userAPI,
  barbers: barberAPI,
  services: serviceAPI,
  appointments: appointmentAPI,
  payments: paymentAPI,
  notifications: notificationAPI,
  analytics: analyticsAPI,
  chat: chatAPI,
};
