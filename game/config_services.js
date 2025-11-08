/**
 * CONFIGURACIÓN DE SERVICIOS CLOUD - AGROVERSE
 * URLs de los microservicios desplegados en Google Cloud Run
 */

// Configuración de servicios (actualizar después del deployment)
window.CONFIG = {
  // Servicio principal de base de datos (CRUD)
  DATABASE_SERVICE_URL: 'https://agroverse-database.run.app',
  
  // Servicio meteorológico (NASA POWER + Open-Meteo)
  WEATHER_SERVICE_URL: 'https://agroverse-weather.run.app',
  
  // Servicio de procesamiento de imágenes satelitales (Google Earth Engine)
  SATELLITE_SERVICE_URL: 'https://agroverse-image-processing.run.app',
  
  // Servicio de predicciones ML (heladas, sequías, plagas)
  PREDICTIONS_SERVICE_URL: 'https://agroverse-predictions.run.app',
  
  // Servicio Gemini + RAG (asistente agronómico)
  GEMINI_SERVICE_URL: 'https://agroverse-gemini-rag.run.app',
  
  // Configuración regional
  GCP_PROJECT_ID: 'agroverse-hackathon-2025',
  GCP_REGION: 'us-central1',
  
  // Modo de funcionamiento
  OFFLINE_MODE: localStorage.getItem('agroverse_mode') === 'offline',
  
  // Opciones de rendimiento
  ENABLE_SATELLITE_AUTO_REFRESH: true,
  SATELLITE_REFRESH_INTERVAL_DAYS: 3,
  
  ENABLE_PREDICTIONS_AUTO_CHECK: true,
  PREDICTIONS_CHECK_INTERVAL_HOURS: 12,
  
  // Cache
  CACHE_ENABLED: true,
  CACHE_DURATION_MINUTES: 60,
  
  // Timeouts (ms)
  API_TIMEOUT: 30000, // 30 segundos
  GEMINI_TIMEOUT: 60000, // 60 segundos
  SATELLITE_TIMEOUT: 90000, // 90 segundos
};

/**
 * Obtener URL del servicio con fallback local
 * @param {string} serviceName - Nombre del servicio
 * @returns {string} - URL del servicio
 */
window.getServiceUrl = function(serviceName) {
  if (window.CONFIG.OFFLINE_MODE) {
    console.log(`[CONFIG] Modo offline activado - usando fallbacks para ${serviceName}`);
    return null; // Los servicios manejarán el fallback
  }
  
  const serviceUrls = {
    'database': window.CONFIG.DATABASE_SERVICE_URL,
    'weather': window.CONFIG.WEATHER_SERVICE_URL,
    'satellite': window.CONFIG.SATELLITE_SERVICE_URL,
    'predictions': window.CONFIG.PREDICTIONS_SERVICE_URL,
    'gemini': window.CONFIG.GEMINI_SERVICE_URL
  };
  
  return serviceUrls[serviceName] || null;
};

/**
 * Verificar estado de los servicios
 * @returns {Promise<Object>} - Estado de cada servicio
 */
window.checkServicesHealth = async function() {
  const services = ['database', 'weather', 'satellite', 'predictions', 'gemini'];
  const healthStatus = {};
  
  for (const service of services) {
    const url = window.getServiceUrl(service);
    if (!url) {
      healthStatus[service] = { status: 'offline', mode: 'local' };
      continue;
    }
    
    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        healthStatus[service] = { status: 'healthy', ...data };
      } else {
        healthStatus[service] = { status: 'unhealthy', code: response.status };
      }
    } catch (error) {
      healthStatus[service] = { status: 'error', error: error.message };
    }
  }
  
  return healthStatus;
};

/**
 * Mostrar panel de estado de servicios (para debugging)
 */
window.showServicesStatus = async function() {
  console.log('🔍 Verificando estado de servicios AgroVerse...');
  const status = await window.checkServicesHealth();
  
  console.table(status);
  
  const allHealthy = Object.values(status).every(s => s.status === 'healthy' || s.status === 'offline');
  
  if (allHealthy) {
    console.log('✅ Todos los servicios están operativos');
  } else {
    console.warn('⚠️ Algunos servicios presentan problemas');
  }
  
  return status;
};

// Cargar configuración al iniciar
console.log('🌾 AgroVerse - Configuración de servicios cargada');
console.log(`📍 Región: ${window.CONFIG.GCP_REGION}`);
console.log(`🔵 Modo: ${window.CONFIG.OFFLINE_MODE ? 'Offline' : 'Online'}`);

// Verificar servicios en desarrollo (comentar en producción)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('🔧 Entorno de desarrollo detectado');
  setTimeout(() => {
    window.showServicesStatus().then(status => {
      console.log('Estado de servicios al iniciar:', status);
    });
  }, 2000);
}

