/**
 * WAREHOUSE SERVICE
 * Gestiona guardado de almacenes (alimentos y materiales) en PostgreSQL
 */

/**
 * Guarda almacén en la base de datos
 * @param {Object} warehouseData - Datos del almacén del formulario
 * @param {Object} entity - Entidad del juego con coordenadas
 * @param {string} kind - Tipo de almacén ('alimentos' | 'materiales')
 * @returns {Promise<{warehouse_id}>}
 */
export async function saveWarehouseToDatabase(warehouseData, entity, kind = 'alimentos') {
  try {
    // Obtener user_id de la sesión
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      console.warn('[WAREHOUSE SERVICE] No user_id found. Skipping database save.');
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
      console.log('[WAREHOUSE SERVICE] Coordenadas calculadas: X=', coordX, 'Y=', coordY);
    }

    // Preparar datos del almacén para la BD
    const warehouseDBData = {
      user_id: userId,
      tipo_almacen: kind, // 'alimentos' | 'materiales'
      
      // Capacidad
      capacidad: warehouseData.capacity || null,
      capacidad_unidad: warehouseData.capacityUnit || 'kg',
      
      // Ubicación
      ubicacion_texto: warehouseData.location || null,
      latitud: warehouseData.geo?.lat || null,
      longitud: warehouseData.geo?.lon || null,
      direccion_completa: warehouseData.geo?.display_name || null,
      
      // Coordenadas del juego
      coordenada_x: coordX,
      coordenada_y: coordY,
      
      // Metadata
      fecha_registro: new Date().toISOString()
    };

    // Campos específicos según tipo de almacén
    if (kind === 'alimentos') {
      warehouseDBData.cultivos_almacenados = warehouseData.crops || null;
      warehouseDBData.principales_problemas = warehouseData.issues || null;
      warehouseDBData.control_temperatura = warehouseData.temperatureControl || null;
      warehouseDBData.sistema_ventilacion = warehouseData.ventilation || null;
      warehouseDBData.control_humedad = warehouseData.humidityControl || null;
      warehouseDBData.sistema_refrigeracion = warehouseData.refrigeration || null;
    } else if (kind === 'materiales') {
      warehouseDBData.materiales_almacenados = warehouseData.materials || null;
      warehouseDBData.almacena_fertilizantes = warehouseData.fertilizers || null;
      warehouseDBData.almacena_pesticidas = warehouseData.pesticides || null;
      warehouseDBData.almacena_semillas = warehouseData.seeds || null;
      warehouseDBData.principales_problemas = warehouseData.issues || null;
      warehouseDBData.medidas_seguridad = warehouseData.security || null;
    }

    console.log('[WAREHOUSE SERVICE] 💾 Guardando almacén en BD:', warehouseDBData);

    // Determinar endpoint según tipo (alimentos vs materiales)
    const endpoint = kind === 'alimentos' ? 'almacen_alimentos' : 'almacen_materiales';

    // Guardar en la base de datos
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(warehouseDBData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('[WAREHOUSE SERVICE] ✅ Almacén guardado exitosamente:', result);

    // Mostrar notificación
    showWarehouseNotification(kind, warehouseData.capacity);

    return {
      success: true,
      warehouse_id: result.warehouse_id,
      message: result.message
    };

  } catch (error) {
    console.error('[WAREHOUSE SERVICE] ❌ Error al guardar almacén:', error);
    
    // Mostrar error al usuario
    import('../view/render.js').then(m => {
      m.displayMessageToAlertBox(`Error al guardar almacén: ${error.message}`);
    });

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Muestra notificación de almacén guardado
 */
function showWarehouseNotification(kind, capacity) {
  const typeNames = {
    'alimentos': '🌾 Almacén de Alimentos',
    'materiales': '🔧 Almacén de Materiales'
  };

  const typeName = typeNames[kind] || '🏪 Almacén';
  const capacityText = capacity ? ` (${capacity})` : '';

  import('../view/render.js').then(m => {
    m.displayMessageToAlertBox(
      `${typeName} guardado exitosamente${capacityText}`
    );
  });
}

/**
 * Carga almacenes del usuario desde la base de datos
 */
export async function loadWarehousesFromDatabase(kind = null) {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      console.warn('[WAREHOUSE SERVICE] No user_id found. Cannot load warehouses.');
      return [];
    }

    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';

    // Cargar ambos tipos de almacenes o filtrar por tipo
    let allWarehouses = [];
    
    if (!kind || kind === 'alimentos') {
      const responseAlimentos = await fetch(`${API_URL}/almacen_alimentos?user_id=${userId}`);
      if (responseAlimentos.ok) {
        const resultAlimentos = await responseAlimentos.json();
        allWarehouses = allWarehouses.concat(resultAlimentos.data || []);
      }
    }
    
    if (!kind || kind === 'materiales') {
      const responseMateriales = await fetch(`${API_URL}/almacen_materiales?user_id=${userId}`);
      if (responseMateriales.ok) {
        const resultMateriales = await responseMateriales.json();
        allWarehouses = allWarehouses.concat(resultMateriales.data || []);
      }
    }
    
    console.log('[WAREHOUSE SERVICE] 🏪 Almacenes cargados:', allWarehouses.length);

    return allWarehouses;

  } catch (error) {
    console.error('[WAREHOUSE SERVICE] ❌ Error al cargar almacenes:', error);
    return [];
  }
}

/**
 * Actualiza datos de un almacén existente
 */
export async function updateWarehouseInDatabase(warehouseId, updateData) {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      return { success: false, error: 'No session' };
    }

    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';

    // Determinar tabla según tipo de almacén
    // Nota: Tu backend actual no tiene UPDATE para almacenes, solo GET/POST
    // Este endpoint podría necesitar implementarse en el backend
    const endpoint = updateData.tipo_almacen === 'alimentos' ? 'almacen_alimentos' : 'almacen_materiales';

    const response = await fetch(`${API_URL}/${endpoint}/${warehouseId}`, {
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
    console.log('[WAREHOUSE SERVICE] ✅ Almacén actualizado:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('[WAREHOUSE SERVICE] ❌ Error al actualizar almacén:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina un almacén de la base de datos
 */
export async function deleteWarehouseFromDatabase(warehouseId) {
  try {
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    if (!userId) {
      return { success: false, error: 'No session' };
    }

    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';

    // Nota: Tu backend actual no tiene DELETE para almacenes
    // Este endpoint podría necesitar implementarse
    // Por ahora intentamos con ambas tablas
    const endpoints = ['almacen_alimentos', 'almacen_materiales'];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_URL}/${endpoint}/${warehouseId}?user_id=${userId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('[WAREHOUSE SERVICE] 🗑️ Almacén eliminado:', result);
          return { success: true, data: result };
        }
      } catch (e) {
        // Continuar con el siguiente endpoint
      }
    }
    
    throw new Error('Almacén no encontrado en ninguna tabla');

  } catch (error) {
    console.error('[WAREHOUSE SERVICE] ❌ Error al eliminar almacén:', error);
    return { success: false, error: error.message };
  }
}
