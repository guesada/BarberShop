/**
 * Elite Barber Shop - Notification Service
 * Handles all types of notifications: toast, push, email, SMS
 * @version 2.0.0
 */

class NotificationService {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 5;
    this.defaultDuration = 5000;
    this.container = null;
    this.pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.permission = Notification.permission;
    
    this.init();
  }

  async init() {
    this.createContainer();
    await this.requestPermission();
    this.setupServiceWorker();
  }

  /**
   * Create notification container
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.className = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
      max-width: 400px;
    `;
    document.body.appendChild(this.container);
  }

  /**
   * Show toast notification
   */
  show(message, type = 'info', options = {}) {
    const notification = {
      id: Date.now(),
      message,
      type,
      duration: options.duration || this.defaultDuration,
      persistent: options.persistent || false,
      actions: options.actions || [],
      timestamp: new Date()
    };

    this.notifications.unshift(notification);

    // Limit number of notifications
    if (this.notifications.length > this.maxNotifications) {
      const removed = this.notifications.pop();
      this.removeToast(removed.id);
    }

    this.renderToast(notification);

    // Auto-remove if not persistent
    if (!notification.persistent) {
      setTimeout(() => {
        this.remove(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  /**
   * Render toast notification
   */
  renderToast(notification) {
    const toast = document.createElement('div');
    toast.id = `notification-${notification.id}`;
    toast.className = `notification-toast notification-${notification.type}`;
    toast.style.cssText = `
      background: ${this.getTypeColor(notification.type)};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: auto;
      max-width: 100%;
      word-wrap: break-word;
    `;

    const icon = this.getTypeIcon(notification.type);
    const content = `
      <div class="notification-icon" style="flex-shrink: 0;">
        <i class="fas ${icon}"></i>
      </div>
      <div class="notification-content" style="flex: 1; min-width: 0;">
        <div class="notification-message" style="font-weight: 500; margin-bottom: 4px;">
          ${notification.message}
        </div>
        ${notification.actions.length > 0 ? this.renderActions(notification.actions) : ''}
      </div>
      <button class="notification-close" style="
        background: none;
        border: none;
        color: rgba(255,255,255,0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
        flex-shrink: 0;
      " onclick="window.notificationService.remove(${notification.id})">
        <i class="fas fa-times"></i>
      </button>
    `;

    toast.innerHTML = content;
    this.container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });

    // Add hover effects
    toast.addEventListener('mouseenter', () => {
      toast.style.transform = 'translateX(-8px) scale(1.02)';
    });

    toast.addEventListener('mouseleave', () => {
      toast.style.transform = 'translateX(0) scale(1)';
    });
  }

  /**
   * Render notification actions
   */
  renderActions(actions) {
    return `
      <div class="notification-actions" style="display: flex; gap: 8px; margin-top: 8px;">
        ${actions.map(action => `
          <button class="notification-action" style="
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: background-color 0.2s;
          " onclick="${action.onClick}">
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  /**
   * Remove notification
   */
  remove(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) return;

    this.removeToast(id);
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  /**
   * Remove toast from DOM
   */
  removeToast(id) {
    const toast = document.getElementById(`notification-${id}`);
    if (toast) {
      toast.style.transform = 'translateX(100%) scale(0.8)';
      toast.style.opacity = '0';
      
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  /**
   * Clear all notifications
   */
  clear() {
    this.notifications.forEach(notification => {
      this.removeToast(notification.id);
    });
    this.notifications = [];
  }

  /**
   * Show success notification
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  /**
   * Show error notification
   */
  error(message, options = {}) {
    return this.show(message, 'error', { ...options, duration: 8000 });
  }

  /**
   * Show warning notification
   */
  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  /**
   * Show info notification
   */
  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  /**
   * Show loading notification
   */
  loading(message, options = {}) {
    return this.show(message, 'loading', { ...options, persistent: true });
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Show browser notification
   */
  async showBrowserNotification(title, options = {}) {
    if (!await this.requestPermission()) {
      console.warn('Notification permission not granted');
      return null;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      if (options.onClick) {
        options.onClick();
      }
      notification.close();
    };

    return notification;
  }

  /**
   * Setup service worker for push notifications
   */
  async setupServiceWorker() {
    if (!this.pushSupported) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Check if already subscribed
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        console.log('Already subscribed to push notifications');
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush() {
    if (!this.pushSupported) {
      throw new Error('Push notifications not supported');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY || '')
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });

      console.log('Subscribed to push notifications');
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }

  /**
   * Show appointment reminder
   */
  showAppointmentReminder(appointment) {
    const message = `Lembrete: Você tem um agendamento com ${appointment.barber} às ${appointment.time}`;
    
    this.show(message, 'info', {
      duration: 10000,
      actions: [
        {
          label: 'Ver Detalhes',
          onClick: `window.app.navigateTo('appointments')`
        },
        {
          label: 'Cancelar',
          onClick: `window.app.cancelAppointment(${appointment.id})`
        }
      ]
    });

    // Also show browser notification if permission granted
    this.showBrowserNotification('Lembrete de Agendamento', {
      body: message,
      icon: '/icons/appointment.png',
      tag: `appointment-${appointment.id}`,
      onClick: () => {
        window.app.navigateTo('appointments');
      }
    });
  }

  /**
   * Show system notification
   */
  showSystemNotification(type, data) {
    switch (type) {
      case 'appointment_confirmed':
        this.success(`Agendamento confirmado para ${data.date} às ${data.time}`);
        break;
      case 'appointment_cancelled':
        this.warning(`Agendamento cancelado: ${data.reason}`);
        break;
      case 'payment_received':
        this.success(`Pagamento de R$ ${data.amount} recebido`);
        break;
      case 'new_message':
        this.info(`Nova mensagem de ${data.sender}`, {
          actions: [
            {
              label: 'Ver',
              onClick: `window.app.navigateTo('chat', { userId: ${data.senderId} })`
            }
          ]
        });
        break;
      default:
        this.info(data.message || 'Notificação do sistema');
    }
  }

  // Utility methods
  getTypeColor(type) {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      loading: '#6b7280'
    };
    return colors[type] || colors.info;
  }

  getTypeIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-triangle',
      warning: 'fa-exclamation-circle',
      info: 'fa-info-circle',
      loading: 'fa-spinner fa-spin'
    };
    return icons[type] || icons.info;
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Get notification history
   */
  getHistory() {
    return [...this.notifications];
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
  }
}

// Export for use in other modules
window.NotificationService = NotificationService;
