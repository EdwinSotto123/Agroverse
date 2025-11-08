/**
 * CROP LOADER
 * Carga cultivos guardados desde la base de datos y los recrea en el mapa
 */

import { loadCropsFromDatabase } from '../services/crop_service.js';
import EntityStore from '../game/entity_store.js';
import Map from '../game/map.js';

/**
 * Carga y renderiza todos los cultivos guardados del usuario
 */
export async function loadAndRenderCrops() {
  try {
    console.log('[CROP LOADER] 🔄 Iniciando carga de cultivos...');

    const crops = await loadCropsFromDatabase();
    
    if (crops.length === 0) {
      console.log('[CROP LOADER] ℹ️ No hay cultivos para cargar');
      return;
    }

    console.log('[CROP LOADER] 📦 Cargando', crops.length, 'cultivos...');

    const mapElement = Map.map;
    if (!mapElement) {
      console.error('[CROP LOADER] ❌ Mapa no disponible');
      return;
    }

    // Obtener grid del mapa
    const squares = Array.from(mapElement.querySelectorAll('.square'));
    const mapWidth = Map.mapInstance?.squaresPerRow || Map.mapInstance?.cols || 100;
    const mapHeight = Map.mapInstance?.numRows || 50;
    
    console.log('[CROP LOADER] 🗺️ Dimensiones mapa:', {
      ancho: mapWidth,
      alto: mapHeight,
      totalCasillas: squares.length,
      esperadas: mapWidth * mapHeight
    });

    crops.forEach((crop, index) => {
      try {
        // Convertir datos de BD a formato de entity
        const entity = {
          type: 'crop-area',
          elementId: crop.producto_sembrado || 'crops',
          w: crop.tamano_ancho || 1,
          h: crop.tamano_alto || 1,
          cropName: crop.nombre_cultivo,
          cultivoId: crop.cultivo_id, // ID de la BD (para dashboard)
          cultivo_id: crop.cultivo_id, // Compatibilidad
          weatherId: crop.weather_id || null, // Para dashboard
          weather_id: crop.weather_id || null, // Compatibilidad
          
          // Ubicación
          geo: crop.latitud && crop.longitud ? {
            lat: crop.latitud,
            lon: crop.longitud,
            display_name: crop.ubicacion_texto
          } : null,
          
          // Información básica
          areaMeasure: crop.tamano_real_valor ? {
            value: crop.tamano_real_valor,
            unit: crop.tamano_real_unidad || 'm²'
          } : null,
          variety: crop.variedad_cultivo,
          cropType: crop.tipo_cultivo,
          seedOrigin: crop.origen_semillas,
          
          // Fechas
          plantedAt: crop.fecha_plantado,
          harvestAt: crop.fecha_esperada_cosecha,
          
          // Suelo
          soilType: crop.tipo_suelo,
          soilPreparation: crop.preparacion_suelo,
          
          // Siembra
          density: crop.densidad_siembra,
          expectedYield: crop.rendimiento_esperado,
          previousCrop: crop.cultivo_anterior,
          companionPlants: crop.cultivos_asociados,
          
          // Manejo
          irrigation: crop.sistema_riego,
          fertilization: crop.tipo_abono,
          mulching: crop.uso_cobertura,
          organicPractices: crop.practicas_organicas ? JSON.parse(crop.practicas_organicas) : [],
          
          // Problemas
          pests: crop.enfermedades_plagas,
          challenges: crop.desafios_especificos,
          notes: crop.notas_adicionales,
          
          // Coordenadas del mapa (casillas)
          squares: []
        };

        // Usar el mismo método que la casa: acceder por row y col directamente
        const startCol = crop.coordenada_x || 0;
        const startRow = crop.coordenada_y || 0;
        
        console.log(`[CROP LOADER] 📍 Cultivo "${crop.nombre_cultivo}" en posición:`, {
          col: startCol,
          row: startRow,
          ancho: entity.w,
          alto: entity.h
        });
        
        const coveredSquares = [];
        const coveredIndices = [];

        // Igual que la casa: acceder Map.map.children[row].children[col]
        for (let dy = 0; dy < entity.h; dy++) {
          for (let dx = 0; dx < entity.w; dx++) {
            const col = startCol + dx;
            const row = startRow + dy;
            
            // Validar que está dentro de los límites
            if (col < 0 || col >= mapWidth || row < 0 || row >= mapHeight) {
              console.warn(`[CROP LOADER] ⚠️ Coordenada fuera de límites: (col=${col}, row=${row})`);
              continue;
            }
            
            // Acceder al square igual que la casa
            const rowEl = mapElement.children[row];
            if (!rowEl) {
              console.warn(`[CROP LOADER] ⚠️ Fila ${row} no encontrada en mapa`);
              continue;
            }
            
            const square = rowEl.children[col];
            if (!square) {
              console.warn(`[CROP LOADER] ⚠️ Square no encontrado en (col=${col}, row=${row})`);
              continue;
            }
            
            // Calcular índice para compatibility
            const index = row * mapWidth + col;
            coveredIndices.push(index);
            coveredSquares.push(square);
          }
        }
        
        if (coveredSquares.length === 0) {
          console.error(`[CROP LOADER] ❌ No se pudieron obtener casillas para cultivo: ${crop.nombre_cultivo}`);
          return;
        }

        entity.squares = coveredIndices;
        
        console.log(`[CROP LOADER] ✓ ${coveredSquares.length} casillas obtenidas para "${crop.nombre_cultivo}"`);

        // Crear entity en EntityStore
        const storedEntity = EntityStore.create(entity);
        
        console.log(`[CROP LOADER] ✅ Entity creado (ID: ${storedEntity.id}) para cultivo "${crop.nombre_cultivo}"`);

        // Renderizar cultivo en el mapa usando squares directos
        // El cultivo aparecerá directamente en su etapa FINAL (con frutos)
        renderCropOnMapDirect(storedEntity, coveredSquares, entity.elementId);

      } catch (err) {
        console.error('[CROP LOADER] ❌ Error al cargar cultivo:', crop.nombre_cultivo, err);
      }
    });

    console.log('[CROP LOADER] ✅ Carga completada:', crops.length, 'cultivos renderizados');
    console.log('[CROP LOADER] 💡 Tip: Usa la herramienta de inspección para ver/editar cultivos');

  } catch (error) {
    console.error('[CROP LOADER] ❌ Error general al cargar cultivos:', error);
  }
}

/**
 * Renderiza un cultivo en el mapa usando referencias directas a squares
 * Versión simplificada: muestra cultivo en etapa final (con frutos)
 */
function renderCropOnMapDirect(entity, coveredSquares, elementId) {
  console.log(`[CROP LOADER] 🎨 Renderizando "${entity.cropName}" en ${coveredSquares.length} casillas`);
  
  // Obtener imagen del elemento EN SU ETAPA FINAL (con frutos)
  const imageName = elementId + '.png';
  const imagePath = `assets/image/${elementId}/${imageName}`;

  let renderedCount = 0;
  
  coveredSquares.forEach((square, i) => {
    if (!square) {
      console.warn(`[CROP LOADER] ⚠️ Square undefined en posición ${i}`);
      return;
    }

    // Vincular entity al square para inspección
    square.dataset.entityId = entity.id;

    // Solo la primera casilla muestra la imagen completa
    if (i === 0) {
      // Limpiar contenido previo
      square.innerHTML = '';

      // Crear imagen del cultivo DIRECTAMENTE en etapa final
      const img = document.createElement('img');
      img.src = imagePath;
      img.alt = entity.cropName || elementId;
      img.draggable = false;
      img.style.cssText = `
        width: ${entity.w * 100}%;
        height: ${entity.h * 100}%;
        object-fit: cover;
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        image-rendering: pixelated;
        z-index: 10;
      `;

      // Manejar error de carga de imagen
      img.onerror = () => {
        console.warn('[CROP LOADER] ⚠️ Imagen no encontrada:', imagePath);
        // Mostrar placeholder verde
        square.style.background = 'linear-gradient(135deg, #4caf50, #81c784)';
        square.style.border = '2px solid #2e7d32';
        
        // Agregar emoji de planta como fallback
        const emoji = document.createElement('div');
        emoji.textContent = '🌾';
        emoji.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
        `;
        square.appendChild(emoji);
      };
      
      img.onload = () => {
        console.log(`[CROP LOADER] ✓ Imagen cargada para "${entity.cropName}"`);
      };

      square.appendChild(img);
      renderedCount++;

      // Agregar nameplate si tiene nombre
      if (entity.cropName && entity.cropName.trim()) {
        addCropNameplate(square, entity.cropName.trim());
      }
    } else {
      // Casillas adicionales: solo marcar como ocupadas con fondo semi-transparente
      square.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
      square.style.border = '1px dashed rgba(76, 175, 80, 0.3)';
      renderedCount++;
    }
  });
  
  console.log(`[CROP LOADER] ✅ "${entity.cropName}" renderizado en ${renderedCount}/${coveredSquares.length} casillas`);
}

/**
 * Renderiza un cultivo en el mapa (versión antigua con índices)
 * @deprecated Usar renderCropOnMapDirect en su lugar
 */
function renderCropOnMap(entity, coveredIndices, squares, elementId) {
  console.log(`[CROP LOADER] 🎨 Renderizando "${entity.cropName}" en ${coveredIndices.length} casillas`);
  
  // Obtener imagen del elemento
  const imageName = elementId + '.png';
  const imagePath = `assets/image/${elementId}/${imageName}`;

  // Aplicar imagen y vincular entity a las casillas
  let renderedCount = 0;
  
  coveredIndices.forEach((index, i) => {
    const square = squares[index];
    if (!square) {
      console.warn(`[CROP LOADER] ⚠️ Square no encontrado en índice ${index}`);
      return;
    }

    // Vincular entity al square
    square.dataset.entityId = entity.id;

    // Solo la primera casilla muestra la imagen completa
    if (i === 0) {
      // Limpiar contenido previo
      square.innerHTML = '';

      // Crear imagen
      const img = document.createElement('img');
      img.src = imagePath;
      img.alt = entity.cropName || elementId;
      img.draggable = false;
      img.style.cssText = `
        width: ${entity.w * 100}%;
        height: ${entity.h * 100}%;
        object-fit: cover;
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        image-rendering: pixelated;
        z-index: 10;
      `;

      // Manejar error de carga de imagen
      img.onerror = () => {
        console.warn('[CROP LOADER] ⚠️ Imagen no encontrada:', imagePath);
        // Mostrar placeholder
        square.style.background = 'linear-gradient(135deg, #4caf50, #81c784)';
        square.style.border = '2px solid #2e7d32';
      };
      
      img.onload = () => {
        console.log(`[CROP LOADER] ✓ Imagen cargada para "${entity.cropName}"`);
      };

      square.appendChild(img);
      renderedCount++;

      // Agregar nameplate si tiene nombre
      if (entity.cropName && entity.cropName.trim()) {
        addCropNameplate(square, entity.cropName.trim());
      }
    } else {
      // Casillas adicionales: solo marcar como ocupadas
      square.style.opacity = '0.7';
      renderedCount++;
    }
  });
  
  console.log(`[CROP LOADER] ✅ "${entity.cropName}" renderizado en ${renderedCount}/${coveredIndices.length} casillas`);
}

/**
 * Agrega etiqueta con el nombre del cultivo
 */
function addCropNameplate(square, cropName) {
  const nameplate = document.createElement('div');
  nameplate.className = 'crop-nameplate';
  nameplate.textContent = cropName;
  nameplate.style.cssText = `
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(46, 125, 50, 0.9);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    pointer-events: none;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    border: 1px solid rgba(255, 255, 255, 0.3);
  `;
  square.appendChild(nameplate);
}

/**
 * Limpia todos los cultivos del mapa (útil antes de recargar)
 */
export function clearCropsFromMap() {
  const mapElement = Map.map;
  if (!mapElement) return;

  // Remover todas las imágenes de cultivos
  const cropImages = mapElement.querySelectorAll('img[src*="crops"]');
  cropImages.forEach(img => img.remove());

  // Remover nameplates
  const nameplates = mapElement.querySelectorAll('.crop-nameplate');
  nameplates.forEach(np => np.remove());

  // Limpiar dataset.entityId de casillas con cultivos
  const squares = mapElement.querySelectorAll('.square[data-entity-id]');
  squares.forEach(square => {
    const entityId = square.dataset.entityId;
    const entity = EntityStore.getById(entityId);
    if (entity && entity.type === 'crop-area') {
      delete square.dataset.entityId;
      square.style.opacity = '1';
      square.style.background = '';
      square.style.border = '';
    }
  });

  console.log('[CROP LOADER] 🧹 Cultivos limpiados del mapa');
}

/**
 * Función de depuración: resalta todos los cultivos en el mapa
 * Usar desde consola: window.debugCrops()
 */
window.debugCrops = function() {
  const Map = window.Map;
  if (!Map || !Map.map) {
    console.error('❌ Mapa no disponible');
    return;
  }
  
  const mapElement = Map.map;
  const squares = mapElement.querySelectorAll('.square[data-entity-id]');
  console.log(`🔍 Encontrados ${squares.length} squares con entidades`);
  
  let cropCount = 0;
  squares.forEach(sq => {
    const entityId = sq.dataset.entityId;
    const entity = EntityStore.getById(entityId);
    
    if (entity && entity.type === 'crop-area') {
      cropCount++;
      // Resaltar con borde rojo brillante
      sq.style.outline = '5px solid red';
      sq.style.outlineOffset = '-2px';
      sq.style.zIndex = '1000';
      sq.style.boxShadow = '0 0 20px red';
      
      console.log(`🌾 Cultivo ${cropCount}:`, {
        nombre: entity.cropName,
        entityId: entity.id,
        elementId: entity.elementId,
        tamaño: `${entity.w}×${entity.h}`,
        squares: entity.squares
      });
      
      // Obtener posición del square
      const parent = sq.parentElement;
      if (parent) {
        const row = Array.from(mapElement.children).indexOf(parent);
        const col = Array.from(parent.children).indexOf(sq);
        console.log(`   📍 Posición: fila=${row}, columna=${col}`);
      }
    }
  });
  
  if (cropCount === 0) {
    console.warn('⚠️ No se encontraron cultivos en el mapa');
    console.log('💡 Verifica que los cultivos se hayan cargado correctamente');
  } else {
    console.log(`✅ ${cropCount} cultivos encontrados y resaltados en rojo`);
  }
};

console.log('[CROP LOADER] 💡 Usa window.debugCrops() en consola para ver cultivos');


