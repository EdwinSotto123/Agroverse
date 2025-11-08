/**
 * CROP SERVICE
 * Gestiona guardado de cultivos en PostgreSQL + datos meteorológicos
 */

/**
 * Guarda cultivo en la       console.log('[CROP SERVICE] 📦 Datos a enviar:', weatherData);

      // Usar proxy de Vite para evitar problemas de CORS
      // /weather se redirige automáticamente a localhost:5000
      const WEATHER_URL = '/weather';

      try {
        console.log('[CROP SERVICE] 🌐 Llamando a:', WEATHER_URL);
        
        const weatherResponse = await fetch(WEATHER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(weatherData)
        });enera datos meteorológicos
 * @param {Object} cropData - Datos del cultivo del formulario
 * @param {Object} entity - Entidad del juego con coordenadas
 * @returns {Promise<{cultivo_id, weather_id}>}
 */
export async function saveCropToDatabase(cropData, entity) {
  try {
    // Obtener user_id de la sesión
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      console.warn('[CROP SERVICE] No user_id found. Skipping database save.');
      return { success: false, error: 'No session' };
    }

    // Obtener API URL
    const API_URL = window.location.hostname === 'localhost' 
      ? '/api' 
      : (import.meta?.env?.VITE_API_URL || '/api');

    // Calcular coordenadas X,Y del mapa (casillas)
    let coordX = null;
    let coordY = null;
    if (entity.squares && entity.squares.length > 0) {
      // Importar Map para obtener dimensiones del mapa
      const Map = await import('../game/map.js').then(m => m.default);
      const mapCols = Map.mapInstance?.squaresPerRow || Map.mapInstance?.cols || 100;
      const firstSquareIndex = entity.squares[0];
      coordX = firstSquareIndex % mapCols;
      coordY = Math.floor(firstSquareIndex / mapCols);
      console.log('[CROP SERVICE] Coordenadas calculadas: X=', coordX, 'Y=', coordY, 'Index=', firstSquareIndex, 'Cols=', mapCols);
    }

    // Preparar datos del cultivo para la BD
    const cultivoData = {
      user_id: userId,
      nombre_cultivo: cropData.cropName || 'Cultivo sin nombre',
      producto_sembrado: cropData.variety || null,
      
      // Dimensiones (del canvas del juego)
      tamano_ancho: cropData.w || null,
      tamano_alto: cropData.h || null,
      tamano_real_valor: cropData.areaMeasure?.value || null,
      tamano_real_unidad: cropData.areaMeasure?.unit || null,
      
      // Coordenadas del juego (casillas)
      coordenada_x: coordX,
      coordenada_y: coordY,
      
      // Coordenadas GPS (del mapa)
      latitud: cropData.geo?.lat || null,
      longitud: cropData.geo?.lon || null,
      ubicacion_texto: cropData.geo?.display_name || null,
      
      // Información del cultivo
      variedad_cultivo: cropData.variety || null,
      tipo_cultivo: cropData.cropType || null,
      origen_semillas: cropData.seedOrigin || null,
      
      // Fechas
      fecha_plantado: cropData.plantedAt || null,
      fecha_esperada_cosecha: cropData.harvestAt || null,
      
      // Suelo
      tipo_suelo: cropData.soilType || null,
      preparacion_suelo: cropData.soilPreparation || null,
      
      // Siembra
      densidad_siembra: cropData.density || null,
      rendimiento_esperado: cropData.expectedYield || null,
      cultivo_anterior: cropData.previousCrop || null,
      cultivos_asociados: cropData.companionPlants || null,
      
      // Manejo
      sistema_riego: cropData.irrigation || null,
      tipo_abono: cropData.fertilization || null,
      uso_cobertura: cropData.mulching || null,
      practicas_organicas: JSON.stringify(cropData.organicPractices || []),
      
      // Problemas
      enfermedades_plagas: cropData.pests || null,
      desafios_especificos: cropData.challenges || null,
      notas_adicionales: cropData.notes || null
    };

    console.log('[CROP SERVICE] Guardando cultivo en BD:', cultivoData);

    // 1. Guardar cultivo en la tabla cultivos
    const cropResponse = await fetch(`${API_URL}/cultivos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('agroverse_token') || ''}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(cultivoData)
    });

    const cropResult = await cropResponse.json();

    if (!cropResult.success) {
      throw new Error(cropResult.error || 'Error al guardar cultivo');
    }

    const cultivoId = cropResult.cultivo_id;
    console.log('[CROP SERVICE] ✅ Cultivo guardado. ID:', cultivoId);

    // 2. Generar datos meteorológicos (solo si hay coordenadas GPS)
    let weatherId = null;
    
    if (cropData.geo?.lat && cropData.geo?.lon) {
      console.log('[CROP SERVICE] 🌤️ Generando datos meteorológicos...');
      console.log('[CROP SERVICE] 📍 Coordenadas:', { lat: cropData.geo.lat, lon: cropData.geo.lon });
      
      const weatherData = {
        user_id: userId,
        cultivo_id: cultivoId,
        latitude: cropData.geo.lat,
        longitude: cropData.geo.lon,
        days_historical: 7,  // 1 día histórico
        days_forecast: 7     // 7 días de pronóstico
      };

      console.log('[CROP SERVICE] 📦 Datos a enviar:', weatherData);

      // Usar ruta relativa /weather que se maneja por proxy
      // En desarrollo: Vite proxy redirige a localhost:5000
      // En producción: Necesitas configurar proxy/reverse proxy a servidor weather
      const WEATHER_URL = '/weather';

      try {
        console.log('[CROP SERVICE] 🌐 Llamando a:', WEATHER_URL);
        
        const weatherResponse = await fetch(WEATHER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(weatherData)
        });

        console.log('[CROP SERVICE] 📡 Respuesta recibida, status:', weatherResponse.status);

        if (!weatherResponse.ok) {
          const errorText = await weatherResponse.text();
          console.error('[CROP SERVICE] ❌ Error HTTP:', weatherResponse.status, errorText);
          throw new Error(`HTTP ${weatherResponse.status}: ${errorText}`);
        }

        const weatherResult = await weatherResponse.json();
        console.log('[CROP SERVICE] 📊 Resultado completo:', weatherResult);

        if (weatherResult.success) {
          weatherId = weatherResult.weather_id;
          console.log('[CROP SERVICE] ✅ Datos meteorológicos creados. ID:', weatherId);
          
          // Mostrar notificación al usuario
          showCropNotification('🌤️ Datos meteorológicos generados correctamente', 'success');
        } else {
          console.error('[CROP SERVICE] ❌ Error al crear datos meteorológicos:', weatherResult.error);
          showCropNotification('⚠️ Error al generar datos meteorológicos: ' + weatherResult.error, 'warning');
        }
      } catch (weatherError) {
        console.error('[CROP SERVICE] ❌ Error completo al llamar servidor meteorológico:', weatherError);
        console.error('[CROP SERVICE] ❌ Stack:', weatherError.stack);
        
        // Mostrar error al usuario
        showCropNotification('⚠️ Servidor meteorológico no disponible. Cultivo guardado sin datos climáticos.', 'warning');
        
        // No bloquear el guardado del cultivo si falla el clima
      }
    } else {
      console.log('[CROP SERVICE] ℹ️ Sin coordenadas GPS, omitiendo datos meteorológicos');
      showCropNotification('ℹ️ Cultivo guardado (sin coordenadas GPS para datos meteorológicos)', 'info');
    }

    // Retornar IDs para vincular con la entidad del juego
    return {
      success: true,
      cultivo_id: cultivoId,
      weather_id: weatherId,
      message: '✅ Cultivo guardado correctamente'
    };

  } catch (error) {
    console.error('[CROP SERVICE] ❌ Error al guardar cultivo:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Actualiza cultivo existente en la BD
 * @param {number} cultivoId - ID del cultivo
 * @param {Object} cropData - Datos actualizados
 */
export async function updateCropInDatabase(cultivoId, cropData) {
  try {
    const API_URL = window.location.hostname === 'localhost' 
      ? '/api' 
      : (import.meta?.env?.VITE_API_URL || '/api');

    // Mapear datos del formulario a estructura de BD
    const cultivoData = {
      nombre_cultivo: cropData.cropName || 'Cultivo sin nombre',
      producto_sembrado: cropData.variety || null,
      
      // Dimensiones
      tamano_ancho: cropData.w || null,
      tamano_alto: cropData.h || null,
      tamano_real_valor: cropData.areaMeasure?.value || null,
      tamano_real_unidad: cropData.areaMeasure?.unit || null,
      
      // Coordenadas GPS
      latitud: cropData.geo?.lat || null,
      longitud: cropData.geo?.lon || null,
      ubicacion_texto: cropData.geo?.display_name || null,
      
      // Información del cultivo
      variedad_cultivo: cropData.variety || null,
      tipo_cultivo: cropData.cropType || null,
      origen_semillas: cropData.seedOrigin || null,
      
      // Fechas
      fecha_plantado: cropData.plantedAt || null,
      fecha_esperada_cosecha: cropData.harvestAt || null,
      
      // Suelo
      tipo_suelo: cropData.soilType || null,
      preparacion_suelo: cropData.soilPreparation || null,
      
      // Siembra
      densidad_siembra: cropData.density || null,
      rendimiento_esperado: cropData.expectedYield || null,
      cultivo_anterior: cropData.previousCrop || null,
      cultivos_asociados: cropData.companionPlants || null,
      
      // Manejo
      sistema_riego: cropData.irrigation || null,
      tipo_abono: cropData.fertilization || null,
      uso_cobertura: cropData.mulching || null,
      practicas_organicas: JSON.stringify(cropData.organicPractices || []),
      
      // Problemas
      enfermedades_plagas: cropData.pests || null,
      desafios_especificos: cropData.challenges || null,
      notas_adicionales: cropData.notes || null
    };

    console.log('[CROP SERVICE] Actualizando cultivo en BD:', cultivoData);

    const response = await fetch(`${API_URL}/cultivos/${cultivoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('agroverse_token') || ''}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(cultivoData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('[CROP SERVICE] ✅ Cultivo actualizado');
      return { success: true };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('[CROP SERVICE] ❌ Error al actualizar cultivo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Carga todos los cultivos del usuario desde la base de datos
 * @returns {Promise<Array>} Array de cultivos
 */
export async function loadCropsFromDatabase() {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      console.warn('[CROP SERVICE] No user_id found. Cannot load crops.');
      return [];
    }

    const API_URL = window.location.hostname === 'localhost' 
      ? '/api' 
      : (import.meta?.env?.VITE_API_URL || '/api');

    console.log('[CROP SERVICE] 📥 Cargando cultivos del usuario', userId);

    const response = await fetch(`${API_URL}/cultivos?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('agroverse_token') || ''}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    const result = await response.json();
    
    if (result.success && result.cultivos) {
      console.log('[CROP SERVICE] ✅ Cultivos cargados:', result.cultivos.length);
      return result.cultivos;
    } else {
      console.warn('[CROP SERVICE] ⚠️ No se encontraron cultivos');
      return [];
    }
  } catch (error) {
    console.error('[CROP SERVICE] ❌ Error al cargar cultivos:', error);
    return [];
  }
}

/**
 * Elimina cultivo de la BD
 * @param {number} cultivoId - ID del cultivo
 */
export async function deleteCropFromDatabase(cultivoId) {
  try {
    const API_URL = window.location.hostname === 'localhost' 
      ? '/api' 
      : (import.meta?.env?.VITE_API_URL || '/api');

    const response = await fetch(`${API_URL}/cultivos/${cultivoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('agroverse_token') || ''}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('[CROP SERVICE] ✅ Cultivo eliminado');
      return { success: true };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('[CROP SERVICE] ❌ Error al eliminar cultivo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Muestra mensaje de notificación al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: success, error, warning, info
 */
export function showCropNotification(message, type = 'info') {
  const colors = {
    success: { bg: '#4a8c3a', border: '#6fb36a' },
    error: { bg: '#c93a3a', border: '#ff6b6b' },
    warning: { bg: '#d4a017', border: '#ffcc00' },
    info: { bg: '#2d5a27', border: '#4a8c3a' }
  };
  
  const colorScheme = colors[type] || colors.info;
  
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colorScheme.bg};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-weight: bold;
    border: 2px solid ${colorScheme.border};
    animation: slideIn 0.3s ease-out;
    max-width: 350px;
  `;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    if (document.body.contains(messageDiv)) {
      messageDiv.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(messageDiv)) {
          document.body.removeChild(messageDiv);
        }
      }, 300);
    }
  }, 4000);
}
