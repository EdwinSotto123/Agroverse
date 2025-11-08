# 🤖 Servicio de Predicciones Agrícolas - AgroVerse

Servicio Cloud Run con modelos de Machine Learning para predicción de eventos agrícolas críticos.

## 🎯 Predicciones Disponibles

### 1. Heladas (Frost Prediction)
- **Modelo**: TensorFlow/Keras
- **Algoritmo**: Red neuronal densa (DNN)
- **Input**: 10 features meteorológicos
- **Output**: Probabilidad de helada (0-1) + nivel de riesgo
- **Ventana**: 12-48 horas

**Features utilizados:**
- Temperatura mínima/máxima
- Humedad relativa
- Velocidad del viento
- Cobertura de nubes
- Punto de rocío
- Presión atmosférica
- Hora del día
- Estación del año
- Elevación
- Latitud

### 2. Sequía (Drought Prediction)
- **Modelo**: PyTorch
- **Algoritmo**: LSTM (Long Short-Term Memory)
- **Input**: 15 features temporales
- **Output**: Probabilidad de sequía + déficit hídrico (mm)
- **Ventana**: 7-30 días

**Features utilizados:**
- Evapotranspiración (ET0)
- Precipitación acumulada
- Humedad del suelo (4 niveles)
- NDWI (Normalized Difference Water Index)
- Temperatura
- Radiación solar
- Déficit de presión de vapor
- Series temporales (30 días)

### 3. Plagas (Pest Prediction)
- **Modelo**: Scikit-learn Random Forest
- **Algoritmo**: Ensemble de árboles de decisión
- **Input**: 8 features ambientales + crop type
- **Output**: Probabilidad de plaga + nivel de riesgo
- **Ventana**: 7-14 días

**Features utilizados:**
- Temperatura
- Humedad
- NDVI
- Tipo de cultivo
- Etapa fenológica
- Precipitación
- Historial de plagas
- Región geográfica

## 📊 Arquitectura de Modelos

```
┌─────────────────────────────────────────────────┐
│         SERVICIO DE PREDICCIONES                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐   ┌──────────────┐          │
│  │ Heladas      │   │ Sequía       │          │
│  │ (Keras)      │   │ (PyTorch)    │          │
│  │ DNN          │   │ LSTM         │          │
│  └──────────────┘   └──────────────┘          │
│                                                 │
│  ┌──────────────┐   ┌──────────────┐          │
│  │ Plagas       │   │ Yield        │          │
│  │ (Scikit-learn)│   │ (Future)     │          │
│  │ Random Forest│   │              │          │
│  └──────────────┘   └──────────────┘          │
│                                                 │
└─────────────────────────────────────────────────┘
         ↓
    Cloud Run (Autoescalado)
```

## 🚀 Endpoints API

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "predictions",
  "models_loaded": {
    "frost": true,
    "drought": true,
    "pest": true
  },
  "tensorflow": true,
  "pytorch": true
}
```

### Predicción de Heladas
```bash
POST /predict/frost
Content-Type: application/json

{
  "temp_min": 3.5,
  "temp_max": 18.2,
  "humidity": 55,
  "wind_speed": 2.3,
  "cloud_cover": 10,
  "latitude": -13.1631,
  "longitude": -74.2236,
  "date": "2024-12-15",
  "hours_ahead": 24
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "probability": 0.75,
    "risk_level": "alto",
    "model_type": "trained_ml_model"
  },
  "metadata": {
    "service": "frost_prediction",
    "timestamp": "2024-12-14T10:30:00Z",
    "location": {
      "latitude": -13.1631,
      "longitude": -74.2236
    }
  }
}
```

### Predicción de Sequía
```bash
POST /predict/drought
Content-Type: application/json

{
  "evapotranspiration": 5.2,
  "precipitation_sum": 0.5,
  "soil_moisture": 25,
  "ndwi": -0.15,
  "temperature": 28,
  "latitude": -13.1631,
  "longitude": -74.2236
}
```

### Predicción de Plagas
```bash
POST /predict/pest
Content-Type: application/json

{
  "temperature": 25,
  "humidity": 75,
  "ndvi": 0.5,
  "crop_type": "potato",
  "latitude": -13.1631,
  "longitude": -74.2236
}
```

### Predicción Múltiple
```bash
POST /predict/multi
Content-Type: application/json

{
  "temp_min": 3.5,
  "temp_max": 18.2,
  "humidity": 55,
  "wind_speed": 2.3,
  "cloud_cover": 10,
  "evapotranspiration": 5.2,
  "precipitation_sum": 0.5,
  "soil_moisture": 25,
  "ndvi": 0.5,
  "ndwi": -0.15,
  "crop_type": "potato",
  "latitude": -13.1631,
  "longitude": -74.2236
}
```

## 🔧 Desarrollo y Entrenamiento

### Crear Modelos Base
```bash
python create_empty_models.py
```

Esto crea modelos vacíos en `models/`:
- `frost_prediction_model.h5` (Keras)
- `drought_prediction_model.pt` (PyTorch)
- `pest_prediction_model.pkl` (Scikit-learn)

### Entrenar con Datos Reales

#### 1. Preparar Datasets
```python
# Ejemplo para heladas
import pandas as pd
import numpy as np

# Cargar datos históricos de NASA POWER + eventos documentados
df = pd.read_csv('frost_events_historical.csv')

# Features
X = df[['temp_min', 'temp_max', 'humidity', 'wind_speed', ...]]

# Labels (0 = no helada, 1 = helada)
y = df['frost_occurred']

# Split train/test
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25)
```

#### 2. Entrenar Modelo
```python
import tensorflow as tf
from tensorflow import keras

# Cargar modelo base
model = keras.models.load_model('models/frost_prediction_model.h5')

# Entrenar
history = model.fit(
    X_train, y_train,
    epochs=100,
    batch_size=32,
    validation_split=0.2,
    callbacks=[
        keras.callbacks.EarlyStopping(patience=10),
        keras.callbacks.ModelCheckpoint('models/frost_best.h5', save_best_only=True)
    ]
)

# Evaluar
loss, accuracy, auc = model.evaluate(X_test, y_test)
print(f'Accuracy: {accuracy:.2%}, AUC: {auc:.3f}')

# Guardar modelo entrenado
model.save('models/frost_prediction_model.h5')
```

#### 3. Desplegar Modelo Actualizado
```bash
# Reconstruir imagen con nuevo modelo
docker build -t agroverse-predictions:latest .

# Desplegar
gcloud run deploy agroverse-predictions \
    --image gcr.io/PROJECT_ID/agroverse-predictions:latest
```

## 📊 Fuentes de Datos

### Datos de Entrenamiento

1. **NASA POWER API**
   - Datos meteorológicos históricos (1981-presente)
   - Temperatura, precipitación, humedad, viento
   - Resolución: 0.5° x 0.5° (~50km)

2. **Google Earth Engine**
   - Series temporales de NDVI, NDWI, LST
   - Sentinel-2 (2017-presente)
   - Landsat-8 (2013-presente)

3. **Registros de Eventos**
   - SENAMHI (Perú): heladas documentadas
   - FAO: plagas y enfermedades
   - INIA: rendimientos y pérdidas

### Preparación de Datasets

Ver notebooks en `notebooks/`:
- `01_prepare_frost_dataset.ipynb`
- `02_prepare_drought_dataset.ipynb`
- `03_prepare_pest_dataset.ipynb`

## 🎯 Métricas de Performance

| Modelo | Accuracy | Precision | Recall | F1-Score | AUC |
|--------|----------|-----------|--------|----------|-----|
| Heladas | 82% | 0.85 | 0.78 | 0.81 | 0.88 |
| Sequía  | 78% | 0.80 | 0.75 | 0.77 | 0.84 |
| Plagas  | 75% | 0.72 | 0.73 | 0.72 | 0.80 |

*Métricas objetivo. Los modelos base requieren entrenamiento con datos reales.*

## 💰 Costos Estimados (Cloud Run)

- Memoria: 2 GiB × $0.0025/GiB-hora
- CPU: 2 vCPUs × $0.024/vCPU-hora
- Solicitudes: $0.40 / millón
- Storage (modelos): ~500 MB

**Estimado mensual:** $20-100 para 1000-10000 predicciones/mes

## 🔒 Seguridad y Mejores Prácticas

1. **Validación de Input**: Rangos esperados para cada feature
2. **Rate Limiting**: Máximo 100 requests/minuto/usuario
3. **Model Versioning**: Guardar versiones anteriores
4. **A/B Testing**: Comparar modelos en producción
5. **Monitoring**: Vertex AI Model Monitoring

## 📚 Referencias

- [TensorFlow Keras](https://www.tensorflow.org/guide/keras)
- [PyTorch](https://pytorch.org/docs/stable/index.html)
- [Scikit-learn](https://scikit-learn.org/stable/)
- [Vertex AI](https://cloud.google.com/vertex-ai/docs)
- [NASA POWER](https://power.larc.nasa.gov/)

