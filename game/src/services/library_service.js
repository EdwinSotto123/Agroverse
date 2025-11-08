/**
 * LIBRARY SERVICE
 * Gestiona guardado de bibliotecas (conocimiento del agricultor) en PostgreSQL
 */

/**
 * Guarda biblioteca/conocimiento del agricultor en la base de datos
 * @param {Object} libraryData - Datos del conocimiento del formulario
 * @param {Object} entity - Entidad del juego con coordenadas
 * @returns {Promise<{library_id}>}
 */
export async function saveLibraryToDatabase(libraryData, entity) {
  try {
    // Obtener user_id de la sesión
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      console.warn('[LIBRARY SERVICE] No user_id found. Skipping database save.');
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
      console.log('[LIBRARY SERVICE] Coordenadas calculadas: X=', coordX, 'Y=', coordY);
    }

    // Preparar datos de la biblioteca para la BD
    const libraryDBData = {
      user_id: userId,
      
      // Coordenadas del juego
      coordenada_x: coordX,
      coordenada_y: coordY,
      
      // Información básica
      nivel_experiencia: libraryData.level || null,
      anos_experiencia: parseInt(libraryData.yearsExperience) || 0,
      tipo_educacion: libraryData.education || null,
      
      // Idiomas y comunicación
      idioma_nativo: libraryData.nativeLanguage || null,
      otros_idiomas: libraryData.otherLanguages || null,
      nivel_alfabetizacion: libraryData.literacy || null,
      acceso_tecnologia: JSON.stringify(libraryData.techAccess || []),
      
      // Técnicas agrícolas
      tecnicas_agricolas: JSON.stringify(libraryData.techniques || []),
      otras_tecnicas: libraryData.otherTechniques || null,
      
      // Conocimientos específicos
      conocimiento_suelos: libraryData.soilKnowledge || null,
      conocimiento_plagas: libraryData.pestKnowledge || null,
      conocimiento_clima: libraryData.climateKnowledge || null,
      variedades_cultivos: libraryData.cropVarieties || null,
      conocimiento_postcosecha: libraryData.postHarvestKnowledge || null,
      
      // Experiencia y especialización
      cultivos_principales: libraryData.mainCrops || null,
      experiencia_animales: libraryData.animalExperience || null,
      conocimiento_herramientas: libraryData.toolsKnowledge || null,
      certificaciones: libraryData.certifications || null,
      logros: libraryData.achievements || null,
      
      // Conocimientos tradicionales
      sabiduria_ancestral: libraryData.ancestralKnowledge || null,
      plantas_medicinales: libraryData.medicinalPlants || null,
      semillas_nativas: libraryData.nativeSeeds || null,
      
      // Recursos y redes
      asociaciones: libraryData.associations || null,
      fuentes_informacion: JSON.stringify(libraryData.infoSources || []),
      dispuesto_compartir: libraryData.willingToShare || null,
      necesidades_aprendizaje: libraryData.learningNeeds || null
    };

    console.log('[LIBRARY SERVICE] 💾 Guardando conocimiento en BD:', libraryDBData);

    // Guardar en la base de datos
    const response = await fetch(`${API_URL}/biblioteca`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(libraryDBData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('[LIBRARY SERVICE] ✅ Conocimiento guardado exitosamente:', result);

    // Mostrar notificación
    showLibraryNotification(libraryData.level, libraryData.yearsExperience);

    return {
      success: true,
      library_id: result.library_id,
      message: result.message
    };

  } catch (error) {
    console.error('[LIBRARY SERVICE] ❌ Error al guardar conocimiento:', error);
    
    // Mostrar error al usuario
    import('../view/render.js').then(m => {
      m.displayMessageToAlertBox(`Error al guardar biblioteca: ${error.message}`);
    });

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Muestra notificación de biblioteca guardada
 */
function showLibraryNotification(level, years) {
  const levelEmojis = {
    'Principiante': '📖',
    'Intermedio': '📚',
    'Avanzado': '🎓',
    'Experto': '🏆',
    'Maestro': '👑'
  };

  const emoji = levelEmojis[level] || '📚';
  const yearsText = years ? ` (${years} años)` : '';

  import('../view/render.js').then(m => {
    m.displayMessageToAlertBox(
      `${emoji} Biblioteca guardada: Conocimiento nivel ${level}${yearsText} registrado`
    );
  });
}

/**
 * Carga bibliotecas del usuario desde la base de datos
 */
export async function loadLibrariesFromDatabase() {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      console.warn('[LIBRARY SERVICE] No user_id found. Cannot load libraries.');
      return [];
    }

    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';

    // Tu backend usa GET /biblioteca/<user_id>
    const response = await fetch(`${API_URL}/biblioteca/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('[LIBRARY SERVICE] 📚 Biblioteca cargada');

    // Tu backend retorna un solo objeto, no un array
    return result.data ? [result.data] : [];

  } catch (error) {
    console.error('[LIBRARY SERVICE] ❌ Error al cargar bibliotecas:', error);
    return [];
  }
}

/**
 * Actualiza datos de una biblioteca existente
 */
export async function updateLibraryInDatabase(libraryId, updateData) {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      return { success: false, error: 'No session' };
    }

    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';

    // Nota: Tu backend actual no tiene UPDATE para biblioteca
    // Este endpoint podría necesitar implementarse
    const response = await fetch(`${API_URL}/biblioteca/${libraryId}`, {
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
    console.log('[LIBRARY SERVICE] ✅ Biblioteca actualizada:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('[LIBRARY SERVICE] ❌ Error al actualizar biblioteca:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina una biblioteca de la base de datos
 */
export async function deleteLibraryFromDatabase(libraryId) {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      return { success: false, error: 'No session' };
    }

    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';

    // Nota: Tu backend actual no tiene DELETE para biblioteca
    // Este endpoint podría necesitar implementarse
    const response = await fetch(`${API_URL}/biblioteca/${libraryId}?user_id=${userId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('[LIBRARY SERVICE] 🗑️ Biblioteca eliminada:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('[LIBRARY SERVICE] ❌ Error al eliminar biblioteca:', error);
    return { success: false, error: error.message };
  }
}
