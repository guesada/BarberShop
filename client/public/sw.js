// Service Worker para BarberShop PWA
const CACHE_NAME = 'barbershop-v1.0.0';
const STATIC_CACHE = 'barbershop-static-v1';
const DYNAMIC_CACHE = 'barbershop-dynamic-v1';

// Arquivos para cache estático
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/lucide/0.263.1/lucide.min.js'
];

// URLs da API para cache dinâmico
const API_URLS = [
  '/api/auth/me',
  '/api/appointments',
  '/api/barbers',
  '/api/services'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error('[SW] Error caching static files:', error);
      })
  );
  
  // Força a ativação imediata
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Remove caches antigos
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Assume controle de todas as páginas
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Estratégia Cache First para arquivos estáticos
  if (STATIC_FILES.some(file => request.url.includes(file))) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
    return;
  }
  
  // Estratégia Network First para APIs
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone a resposta para cache
          const responseClone = response.clone();
          
          // Cache apenas respostas bem-sucedidas
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Fallback para cache em caso de erro de rede
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }
              
              // Resposta offline personalizada para APIs
              return new Response(
                JSON.stringify({
                  error: 'Offline',
                  message: 'Você está offline. Alguns dados podem estar desatualizados.',
                  cached: true
                }),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }
  
  // Estratégia Stale While Revalidate para outras requisições
  event.respondWith(
    caches.open(DYNAMIC_CACHE)
      .then((cache) => {
        return cache.match(request)
          .then((cachedResponse) => {
            const fetchPromise = fetch(request)
              .then((networkResponse) => {
                // Atualiza o cache com a nova resposta
                if (networkResponse.status === 200) {
                  cache.put(request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(() => {
                // Retorna resposta em cache se a rede falhar
                return cachedResponse;
              });
            
            // Retorna cache imediatamente se disponível, senão aguarda rede
            return cachedResponse || fetchPromise;
          });
      })
  );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sincronizar dados pendentes
      syncPendingData()
    );
  }
});

// Notificações push
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do BarberShop',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('BarberShop', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Abrir a aplicação
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Função para sincronizar dados pendentes
async function syncPendingData() {
  try {
    // Buscar dados pendentes do IndexedDB
    const pendingData = await getPendingData();
    
    if (pendingData.length > 0) {
      console.log('[SW] Syncing pending data:', pendingData.length);
      
      // Enviar dados pendentes para o servidor
      for (const data of pendingData) {
        try {
          await fetch(data.url, {
            method: data.method,
            headers: data.headers,
            body: data.body
          });
          
          // Remover do IndexedDB após sucesso
          await removePendingData(data.id);
        } catch (error) {
          console.error('[SW] Error syncing data:', error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Error in background sync:', error);
  }
}

// Função para buscar dados pendentes (placeholder)
async function getPendingData() {
  // Implementar busca no IndexedDB
  return [];
}

// Função para remover dados pendentes (placeholder)
async function removePendingData(id) {
  // Implementar remoção do IndexedDB
  console.log('[SW] Removing pending data:', id);
}

// Limpar caches antigos periodicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded successfully');
