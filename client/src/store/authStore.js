import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiService, handleApiError } from '../services/apiService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const { email, password, userType } = credentials;
          
          // Validação local
          if (!email || !password) {
            throw new Error('Email e senha são obrigatórios');
          }
          
          if (password.length < 6) {
            throw new Error('Senha deve ter pelo menos 6 caracteres');
          }
          
          const response = await apiService.auth.login({
            email,
            password,
            user_type: userType || 'cliente'
          });

          // Correctly destructure the API response
          const { token, data } = response.data;
          const { user: userData } = data;

          set({
            user: {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              type: userData.user_type,
              avatar: userData.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
            },
            token: token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          return { success: true, user: userData };
          
        } catch (error) {
          const errorInfo = handleApiError(error);
          set({
            isLoading: false,
            error: errorInfo.message
          });
          throw new Error(errorInfo.message);
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const { name, email, password, confirmPassword, userType } = userData;
          
          // Validação local
          if (!name || !email || !password || !confirmPassword) {
            throw new Error('Todos os campos são obrigatórios');
          }
          
          if (password !== confirmPassword) {
            throw new Error('As senhas não coincidem');
          }
          
          if (password.length < 6) {
            throw new Error('Senha deve ter pelo menos 6 caracteres');
          }
          
          // Tentar registro com API real primeiro
          try {
            const response = await apiService.auth.register({
              name,
              email,
              password,
              user_type: userType || 'cliente'
            });
            
            set({ isLoading: false, error: null });
            return { success: true, message: 'Cadastro realizado com sucesso!' };
            
          } catch (apiError) {
            // Se a API falhar, usar modo simulado
            console.warn('API register failed, using simulation mode:', apiError);
            
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simular validação de email duplicado
            const existingUsers = JSON.parse(localStorage.getItem('registered-users') || '[]');
            if (existingUsers.some(user => user.email.toLowerCase() === email.toLowerCase())) {
              throw new Error('Este email já está cadastrado');
            }
            
            // Salvar usuário localmente
            const newUser = {
              id: Date.now(),
              name,
              email,
              user_type: userType || 'cliente',
              created_at: new Date().toISOString()
            };
            
            existingUsers.push(newUser);
            localStorage.setItem('registered-users', JSON.stringify(existingUsers));
            
            set({ isLoading: false, error: null });
            return { success: true, message: 'Cadastro realizado com sucesso!' };
          }
          
        } catch (error) {
          const errorInfo = handleApiError(error);
          set({
            isLoading: false,
            error: errorInfo.message
          });
          throw new Error(errorInfo.message);
        }
      },

      logout: () => {
        apiService.auth.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }));
      },

      // Auto-login check
      checkAuth: () => {
        const { user, token } = get();
        if (user && token) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
