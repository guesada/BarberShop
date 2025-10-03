import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Criar instância do axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de API
export const apiService = {
  // Autenticação
  auth: {
    login: async (credentials) => {
      const response = await apiClient.post('/api/auth/login', credentials);
      return response.data;
    },
    
    register: async (userData) => {
      const response = await apiClient.post('/api/auth/register', userData);
      return response.data;
    },
    
    logout: async () => {
      // Implementar logout no backend se necessário
      localStorage.removeItem('auth-storage');
    }
  },

  // Usuários
  users: {
    getProfile: async () => {
      const response = await apiClient.get('/api/users/profile');
      return response.data;
    },
    
    updateProfile: async (userData) => {
      const response = await apiClient.put('/api/users/profile', userData);
      return response.data;
    }
  },

  // Agendamentos
  appointments: {
    getAll: async () => {
      const response = await apiClient.get('/api/appointments');
      return response.data;
    },
    
    create: async (appointmentData) => {
      const response = await apiClient.post('/api/appointments', appointmentData);
      return response.data;
    },
    
    update: async (id, appointmentData) => {
      const response = await apiClient.put(`/api/appointments/${id}`, appointmentData);
      return response.data;
    },
    
    cancel: async (id) => {
      const response = await apiClient.delete(`/api/appointments/${id}`);
      return response.data;
    },
    
    updateStatus: async (id, status) => {
      const response = await apiClient.patch(`/api/appointments/${id}/status`, { status });
      return response.data;
    }
  },

  // Barbeiros
  barbers: {
    getAll: async () => {
      const response = await apiClient.get('/api/users?user_type=barbeiro');
      return response.data;
    },
    
    getById: async (id) => {
      const response = await apiClient.get(`/api/users/${id}`);
      return response.data;
    },
    
    getAvailability: async (barberId, date) => {
      const response = await apiClient.get(`/api/barbers/${barberId}/availability`, {
        params: { date }
      });
      return response.data;
    }
  },

  // Serviços
  services: {
    getAll: async () => {
      const response = await apiClient.get('/api/services');
      return response.data;
    },
    
    getById: async (id) => {
      const response = await apiClient.get(`/api/services/${id}`);
      return response.data;
    },
    
    getPopular: async () => {
      const response = await apiClient.get('/api/services/popular');
      return response.data;
    },
    
    getCategories: async () => {
      const response = await apiClient.get('/api/services/categories');
      return response.data;
    }
  },

  // Notificações
  notifications: {
    getSettings: async () => {
      const response = await apiClient.get('/api/notifications/settings');
      return response.data;
    },
    
    sendWelcome: async (userId) => {
      const response = await apiClient.post('/api/notifications/welcome', { userId });
      return response.data;
    },
    
    sendConfirmation: async (appointmentId) => {
      const response = await apiClient.post('/api/notifications/appointment-confirmation', { appointmentId });
      return response.data;
    },
    
    scheduleReminder: async (appointmentId, appointmentDate) => {
      const response = await apiClient.post('/api/notifications/schedule-reminder', { 
        appointmentId, 
        appointmentDate 
      });
      return response.data;
    },
    
    cancelReminder: async (appointmentId) => {
      const response = await apiClient.delete(`/api/notifications/cancel-reminder/${appointmentId}`);
      return response.data;
    },
    
    testEmail: async (email, type = 'welcome') => {
      const response = await apiClient.post('/api/notifications/test-email-public', { email, type });
      return response.data;
    },
    
    getStatus: async () => {
      const response = await apiClient.get('/api/notifications/status-public');
      return response.data;
    }
  },

  // Estatísticas e Dashboard
  dashboard: {
    getStats: async () => {
      const response = await apiClient.get('/api/users/stats');
      return response.data;
    },
    
    getBarberStats: async () => {
      const response = await apiClient.get('/api/barbers/me/dashboard');
      return response.data;
    }
  },

  // Health Check
  health: {
    check: async () => {
      const response = await apiClient.get('/health');
      return response.data;
    }
  }
};

// Hook personalizado para usar a API com React Query
export const useApiQuery = (queryKey, queryFn, options = {}) => {
  return {
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
    refetchOnWindowFocus: false,
    ...options
  };
};

// Função utilitária para tratar erros da API
export const handleApiError = (error) => {
  if (error.response) {
    // Erro da resposta do servidor
    const message = error.response.data?.message || 'Erro no servidor';
    return { message, status: error.response.status };
  } else if (error.request) {
    // Erro de rede
    return { message: 'Erro de conexão. Verifique sua internet.', status: 0 };
  } else {
    // Outro tipo de erro
    return { message: 'Erro inesperado', status: -1 };
  }
};

export default apiService;
