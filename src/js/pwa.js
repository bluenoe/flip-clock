/**
 * PWA service worker registration
 */

/**
 * Register service worker for PWA functionality
 */
export async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available, notify user
              console.log('New version available. Refresh to update.');
              showUpdateNotification();
            } else {
              // Content is cached for offline use
              console.log('Content cached for offline use.');
            }
          }
        });
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  } else {
    console.log('Service Worker not supported');
  }
}

/**
 * Show update notification to user
 */
function showUpdateNotification() {
  // Simple notification - can be enhanced with custom UI
  if (confirm('A new version is available. Refresh to update?')) {
    window.location.reload();
  }
}

/**
 * Check if app is running as PWA
 * @returns {boolean} True if running as PWA
 */
export function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

/**
 * Show install prompt for PWA
 */
let deferredPrompt = null;

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('PWA install prompt available');
});

/**
 * Trigger PWA install prompt
 */
export async function showInstallPrompt() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    console.log('PWA install choice:', result.outcome);
    deferredPrompt = null;
  } else {
    console.log('PWA install prompt not available');
  }
}