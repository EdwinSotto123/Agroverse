/**
 * WATER SOURCE SERVICE
 * Gestiona guardado de fuentes de agua (lagos, ríos, pozos) en PostgreSQL
 */

/**
 * Guarda fuente de agua en la base de datos
 * @param {Object} waterData - Datos de la fuente de agua del formulario
 * @param {Object} entity - Entidad del juego con coordenadas
 * @param {string} kind - Tipo de fuente ('lago' | 'rio' | 'pozo')
 * @returns {Promise<{water_id}>}
 */
export async function saveWaterSourceToDatabase(waterData, entity, kind = 'lago') {
  try {
    // Obtener user_id de la sesión
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      console.warn('[WATER SERVICE] No user_id found. Skipping database save.');
      return { success: false, error: 'No session' };
    }

    // Obtener API URL
    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';

    // Calcular coordenadas X,Y del mapa (casillas)
    let coordX = null;
    let coordY = null;
    if (entity.squares && entity.squares.length > 0) {
      const Map = await import('../game/map.js').then(m => m.default);
      const mapCols = Map.mapInstance?.squaresPerRow || Map.mapInstance?.cols || 100;
      const firstSquareIndex = entity.squares[0];
      coordX = firstSquareIndex % mapCols;
      coordY = Math.floor(firstSquareIndex / mapCols);
      console.log('[WATER SERVICE] Coordenadas calculadas: X=', coordX, 'Y=', coordY);
    }

    // Preparar datos de la fuente de agua para la BD
    const waterDBData = {
      user_id: userId,
      tipo_fuente: kind, // 'lago', 'rio', 'pozo'
      
      // Identificación
      nombre: waterData.name || null,
      
      // Ubicación
      ubicacion_texto: waterData.location || null,
      latitud: waterData.geo?.lat || null,
      longitud: waterData.geo?.lon || null,
      direccion_completa: waterData.geo?.display_name || null,
      
      // Coordenadas del juego
      coordenada_x: coordX,
      coordenada_y: coordY,
      
      // Uso
      descripcion_uso: waterData.usage || null,
      
      // Métodos de extracción/uso
      metodos_extraccion: JSON.stringify(waterData.methods || []),
      otros_metodos: waterData.otherMethods || null,
      
      // Metadata
      fecha_registro: new Date().toISOString()
    };

    console.log('[WATER SERVICE] 💾 Guardando fuente de agua en BD:', waterDBData);

    // Guardar en la base de datos
    const response = await fetch(`${API_URL}/fuentes_agua`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(waterDBData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('[WATER SERVICE] ✅ Fuente de agua guardada exitosamente:', result);

    // Mostrar notificación
    showWaterNotification(kind, waterData.name);

    return {
      success: true,
      water_id: result.water_id,
      message: result.message
    };

  } catch (error) {
    console.error('[WATER SERVICE] ❌ Error al guardar fuente de agua:', error);
    
    // Mostrar error al usuario
    import('../view/render.js').then(m => {
      m.displayMessageToAlertBox(`Error al guardar fuente de agua: ${error.message}`);
    });

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Muestra notificación de fuente de agua guardada
 */
function showWaterNotification(kind, name) {
  const typeInfo = {
    'lago': { emoji: '🏞️', label: 'Lago' },
    'rio': { emoji: '🌊', label: 'Río' },
    'pozo': { emoji: '🚰', label: 'Pozo' }
  };

  const info = typeInfo[kind] || { emoji: '💧', label: 'Fuente de agua' };
  const nameText = name ? `: ${name}` : '';

  import('../view/render.js').then(m => {
    m.displayMessageToAlertBox(
      `${info.emoji} ${info.label} guardado${nameText}`
    );
  });
}

/**
 * Carga fuentes de agua del usuario desde la base de datos
 */
export async function loadWaterSourcesFromDatabase(kind = null) {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      console.warn('[WATER SERVICE] No user_id found. Cannot load water sources.');
      return [];
    }

    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';

    const kindParam = kind ? `&tipo_fuente=${kind}` : '';
    const response = await fetch(`${API_URL}/fuentes_agua?user_id=${userId}${kindParam}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('[WATER SERVICE] 💧 Fuentes de agua cargadas:', result.data?.length || 0);

    return result.data || [];

  } catch (error) {
    console.error('[WATER SERVICE] ❌ Error al cargar fuentes de agua:', error);
    return [];
  }
}

/**
 * Actualiza datos de una fuente de agua existente
 */
export async function updateWaterSourceInDatabase(waterId, updateData) {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      return { success: false, error: 'No session' };
    }

    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';

    // Nota: Tu backend actual no tiene UPDATE para fuentes_agua
    // Este endpoint podría necesitar implementarse
    const response = await fetch(`${API_URL}/fuentes_agua/${waterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...updateData, user_id: userId })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('[WATER SERVICE] ✅ Fuente de agua actualizada:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('[WATER SERVICE] ❌ Error al actualizar fuente de agua:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina una fuente de agua de la base de datos
 */
export async function deleteWaterSourceFromDatabase(waterId) {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      return { success: false, error: 'No session' };
    }

    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';

    const response = await fetch(`${API_URL}/fuentes_agua/${waterId}?user_id=${userId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('[WATER SERVICE] 🗑️ Fuente de agua eliminada:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('[WATER SERVICE] ❌ Error al eliminar fuente de agua:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene estadísticas de fuentes de agua del usuario
 */
export async function getWaterSourcesStats() {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      return { success: false, error: 'No session' };
    }

    const allSources = await loadWaterSourcesFromDatabase();
    
    const stats = {
      total: allSources.length,
      por_tipo: {
        lagos: allSources.filter(s => s.tipo_fuente === 'lago').length,
        rios: allSources.filter(s => s.tipo_fuente === 'rio').length,
        pozos: allSources.filter(s => s.tipo_fuente === 'pozo').length
      },
      metodos_mas_usados: {}
    };

    // Analizar métodos más usados
    allSources.forEach(source => {
      try {
        const metodos = JSON.parse(source.metodos_extraccion || '[]');
        metodos.forEach(metodo => {
          stats.metodos_mas_usados[metodo] = (stats.metodos_mas_usados[metodo] || 0) + 1;
        });
      } catch (e) {
        // Ignorar errores de parsing
      }
    });

    console.log('[WATER SERVICE] 📊 Estadísticas de agua:', stats);
    return { success: true, data: stats };

  } catch (error) {
    console.error('[WATER SERVICE] ❌ Error al obtener estadísticas:', error);
    return { success: false, error: error.message };
  }
}
