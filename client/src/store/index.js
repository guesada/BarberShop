// Simple store without react-redux dependency
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Simple store configuration without Redux Toolkit for now
const initialState = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    userType: null
  },
  appointments: {
    list: [],
    isLoading: false,
    error: null
  },
  ui: {
    theme: localStorage.getItem('theme') || 'dark',
    sidebarOpen: false,
    notifications: [],
    isOnline: true
  }
};

// Simple reducer
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'auth/setUser':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          userType: action.payload.userType,
          isLoading: false,
          error: null
        }
      };
    case 'auth/logout':
      return {
        ...state,
        auth: {
          ...initialState.auth
        }
      };
    case 'auth/setLoading':
      return {
        ...state,
        auth: {
          ...state.auth,
          isLoading: action.payload
        }
      };
    case 'auth/setError':
      return {
        ...state,
        auth: {
          ...state.auth,
          error: action.payload,
          isLoading: false
        }
      };
    case 'ui/toggleTheme':
      const newTheme = state.ui.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: newTheme
        }
      };
    case 'ui/setTheme':
      localStorage.setItem('theme', action.payload);
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload
        }
      };
    case 'auth/loginStart':
      return {
        ...state,
        auth: {
          ...state.auth,
          isLoading: true,
          error: null
        }
      };
    case 'auth/loginSuccess':
      localStorage.setItem('barbershop_token', action.payload.token);
      if (action.payload.rememberMe) {
        localStorage.setItem('barbershop_remember', 'true');
      }
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          userType: action.payload.userType,
          isLoading: false,
          error: null
        }
      };
    case 'auth/loginFailure':
      return {
        ...state,
        auth: {
          ...state.auth,
          isLoading: false,
          error: action.payload
        }
      };
    case 'ui/setOnlineStatus':
      return {
        ...state,
        ui: {
          ...state.ui,
          isOnline: action.payload
        }
      };
    case 'ui/addToast':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, action.payload]
        }
      };
    default:
      return state;
  }
};

// Create simple store implementation
let currentState = initialState;
const listeners = [];

const storeImpl = {
  getState: () => currentState,
  dispatch: (action) => {
    currentState = rootReducer(currentState, action);
    listeners.forEach(listener => listener());
    return action;
  },
  subscribe: (listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
};

// Action creators
export const authActions = {
  setUser: (payload) => ({ type: 'auth/setUser', payload }),
  logout: () => ({ type: 'auth/logout' }),
  setLoading: (payload) => ({ type: 'auth/setLoading', payload }),
  setError: (payload) => ({ type: 'auth/setError', payload })
};

export const uiActions = {
  toggleTheme: () => ({ type: 'ui/toggleTheme' }),
  setTheme: (payload) => ({ type: 'ui/setTheme', payload }),
  setOnlineStatus: (payload) => ({ type: 'ui/setOnlineStatus', payload }),
  addToast: (payload) => ({ type: 'ui/addToast', payload })
};

export const authAsyncActions = {
  loginUser: (credentials) => async (dispatch) => {
    dispatch({ type: 'auth/loginStart' });
    
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation
      if (!credentials.email || !credentials.password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      if (credentials.password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }
      
      // Mock user data
      const mockUser = {
        id: 1,
        name: credentials.email === 'admin@admin.com' ? 'Administrador' : 'Usuário Teste',
        email: credentials.email,
        userType: credentials.userType || 'client'
      };
      
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      dispatch({
        type: 'auth/loginSuccess',
        payload: {
          user: mockUser,
          token: mockToken,
          userType: mockUser.userType,
          rememberMe: credentials.rememberMe
        }
      });
      
      return { user: mockUser, token: mockToken };
    } catch (error) {
      dispatch({
        type: 'auth/loginFailure',
        payload: error.message
      });
      throw error;
    }
  }
};

// Context for state management
const StoreContext = createContext();

// Enhanced dispatch for async actions
const enhancedDispatch = (dispatch) => (action) => {
  if (typeof action === 'function') {
    return action(dispatch);
  }
  return dispatch(action);
};

// Provider component
export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(rootReducer, initialState);
  const asyncDispatch = enhancedDispatch(dispatch);
  
  // Apply theme on mount (only once to avoid loops)
  useEffect(() => {
    const theme = state.ui.theme;
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, [state.ui.theme]); // Keep theme dependency but with proper handling
  
  return (
    <StoreContext.Provider value={{ state, dispatch: asyncDispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

// Hooks for JavaScript
export const useAppDispatch = () => {
  const context = useContext(StoreContext);
  return context?.dispatch || (() => {});
};

export const useAppSelector = (selector) => {
  const context = useContext(StoreContext);
  return selector(context?.state || initialState);
};

// Export store for compatibility
export const store = storeImpl;

export default storeImpl;
