/**
 * DATA EXTRACTOR SERVICE
 * Extrae toda la información de la base de datos y genera un TXT estructurado
 * para ser usado como contexto en el chat de IA
 */

/**
 * Extrae toda la data de la base de datos y genera un archivo TXT estructurado
 * @param {number} userId - ID del usuario (opcional, si no se provee trae todo)
 * @returns {Promise<string>} - Contenido del TXT generado
 */
export async function extractAllDataToText(userId = null) {
  try {
    console.log('[DATA EXTRACTOR] 🚀 Iniciando extracción de datos...');
    
    // Obtener API URL
    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001' 
      : '';

    // Si no se provee userId, intentar obtenerlo de la sesión
    if (!userId && window.getAgroVerseUserId) {
      userId = window.getAgroVerseUserId();
    }

    const userParam = userId ? `?user_id=${userId}` : '';
    
    // ================================================================
    // 1. OBTENER DATOS DEL USUARIO
    // ================================================================
    let userData = null;
    if (userId) {
      console.log('[DATA EXTRACTOR] 📋 Obteniendo datos del usuario...');
      const userResponse = await fetch(`${API_URL}/usuarios/${userId}`);
      if (userResponse.ok) {
        const userJson = await userResponse.json();
        userData = userJson.data;
      }
    }

    // ================================================================
    // 2. OBTENER CULTIVOS
    // ================================================================
    console.log('[DATA EXTRACTOR] 🌾 Obteniendo cultivos...');
    const cultivosResponse = await fetch(`${API_URL}/cultivos${userParam}`);
    const cultivosJson = await cultivosResponse.json();
    const cultivos = cultivosJson.data || [];

    // ================================================================
    // 3. OBTENER DATOS METEOROLÓGICOS (con relación a cultivos)
    // ================================================================
    console.log('[DATA EXTRACTOR] 🌦️ Obteniendo datos meteorológicos...');
    const weatherResponse = await fetch(`${API_URL}/weather_data${userParam}`);
    const weatherJson = await weatherResponse.json();
    const weatherData = weatherJson.data || [];

    // Crear mapa de cultivo_id -> datos meteorológicos
    const weatherByCultivo = {};
    weatherData.forEach(w => {
      if (w.cultivo_id) {
        if (!weatherByCultivo[w.cultivo_id]) {
          weatherByCultivo[w.cultivo_id] = [];
        }
        weatherByCultivo[w.cultivo_id].push(w);
      }
    });

    // ================================================================
    // 4. OBTENER ANIMALES
    // ================================================================
    console.log('[DATA EXTRACTOR] 🐄 Obteniendo animales...');
    const animalesResponse = await fetch(`${API_URL}/animales${userParam}`);
    const animalesJson = await animalesResponse.json();
    const animales = animalesJson.data || [];

    // ================================================================
    // 5. OBTENER BIBLIOTECA
    // ================================================================
    console.log('[DATA EXTRACTOR] 📚 Obteniendo biblioteca...');
    let biblioteca = null;
    if (userId) {
      const bibliotecaResponse = await fetch(`${API_URL}/biblioteca/${userId}`);
      if (bibliotecaResponse.ok) {
        const bibliotecaJson = await bibliotecaResponse.json();
        biblioteca = bibliotecaJson.data;
      }
    }

    // ================================================================
    // 6. OBTENER FUENTES DE AGUA
    // ================================================================
    console.log('[DATA EXTRACTOR] 💧 Obteniendo fuentes de agua...');
    const fuentesResponse = await fetch(`${API_URL}/fuentes_agua${userParam}`);
    const fuentesJson = await fuentesResponse.json();
    const fuentesAgua = fuentesJson.data || [];

    // ================================================================
    // 7. OBTENER ALMACENES
    // ================================================================
    console.log('[DATA EXTRACTOR] 🏪 Obteniendo almacenes...');
    const almacenesAlimentosResponse = await fetch(`${API_URL}/almacen_alimentos${userParam}`);
    const almacenesAlimentosJson = await almacenesAlimentosResponse.json();
    const almacenesAlimentos = almacenesAlimentosJson.data || [];

    const almacenesMaterialesResponse = await fetch(`${API_URL}/almacen_materiales${userParam}`);
    const almacenesMaterialesJson = await almacenesMaterialesResponse.json();
    const almacenesMateriales = almacenesMaterialesJson.data || [];

    // ================================================================
    // 8. GENERAR TEXTO ESTRUCTURADO
    // ================================================================
    console.log('[DATA EXTRACTOR] 📝 Generando texto estructurado...');
    
    let txtContent = '';
    
    // ============================================================
    // SECCIÓN: ENCABEZADO
    // ============================================================
    txtContent += '═══════════════════════════════════════════════════════════════════\n';
    txtContent += '  CONTEXTO DE DATOS - AGROVERSE FARMING GAME\n';
    txtContent += `  Fecha de extracción: ${new Date().toLocaleString('es-ES')}\n`;
    if (userId) {
      txtContent += `  Usuario ID: ${userId}\n`;
    }
    txtContent += '═══════════════════════════════════════════════════════════════════\n\n';

    // ============================================================
    // SECCIÓN 1: INFORMACIÓN DEL USUARIO
    // ============================================================
    if (userData) {
      txtContent += '───────────────────────────────────────────────────────────────────\n';
      txtContent += '📋 PERFIL DEL AGRICULTOR\n';
      txtContent += '───────────────────────────────────────────────────────────────────\n\n';
      
      txtContent += `👤 Nombre: ${userData.nombre || 'N/A'} ${userData.apellido || ''}\n`;
      txtContent += `🏡 Finca: ${userData.nombre_finca || 'N/A'}\n`;
      txtContent += `📧 Email: ${userData.email || 'N/A'}\n`;
      txtContent += `📱 Teléfono: ${userData.telefono || 'N/A'}\n`;
      txtContent += `🎂 Fecha de nacimiento: ${userData.fecha_nacimiento || 'N/A'}\n`;
      txtContent += `📍 Ubicación: ${userData.ubicacion_texto || 'N/A'}\n`;
      if (userData.latitud && userData.longitud) {
        txtContent += `🌍 Coordenadas GPS: ${userData.latitud}, ${userData.longitud}\n`;
      }
      txtContent += `\n`;
      
      txtContent += `🌾 Tipo de agricultor: ${userData.tipo_agricultor || 'N/A'}\n`;
      txtContent += `📊 Experiencia agrícola: ${userData.experiencia_agricola || 'N/A'}\n`;
      txtContent += `📅 Años de experiencia: ${userData.anos_experiencia || 'N/A'}\n`;
      txtContent += `📏 Tamaño de finca: ${userData.tamano_finca || 'N/A'}\n`;
      txtContent += `🌱 Cultivos principales: ${userData.cultivos_principales || 'N/A'}\n`;
      txtContent += `🔧 Método agrícola: ${userData.metodo_agricola || 'N/A'}\n`;
      txtContent += `🎓 Especializaciones: ${userData.especializaciones || 'N/A'}\n`;
      txtContent += `📜 Certificaciones: ${userData.certificaciones || 'N/A'}\n`;
      txtContent += `\n`;
      
      txtContent += `🗣️ Idioma: ${userData.idioma || 'N/A'}\n`;
      txtContent += `📐 Unidades de medida: ${userData.unidades || 'N/A'}\n`;
      txtContent += `🔔 Notificaciones: ${userData.notificaciones ? 'Activas' : 'Inactivas'}\n`;
      txtContent += `🤖 Nivel de asistencia IA: ${userData.nivel_asistencia_ia || 'N/A'}\n`;
      txtContent += `\n`;
      
      txtContent += `🎯 Objetivo principal: ${userData.objetivo_principal || 'N/A'}\n`;
      txtContent += `📋 Objetivos secundarios: ${userData.objetivos_secundarios || 'N/A'}\n`;
      txtContent += `⏰ Plazo del objetivo: ${userData.plazo_objetivo || 'N/A'}\n`;
      txtContent += `\n\n`;
    }

    // ============================================================
    // SECCIÓN 2: CULTIVOS Y DATOS METEOROLÓGICOS
    // ============================================================
    txtContent += '───────────────────────────────────────────────────────────────────\n';
    txtContent += `🌾 CULTIVOS (Total: ${cultivos.length})\n`;
    txtContent += '───────────────────────────────────────────────────────────────────\n\n';

    if (cultivos.length === 0) {
      txtContent += '  ⚠️ No hay cultivos registrados.\n\n';
    } else {
      cultivos.forEach((cultivo, index) => {
        txtContent += `┌─ CULTIVO #${index + 1} (ID: ${cultivo.cultivo_id}) ────────────────────────────\n`;
        txtContent += `│\n`;
        txtContent += `│ 📌 Nombre: ${cultivo.nombre_cultivo || 'Sin nombre'}\n`;
        txtContent += `│ 🌱 Producto sembrado: ${cultivo.producto_sembrado || 'N/A'}\n`;
        txtContent += `│ 🔖 Variedad: ${cultivo.variedad_cultivo || 'N/A'}\n`;
        txtContent += `│ 📂 Tipo de cultivo: ${cultivo.tipo_cultivo || 'N/A'}\n`;
        txtContent += `│\n`;
        
        // Ubicación y tamaño
        txtContent += `│ 📍 Ubicación en mapa: X=${cultivo.coordenada_x || 'N/A'}, Y=${cultivo.coordenada_y || 'N/A'}\n`;
        txtContent += `│ 🌍 Coordenadas GPS: ${cultivo.latitud || 'N/A'}, ${cultivo.longitud || 'N/A'}\n`;
        txtContent += `│ 📏 Tamaño: ${cultivo.tamano_ancho || 'N/A'} x ${cultivo.tamano_alto || 'N/A'} (casillas)\n`;
        txtContent += `│ 📐 Tamaño real: ${cultivo.tamano_real_valor || 'N/A'} ${cultivo.tamano_real_unidad || ''}\n`;
        txtContent += `│\n`;
        
        // Fechas
        txtContent += `│ 📅 Fecha plantado: ${cultivo.fecha_plantado || 'N/A'}\n`;
        txtContent += `│ 🗓️ Fecha esperada cosecha: ${cultivo.fecha_esperada_cosecha || 'N/A'}\n`;
        txtContent += `│\n`;
        
        // Información agronómica
        txtContent += `│ 🌍 Tipo de suelo: ${cultivo.tipo_suelo || 'N/A'}\n`;
        txtContent += `│ 🔨 Preparación del suelo: ${cultivo.preparacion_suelo || 'N/A'}\n`;
        txtContent += `│ 🌾 Densidad de siembra: ${cultivo.densidad_siembra || 'N/A'}\n`;
        txtContent += `│ 📊 Rendimiento esperado: ${cultivo.rendimiento_esperado || 'N/A'}\n`;
        txtContent += `│ 🔄 Cultivo anterior: ${cultivo.cultivo_anterior || 'N/A'}\n`;
        txtContent += `│ 🤝 Cultivos asociados: ${cultivo.cultivos_asociados || 'N/A'}\n`;
        txtContent += `│\n`;
        
        // Manejo
        txtContent += `│ 💧 Sistema de riego: ${cultivo.sistema_riego || 'N/A'}\n`;
        txtContent += `│ 🌱 Tipo de abono: ${cultivo.tipo_abono || 'N/A'}\n`;
        txtContent += `│ 🍂 Uso de cobertura: ${cultivo.uso_cobertura || 'N/A'}\n`;
        txtContent += `│ ♻️ Prácticas orgánicas: ${cultivo.practicas_organicas || 'N/A'}\n`;
        txtContent += `│\n`;
        
        // Desafíos
        txtContent += `│ 🐛 Enfermedades/plagas: ${cultivo.enfermedades_plagas || 'N/A'}\n`;
        txtContent += `│ ⚠️ Desafíos específicos: ${cultivo.desafios_especificos || 'N/A'}\n`;
        txtContent += `│ 📝 Notas adicionales: ${cultivo.notas_adicionales || 'N/A'}\n`;
        txtContent += `│\n`;
        
        // DATOS METEOROLÓGICOS ASOCIADOS
        const weatherForCultivo = weatherByCultivo[cultivo.cultivo_id] || [];
        if (weatherForCultivo.length > 0) {
          txtContent += `│ ┌─ DATOS METEOROLÓGICOS (${weatherForCultivo.length} registros) ────────\n`;
          
          weatherForCultivo.forEach((weather, wIndex) => {
            txtContent += `│ │\n`;
            txtContent += `│ │ 🌦️ Registro #${wIndex + 1}:\n`;
            txtContent += `│ │ 📅 Fecha: ${weather.created_at || 'N/A'}\n`;
            txtContent += `│ │ 🌡️ Temperatura: ${weather.temperature || 'N/A'}°C\n`;
            txtContent += `│ │ 💧 Humedad: ${weather.humidity || 'N/A'}%\n`;
            txtContent += `│ │ 🌧️ Precipitación: ${weather.precipitation || 'N/A'} mm\n`;
            txtContent += `│ │ 🌬️ Viento: ${weather.wind_speed || 'N/A'} km/h (${weather.wind_direction || 'N/A'})\n`;
            txtContent += `│ │ ☁️ Nubosidad: ${weather.cloud_cover || 'N/A'}%\n`;
            txtContent += `│ │ ☀️ UV Index: ${weather.uv_index || 'N/A'}\n`;
            txtContent += `│ │ 👁️ Visibilidad: ${weather.visibility || 'N/A'} km\n`;
            txtContent += `│ │ 📊 Presión: ${weather.pressure || 'N/A'} hPa\n`;
            txtContent += `│ │ 🌅 Amanecer: ${weather.sunrise || 'N/A'}\n`;
            txtContent += `│ │ 🌇 Atardecer: ${weather.sunset || 'N/A'}\n`;
            
            // Datos del clima JSON
            if (weather.weather_data) {
              try {
                const weatherJson = typeof weather.weather_data === 'string' 
                  ? JSON.parse(weather.weather_data) 
                  : weather.weather_data;
                
                if (weatherJson.weather && weatherJson.weather.length > 0) {
                  txtContent += `│ │ ☁️ Condición: ${weatherJson.weather[0].description || 'N/A'}\n`;
                }
              } catch (e) {
                // Ignorar errores de parsing
              }
            }
          });
          
          txtContent += `│ │\n`;
          txtContent += `│ └────────────────────────────────────────────────────────\n`;
        } else {
          txtContent += `│ ⚠️ Sin datos meteorológicos asociados\n`;
        }
        
        txtContent += `│\n`;
        txtContent += `└─────────────────────────────────────────────────────────────────\n\n`;
      });
    }

    // ============================================================
    // SECCIÓN 3: ANIMALES
    // ============================================================
    txtContent += '───────────────────────────────────────────────────────────────────\n';
    txtContent += `🐄 ANIMALES (Total: ${animales.length})\n`;
    txtContent += '───────────────────────────────────────────────────────────────────\n\n';

    if (animales.length === 0) {
      txtContent += '  ⚠️ No hay animales registrados.\n\n';
    } else {
      animales.forEach((animal, index) => {
        txtContent += `┌─ ANIMAL #${index + 1} (ID: ${animal.animal_id}) ────────────────────────────\n`;
        txtContent += `│\n`;
        txtContent += `│ 🐾 Tipo: ${animal.tipo_animal || 'N/A'}\n`;
        txtContent += `│ 🔢 Cantidad: ${animal.cantidad || 'N/A'}\n`;
        txtContent += `│ 🏷️ Raza: ${animal.raza_animal || 'N/A'}\n`;
        txtContent += `│ 🎯 Uso: ${animal.uso_animal || 'N/A'}\n`;
        txtContent += `│\n`;
        
        // Ubicación
        txtContent += `│ 📍 Ubicación en mapa: X=${animal.coordenada_x || 'N/A'}, Y=${animal.coordenada_y || 'N/A'}\n`;
        txtContent += `│ 🌍 Coordenadas GPS: ${animal.latitud || 'N/A'}, ${animal.longitud || 'N/A'}\n`;
        txtContent += `│ 📌 Ubicación texto: ${animal.ubicacion_texto || 'N/A'}\n`;
        txtContent += `│\n`;
        
        // Salud y edad
        txtContent += `│ 📅 Edad promedio: ${animal.edad_promedio || 'N/A'}\n`;
        txtContent += `│ 💊 Estado de salud: ${animal.estado_salud || 'N/A'}\n`;
        txtContent += `│ 💉 Vacunación: ${animal.estado_vacunacion || 'N/A'}\n`;
        txtContent += `│ 🏥 Manejo veterinario: ${animal.manejo_veterinario || 'N/A'}\n`;
        txtContent += `│ 🦠 Enfermedades comunes: ${animal.enfermedades_comunes || 'N/A'}\n`;
        txtContent += `│\n`;
        
        // Infraestructura y manejo
        txtContent += `│ 🏠 Sistema de alojamiento: ${animal.sistema_alojamiento || 'N/A'}\n`;
        txtContent += `│ 🔄 Método de reproducción: ${animal.metodo_reproduccion || 'N/A'}\n`;
        txtContent += `│\n`;
        
        // Alimentación
        txtContent += `│ 🌾 Tipo de alimentación: ${animal.tipo_alimentacion || 'N/A'}\n`;
        txtContent += `│ 📋 Detalles alimentación: ${animal.detalles_alimentacion || 'N/A'}\n`;
        txtContent += `│ 💧 Fuentes de agua: ${animal.fuentes_agua || 'N/A'}\n`;
        txtContent += `│\n`;
        
        // Producción
        txtContent += `│ 📊 Producción esperada: ${animal.produccion_esperada || 'N/A'}\n`;
        txtContent += `│ 📜 Certificaciones: ${animal.certificaciones || 'N/A'}\n`;
        txtContent += `│\n`;
        
        // Desafíos
        txtContent += `│ ⚠️ Desafíos principales: ${animal.desafios_principales || 'N/A'}\n`;
        txtContent += `│ 📝 Notas adicionales: ${animal.notas_adicionales || 'N/A'}\n`;
        txtContent += `│\n`;
        txtContent += `└─────────────────────────────────────────────────────────────────\n\n`;
      });
    }

    // ============================================================
    // SECCIÓN 4: BIBLIOTECA (CONOCIMIENTO DEL AGRICULTOR)
    // ============================================================
    if (biblioteca) {
      txtContent += '───────────────────────────────────────────────────────────────────\n';
      txtContent += '📚 BIBLIOTECA - CONOCIMIENTO Y HABILIDADES\n';
      txtContent += '───────────────────────────────────────────────────────────────────\n\n';
      
      txtContent += `📍 Ubicación en mapa: X=${biblioteca.coordenada_x || 'N/A'}, Y=${biblioteca.coordenada_y || 'N/A'}\n`;
      txtContent += `\n`;
      
      // Experiencia y educación
      txtContent += `🎓 Nivel de experiencia: ${biblioteca.nivel_experiencia || 'N/A'}\n`;
      txtContent += `📅 Años de experiencia: ${biblioteca.anos_experiencia || 'N/A'}\n`;
      txtContent += `📖 Tipo de educación: ${biblioteca.tipo_educacion || 'N/A'}\n`;
      txtContent += `📚 Nivel de alfabetización: ${biblioteca.nivel_alfabetizacion || 'N/A'}\n`;
      txtContent += `\n`;
      
      // Idiomas
      txtContent += `🗣️ Idioma nativo: ${biblioteca.idioma_nativo || 'N/A'}\n`;
      txtContent += `🌍 Otros idiomas: ${biblioteca.otros_idiomas || 'N/A'}\n`;
      txtContent += `\n`;
      
      // Tecnología
      txtContent += `💻 Acceso a tecnología: ${biblioteca.acceso_tecnologia || 'N/A'}\n`;
      txtContent += `\n`;
      
      // Conocimientos técnicos
      txtContent += `🌾 Técnicas agrícolas: ${biblioteca.tecnicas_agricolas || 'N/A'}\n`;
      txtContent += `🔧 Otras técnicas: ${biblioteca.otras_tecnicas || 'N/A'}\n`;
      txtContent += `🌍 Conocimiento de suelos: ${biblioteca.conocimiento_suelos || 'N/A'}\n`;
      txtContent += `🐛 Conocimiento de plagas: ${biblioteca.conocimiento_plagas || 'N/A'}\n`;
      txtContent += `🌦️ Conocimiento del clima: ${biblioteca.conocimiento_clima || 'N/A'}\n`;
      txtContent += `🌱 Variedades de cultivos: ${biblioteca.variedades_cultivos || 'N/A'}\n`;
      txtContent += `📦 Conocimiento postcosecha: ${biblioteca.conocimiento_postcosecha || 'N/A'}\n`;
      txtContent += `\n`;
      
      // Experiencia práctica
      txtContent += `🌾 Cultivos principales: ${biblioteca.cultivos_principales || 'N/A'}\n`;
      txtContent += `🐄 Experiencia con animales: ${biblioteca.experiencia_animales || 'N/A'}\n`;
      txtContent += `🔨 Conocimiento de herramientas: ${biblioteca.conocimiento_herramientas || 'N/A'}\n`;
      txtContent += `\n`;
      
      // Logros y certificaciones
      txtContent += `📜 Certificaciones: ${biblioteca.certificaciones || 'N/A'}\n`;
      txtContent += `🏆 Logros: ${biblioteca.logros || 'N/A'}\n`;
      txtContent += `\n`;
      
      // Sabiduría tradicional
      txtContent += `🌿 Sabiduría ancestral: ${biblioteca.sabiduria_ancestral || 'N/A'}\n`;
      txtContent += `🌺 Plantas medicinales: ${biblioteca.plantas_medicinales || 'N/A'}\n`;
      txtContent += `🌾 Semillas nativas: ${biblioteca.semillas_nativas || 'N/A'}\n`;
      txtContent += `\n`;
      
      // Redes y aprendizaje
      txtContent += `🤝 Asociaciones: ${biblioteca.asociaciones || 'N/A'}\n`;
      txtContent += `📰 Fuentes de información: ${biblioteca.fuentes_informacion || 'N/A'}\n`;
      txtContent += `💡 Dispuesto a compartir: ${biblioteca.dispuesto_compartir || 'N/A'}\n`;
      txtContent += `📚 Necesidades de aprendizaje: ${biblioteca.necesidades_aprendizaje || 'N/A'}\n`;
      txtContent += `\n\n`;
    }

    // ============================================================
    // SECCIÓN 5: FUENTES DE AGUA
    // ============================================================
    txtContent += '───────────────────────────────────────────────────────────────────\n';
    txtContent += `💧 FUENTES DE AGUA (Total: ${fuentesAgua.length})\n`;
    txtContent += '───────────────────────────────────────────────────────────────────\n\n';

    if (fuentesAgua.length === 0) {
      txtContent += '  ⚠️ No hay fuentes de agua registradas.\n\n';
    } else {
      fuentesAgua.forEach((fuente, index) => {
        txtContent += `┌─ FUENTE #${index + 1} (ID: ${fuente.fuente_agua_id}) ──────────────────────\n`;
        txtContent += `│\n`;
        txtContent += `│ 💧 Tipo: ${fuente.tipo_fuente || 'N/A'}\n`;
        txtContent += `│ 📌 Nombre: ${fuente.nombre || 'Sin nombre'}\n`;
        txtContent += `│\n`;
        txtContent += `│ 📍 Ubicación en mapa: X=${fuente.coordenada_x || 'N/A'}, Y=${fuente.coordenada_y || 'N/A'}\n`;
        txtContent += `│ 🌍 Coordenadas GPS: ${fuente.latitud || 'N/A'}, ${fuente.longitud || 'N/A'}\n`;
        txtContent += `│ 📌 Ubicación texto: ${fuente.ubicacion_texto || 'N/A'}\n`;
        txtContent += `│\n`;
        txtContent += `│ 🎯 Descripción de uso: ${fuente.descripcion_uso || 'N/A'}\n`;
        txtContent += `│ 🔧 Métodos de extracción: ${fuente.metodos_extraccion || 'N/A'}\n`;
        txtContent += `│ 🔨 Otros métodos: ${fuente.otros_metodos || 'N/A'}\n`;
        txtContent += `│\n`;
        txtContent += `└─────────────────────────────────────────────────────────────────\n\n`;
      });
    }

    // ============================================================
    // SECCIÓN 6: ALMACENES
    // ============================================================
    txtContent += '───────────────────────────────────────────────────────────────────\n';
    txtContent += `🏪 ALMACENES\n`;
    txtContent += '───────────────────────────────────────────────────────────────────\n\n';

    // Almacenes de Alimentos
    txtContent += `🍎 ALMACENES DE ALIMENTOS (Total: ${almacenesAlimentos.length})\n\n`;
    
    if (almacenesAlimentos.length === 0) {
      txtContent += '  ⚠️ No hay almacenes de alimentos registrados.\n\n';
    } else {
      almacenesAlimentos.forEach((almacen, index) => {
        txtContent += `  ┌─ ALMACÉN ALIMENTOS #${index + 1} (ID: ${almacen.almacen_id}) ────────\n`;
        txtContent += `  │ 📍 Ubicación en mapa: X=${almacen.coordenada_x || 'N/A'}, Y=${almacen.coordenada_y || 'N/A'}\n`;
        txtContent += `  │ 📊 Capacidad total: ${almacen.capacidad_total || 'N/A'}\n`;
        txtContent += `  │ 📦 Capacidad usada: ${almacen.capacidad_usada || 'N/A'}\n`;
        txtContent += `  │ 📋 Inventario: ${almacen.inventario || 'N/A'}\n`;
        txtContent += `  └────────────────────────────────────────────────────\n\n`;
      });
    }

    // Almacenes de Materiales
    txtContent += `🔨 ALMACENES DE MATERIALES (Total: ${almacenesMateriales.length})\n\n`;
    
    if (almacenesMateriales.length === 0) {
      txtContent += '  ⚠️ No hay almacenes de materiales registrados.\n\n';
    } else {
      almacenesMateriales.forEach((almacen, index) => {
        txtContent += `  ┌─ ALMACÉN MATERIALES #${index + 1} (ID: ${almacen.almacen_id}) ────────\n`;
        txtContent += `  │ 📍 Ubicación en mapa: X=${almacen.coordenada_x || 'N/A'}, Y=${almacen.coordenada_y || 'N/A'}\n`;
        txtContent += `  │ 📊 Capacidad total: ${almacen.capacidad_total || 'N/A'}\n`;
        txtContent += `  │ 📦 Capacidad usada: ${almacen.capacidad_usada || 'N/A'}\n`;
        txtContent += `  │ 📋 Inventario: ${almacen.inventario || 'N/A'}\n`;
        txtContent += `  └────────────────────────────────────────────────────\n\n`;
      });
    }

    // ============================================================
    // PIE DE PÁGINA
    // ============================================================
    txtContent += '═══════════════════════════════════════════════════════════════════\n';
    txtContent += '  FIN DEL CONTEXTO DE DATOS\n';
    txtContent += '═══════════════════════════════════════════════════════════════════\n';

    console.log('[DATA EXTRACTOR] ✅ Extracción completada');
    
    return txtContent;

  } catch (error) {
    console.error('[DATA EXTRACTOR] ❌ Error:', error);
    throw error;
  }
}

/**
 * Extrae datos y guarda en archivo TXT
 * @param {number} userId - ID del usuario (opcional)
 * @param {string} fileName - Nombre del archivo (por defecto: agroverse_data.txt)
 * @returns {Promise<void>}
 */
export async function saveDataToFile(userId = null, fileName = 'agroverse_data.txt') {
  try {
    const txtContent = await extractAllDataToText(userId);
    
    // Crear blob y descargar
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('[DATA EXTRACTOR] 💾 Archivo guardado:', fileName);
    
  } catch (error) {
    console.error('[DATA EXTRACTOR] ❌ Error al guardar archivo:', error);
    throw error;
  }
}

/**
 * Función helper para obtener datos en formato JSON (útil para pasar directo a IA)
 * @param {number} userId - ID del usuario (opcional)
 * @returns {Promise<Object>} - Objeto con toda la data estructurada
 */
export async function extractAllDataAsJSON(userId = null) {
  try {
    console.log('[DATA EXTRACTOR] 🚀 Extrayendo datos como JSON...');
    
    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001' 
      : '';

    if (!userId && window.getAgroVerseUserId) {
      userId = window.getAgroVerseUserId();
    }

    const userParam = userId ? `?user_id=${userId}` : '';
    
    // Hacer todas las peticiones en paralelo para mayor eficiencia
    const [
      userResponse,
      cultivosResponse,
      weatherResponse,
      animalesResponse,
      bibliotecaResponse,
      fuentesResponse,
      almacenesAlimentosResponse,
      almacenesMaterialesResponse
    ] = await Promise.all([
      userId ? fetch(`${API_URL}/usuarios/${userId}`).catch(() => null) : null,
      fetch(`${API_URL}/cultivos${userParam}`),
      fetch(`${API_URL}/weather_data${userParam}`),
      fetch(`${API_URL}/animales${userParam}`),
      userId ? fetch(`${API_URL}/biblioteca/${userId}`).catch(() => null) : null,
      fetch(`${API_URL}/fuentes_agua${userParam}`),
      fetch(`${API_URL}/almacen_alimentos${userParam}`),
      fetch(`${API_URL}/almacen_materiales${userParam}`)
    ]);

    // Procesar respuestas
    const data = {
      usuario: userResponse?.ok ? (await userResponse.json()).data : null,
      cultivos: (await cultivosResponse.json()).data || [],
      weatherData: (await weatherResponse.json()).data || [],
      animales: (await animalesResponse.json()).data || [],
      biblioteca: bibliotecaResponse?.ok ? (await bibliotecaResponse.json()).data : null,
      fuentesAgua: (await fuentesResponse.json()).data || [],
      almacenesAlimentos: (await almacenesAlimentosResponse.json()).data || [],
      almacenesMateriales: (await almacenesMaterialesResponse.json()).data || []
    };

    console.log('[DATA EXTRACTOR] ✅ Datos JSON extraídos');
    
    return data;

  } catch (error) {
    console.error('[DATA EXTRACTOR] ❌ Error al extraer JSON:', error);
    throw error;
  }
}
