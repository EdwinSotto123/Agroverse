/**
 * ANIMAL SERVICE
 * Gestiona guardado de animales en PostgreSQL
 */

/**
 * Guarda animal/corral en la base de datos
 * @param {Object} animalData - Datos del animal del formulario
 * @param {Object} entity - Entidad del juego con coordenadas
 * @param {string} animalType - Tipo de animal (sheep, pig, chicken, cow, etc.)
 * @returns {Promise<{animal_id}>}
 */
export async function saveAnimalToDatabase(animalData, entity, animalType = 'animal') {
  try {
    // Obtener user_id de la sesión
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      console.warn('[ANIMAL SERVICE] No user_id found. Skipping database save.');
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
      console.log('[ANIMAL SERVICE] Coordenadas calculadas: X=', coordX, 'Y=', coordY);
    }

    // Preparar datos del animal para la BD
    const animalDBData = {
      user_id: userId,
      tipo_animal: animalType, // sheep, pig, chicken, cow, etc.
      
      // Cantidad
      cantidad: parseInt(animalData.count) || 1,
      
      // Ubicación
      ubicacion_texto: animalData.location || null,
      latitud: animalData.geo?.lat || null,
      longitud: animalData.geo?.lon || null,
      
      // Coordenadas del juego
      coordenada_x: coordX,
      coordenada_y: coordY,
      
      // Información básica
      uso_animal: animalData.usage || null, // Producción, reproducción, trabajo, etc.
      raza_animal: animalData.breed || null,
      edad_promedio: animalData.age || null,
      estado_salud: animalData.health || null,
      
      // Infraestructura
      sistema_alojamiento: animalData.housing || null,
      
      // Salud y reproducción
      estado_vacunacion: animalData.vaccination || null,
      metodo_reproduccion: animalData.reproduction || null,
      manejo_veterinario: animalData.veterinaryCare || null,
      
      // Producción
      produccion_esperada: animalData.production || null,
      
      // Alimentación
      tipo_alimentacion: animalData.feedType || null,
      detalles_alimentacion: animalData.feedDetails || null,
      fuentes_agua: JSON.stringify(animalData.waterSources || []),
      
      // Sanidad
      enfermedades_comunes: animalData.diseases || null,
      
      // Certificaciones
      certificaciones: JSON.stringify(animalData.certifications || []),
      
      // Notas y desafíos
      desafios_principales: animalData.challenges || null,
      notas_adicionales: animalData.notes || null
    };

    console.log('[ANIMAL SERVICE] 💾 Guardando animal en BD:', animalDBData);

    // Guardar en la base de datos
    const response = await fetch(`${API_URL}/animales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(animalDBData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('[ANIMAL SERVICE] ✅ Animal guardado exitosamente:', result);

    // Mostrar notificación
    showAnimalNotification(animalType, animalData.count || 1);

    return {
      success: true,
      animal_id: result.animal_id,
      message: result.message
    };

  } catch (error) {
    console.error('[ANIMAL SERVICE] ❌ Error al guardar animal:', error);
    
    // Mostrar error al usuario
    import('../view/render.js').then(m => {
      m.displayMessageToAlertBox(`Error al guardar ${animalType}: ${error.message}`);
    });

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Muestra notificación de animal guardado
 */
function showAnimalNotification(animalType, count) {
  const animalNames = {
    'sheep': 'ovejas',
    'pig': 'cerdos',
    'chicken': 'gallinas',
    'cow': 'vacas',
    'goat': 'cabras',
    'rabbit': 'conejos',
    'duck': 'patos',
    'horse': 'caballos'
  };

  const animalName = animalNames[animalType] || 'animales';
  const emoji = {
    'sheep': '🐑',
    'pig': '🐷',
    'chicken': '🐔',
    'cow': '🐄',
    'goat': '🐐',
    'rabbit': '🐰',
    'duck': '🦆',
    'horse': '🐴'
  }[animalType] || '🐾';

  import('../view/render.js').then(m => {
    m.displayMessageToAlertBox(
      `${emoji} Corral guardado: ${count} ${animalName} registrados en la base de datos`
    );
  });
}

/**
 * Carga animales del usuario desde la base de datos
 */
export async function loadAnimalsFromDatabase() {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      console.warn('[ANIMAL SERVICE] No user_id found. Cannot load animals.');
      return [];
    }

    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';

    const response = await fetch(`${API_URL}/animales?user_id=${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('[ANIMAL SERVICE] 🐾 Animales cargados:', result.data?.length || 0);

    return result.data || [];

  } catch (error) {
    console.error('[ANIMAL SERVICE] ❌ Error al cargar animales:', error);
    return [];
  }
}

/**
 * Actualiza datos de un animal existente
 */
export async function updateAnimalInDatabase(animalId, updateData) {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      return { success: false, error: 'No session' };
    }

    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';

    const response = await fetch(`${API_URL}/animales/${animalId}`, {
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
    console.log('[ANIMAL SERVICE] ✅ Animal actualizado:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('[ANIMAL SERVICE] ❌ Error al actualizar animal:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina un animal de la base de datos
 */
export async function deleteAnimalFromDatabase(animalId) {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      return { success: false, error: 'No session' };
    }

    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';

    const response = await fetch(`${API_URL}/animales/${animalId}?user_id=${userId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('[ANIMAL SERVICE] 🗑️ Animal eliminado:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('[ANIMAL SERVICE] ❌ Error al eliminar animal:', error);
    return { success: false, error: error.message };
  }
}
