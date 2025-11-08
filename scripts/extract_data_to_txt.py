#!/usr/bin/env python3
"""
DATA EXTRACTOR - AgroVerse
Extrae toda la información de la base de datos mediante peticiones HTTP
y genera un archivo TXT estructurado para contexto de IA
"""

import requests
import json
import sys
from datetime import datetime

# Configuración
API_BASE_URL = "http://localhost:5001"
USER_ID = None  # Cambiar por el user_id específico o dejar None para todos

def fetch_json(endpoint):
    """Hace petición GET y retorna JSON"""
    try:
        url = f"{API_BASE_URL}{endpoint}"
        print(f"📡 Fetching: {url}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Error fetching {endpoint}: {e}")
        return {"success": False, "data": None}

def safe_get(data, key, default='N/A'):
    """Obtiene valor de diccionario de forma segura"""
    value = data.get(key, default)
    return value if value not in [None, '', []] else default

def extract_all_data(user_id=None):
    """Extrae toda la data de la API"""
    
    print("=" * 70)
    print("  AGROVERSE DATA EXTRACTOR")
    print("=" * 70)
    print()
    
    # Construir parámetro de usuario
    user_param = f"?user_id={user_id}" if user_id else ""
    
    # ================================================================
    # 1. DATOS DEL USUARIO
    # ================================================================
    user_data = None
    if user_id:
        print("📋 Obteniendo datos del usuario...")
        response = fetch_json(f"/usuarios/{user_id}")
        if response.get("success"):
            user_data = response.get("data")
    
    # ================================================================
    # 2. CULTIVOS
    # ================================================================
    print("🌾 Obteniendo cultivos...")
    cultivos_response = fetch_json(f"/cultivos{user_param}")
    cultivos = cultivos_response.get("data", [])
    
    # ================================================================
    # 3. DATOS METEOROLÓGICOS
    # ================================================================
    print("🌦️ Obteniendo datos meteorológicos...")
    weather_response = fetch_json(f"/weather_data{user_param}")
    weather_data = weather_response.get("data", [])
    
    # Mapear weather_data por cultivo_id
    weather_by_cultivo = {}
    for w in weather_data:
        cultivo_id = w.get('cultivo_id')
        if cultivo_id:
            if cultivo_id not in weather_by_cultivo:
                weather_by_cultivo[cultivo_id] = []
            weather_by_cultivo[cultivo_id].append(w)
    
    # ================================================================
    # 4. ANIMALES
    # ================================================================
    print("🐄 Obteniendo animales...")
    animales_response = fetch_json(f"/animales{user_param}")
    animales = animales_response.get("data", [])
    
    # ================================================================
    # 5. BIBLIOTECA
    # ================================================================
    print("📚 Obteniendo biblioteca...")
    biblioteca = None
    if user_id:
        biblioteca_response = fetch_json(f"/biblioteca/{user_id}")
        if biblioteca_response.get("success"):
            biblioteca = biblioteca_response.get("data")
    
    # ================================================================
    # 6. FUENTES DE AGUA
    # ================================================================
    print("💧 Obteniendo fuentes de agua...")
    fuentes_response = fetch_json(f"/fuentes_agua{user_param}")
    fuentes_agua = fuentes_response.get("data", [])
    
    # ================================================================
    # 7. ALMACENES
    # ================================================================
    print("🏪 Obteniendo almacenes...")
    almacenes_alimentos_response = fetch_json(f"/almacen_alimentos{user_param}")
    almacenes_alimentos = almacenes_alimentos_response.get("data", [])
    
    almacenes_materiales_response = fetch_json(f"/almacen_materiales{user_param}")
    almacenes_materiales = almacenes_materiales_response.get("data", [])
    
    print()
    print("✅ Extracción completada")
    print()
    
    return {
        "user_data": user_data,
        "cultivos": cultivos,
        "weather_data": weather_data,
        "weather_by_cultivo": weather_by_cultivo,
        "animales": animales,
        "biblioteca": biblioteca,
        "fuentes_agua": fuentes_agua,
        "almacenes_alimentos": almacenes_alimentos,
        "almacenes_materiales": almacenes_materiales
    }

def generate_txt_content(data, user_id=None):
    """Genera el contenido del archivo TXT estructurado"""
    
    txt = []
    
    # ============================================================
    # ENCABEZADO
    # ============================================================
    txt.append("═" * 70)
    txt.append("  CONTEXTO DE DATOS - AGROVERSE FARMING GAME")
    txt.append(f"  Fecha de extracción: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    if user_id:
        txt.append(f"  Usuario ID: {user_id}")
    txt.append("═" * 70)
    txt.append("")
    
    # ============================================================
    # SECCIÓN 1: INFORMACIÓN DEL USUARIO
    # ============================================================
    user_data = data.get("user_data")
    if user_data:
        txt.append("─" * 70)
        txt.append("📋 PERFIL DEL AGRICULTOR")
        txt.append("─" * 70)
        txt.append("")
        
        txt.append(f"👤 Nombre: {safe_get(user_data, 'nombre')} {safe_get(user_data, 'apellido')}")
        txt.append(f"🏡 Finca: {safe_get(user_data, 'nombre_finca')}")
        txt.append(f"📧 Email: {safe_get(user_data, 'email')}")
        txt.append(f"📱 Teléfono: {safe_get(user_data, 'telefono')}")
        txt.append(f"🎂 Fecha de nacimiento: {safe_get(user_data, 'fecha_nacimiento')}")
        txt.append(f"📍 Ubicación: {safe_get(user_data, 'ubicacion_texto')}")
        
        if user_data.get('latitud') and user_data.get('longitud'):
            txt.append(f"🌍 Coordenadas GPS: {user_data['latitud']}, {user_data['longitud']}")
        
        txt.append("")
        txt.append(f"🌾 Tipo de agricultor: {safe_get(user_data, 'tipo_agricultor')}")
        txt.append(f"📊 Experiencia agrícola: {safe_get(user_data, 'experiencia_agricola')}")
        txt.append(f"📅 Años de experiencia: {safe_get(user_data, 'anos_experiencia')}")
        txt.append(f"📏 Tamaño de finca: {safe_get(user_data, 'tamano_finca')}")
        txt.append(f"🌱 Cultivos principales: {safe_get(user_data, 'cultivos_principales')}")
        txt.append(f"🔧 Método agrícola: {safe_get(user_data, 'metodo_agricola')}")
        txt.append(f"🎓 Especializaciones: {safe_get(user_data, 'especializaciones')}")
        txt.append(f"📜 Certificaciones: {safe_get(user_data, 'certificaciones')}")
        txt.append("")
        
        txt.append(f"🗣️ Idioma: {safe_get(user_data, 'idioma')}")
        txt.append(f"📐 Unidades de medida: {safe_get(user_data, 'unidades')}")
        txt.append(f"🔔 Notificaciones: {'Activas' if user_data.get('notificaciones') else 'Inactivas'}")
        txt.append(f"🤖 Nivel de asistencia IA: {safe_get(user_data, 'nivel_asistencia_ia')}")
        txt.append("")
        
        txt.append(f"🎯 Objetivo principal: {safe_get(user_data, 'objetivo_principal')}")
        txt.append(f"📋 Objetivos secundarios: {safe_get(user_data, 'objetivos_secundarios')}")
        txt.append(f"⏰ Plazo del objetivo: {safe_get(user_data, 'plazo_objetivo')}")
        txt.append("")
        txt.append("")
    
    # ============================================================
    # SECCIÓN 2: CULTIVOS Y DATOS METEOROLÓGICOS
    # ============================================================
    cultivos = data.get("cultivos", [])
    weather_by_cultivo = data.get("weather_by_cultivo", {})
    
    txt.append("─" * 70)
    txt.append(f"🌾 CULTIVOS (Total: {len(cultivos)})")
    txt.append("─" * 70)
    txt.append("")
    
    if not cultivos:
        txt.append("  ⚠️ No hay cultivos registrados.")
        txt.append("")
    else:
        for i, cultivo in enumerate(cultivos, 1):
            txt.append(f"┌─ CULTIVO #{i} (ID: {cultivo.get('cultivo_id')}) " + "─" * 40)
            txt.append("│")
            txt.append(f"│ 📌 Nombre: {safe_get(cultivo, 'nombre_cultivo', 'Sin nombre')}")
            txt.append(f"│ 🌱 Producto sembrado: {safe_get(cultivo, 'producto_sembrado')}")
            txt.append(f"│ 🔖 Variedad: {safe_get(cultivo, 'variedad_cultivo')}")
            txt.append(f"│ 📂 Tipo de cultivo: {safe_get(cultivo, 'tipo_cultivo')}")
            txt.append("│")
            
            txt.append(f"│ 📍 Ubicación en mapa: X={safe_get(cultivo, 'coordenada_x')}, Y={safe_get(cultivo, 'coordenada_y')}")
            txt.append(f"│ 🌍 Coordenadas GPS: {safe_get(cultivo, 'latitud')}, {safe_get(cultivo, 'longitud')}")
            txt.append(f"│ 📏 Tamaño: {safe_get(cultivo, 'tamano_ancho')} x {safe_get(cultivo, 'tamano_alto')} (casillas)")
            txt.append(f"│ 📐 Tamaño real: {safe_get(cultivo, 'tamano_real_valor')} {safe_get(cultivo, 'tamano_real_unidad', '')}")
            txt.append("│")
            
            txt.append(f"│ 📅 Fecha plantado: {safe_get(cultivo, 'fecha_plantado')}")
            txt.append(f"│ 🗓️ Fecha esperada cosecha: {safe_get(cultivo, 'fecha_esperada_cosecha')}")
            txt.append("│")
            
            txt.append(f"│ 🌍 Tipo de suelo: {safe_get(cultivo, 'tipo_suelo')}")
            txt.append(f"│ 🔨 Preparación del suelo: {safe_get(cultivo, 'preparacion_suelo')}")
            txt.append(f"│ 🌾 Densidad de siembra: {safe_get(cultivo, 'densidad_siembra')}")
            txt.append(f"│ 📊 Rendimiento esperado: {safe_get(cultivo, 'rendimiento_esperado')}")
            txt.append(f"│ 🔄 Cultivo anterior: {safe_get(cultivo, 'cultivo_anterior')}")
            txt.append(f"│ 🤝 Cultivos asociados: {safe_get(cultivo, 'cultivos_asociados')}")
            txt.append("│")
            
            txt.append(f"│ 💧 Sistema de riego: {safe_get(cultivo, 'sistema_riego')}")
            txt.append(f"│ 🌱 Tipo de abono: {safe_get(cultivo, 'tipo_abono')}")
            txt.append(f"│ 🍂 Uso de cobertura: {safe_get(cultivo, 'uso_cobertura')}")
            txt.append(f"│ ♻️ Prácticas orgánicas: {safe_get(cultivo, 'practicas_organicas')}")
            txt.append("│")
            
            txt.append(f"│ 🐛 Enfermedades/plagas: {safe_get(cultivo, 'enfermedades_plagas')}")
            txt.append(f"│ ⚠️ Desafíos específicos: {safe_get(cultivo, 'desafios_especificos')}")
            txt.append(f"│ 📝 Notas adicionales: {safe_get(cultivo, 'notas_adicionales')}")
            txt.append("│")
            
            # DATOS METEOROLÓGICOS
            cultivo_id = cultivo.get('cultivo_id')
            weather_list = weather_by_cultivo.get(cultivo_id, [])
            
            if weather_list:
                txt.append(f"│ ┌─ DATOS METEOROLÓGICOS ({len(weather_list)} registros) " + "─" * 20)
                
                for w_idx, weather in enumerate(weather_list, 1):
                    txt.append("│ │")
                    txt.append(f"│ │ 🌦️ Registro #{w_idx}:")
                    txt.append(f"│ │ 📅 Fecha: {safe_get(weather, 'created_at')}")
                    txt.append(f"│ │ 🌡️ Temperatura: {safe_get(weather, 'temperature')}°C")
                    txt.append(f"│ │ 💧 Humedad: {safe_get(weather, 'humidity')}%")
                    txt.append(f"│ │ 🌧️ Precipitación: {safe_get(weather, 'precipitation')} mm")
                    txt.append(f"│ │ 🌬️ Viento: {safe_get(weather, 'wind_speed')} km/h ({safe_get(weather, 'wind_direction')})")
                    txt.append(f"│ │ ☁️ Nubosidad: {safe_get(weather, 'cloud_cover')}%")
                    txt.append(f"│ │ ☀️ UV Index: {safe_get(weather, 'uv_index')}")
                    txt.append(f"│ │ 👁️ Visibilidad: {safe_get(weather, 'visibility')} km")
                    txt.append(f"│ │ 📊 Presión: {safe_get(weather, 'pressure')} hPa")
                    txt.append(f"│ │ 🌅 Amanecer: {safe_get(weather, 'sunrise')}")
                    txt.append(f"│ │ 🌇 Atardecer: {safe_get(weather, 'sunset')}")
                
                txt.append("│ │")
                txt.append("│ └" + "─" * 55)
            else:
                txt.append("│ ⚠️ Sin datos meteorológicos asociados")
            
            txt.append("│")
            txt.append("└" + "─" * 68)
            txt.append("")
    
    # ============================================================
    # SECCIÓN 3: ANIMALES
    # ============================================================
    animales = data.get("animales", [])
    
    txt.append("─" * 70)
    txt.append(f"🐄 ANIMALES (Total: {len(animales)})")
    txt.append("─" * 70)
    txt.append("")
    
    if not animales:
        txt.append("  ⚠️ No hay animales registrados.")
        txt.append("")
    else:
        for i, animal in enumerate(animales, 1):
            txt.append(f"┌─ ANIMAL #{i} (ID: {animal.get('animal_id')}) " + "─" * 40)
            txt.append("│")
            txt.append(f"│ 🐾 Tipo: {safe_get(animal, 'tipo_animal')}")
            txt.append(f"│ 🔢 Cantidad: {safe_get(animal, 'cantidad')}")
            txt.append(f"│ 🏷️ Raza: {safe_get(animal, 'raza_animal')}")
            txt.append(f"│ 🎯 Uso: {safe_get(animal, 'uso_animal')}")
            txt.append("│")
            
            txt.append(f"│ 📍 Ubicación en mapa: X={safe_get(animal, 'coordenada_x')}, Y={safe_get(animal, 'coordenada_y')}")
            txt.append(f"│ 🌍 Coordenadas GPS: {safe_get(animal, 'latitud')}, {safe_get(animal, 'longitud')}")
            txt.append(f"│ 📌 Ubicación texto: {safe_get(animal, 'ubicacion_texto')}")
            txt.append("│")
            
            txt.append(f"│ 📅 Edad promedio: {safe_get(animal, 'edad_promedio')}")
            txt.append(f"│ 💊 Estado de salud: {safe_get(animal, 'estado_salud')}")
            txt.append(f"│ 💉 Vacunación: {safe_get(animal, 'estado_vacunacion')}")
            txt.append(f"│ 🏥 Manejo veterinario: {safe_get(animal, 'manejo_veterinario')}")
            txt.append(f"│ 🦠 Enfermedades comunes: {safe_get(animal, 'enfermedades_comunes')}")
            txt.append("│")
            
            txt.append(f"│ 🏠 Sistema de alojamiento: {safe_get(animal, 'sistema_alojamiento')}")
            txt.append(f"│ 🔄 Método de reproducción: {safe_get(animal, 'metodo_reproduccion')}")
            txt.append("│")
            
            txt.append(f"│ 🌾 Tipo de alimentación: {safe_get(animal, 'tipo_alimentacion')}")
            txt.append(f"│ 📋 Detalles alimentación: {safe_get(animal, 'detalles_alimentacion')}")
            txt.append(f"│ 💧 Fuentes de agua: {safe_get(animal, 'fuentes_agua')}")
            txt.append("│")
            
            txt.append(f"│ 📊 Producción esperada: {safe_get(animal, 'produccion_esperada')}")
            txt.append(f"│ 📜 Certificaciones: {safe_get(animal, 'certificaciones')}")
            txt.append("│")
            
            txt.append(f"│ ⚠️ Desafíos principales: {safe_get(animal, 'desafios_principales')}")
            txt.append(f"│ 📝 Notas adicionales: {safe_get(animal, 'notas_adicionales')}")
            txt.append("│")
            txt.append("└" + "─" * 68)
            txt.append("")
    
    # ============================================================
    # SECCIÓN 4: BIBLIOTECA
    # ============================================================
    biblioteca = data.get("biblioteca")
    if biblioteca:
        txt.append("─" * 70)
        txt.append("📚 BIBLIOTECA - CONOCIMIENTO Y HABILIDADES")
        txt.append("─" * 70)
        txt.append("")
        
        txt.append(f"📍 Ubicación en mapa: X={safe_get(biblioteca, 'coordenada_x')}, Y={safe_get(biblioteca, 'coordenada_y')}")
        txt.append("")
        
        txt.append(f"🎓 Nivel de experiencia: {safe_get(biblioteca, 'nivel_experiencia')}")
        txt.append(f"📅 Años de experiencia: {safe_get(biblioteca, 'anos_experiencia')}")
        txt.append(f"📖 Tipo de educación: {safe_get(biblioteca, 'tipo_educacion')}")
        txt.append(f"📚 Nivel de alfabetización: {safe_get(biblioteca, 'nivel_alfabetizacion')}")
        txt.append("")
        
        txt.append(f"🗣️ Idioma nativo: {safe_get(biblioteca, 'idioma_nativo')}")
        txt.append(f"🌍 Otros idiomas: {safe_get(biblioteca, 'otros_idiomas')}")
        txt.append("")
        
        txt.append(f"💻 Acceso a tecnología: {safe_get(biblioteca, 'acceso_tecnologia')}")
        txt.append("")
        
        txt.append(f"🌾 Técnicas agrícolas: {safe_get(biblioteca, 'tecnicas_agricolas')}")
        txt.append(f"🔧 Otras técnicas: {safe_get(biblioteca, 'otras_tecnicas')}")
        txt.append(f"🌍 Conocimiento de suelos: {safe_get(biblioteca, 'conocimiento_suelos')}")
        txt.append(f"🐛 Conocimiento de plagas: {safe_get(biblioteca, 'conocimiento_plagas')}")
        txt.append(f"🌦️ Conocimiento del clima: {safe_get(biblioteca, 'conocimiento_clima')}")
        txt.append(f"🌱 Variedades de cultivos: {safe_get(biblioteca, 'variedades_cultivos')}")
        txt.append(f"📦 Conocimiento postcosecha: {safe_get(biblioteca, 'conocimiento_postcosecha')}")
        txt.append("")
        
        txt.append(f"🌾 Cultivos principales: {safe_get(biblioteca, 'cultivos_principales')}")
        txt.append(f"🐄 Experiencia con animales: {safe_get(biblioteca, 'experiencia_animales')}")
        txt.append(f"🔨 Conocimiento de herramientas: {safe_get(biblioteca, 'conocimiento_herramientas')}")
        txt.append("")
        
        txt.append(f"📜 Certificaciones: {safe_get(biblioteca, 'certificaciones')}")
        txt.append(f"🏆 Logros: {safe_get(biblioteca, 'logros')}")
        txt.append("")
        
        txt.append(f"🌿 Sabiduría ancestral: {safe_get(biblioteca, 'sabiduria_ancestral')}")
        txt.append(f"🌺 Plantas medicinales: {safe_get(biblioteca, 'plantas_medicinales')}")
        txt.append(f"🌾 Semillas nativas: {safe_get(biblioteca, 'semillas_nativas')}")
        txt.append("")
        
        txt.append(f"🤝 Asociaciones: {safe_get(biblioteca, 'asociaciones')}")
        txt.append(f"📰 Fuentes de información: {safe_get(biblioteca, 'fuentes_informacion')}")
        txt.append(f"💡 Dispuesto a compartir: {safe_get(biblioteca, 'dispuesto_compartir')}")
        txt.append(f"📚 Necesidades de aprendizaje: {safe_get(biblioteca, 'necesidades_aprendizaje')}")
        txt.append("")
        txt.append("")
    
    # ============================================================
    # SECCIÓN 5: FUENTES DE AGUA
    # ============================================================
    fuentes_agua = data.get("fuentes_agua", [])
    
    txt.append("─" * 70)
    txt.append(f"💧 FUENTES DE AGUA (Total: {len(fuentes_agua)})")
    txt.append("─" * 70)
    txt.append("")
    
    if not fuentes_agua:
        txt.append("  ⚠️ No hay fuentes de agua registradas.")
        txt.append("")
    else:
        for i, fuente in enumerate(fuentes_agua, 1):
            txt.append(f"┌─ FUENTE #{i} (ID: {fuente.get('fuente_agua_id')}) " + "─" * 30)
            txt.append("│")
            txt.append(f"│ 💧 Tipo: {safe_get(fuente, 'tipo_fuente')}")
            txt.append(f"│ 📌 Nombre: {safe_get(fuente, 'nombre', 'Sin nombre')}")
            txt.append("│")
            txt.append(f"│ 📍 Ubicación en mapa: X={safe_get(fuente, 'coordenada_x')}, Y={safe_get(fuente, 'coordenada_y')}")
            txt.append(f"│ 🌍 Coordenadas GPS: {safe_get(fuente, 'latitud')}, {safe_get(fuente, 'longitud')}")
            txt.append(f"│ 📌 Ubicación texto: {safe_get(fuente, 'ubicacion_texto')}")
            txt.append("│")
            txt.append(f"│ 🎯 Descripción de uso: {safe_get(fuente, 'descripcion_uso')}")
            txt.append(f"│ 🔧 Métodos de extracción: {safe_get(fuente, 'metodos_extraccion')}")
            txt.append(f"│ 🔨 Otros métodos: {safe_get(fuente, 'otros_metodos')}")
            txt.append("│")
            txt.append("└" + "─" * 68)
            txt.append("")
    
    # ============================================================
    # SECCIÓN 6: ALMACENES
    # ============================================================
    almacenes_alimentos = data.get("almacenes_alimentos", [])
    almacenes_materiales = data.get("almacenes_materiales", [])
    
    txt.append("─" * 70)
    txt.append("🏪 ALMACENES")
    txt.append("─" * 70)
    txt.append("")
    
    txt.append(f"🍎 ALMACENES DE ALIMENTOS (Total: {len(almacenes_alimentos)})")
    txt.append("")
    
    if not almacenes_alimentos:
        txt.append("  ⚠️ No hay almacenes de alimentos registrados.")
        txt.append("")
    else:
        for i, almacen in enumerate(almacenes_alimentos, 1):
            txt.append(f"  ┌─ ALMACÉN ALIMENTOS #{i} (ID: {almacen.get('almacen_id')}) ────")
            txt.append(f"  │ 📍 Ubicación en mapa: X={safe_get(almacen, 'coordenada_x')}, Y={safe_get(almacen, 'coordenada_y')}")
            txt.append(f"  │ 📊 Capacidad total: {safe_get(almacen, 'capacidad_total')}")
            txt.append(f"  │ 📦 Capacidad usada: {safe_get(almacen, 'capacidad_usada')}")
            txt.append(f"  │ 📋 Inventario: {safe_get(almacen, 'inventario')}")
            txt.append(f"  └" + "─" * 50)
            txt.append("")
    
    txt.append(f"🔨 ALMACENES DE MATERIALES (Total: {len(almacenes_materiales)})")
    txt.append("")
    
    if not almacenes_materiales:
        txt.append("  ⚠️ No hay almacenes de materiales registrados.")
        txt.append("")
    else:
        for i, almacen in enumerate(almacenes_materiales, 1):
            txt.append(f"  ┌─ ALMACÉN MATERIALES #{i} (ID: {almacen.get('almacen_id')}) ────")
            txt.append(f"  │ 📍 Ubicación en mapa: X={safe_get(almacen, 'coordenada_x')}, Y={safe_get(almacen, 'coordenada_y')}")
            txt.append(f"  │ 📊 Capacidad total: {safe_get(almacen, 'capacidad_total')}")
            txt.append(f"  │ 📦 Capacidad usada: {safe_get(almacen, 'capacidad_usada')}")
            txt.append(f"  │ 📋 Inventario: {safe_get(almacen, 'inventario')}")
            txt.append(f"  └" + "─" * 50)
            txt.append("")
    
    # ============================================================
    # PIE DE PÁGINA
    # ============================================================
    txt.append("═" * 70)
    txt.append("  FIN DEL CONTEXTO DE DATOS")
    txt.append("═" * 70)
    
    return "\n".join(txt)

def main():
    """Función principal"""
    
    # Obtener user_id de argumentos o usar el global
    user_id = USER_ID
    if len(sys.argv) > 1:
        try:
            user_id = int(sys.argv[1])
        except:
            print("⚠️ User ID inválido, extrayendo todos los datos")
            user_id = None
    
    # Extraer datos
    data = extract_all_data(user_id)
    
    # Generar contenido TXT
    print("📝 Generando archivo TXT...")
    txt_content = generate_txt_content(data, user_id)
    
    # Guardar archivo
    filename = f"agroverse_data{'_user_' + str(user_id) if user_id else ''}.txt"
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(txt_content)
    
    print(f"✅ Archivo guardado: {filename}")
    print(f"📊 Tamaño: {len(txt_content)} caracteres")
    print()
    print("=" * 70)
    print("  EXTRACCIÓN COMPLETADA")
    print("=" * 70)

if __name__ == "__main__":
    main()
