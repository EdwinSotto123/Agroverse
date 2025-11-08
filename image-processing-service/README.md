# 🛰️ Servicio de Procesamiento de Imágenes Satelitales - AgroVerse

Servicio Cloud Run para procesamiento de imágenes satelitales usando Google Earth Engine.

## Características

- **Sentinel-2**: Índices espectrales (NDVI, EVI, NDWI, SAVI)
- **Landsat-8**: Temperatura superficial (LST)
- **Análisis temporal**: Series temporales de índices
- **Detección de nubes**: Filtrado automático
- **Escalado automático**: Cloud Run maneja la carga

## Índices Espectrales

### NDVI (Normalized Difference Vegetation Index)
- Rango: -1 a 1
- > 0.6: Vegetación densa y saludable
- 0.2-0.6: Vegetación moderada
- < 0.2: Suelo desnudo o vegetación escasa

### EVI (Enhanced Vegetation Index)
- Mejora sobre NDVI, reduce efectos atmosféricos
- Rango: -1 a 1

### NDWI (Normalized Difference Water Index)
- Detección de contenido de agua en vegetación
- > 0: Alta humedad
- < 0: Baja humedad

### LST (Land Surface Temperature)
- Temperatura superficial del terreno en °C
- Útil para detección de heladas

## Endpoints

### Health Check
```bash
GET /health
```

### Procesar Sentinel-2
```bash
POST /process/sentinel2
Content-Type: application/json

{
  "latitude": -13.1631,
  "longitude": -74.2236,
  "buffer_km": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "indices": ["NDVI", "EVI", "NDWI"]
}
```

### Procesar Landsat-8 (LST)
```bash
POST /process/landsat8
Content-Type: application/json

{
  "latitude": -13.1631,
  "longitude": -74.2236,
  "buffer_km": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

### Análisis Completo
```bash
POST /process/full-analysis
Content-Type: application/json

{
  "latitude": -13.1631,
  "longitude": -74.2236,
  "buffer_km": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

## Deployment

```bash
# Configurar variables
export GCP_PROJECT_ID="tu-project-id"
export GCP_REGION="us-central1"

# Deploy
./deploy.sh
```

## Desarrollo Local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Autenticar Earth Engine
earthengine authenticate

# Ejecutar
python server.py
```

## Configuración Earth Engine

Para producción, necesitas:
1. Service Account de GCP
2. Activar Earth Engine API
3. Dar permisos al Service Account

```bash
# Crear service account
gcloud iam service-accounts create agroverse-ee-sa

# Dar permisos
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:agroverse-ee-sa@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/earthengine.reader"
```

## Resoluciones y Limitaciones

- **Sentinel-2**: 10m (bandas visibles e NIR), 20m (SWIR)
- **Landsat-8**: 30m (bandas visibles e NIR), 100m (térmica, resampled a 30m)
- **Frecuencia de revisita**: Sentinel-2 (5 días), Landsat-8 (16 días)
- **Cobertura de nubes**: Filtro automático < 20%

## Costos

Earth Engine es gratuito para uso académico y no comercial. Para uso comercial, consulta [Earth Engine pricing](https://earthengine.google.com/commercial/).

Cloud Run se cobra por uso:
- Memoria: ~$0.0025 / GB-hora
- CPU: ~$0.024 / vCPU-hora
- Solicitudes: $0.40 / millón

Estimado: ~$10-50/mes para 1000-10000 análisis mensuales.

