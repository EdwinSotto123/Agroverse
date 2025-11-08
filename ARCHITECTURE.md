# 🏗️ Arquitectura Completa de AgroVerse - Google Cloud Platform

## 📊 Diagrama de Servicios

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAPA DE PRESENTACIÓN                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │              FRONTEND (React 18 PWA)                               │    │
│  │  • Game Engine Canvas 2D (Gemelo Digital)                          │    │
│  │  • Dashboard Agrícola                                               │    │
│  │  • Voice Commands (Web Speech API)                                  │    │
│  │  • Offline-First (Service Workers)                                  │    │
│  │  Deploy: Firebase Hosting / Netlify                                 │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
                                   │ HTTPS / WebSocket
                                   │
┌──────────────────────────────────┴───────────────────────────────────────────┐
│                        CAPA DE MICROSERVICIOS                                │
│                          (Google Cloud Run)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │ DATABASE API     │  │ WEATHER API      │  │ IMAGE PROCESSING │         │
│  │ FastAPI + PG     │  │ Flask + NASA     │  │ Flask + EE       │         │
│  │ :8080            │  │ :8080            │  │ :8080            │         │
│  │                  │  │                  │  │                  │         │
│  │ • CRUD Usuarios  │  │ • Open-Meteo     │  │ • Sentinel-2     │         │
│  │ • Cultivos       │  │ • NASA POWER     │  │ • Landsat-8      │         │
│  │ • Animales       │  │ • Agroclimatolog.│  │ • NDVI, EVI      │         │
│  │ • Biblioteca     │  │ • Forecast 7d    │  │ • NDWI, SAVI     │         │
│  │ • Auth/Sessions  │  │                  │  │ • LST            │         │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘         │
│           │                     │                     │                     │
│           │                     │                     │                     │
│  ┌────────┴─────────┐  ┌────────┴──────────┐  ┌────────┴─────────┐        │
│  │  PREDICTIONS     │  │   GEMINI + RAG    │  │  IoT GATEWAY     │        │
│  │  Flask + ML      │  │   Flask + Gemini  │  │  (Futuro)        │        │
│  │  :8080           │  │   :8080           │  │  :8080           │        │
│  │                  │  │                   │  │                  │        │
│  │ • Heladas (Keras)│  │ • RAG Search      │  │ • MQTT Broker    │        │
│  │ • Sequía (PyTorch│  │ • Chat Agronomico │  │ • Sensor Data    │        │
│  │ • Plagas (RF)    │  │ • Image Analysis  │  │ • Real-time      │        │
│  │ • Multi-predict  │  │ • Sensor Extract  │  │                  │        │
│  └──────────────────┘  └───────────────────┘  └──────────────────┘        │
│                                                                              │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
                                   │
┌──────────────────────────────────┴───────────────────────────────────────────┐
│                      CAPA DE DATOS Y SERVICIOS GCP                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐                        │
│  │ Google Cloud SQL     │  │ Firestore            │                        │
│  │ (PostgreSQL)         │  │ (NoSQL Real-time)    │                        │
│  │ • Usuarios           │  │ • Game State         │                        │
│  │ • Cultivos           │  │ • Offline Sync       │                        │
│  │ • Series temporales  │  │ • Real-time updates  │                        │
│  └──────────────────────┘  └──────────────────────┘                        │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐                        │
│  │ BigQuery             │  │ Cloud Storage        │                        │
│  │ (Data Warehouse)     │  │ (Object Storage)     │                        │
│  │ • Índices espectrales│  │ • Imágenes satelitales│                       │
│  │ • Datos meteorológicos│  │ • Fotos de usuarios  │                        │
│  │ • Eventos agrícolas  │  │ • Modelos ML (.h5)   │                        │
│  │ • Analytics          │  │ • Backups            │                        │
│  └──────────────────────┘  └──────────────────────┘                        │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐                        │
│  │ Google Earth Engine  │  │ Vertex AI            │                        │
│  │ (Geoespacial)        │  │ (Machine Learning)   │                        │
│  │ • Sentinel-2         │  │ • Vector Search (RAG)│                        │
│  │ • Landsat-8          │  │ • Model Training     │                        │
│  │ • Procesamiento      │  │ • Embeddings         │                        │
│  │ • Time Series        │  │ • Model Monitoring   │                        │
│  └──────────────────────┘  └──────────────────────┘                        │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐                        │
│  │ Gemini 2.0 Flash     │  │ Cloud Functions      │                        │
│  │ (Generative AI)      │  │ (Serverless)         │                        │
│  │ • Chat agronómico    │  │ • Cron Jobs          │                        │
│  │ • Image Analysis     │  │ • Triggers           │                        │
│  │ • Sensor Extract     │  │ • Event Processing   │                        │
│  │ • RAG Generation     │  │ • Alertas            │                        │
│  └──────────────────────┘  └──────────────────────┘                        │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐                        │
│  │ Firebase Auth        │  │ Google Maps Platform │                        │
│  │ • Multi-device       │  │ • Geolocation        │                        │
│  │ • OAuth 2.0          │  │ • Geocoding          │                        │
│  │ • Session Management │  │ • Base Maps          │                        │
│  └──────────────────────┘  └──────────────────────┘                        │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐                        │
│  │ Cloud Pub/Sub        │  │ Cloud Monitoring     │                        │
│  │ • IoT MQTT           │  │ • Logs               │                        │
│  │ • Event Streaming    │  │ • Metrics            │                        │
│  │ • Async Processing   │  │ • Alertas            │                        │
│  └──────────────────────┘  └──────────────────────┘                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 Flujo de Datos

### 1. Usuario Dibuja Parcela
```
Frontend → Firestore (sync) → BigQuery (analytics)
```

### 2. Análisis Satelital Automatizado
```
Cloud Function (cron 3 días) → 
  Image Processing Service → 
    Google Earth Engine (Sentinel-2) → 
      Cloud Storage (imágenes) → 
        BigQuery (índices NDVI, EVI, etc.)
```

### 3. Predicción de Heladas
```
Weather Service (datos) → 
  Predictions Service (modelo ML) → 
    Cloud Function (evaluar riesgo) → 
      Frontend (alerta push)
```

### 4. Consulta al Asistente IA
```
Frontend (query) → 
  Gemini Service → 
    Vertex AI Vector Search (docs relevantes) → 
      Gemini 2.0 Flash (RAG generation) → 
        Frontend (respuesta + fuentes)
```

### 5. Subir Foto de Medidor
```
Frontend (imagen) → 
  Cloud Storage (upload) → 
    Gemini Service (OCR + análisis) → 
      Database API (guardar valores) → 
        Firestore (sync) → Frontend
```

## 📊 Tabla de Servicios

| Servicio | Puerto | Framework | BD | Propósito | URL |
|----------|--------|-----------|-------|-----------|-----|
| **database-api** | 8080 | FastAPI | Cloud SQL | CRUD usuarios, cultivos | `/usuarios`, `/cultivos` |
| **weather-api** | 8080 | Flask | Cloud SQL | Datos meteorológicos | `/weather`, `/weather/nasa-power` |
| **image-processing** | 8080 | Flask | - | Análisis satelital | `/process/sentinel2`, `/process/landsat8` |
| **predictions** | 8080 | Flask | - | ML predictions | `/predict/frost`, `/predict/drought` |
| **gemini-rag** | 8080 | Flask | - | Asistente IA + RAG | `/chat`, `/analyze-image` |

## 🔐 Seguridad

### Autenticación
- **Firebase Auth**: Autenticación multi-dispositivo
- **OAuth 2.0**: Google Sign-In
- **JWT Tokens**: Sesiones seguras

### Autorización
- **IAM Roles**: Permisos granulares GCP
- **Service Accounts**: Comunicación inter-servicios
- **Secret Manager**: API keys y credenciales

### Network
- **VPC**: Red privada para servicios
- **Cloud Armor**: Protección DDoS
- **SSL/TLS**: HTTPS en todos los endpoints

## 💰 Estimación de Costos Mensuales

### Escenario: 1,000 usuarios activos

| Servicio | Configuración | Costo/Mes |
|----------|---------------|-----------|
| Cloud Run (5 servicios) | 1-2 GB RAM, 1-2 vCPU | $50-150 |
| Cloud SQL | db-f1-micro | $15-30 |
| Firestore | 1 GB storage + 1M reads | $5-15 |
| BigQuery | 10 GB storage + 100 GB queries | $10-25 |
| Cloud Storage | 50 GB | $1-3 |
| Earth Engine | Académico | $0 |
| Gemini 2.0 Flash | 1M tokens | $0.30-5 |
| Vertex AI Vector Search | 10K queries | $10-20 |
| Firebase Auth | 10K MAU | $0 |
| Google Maps | 10K requests | $0-10 |
| Cloud Monitoring | Logs + Metrics | $5-15 |
| **TOTAL** | | **$96-273/mes** |

### Escenario: 10,000 usuarios activos

| Componente | Costo/Mes |
|------------|-----------|
| Cloud Run (autoescalado) | $300-800 |
| Cloud SQL (db-n1-standard-1) | $50-100 |
| Otros servicios (escalados) | $150-300 |
| **TOTAL** | **$500-1,200/mes** |

## 🚀 Pipeline de Deployment

```bash
# 1. Build y push todas las imágenes
./deploy-all-services.sh

# 2. Servicios se despliegan en paralelo
# - agroverse-database
# - agroverse-weather
# - agroverse-image-processing
# - agroverse-predictions
# - agroverse-gemini-rag

# 3. Cloud Run autoescala según demanda
# Min instances: 0
# Max instances: 10 (configurable)

# 4. Health checks automáticos
# Cada 30s, timeout 10s

# 5. Rolling updates
# Zero downtime deployments
```

## 📈 Escalabilidad

### Horizontal
- **Cloud Run**: Autoescala hasta 10 instancias por servicio
- **BigQuery**: Procesamiento paralelo distribuido
- **Firestore**: Replicación multi-región

### Vertical
- **Cloud SQL**: Upgrade a instancias más grandes
- **Cloud Run**: Aumentar CPU/RAM por instancia
- **Earth Engine**: Sin límites (gestionado por Google)

### Optimizaciones
- **Caching**: Redis/Memorystore para queries frecuentes
- **CDN**: Cloud CDN para assets estáticos
- **Connection Pooling**: Pooling de conexiones SQL

## 🔧 Monitoreo y Observabilidad

### Métricas Clave
- **Latencia**: p50, p95, p99 por servicio
- **Error Rate**: % de requests fallidos
- **Throughput**: Requests/segundo
- **Resource Usage**: CPU, RAM, Storage

### Alertas
- **Downtime**: Servicio no responde >1min
- **High Latency**: p95 >2 segundos
- **Error Spike**: >5% error rate
- **Resource Exhaustion**: >90% CPU/RAM

### Logging
```
Cloud Logging → 
  Log Explorer (búsqueda) → 
    BigQuery (análisis) → 
      Dashboards (visualización)
```

## 🌍 Multi-Región (Futuro)

```
┌─────────────────────────────────────┐
│  us-central1 (Primary)              │
│  • Cloud Run services               │
│  • Cloud SQL (Master)               │
│  • BigQuery                         │
└─────────────────────────────────────┘
         │
         │ Replication
         ▼
┌─────────────────────────────────────┐
│  southamerica-east1 (Secondary)     │
│  • Cloud Run services               │
│  • Cloud SQL (Replica)              │
│  • Firestore (Multi-region)         │
└─────────────────────────────────────┘
```

## 📚 Stack Tecnológico Resumido

### Frontend
- React 18, TypeScript, TailwindCSS
- Canvas 2D, Socket.io, PWA

### Backend
- FastAPI, Flask, Python 3.11+
- TensorFlow, PyTorch, Scikit-learn

### Google Cloud
- Cloud Run, Cloud SQL, Firestore
- BigQuery, Cloud Storage
- Earth Engine, Vertex AI
- Gemini 2.0 Flash

### DevOps
- Docker, GitHub Actions
- Cloud Build, Artifact Registry
- Cloud Monitoring, Cloud Logging

---

**Actualizado**: Noviembre 2024  
**Versión**: 2.0.0  
**Hackathon**: Intelligent Planet 2025

