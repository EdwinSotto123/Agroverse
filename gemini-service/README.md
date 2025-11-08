# 🤖 AgroVerse Gemini + RAG Service

Servicio de asistente agronómico inteligente que integra Gemini 2.0 Flash con un sistema de Retrieval-Augmented Generation (RAG) para proporcionar respuestas contextualizadas y citadas sobre agricultura.

## ✨ Características

- **Chat Agronómico**: Respuestas en lenguaje natural sobre agricultura
- **RAG (Retrieval-Augmented Generation)**: Búsqueda semántica en base de conocimientos agrícolas
- **Análisis Multimodal**: Interpretación de imágenes de cultivos y sensores
- **Extracción OCR**: Lectura inteligente de valores de medidores de suelo
- **Citas de Fuentes**: Todas las respuestas incluyen referencias verificables

## 📚 Base de Conocimientos

La base de conocimientos incluye documentos de:

- **FAO**: Guías de Buenas Prácticas Agrícolas
- **NASA**: Interpretación de datos satelitales y agroclimatológicos
- **INIA**: Manuales de agricultura andina y manejo de cultivos locales
- **USGS**: Teledetección y análisis de imágenes satelitales

## 🚀 Deployment

### Prerequisitos

- Google Cloud SDK instalado y configurado
- Docker instalado
- API Key de Gemini (obtener en [Google AI Studio](https://aistudio.google.com/))

### Paso 1: Configurar API Key

Edita `server.py` o usa variables de entorno:

```bash
export GEMINI_API_KEY="tu_api_key_aqui"
```

### Paso 2: Desplegar a Cloud Run

```bash
cd gemini-service
chmod +x deploy.sh
./deploy.sh
```

### Paso 3: Actualizar API Key en Cloud Run

```bash
gcloud run services update agroverse-gemini-rag \
  --region us-central1 \
  --update-env-vars GEMINI_API_KEY=tu_api_key_real
```

## 🛠️ Uso

### Endpoints

#### 1. Chat con el Asistente (RAG)

**POST** `/chat`

```json
{
  "query": "¿Cómo interpreto un NDVI bajo en mi cultivo de papa?",
  "user_data": {
    "crops": ["papa"],
    "location": "Cusco, Perú",
    "farm_size": 5
  }
}
```

**Respuesta**:
```json
{
  "success": true,
  "response": "Un NDVI bajo en papa puede indicar...",
  "sources": [
    "FAO - Guía de Buenas Prácticas Agrícolas",
    "NASA - Interpretación de NDVI"
  ],
  "metadata": {
    "model": "gemini-2.0-flash",
    "timestamp": "2024-11-08T12:00:00Z"
  }
}
```

#### 2. Analizar Imagen

**POST** `/analyze-image`

```json
{
  "image": "data:image/jpeg;base64,...",
  "query": "¿Qué problema tiene este cultivo?",
  "crop_type": "tomate"
}
```

#### 3. Extraer Valores de Sensor

**POST** `/extract-sensor-values`

```json
{
  "image": "data:image/jpeg;base64,...",
  "sensor_type": "3-in-1"
}
```

**Respuesta**:
```json
{
  "success": true,
  "values": {
    "ph": 6.5,
    "humidity": 7,
    "light": 1200
  },
  "confidence": "high",
  "sensor_type": "3-in-1"
}
```

#### 4. Obtener Base de Conocimientos

**GET** `/knowledge-base`

```json
{
  "success": true,
  "documents": ["papa", "maiz", "heladas", "ndvi"],
  "total_documents": 4
}
```

#### 5. Health Check

**GET** `/health`

## ⚙️ Desarrollo Local

### 1. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 2. Configurar API Key

```bash
export GEMINI_API_KEY="tu_api_key"
```

### 3. Ejecutar servidor

```bash
python server.py
```

El servidor estará disponible en `http://localhost:8080`

### 4. Probar endpoints

```bash
# Chat
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "¿Cómo prevenir heladas?", "user_data": {}}'

# Health check
curl http://localhost:8080/health
```

## 📊 Base de Conocimientos RAG

### Estructura

La base de conocimientos se almacena en `knowledge_base/agro_docs.json`:

```json
{
  "keyword": "Descripción detallada del tema agrícola. Fuentes: FAO, NASA, INIA.",
  ...
}
```

### Agregar Nuevos Documentos

Edita `knowledge_base/agro_docs.json` y reinicia el servicio:

```json
{
  "nuevo_tema": "Descripción completa con información técnica. Fuentes: Organización."
}
```

### Futuro: Vector Search

En producción, se recomienda migrar a **Vertex AI Vector Search** para:
- Búsqueda semántica más sofisticada
- Escalabilidad a miles de documentos
- Embeddings con `text-embedding-004`

## 💰 Costos Estimados

### Gemini 2.0 Flash

- **Precio**: $0.30 por millón de tokens de entrada
- **Estimado**: 10,000 consultas/mes ≈ $2-5/mes

### Cloud Run

- **CPU/RAM**: $0.00002400 por vCPU-segundo
- **Requests**: Primeros 2M gratuitos
- **Estimado**: 10,000 requests/mes ≈ $0-3/mes

**Total**: ~$2-8/mes para 10,000 consultas

## 🔒 Seguridad

### ⚠️ IMPORTANTE

- **NUNCA** expongas `GEMINI_API_KEY` en código cliente
- Usa **Secret Manager** en producción:

```bash
# Crear secreto
gcloud secrets create gemini-api-key --data-file=./api_key.txt

# Actualizar Cloud Run para usar secreto
gcloud run services update agroverse-gemini-rag \
  --update-secrets GEMINI_API_KEY=gemini-api-key:latest
```

### CORS

Por defecto, el servicio acepta requests de cualquier origen. En producción, restringe:

```python
# server.py
CORS(app, origins=['https://agroverse.app'])
```

## 📈 Monitoreo

### Logs

```bash
gcloud run services logs agroverse-gemini-rag \
  --region us-central1 \
  --limit 50
```

### Métricas

- **Latencia**: p95 < 2 segundos
- **Error Rate**: < 1%
- **Requests/min**: Monitorear en Cloud Console

## 🚀 Roadmap

- [ ] Integración con Vertex AI Vector Search
- [ ] Embeddings con `text-embedding-004`
- [ ] Cache de respuestas frecuentes
- [ ] Streaming de respuestas largas
- [ ] Soporte multilingüe mejorado
- [ ] Fine-tuning de modelo con datos agrícolas

## 📝 Licencia

MIT License - AgroVerse 2024

---

**Desarrollado para**: Intelligent Planet Hackathon 2025  
**Stack**: Flask + Gemini 2.0 Flash + Google Cloud Run  
**Contacto**: [tu_email@agroverse.app](mailto:tu_email@agroverse.app)
