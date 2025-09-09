/**
 * Service Worker for PWA functionality
 */

const CACHE_VERSION = 'flip-clock-v1.0.0';
const CACHE_NAME = `flip-clock-${CACHE_VERSION}`;

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/css/base.css',
  '/src/css/theme.css',
  '/src/css/flip.css',
  '/src/js/main.js',
  '/src/js/clock.js',
  '/src/js/renderer.js',
  '/src/js/sound.js',
  '/src/js/settings.js',
  '/src/js/theme.js',
  '/src/js/timezone.js',
  '/src/js/pwa.js',
  '/src/data/timezones.json',
  '/icons/192.png',
  '/icons/512.png',
  '/audio/tick.mp3'
];

// Google Fonts cache
const FONT_CACHE = 'flip-clock-fonts-v1';

/**
 * Install event - cache static files
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static files...');
        return cache.addAll(STATIC_FILES.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log('Static files cached successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static files:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName.startsWith('flip-clock-') && cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - serve cached files or fetch from network
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method === 'GET') {
    if (isStaticFile(url)) {
      // Static files: Cache first, fallback to network
      event.respondWith(cacheFirst(request));
    } else if (isGoogleFont(url)) {
      // Google Fonts: Stale while revalidate
      event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    } else if (isNavigationRequest(request)) {
      // Navigation: Network first, fallback to cached index.html
      event.respondWith(navigationHandler(request));
    } else {
      // Other requests: Network first
      event.respondWith(networkFirst(request));
    }
  }
});

/**
 * Check if URL is a static file we want to cache
 */
function isStaticFile(url) {
  return STATIC_FILES.some(file => {
    const staticUrl = new URL(file, self.location.origin);
    return url.pathname === staticUrl.pathname;
  });
}

/**
 * Check if URL is a Google Font
 */
function isGoogleFont(url) {
  return url.hostname === 'fonts.googleapis.com' || 
         url.hostname === 'fonts.gstatic.com';
}

/**
 * Check if request is a navigation request
 */
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

/**
 * Cache first strategy
 */
async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first failed:', error);
    throw error;
  }
}

/**
 * Stale while revalidate strategy
 */
async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Fetch in background to update cache
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });
    
    // Return cached version immediately if available
    return cachedResponse || await fetchPromise;
  } catch (error) {
    console.error('Stale while revalidate failed:', error);
    throw error;
  }
}

/**
 * Network first strategy
 */
async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Fallback to cache if network fails
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Navigation handler with offline fallback
 */
async function navigationHandler(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Fallback to cached index.html for offline support
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match('/index.html') || 
                          await cache.match('/');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a basic offline page if nothing is cached
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Flip Clock - Offline</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #0b0f14; 
            color: #e6f0ff; 
          }
        </style>
      </head>
      <body>
        <h1>Flip Clock</h1>
        <p>You are offline. Please check your internet connection.</p>
        <p><button onclick="location.reload()">Try Again</button></p>
      </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

/**
 * Handle messages from the main app
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_VERSION });
        break;
        
      default:
        console.log('Unknown message type:', event.data.type);
    }
  }
});

/**
 * Handle sync events for background sync
 */
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'settings-sync') {
    // Could sync settings changes when back online
    event.waitUntil(syncSettings());
  }
});

/**
 * Sync settings (placeholder for future implementation)
 */
async function syncSettings() {
  console.log('Syncing settings...');
  // Implementation would depend on backend requirements
}