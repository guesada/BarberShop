/**
 * Elite Barber Shop - Authentication Service
 * Handles user authentication, authorization, and session management
 * @version 2.0.0
 */

class AuthService {
  constructor(apiService) {
    this.api = apiService;
    this.currentUser = null;
    this.sessionTimeout = null;
    this.refreshTokenInterval = null;
    this.sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
    this.refreshInterval = 15 * 60 * 1000; // 15 minutes
    
    this.init();
  }

  async init() {
    // Check for existing session
    await this.restoreSession();
    
    // Setup automatic token refresh
    this.setupTokenRefresh();
    
    // Setup session timeout
    this.setupSessionTimeout();
  }

  /**
   * Login user with email and password
   */
  async login(email, password, userType = 'cliente') {
    try {
      // For static deployment, use localStorage-based authentication
      if (this.isStaticDeployment()) {
        return this.loginOffline(email, password, userType);
      }

      // API-based login for full deployment
      const response = await this.api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password,
        userType
      });

      if (response.success) {
        await this.handleLoginSuccess(response);
        return response;
      }

      throw new Error(response.message || 'Login failed');

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Offline login for static deployment
   */
  async loginOffline(email, password, userType) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find(u => 
      u.email === email.toLowerCase().trim() && 
      u.userType === userType
    );

    if (user) {
      // In production, you would verify the password hash
      // For demo purposes, we'll accept any password for registered users
      const sessionData = {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          phone: user.phone,
          avatar: user.avatar || null
        },
        token: this.generateMockToken(user),
        refreshToken: this.generateMockToken(user, 'refresh')
      };

      await this.handleLoginSuccess(sessionData);
      return sessionData;
    }

    // Fallback for demo mode
    if (email) {
      const demoUser = {
        id: Date.now(),
        name: this.extractNameFromEmail(email),
        email: email.toLowerCase().trim(),
        userType,
        phone: null,
        avatar: null
      };

      const sessionData = {
        success: true,
        user: demoUser,
        token: this.generateMockToken(demoUser),
        refreshToken: this.generateMockToken(demoUser, 'refresh')
      };

      await this.handleLoginSuccess(sessionData);
      return sessionData;
    }

    throw new Error('Email é obrigatório');
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      if (this.isStaticDeployment()) {
        return this.registerOffline(userData);
      }

      const response = await this.api.post('/auth/register', userData);

      if (response.success) {
        // Optionally auto-login after registration
        if (response.autoLogin) {
          await this.handleLoginSuccess(response);
        }
        return response;
      }

      throw new Error(response.message || 'Registration failed');

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Offline registration for static deployment
   */
  async registerOffline(userData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = existingUsers.find(user => user.email === userData.email);

    if (userExists) {
      throw new Error('Email já cadastrado');
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString(),
      isActive: true,
      emailVerified: false
    };

    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

    return {
      success: true,
      message: 'Usuário cadastrado com sucesso!',
      user: newUser
    };
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Clear server session if using API
      if (!this.isStaticDeployment() && this.currentUser) {
        await this.api.post('/auth/logout');
      }

      this.clearSession();
      
      // Emit logout event
      document.dispatchEvent(new CustomEvent('user-logout'));

    } catch (error) {
      console.error('Logout error:', error);
      // Clear session even if API call fails
      this.clearSession();
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      if (this.isStaticDeployment()) {
        // For static deployment, just extend the session
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
          const newToken = this.generateMockToken(currentUser);
          localStorage.setItem('authToken', newToken);
          localStorage.setItem('loginTime', Date.now().toString());
          return { token: newToken };
        }
        throw new Error('No current user');
      }

      const response = await this.api.post('/auth/refresh', {
        refreshToken
      });

      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('loginTime', Date.now().toString());
        return response;
      }

      throw new Error('Token refresh failed');

    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await this.logout();
      throw error;
    }
  }

  /**
   * Validate current token
   */
  async validateToken(token) {
    try {
      if (this.isStaticDeployment()) {
        // For static deployment, check if user exists in localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const loginTime = localStorage.getItem('loginTime');
        
        if (currentUser && loginTime) {
          const timeDiff = Date.now() - parseInt(loginTime);
          if (timeDiff < this.sessionDuration) {
            this.currentUser = currentUser;
            return currentUser;
          }
        }
        return null;
      }

      const response = await this.api.get('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.success) {
        this.currentUser = response.user;
        return response.user;
      }

      return null;

    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }

  /**
   * Handle successful login
   */
  async handleLoginSuccess(response) {
    this.currentUser = response.user;
    
    // Store session data
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken || '');
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    localStorage.setItem('loginTime', Date.now().toString());
    localStorage.setItem('isLoggedIn', 'true');

    // Setup session management
    this.setupSessionTimeout();
    this.setupTokenRefresh();

    // Emit login event
    document.dispatchEvent(new CustomEvent('user-authenticated', {
      detail: { user: response.user }
    }));

    console.log('✅ User authenticated:', response.user);
  }

  /**
   * Restore session from localStorage
   */
  async restoreSession() {
    const token = localStorage.getItem('authToken');
    const loginTime = localStorage.getItem('loginTime');
    
    if (token && loginTime) {
      const timeDiff = Date.now() - parseInt(loginTime);
      
      if (timeDiff < this.sessionDuration) {
        const user = await this.validateToken(token);
        if (user) {
          this.currentUser = user;
          return true;
        }
      }
    }

    this.clearSession();
    return false;
  }

  /**
   * Clear session data
   */
  clearSession() {
    this.currentUser = null;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('isLoggedIn');

    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
    }
  }

  /**
   * Setup automatic session timeout
   */
  setupSessionTimeout() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    this.sessionTimeout = setTimeout(() => {
      this.logout();
    }, this.sessionDuration);
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh() {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
    }

    if (!this.isStaticDeployment()) {
      this.refreshTokenInterval = setInterval(async () => {
        try {
          await this.refreshToken();
        } catch (error) {
          console.error('Automatic token refresh failed:', error);
        }
      }, this.refreshInterval);
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    return this.currentUser && this.currentUser.userType === role;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      if (this.isStaticDeployment()) {
        // Update in localStorage
        const updatedUser = { ...this.currentUser, ...profileData };
        this.currentUser = updatedUser;
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update in registered users
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = registeredUsers.findIndex(u => u.id === updatedUser.id);
        if (userIndex !== -1) {
          registeredUsers[userIndex] = { ...registeredUsers[userIndex], ...profileData };
          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }

        return { success: true, user: updatedUser };
      }

      const response = await this.api.put('/auth/profile', profileData);
      
      if (response.success) {
        this.currentUser = response.user;
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }

      return response;

    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      return response;

    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    try {
      const response = await this.api.post('/auth/forgot-password', { email });
      return response;

    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  // Utility methods
  isStaticDeployment() {
    return !window.location.hostname.includes('localhost') && 
           !window.location.hostname.includes('127.0.0.1') &&
           window.location.protocol === 'https:';
  }

  extractNameFromEmail(email) {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  generateMockToken(user, type = 'access') {
    const payload = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      type,
      iat: Date.now(),
      exp: Date.now() + (type === 'refresh' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
    };

    return btoa(JSON.stringify(payload));
  }
}

// Export for use in other modules
window.AuthService = AuthService;