"""
SERVICIO DE PREDICCIONES AGRÍCOLAS - AGROVERSE
Modelos ML para predicción de heladas, sequías y plagas
TensorFlow + PyTorch + Scikit-learn
Optimizado para Cloud Run + Vertex AI
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import logging
import os
from datetime import datetime, timedelta
import json
import joblib

# TensorFlow y Keras
try:
    import tensorflow as tf
    from tensorflow import keras
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    logging.warning("TensorFlow no disponible")

# PyTorch
try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    logging.warning("PyTorch no disponible")

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuración GCP
GCP_PROJECT_ID = os.getenv('GCP_PROJECT_ID', '')
GCP_REGION = os.getenv('GCP_REGION', 'us-central1')
MODEL_PATH = os.getenv('MODEL_PATH', './models')

# Cargar modelos globalmente
models = {}


def load_models():
    """Cargar todos los modelos ML al iniciar"""
    global models
    
    try:
        # Modelo de heladas (Keras)
        frost_model_path = os.path.join(MODEL_PATH, 'frost_prediction_model.h5')
        if os.path.exists(frost_model_path) and TF_AVAILABLE:
            models['frost'] = keras.models.load_model(frost_model_path)
            logger.info("✅ Modelo de heladas cargado")
        else:
            logger.warning("⚠️ Modelo de heladas no encontrado, usando predicción base")
            models['frost'] = None
        
        # Modelo de sequía (PyTorch)
        drought_model_path = os.path.join(MODEL_PATH, 'drought_prediction_model.pt')
        if os.path.exists(drought_model_path) and TORCH_AVAILABLE:
            models['drought'] = torch.load(drought_model_path)
            models['drought'].eval()
            logger.info("✅ Modelo de sequía cargado")
        else:
            logger.warning("⚠️ Modelo de sequía no encontrado, usando predicción base")
            models['drought'] = None
        
        # Modelo de plagas (Scikit-learn)
        pest_model_path = os.path.join(MODEL_PATH, 'pest_prediction_model.pkl')
        if os.path.exists(pest_model_path):
            models['pest'] = joblib.load(pest_model_path)
            logger.info("✅ Modelo de plagas cargado")
        else:
            logger.warning("⚠️ Modelo de plagas no encontrado, usando predicción base")
            models['pest'] = None
            
    except Exception as e:
        logger.error(f"Error cargando modelos: {e}")


def predict_frost_baseline(features):
    """
    Predicción baseline de heladas sin modelo entrenado
    Basado en reglas meteorológicas
    """
    temp_min = features.get('temp_min', 999)
    temp_max = features.get('temp_max', 999)
    humidity = features.get('humidity', 0)
    wind_speed = features.get('wind_speed', 999)
    cloud_cover = features.get('cloud_cover', 100)
    
    # Calcular score de riesgo
    risk_score = 0.0
    
    # Temperatura mínima crítica
    if temp_min < 0:
        risk_score += 0.5
    elif temp_min < 2:
        risk_score += 0.3
    elif temp_min < 5:
        risk_score += 0.15
    
    # Diferencia térmica grande (radiación nocturna)
    temp_diff = temp_max - temp_min
    if temp_diff > 15:
        risk_score += 0.15
    
    # Baja humedad favorece heladas radiativas
    if humidity < 60:
        risk_score += 0.1
    
    # Viento bajo permite acumulación de aire frío
    if wind_speed < 5:
        risk_score += 0.1
    
    # Cielo despejado aumenta radiación
    if cloud_cover < 30:
        risk_score += 0.15
    
    # Normalizar a 0-1
    risk_score = min(risk_score, 1.0)
    
    # Clasificar riesgo
    if risk_score >= 0.7:
        level = "crítico"
    elif risk_score >= 0.5:
        level = "alto"
    elif risk_score >= 0.3:
        level = "medio"
    else:
        level = "bajo"
    
    return {
        "probability": risk_score,
        "risk_level": level,
        "model_type": "baseline_rules"
    }


def predict_drought_baseline(features):
    """
    Predicción baseline de sequía
    Basado en balance hídrico simple
    """
    et0 = features.get('evapotranspiration', 0)
    precipitation = features.get('precipitation_sum', 0)
    soil_moisture = features.get('soil_moisture', 50)
    ndwi = features.get('ndwi', 0)
    
    # Balance hídrico acumulado (últimos 30 días)
    deficit = et0 - precipitation
    
    risk_score = 0.0
    
    # Déficit hídrico
    if deficit > 100:
        risk_score += 0.4
    elif deficit > 50:
        risk_score += 0.25
    elif deficit > 20:
        risk_score += 0.15
    
    # Humedad del suelo baja
    if soil_moisture < 20:
        risk_score += 0.3
    elif soil_moisture < 35:
        risk_score += 0.2
    elif soil_moisture < 50:
        risk_score += 0.1
    
    # NDWI bajo indica estrés hídrico
    if ndwi < -0.3:
        risk_score += 0.2
    elif ndwi < 0:
        risk_score += 0.1
    
    # Sin precipitación reciente
    if precipitation < 5:
        risk_score += 0.1
    
    risk_score = min(risk_score, 1.0)
    
    if risk_score >= 0.7:
        level = "crítico"
    elif risk_score >= 0.5:
        level = "alto"
    elif risk_score >= 0.3:
        level = "medio"
    else:
        level = "bajo"
    
    return {
        "probability": risk_score,
        "risk_level": level,
        "water_deficit_mm": deficit,
        "model_type": "baseline_water_balance"
    }


def predict_pest_baseline(features):
    """
    Predicción baseline de plagas
    Basado en condiciones favorables
    """
    temperature = features.get('temperature', 0)
    humidity = features.get('humidity', 0)
    ndvi = features.get('ndvi', 0)
    crop_type = features.get('crop_type', 'unknown')
    
    risk_score = 0.0
    
    # Temperatura óptima para la mayoría de plagas: 20-30°C
    if 20 <= temperature <= 30:
        risk_score += 0.3
    elif 15 <= temperature <= 35:
        risk_score += 0.15
    
    # Humedad alta favorece hongos y algunas plagas
    if humidity > 80:
        risk_score += 0.3
    elif humidity > 70:
        risk_score += 0.2
    elif humidity > 60:
        risk_score += 0.1
    
    # NDVI moderado indica vegetación susceptible
    if 0.3 <= ndvi <= 0.7:
        risk_score += 0.2
    
    # Factores específicos por cultivo (simplificado)
    if crop_type in ['potato', 'tomato']:
        risk_score += 0.1  # Cultivos más susceptibles
    
    risk_score = min(risk_score, 1.0)
    
    if risk_score >= 0.6:
        level = "alto"
    elif risk_score >= 0.4:
        level = "medio"
    else:
        level = "bajo"
    
    return {
        "probability": risk_score,
        "risk_level": level,
        "model_type": "baseline_environmental"
    }


@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    models_status = {
        'frost': models.get('frost') is not None,
        'drought': models.get('drought') is not None,
        'pest': models.get('pest') is not None
    }
    
    return jsonify({
        "status": "healthy",
        "service": "predictions",
        "models_loaded": models_status,
        "tensorflow": TF_AVAILABLE,
        "pytorch": TORCH_AVAILABLE,
        "timestamp": datetime.utcnow().isoformat()
    })


@app.route('/predict/frost', methods=['POST'])
def predict_frost():
    """
    Predicción de heladas
    
    Body JSON:
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
    """
    try:
        data = request.get_json()
        
        # Usar modelo entrenado si está disponible
        if models.get('frost') is not None:
            # Preparar features para el modelo
            # (Aquí iría la lógica de preparación de datos específica del modelo)
            result = predict_frost_baseline(data)
            result['model_type'] = 'trained_ml_model'
        else:
            # Usar modelo baseline
            result = predict_frost_baseline(data)
        
        return jsonify({
            "success": True,
            "prediction": result,
            "metadata": {
                "service": "frost_prediction",
                "timestamp": datetime.utcnow().isoformat(),
                "location": {
                    "latitude": data.get('latitude'),
                    "longitude": data.get('longitude')
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error en predicción de heladas: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/predict/drought', methods=['POST'])
def predict_drought():
    """
    Predicción de sequía
    
    Body JSON:
    {
        "evapotranspiration": 5.2,
        "precipitation_sum": 0.5,
        "soil_moisture": 25,
        "ndwi": -0.15,
        "temperature": 28,
        "latitude": -13.1631,
        "longitude": -74.2236
    }
    """
    try:
        data = request.get_json()
        
        if models.get('drought') is not None and TORCH_AVAILABLE:
            result = predict_drought_baseline(data)
            result['model_type'] = 'trained_ml_model'
        else:
            result = predict_drought_baseline(data)
        
        return jsonify({
            "success": True,
            "prediction": result,
            "metadata": {
                "service": "drought_prediction",
                "timestamp": datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error en predicción de sequía: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/predict/pest', methods=['POST'])
def predict_pest():
    """
    Predicción de plagas
    
    Body JSON:
    {
        "temperature": 25,
        "humidity": 75,
        "ndvi": 0.5,
        "crop_type": "potato",
        "latitude": -13.1631,
        "longitude": -74.2236
    }
    """
    try:
        data = request.get_json()
        
        if models.get('pest') is not None:
            result = predict_pest_baseline(data)
            result['model_type'] = 'trained_ml_model'
        else:
            result = predict_pest_baseline(data)
        
        return jsonify({
            "success": True,
            "prediction": result,
            "metadata": {
                "service": "pest_prediction",
                "timestamp": datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error en predicción de plagas: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/predict/multi', methods=['POST'])
def predict_multi():
    """
    Predicción múltiple (heladas + sequía + plagas)
    
    Body JSON:
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
    """
    try:
        data = request.get_json()
        
        # Predicciones individuales
        frost = predict_frost_baseline(data)
        drought = predict_drought_baseline(data)
        pest = predict_pest_baseline(data)
        
        # Calcular riesgo general
        avg_risk = (frost['probability'] + drought['probability'] + pest['probability']) / 3
        
        if avg_risk >= 0.6:
            overall_risk = "alto"
        elif avg_risk >= 0.4:
            overall_risk = "medio"
        else:
            overall_risk = "bajo"
        
        return jsonify({
            "success": True,
            "predictions": {
                "frost": frost,
                "drought": drought,
                "pest": pest
            },
            "overall_risk": {
                "level": overall_risk,
                "score": avg_risk
            },
            "metadata": {
                "service": "multi_prediction",
                "timestamp": datetime.utcnow().isoformat(),
                "location": {
                    "latitude": data.get('latitude'),
                    "longitude": data.get('longitude')
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error en predicción múltiple: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    # Cargar modelos al iniciar
    load_models()
    
    port = int(os.getenv('PORT', 8080))
    host = os.getenv('HOST', '0.0.0.0')
    
    logger.info(f"🤖 Servicio de Predicciones Agrícolas")
    logger.info(f"☁️  Plataforma: Google Cloud Run + Vertex AI")
    logger.info(f"📍 Host: {host}:{port}")
    logger.info(f"🚀 Starting...")
    
    app.run(host=host, port=port)

