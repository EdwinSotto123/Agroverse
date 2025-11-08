/**
 * Global Fetch Wrapper
 * Automatically adds ngrok-skip-browser-warning header to all fetch requests
 * This prevents 403 Forbidden errors from ngrok's anti-bot screen
 */

// Save original fetch
const originalFetch = window.fetch;

// Override global fetch
window.fetch = function(...args) {
  const [url, config = {}] = args;
  
  // Add ngrok header to all requests
  const newConfig = {
    ...config,
    headers: {
      ...config.headers,
      'ngrok-skip-browser-warning': 'true'
    }
  };
  
  // Log fetch for debugging (optional, comment out in production)
  if (window.location.hostname !== 'localhost') {
    console.log('[FETCH] Request to:', url);
  }
  
  return originalFetch(url, newConfig);
};

console.log('[FETCH WRAPPER] Ngrok 403 fix applied globally');
