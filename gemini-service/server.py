"""
SERVICIO GEMINI + RAG - AGROVERSE
Asistente Agronómico Inteligente con Retrieval-Augmented Generation
Gemini 2.0 Flash + Vertex AI Vector Search + Knowledge Base Agrícola
Optimizado para Cloud Run
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
from datetime import datetime
import json
import base64
import requests

# Google Cloud AI
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel, Part, SafetySetting
    from vertexai.language_models import TextEmbeddingModel
    VERTEXAI_AVAILABLE = True
except ImportError:
    VERTEXAI_AVAILABLE = False
    logging.warning("Vertex AI no disponible")

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuración GCP
GCP_PROJECT_ID = os.getenv('GCP_PROJECT_ID', '')
GCP_REGION = os.getenv('GCP_REGION', 'us-central1')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

# Inicializar Vertex AI
if VERTEXAI_AVAILABLE and GCP_PROJECT_ID:
    try:
        vertexai.init(project=GCP_PROJECT_ID, location=GCP_REGION)
        logger.info("✅ Vertex AI inicializado")
    except Exception as e:
        logger.error(f"❌ Error inicializando Vertex AI: {e}")

# Simular base de conocimientos agrícola
AGRICULTURAL_KNOWLEDGE_BASE = [
    {
        "id": "fao_001",
        "title": "Manejo Integrado de Plagas en Papa",
        "source": "FAO - Guía de Buenas Prácticas Agrícolas",
        "content": """
        El manejo integrado de plagas (MIP) en papa debe considerar:
        1. Monitoreo regular del cultivo (2-3 veces por semana)
        2. Uso de variedades resistentes cuando sea posible
        3. Rotación de cultivos para romper ciclos de plagas
        4. Control biológico antes que químico
        5. Aplicación de pesticidas solo cuando sea necesario
        
        Plagas principales: Polilla de la papa, Gusano blanco, Pulgones
        Umbrales de acción: >5% de plantas afectadas
        """,
        "keywords": ["papa", "plagas", "mip", "control", "pulgones", "polilla"],
        "embedding": [0.23, 0.45, 0.67, 0.12, 0.89]  # Simulado
    },
    {
        "id": "nasa_002",
        "title": "Interpretación de NDVI para Salud de Cultivos",
        "source": "NASA Earth Observatory",
        "content": """
        El NDVI (Normalized Difference Vegetation Index) es un indicador de salud vegetal:
        
        Valores de NDVI:
        - 0.8 - 1.0: Vegetación muy densa y saludable (bosques)
        - 0.6 - 0.8: Vegetación moderada a densa (cultivos saludables)
        - 0.4 - 0.6: Vegetación moderada (cultivos en crecimiento)
        - 0.2 - 0.4: Vegetación escasa (cultivos estresados o suelo con cobertura)
        - 0.0 - 0.2: Suelo desnudo o vegetación muy escasa
        - < 0: Agua, nieve, nubes
        
        Un NDVI decreciente indica estrés por sequía, plagas o enfermedades.
        """,
        "keywords": ["ndvi", "salud", "vegetación", "satelital", "índice", "estrés"],
        "embedding": [0.78, 0.34, 0.56, 0.91, 0.23]  # Simulado
    },
    {
        "id": "inia_003",
        "title": "Predicción y Prevención de Heladas",
        "source": "INIA Perú - Manual de Agricultura Andina",
        "content": """
        Estrategias para prevenir daños por heladas:
        
        Predicción:
        - Temperatura < 5°C y descendiendo: riesgo medio
        - Temperatura < 2°C: riesgo alto
        - Humedad baja + cielo despejado + viento calmo = alta probabilidad
        
        Métodos de protección:
        1. Riego por aspersión antes de helada (libera calor)
        2. Quema de biomasa para generar humo y calor
        3. Mantas térmicas o coberturas plásticas
        4. Siembra escalonada para diversificar riesgo
        
        Cultivos más sensibles: papa, maíz, tomate (daño a -2°C)
        Cultivos resistentes: quinua, habas, cebada (resisten hasta -8°C)
        """,
        "keywords": ["heladas", "frío", "protección", "temperatura", "prevención"],
        "embedding": [0.45, 0.67, 0.23, 0.89, 0.12]  # Simulado
    },
    {
        "id": "fao_004",
        "title": "Riego Eficiente y Manejo del Agua",
        "source": "FAO - Productividad del Agua",
        "content": """
        Principios de riego eficiente:
        
        1. Riego por goteo: 90-95% eficiencia
        2. Riego por aspersión: 75-85% eficiencia
        3. Riego por gravedad: 50-70% eficiencia
        
        Cálculo de necesidades:
        - Evapotranspiración (ET0) - Precipitación efectiva = Déficit hídrico
        - Regar cuando déficit > 25% del agua disponible en suelo
        
        Uso de NDWI (Normalized Difference Water Index):
        - NDWI > 0.2: Sin estrés hídrico
        - NDWI 0 - 0.2: Estrés leve
        - NDWI < 0: Estrés moderado a severo
        
        Momento óptimo de riego: temprano en la mañana o tarde
        """,
        "keywords": ["riego", "agua", "eficiencia", "sequía", "ndwi", "goteo"],
        "embedding": [0.34, 0.56, 0.78, 0.12, 0.45]  # Simulado
    },
    {
        "id": "nasa_005",
        "title": "Temperatura Superficial (LST) y Estrés Térmico",
        "source": "NASA POWER - Agroclimatología",
        "content": """
        Land Surface Temperature (LST) indica estrés térmico:
        
        Umbrales críticos por cultivo:
        - Papa: LST > 35°C = estrés severo
        - Maíz: LST > 38°C = reducción de rendimiento
        - Tomate: LST > 32°C = caída de flores
        
        Interpretación:
        - LST nocturna < 10°C: Riesgo de helada
        - LST diurna > 40°C: Estrés térmico extremo
        - Diferencia día-noche > 20°C: Alta radiación, riesgo de helada
        
        Mitigación:
        - Mulching para reducir temperatura del suelo
        - Riego por aspersión para enfriamiento evaporativo
        - Mallas de sombreado en cultivos sensibles
        """,
        "keywords": ["temperatura", "lst", "estrés", "térmico", "calor", "landsat"],
        "embedding": [0.67, 0.23, 0.45, 0.78, 0.34]  # Simulado
    }
]


def simulate_vector_search(query, top_k=3):
    """
    Simular búsqueda vectorial en base de conocimientos
    En producción, esto usaría Vertex AI Vector Search
    """
    # Simular scoring basado en keywords
    results = []
    query_lower = query.lower()
    
    for doc in AGRICULTURAL_KNOWLEDGE_BASE:
        score = 0.0
        # Calcular score simple basado en keywords
        for keyword in doc['keywords']:
            if keyword in query_lower:
                score += 1.0
        
        # Normalizar
        score = score / max(len(doc['keywords']), 1)
        
        if score > 0:
            results.append({
                'document': doc,
                'score': score
            })
    
    # Ordenar por score y retornar top_k
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:top_k]


def build_rag_prompt(query, context_docs, user_data=None):
    """Construir prompt RAG con contexto recuperado"""
    
    # Construir contexto de documentos recuperados
    context_text = "\n\n---\n\n".join([
        f"**Fuente**: {doc['document']['source']}\n"
        f"**Título**: {doc['document']['title']}\n"
        f"**Contenido**:\n{doc['document']['content']}"
        for doc in context_docs
    ])
    
    # Agregar datos del usuario si están disponibles
    user_context = ""
    if user_data:
        user_context = f"""
DATOS DEL USUARIO:
- Cultivos: {user_data.get('crops', 'No especificado')}
- Ubicación: {user_data.get('location', 'No especificado')}
- Experiencia: {user_data.get('experience', 'No especificado')}
"""
    
    prompt = f"""Eres un asistente agronómico experto que ayuda a agricultores con información precisa y práctica.

CONTEXTO DE CONOCIMIENTO AGRÍCOLA:
{context_text}

{user_context}

PREGUNTA DEL AGRICULTOR:
{query}

INSTRUCCIONES:
1. Responde basándote PRINCIPALMENTE en el contexto proporcionado
2. Si el contexto no es suficiente, indica qué información adicional necesitas
3. Cita las fuentes específicas cuando uses información del contexto
4. Sé práctico y específico, evita generalidades
5. Usa lenguaje sencillo, considera que el usuario puede tener baja alfabetización digital
6. Si mencionas valores numéricos (NDVI, temperatura, etc.), explica qué significan

FORMATO DE RESPUESTA:
- Respuesta directa y práctica
- Pasos de acción específicos si aplica
- Fuentes citadas al final
"""
    
    return prompt


def call_gemini_api(prompt, image_data=None):
    """
    Llamar a Gemini API (simulado para demo)
    En producción, usar Vertex AI SDK
    """
    if not GEMINI_API_KEY:
        # Respuesta simulada
        return {
            "response": "Esta es una respuesta simulada del asistente agronómico. "
                       "En producción, aquí vendría la respuesta generada por Gemini 2.0 Flash "
                       "basada en el contexto RAG y la pregunta del usuario.",
            "model": "gemini-2.0-flash-simulated",
            "sources": ["FAO", "NASA", "INIA"]
        }
    
    # Llamada real a Gemini API
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            },
            "safetySettings": [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            ]
        }
        
        if image_data:
            payload["contents"][0]["parts"].append({
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": image_data
                }
            })
        
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        text = result['candidates'][0]['content']['parts'][0]['text']
        
        return {
            "response": text,
            "model": "gemini-2.0-flash",
            "sources": []  # Extraer de la respuesta si es necesario
        }
        
    except Exception as e:
        logger.error(f"Error llamando a Gemini API: {e}")
        raise


@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        "status": "healthy",
        "service": "gemini-rag",
        "vertexai": VERTEXAI_AVAILABLE,
        "knowledge_base_size": len(AGRICULTURAL_KNOWLEDGE_BASE),
        "timestamp": datetime.utcnow().isoformat()
    })


@app.route('/chat', methods=['POST'])
def chat():
    """
    Chat con asistente agronómico RAG
    
    Body JSON:
    {
        "query": "¿Cómo interpreto un NDVI de 0.45 en mi cultivo de papa?",
        "user_data": {
            "user_id": 1,
            "crops": ["papa", "maíz"],
            "location": "Cusco, Perú",
            "experience": "5 años"
        }
    }
    """
    try:
        data = request.get_json()
        
        query = data.get('query')
        user_data = data.get('user_data', {})
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query es requerido"
            }), 400
        
        logger.info(f"Query recibida: {query}")
        
        # 1. Búsqueda vectorial en knowledge base
        relevant_docs = simulate_vector_search(query, top_k=3)
        logger.info(f"Documentos relevantes encontrados: {len(relevant_docs)}")
        
        # 2. Construir prompt RAG
        rag_prompt = build_rag_prompt(query, relevant_docs, user_data)
        
        # 3. Llamar a Gemini
        gemini_response = call_gemini_api(rag_prompt)
        
        # 4. Extraer fuentes citadas
        sources = [doc['document']['source'] for doc in relevant_docs]
        
        return jsonify({
            "success": True,
            "response": gemini_response['response'],
            "sources": sources,
            "relevant_documents": [
                {
                    "title": doc['document']['title'],
                    "source": doc['document']['source'],
                    "relevance_score": doc['score']
                }
                for doc in relevant_docs
            ],
            "metadata": {
                "model": gemini_response.get('model', 'simulated'),
                "query": query,
                "timestamp": datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error en chat: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    """
    Análisis multimodal de imágenes con Gemini
    
    Body JSON:
    {
        "image": "base64_encoded_image",
        "query": "¿Qué enfermedad tiene mi planta?",
        "crop_type": "papa"
    }
    """
    try:
        data = request.get_json()
        
        image_base64 = data.get('image')
        query = data.get('query', '¿Qué ves en esta imagen?')
        crop_type = data.get('crop_type', 'desconocido')
        
        if not image_base64:
            return jsonify({
                "success": False,
                "error": "Imagen es requerida"
            }), 400
        
        # Construir prompt especializado para análisis de imagen agrícola
        image_prompt = f"""Eres un agrónomo experto analizando una imagen de cultivo.

TIPO DE CULTIVO: {crop_type}

PREGUNTA: {query}

Analiza la imagen y proporciona:
1. Diagnóstico visual (color, textura, patrones anormales)
2. Posibles problemas identificados (plagas, enfermedades, deficiencias)
3. Nivel de severidad (leve, moderado, severo)
4. Recomendaciones de acción inmediata
5. Seguimiento sugerido

Sé específico y práctico en tus recomendaciones.
"""
        
        # Llamar a Gemini con imagen
        gemini_response = call_gemini_api(image_prompt, image_data=image_base64)
        
        return jsonify({
            "success": True,
            "analysis": gemini_response['response'],
            "crop_type": crop_type,
            "metadata": {
                "model": "gemini-2.0-flash-vision",
                "timestamp": datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error en análisis de imagen: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/extract-sensor-values', methods=['POST'])
def extract_sensor_values():
    """
    Extraer valores numéricos de fotos de medidores de suelo
    
    Body JSON:
    {
        "image": "base64_encoded_image",
        "sensor_type": "3-in-1" (pH, humedad, luz)
    }
    """
    try:
        data = request.get_json()
        
        image_base64 = data.get('image')
        sensor_type = data.get('sensor_type', '3-in-1')
        
        if not image_base64:
            return jsonify({
                "success": False,
                "error": "Imagen es requerida"
            }), 400
        
        extraction_prompt = f"""Analiza esta imagen de un medidor de suelo tipo {sensor_type}.

TAREA: Extraer los valores numéricos que muestra el medidor.

Medidores comunes:
- 3-in-1: pH (4-9), Humedad (1-10), Luz (0-2000 lux)
- 4-in-1: pH, Humedad, Temperatura, Luz
- Digital: Lecturas numéricas en pantalla LCD

INSTRUCCIONES:
1. Identifica el tipo exacto de medidor
2. Lee cada valor mostrado
3. Indica unidades de medida
4. Si hay alguna lectura dudosa, indica "no legible"

FORMATO DE RESPUESTA (JSON):
{{
    "sensor_type": "3-in-1",
    "readings": {{
        "ph": 6.5,
        "humidity": 7,
        "light": 850
    }},
    "confidence": "high/medium/low",
    "notes": "Cualquier observación adicional"
}}
"""
        
        gemini_response = call_gemini_api(extraction_prompt, image_data=image_base64)
        
        # Intentar parsear JSON de la respuesta
        try:
            # Extraer JSON de la respuesta
            import re
            json_match = re.search(r'\{.*\}', gemini_response['response'], re.DOTALL)
            if json_match:
                extracted_data = json.loads(json_match.group())
            else:
                extracted_data = {"raw_response": gemini_response['response']}
        except:
            extracted_data = {"raw_response": gemini_response['response']}
        
        return jsonify({
            "success": True,
            "extracted_values": extracted_data,
            "metadata": {
                "model": "gemini-2.0-flash-vision",
                "sensor_type": sensor_type,
                "timestamp": datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error extrayendo valores: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/knowledge-base', methods=['GET'])
def get_knowledge_base():
    """Listar documentos en la base de conocimientos"""
    documents = [
        {
            "id": doc['id'],
            "title": doc['title'],
            "source": doc['source'],
            "keywords": doc['keywords']
        }
        for doc in AGRICULTURAL_KNOWLEDGE_BASE
    ]
    
    return jsonify({
        "success": True,
        "total_documents": len(documents),
        "documents": documents
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    host = os.getenv('HOST', '0.0.0.0')
    
    logger.info(f"🤖 Servicio Gemini + RAG - Asistente Agronómico")
    logger.info(f"☁️  Plataforma: Google Cloud Run + Vertex AI")
    logger.info(f"📚 Base de conocimientos: {len(AGRICULTURAL_KNOWLEDGE_BASE)} documentos")
    logger.info(f"📍 Host: {host}:{port}")
    logger.info(f"🚀 Starting...")
    
    app.run(host=host, port=port)

