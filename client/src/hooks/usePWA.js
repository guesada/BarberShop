import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para gerenciar funcionalidades PWA
 * Inclui: Service Worker, instalação, notificações, offline status
 */
export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Registrar Service Worker
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        setSwRegistration(registration);
        console.log('[PWA] Service Worker registrado:', registration);

        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              toast.success('Nova versão disponível! Clique para atualizar.', {
                duration: 5000,
                onClick: () => updateApp()
              });
            }
          });
        });

        return registration;
      } catch (error) {
        console.error('[PWA] Erro ao registrar Service Worker:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Atualizar aplicação
  const updateApp = useCallback(() => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [swRegistration]);

  // Instalar PWA
  const installPWA = useCallback(async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          toast.success('BarberShop instalado com sucesso!');
        }
        
        setDeferredPrompt(null);
        return outcome === 'accepted';
      } catch (error) {
        console.error('[PWA] Erro ao instalar:', error);
        toast.error('Erro ao instalar a aplicação');
        return false;
      }
    }
    return false;
  }, [deferredPrompt]);

  // Solicitar permissão para notificações
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          toast.success('Notificações ativadas!');
          
          // Registrar para push notifications se SW estiver disponível
          if (swRegistration) {
            try {
              const subscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
              });
              
              console.log('[PWA] Push subscription:', subscription);
              // Enviar subscription para o servidor
              // await sendSubscriptionToServer(subscription);
            } catch (error) {
              console.error('[PWA] Erro ao registrar push notifications:', error);
            }
          }
          
          return true;
        } else {
          toast.error('Permissão para notificações negada');
          return false;
        }
      } catch (error) {
        console.error('[PWA] Erro ao solicitar permissão:', error);
        return false;
      }
    }
    return false;
  }, [swRegistration]);

  // Enviar notificação local
  const showNotification = useCallback((title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        ...options
      });

      // Auto-fechar após 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
    return null;
  }, []);

  // Verificar se está instalado
  const checkIfInstalled = useCallback(() => {
    // Verificar se está rodando como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone ||
                        document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);
    return isStandalone;
  }, []);

  // Limpar cache
  const clearCache = useCallback(async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        
        toast.success('Cache limpo com sucesso!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[PWA] Erro ao limpar cache:', error);
      toast.error('Erro ao limpar cache');
      return false;
    }
  }, []);

  // Verificar espaço de armazenamento
  const checkStorageQuota = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
        
        return {
          usage: Math.round(usage / 1024 / 1024), // MB
          quota: Math.round(quota / 1024 / 1024), // MB
          percentUsed: Math.round(percentUsed)
        };
      } catch (error) {
        console.error('[PWA] Erro ao verificar storage:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Efeitos
  useEffect(() => {
    // Registrar Service Worker
    registerServiceWorker();

    // Verificar se está instalado
    checkIfInstalled();

    // Listeners para status online/offline
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada!');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Você está offline');
    };

    // Listener para prompt de instalação
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listener para quando app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast.success('BarberShop instalado!');
    };

    // Adicionar listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [registerServiceWorker, checkIfInstalled]);

  return {
    // Estados
    isOnline,
    isInstallable,
    isInstalled,
    updateAvailable,
    swRegistration,
    
    // Funções
    installPWA,
    updateApp,
    requestNotificationPermission,
    showNotification,
    clearCache,
    checkStorageQuota,
    
    // Utilitários
    isNotificationSupported: 'Notification' in window,
    isServiceWorkerSupported: 'serviceWorker' in navigator,
    isPWACapable: 'serviceWorker' in navigator && 'PushManager' in window
  };
};

export default usePWA;
