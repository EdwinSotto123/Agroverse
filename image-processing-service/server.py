"""
SERVICIO DE PROCESAMIENTO DE IMÁGENES SATELITALES - AGROVERSE
Google Earth Engine + Sentinel-2 + Landsat-8
Cálculo de índices espectrales: NDVI, EVI, NDWI, LST
Optimizado para Cloud Run
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import ee
import logging
import os
from datetime import datetime, timedelta
import json

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Inicializar Google Earth Engine
try:
    # En producción, usar service account
    service_account = os.getenv('GEE_SERVICE_ACCOUNT', '')
    key_file = os.getenv('GEE_KEY_FILE', '/secrets/gee-key.json')
    
    if service_account and os.path.exists(key_file):
        credentials = ee.ServiceAccountCredentials(service_account, key_file)
        ee.Initialize(credentials)
        logger.info("✅ Earth Engine inicializado con Service Account")
    else:
        # Desarrollo local
        ee.Initialize()
        logger.info("✅ Earth Engine inicializado (modo local)")
except Exception as e:
    logger.error(f"❌ Error inicializando Earth Engine: {e}")

# Configuración GCP
GCP_PROJECT_ID = os.getenv('GCP_PROJECT_ID', '')
GCP_REGION = os.getenv('GCP_REGION', 'us-central1')


def calculate_ndvi(image):
    """Calcular NDVI (Normalized Difference Vegetation Index)"""
    ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
    return image.addBands(ndvi)


def calculate_evi(image):
    """Calcular EVI (Enhanced Vegetation Index)"""
    evi = image.expression(
        '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))',
        {
            'NIR': image.select('B8'),
            'RED': image.select('B4'),
            'BLUE': image.select('B2')
        }
    ).rename('EVI')
    return image.addBands(evi)


def calculate_ndwi(image):
    """Calcular NDWI (Normalized Difference Water Index)"""
    ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI')
    return image.addBands(ndwi)


def calculate_savi(image):
    """Calcular SAVI (Soil Adjusted Vegetation Index)"""
    L = 0.5
    savi = image.expression(
        '((NIR - RED) / (NIR + RED + L)) * (1 + L)',
        {
            'NIR': image.select('B8'),
            'RED': image.select('B4'),
            'L': L
        }
    ).rename('SAVI')
    return image.addBands(savi)


def mask_clouds_sentinel2(image):
    """Máscara de nubes para Sentinel-2"""
    qa = image.select('QA60')
    cloudBitMask = 1 << 10
    cirrusBitMask = 1 << 11
    mask = qa.bitwiseAnd(cloudBitMask).eq(0).And(
        qa.bitwiseAnd(cirrusBitMask).eq(0))
    return image.updateMask(mask).divide(10000)


@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    try:
        # Verificar conexión a Earth Engine
        test_image = ee.Image('COPERNICUS/S2_SR/20200101T000000_20200101T000000_T01AAA')
        test_image.getInfo()
        
        return jsonify({
            "status": "healthy",
            "service": "image-processing",
            "earth_engine": "connected",
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "service": "image-processing",
            "error": str(e)
        }), 500


@app.route('/process/sentinel2', methods=['POST'])
def process_sentinel2():
    """
    Procesar imágenes Sentinel-2 y calcular índices espectrales
    
    Body JSON:
    {
        "latitude": -13.1631,
        "longitude": -74.2236,
        "buffer_km": 1,
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "indices": ["NDVI", "EVI", "NDWI", "SAVI"]
    }
    """
    try:
        data = request.get_json()
        
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        buffer_km = data.get('buffer_km', 1)
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        indices = data.get('indices', ['NDVI', 'EVI', 'NDWI'])
        
        if not all([latitude, longitude, start_date, end_date]):
            return jsonify({
                "success": False,
                "error": "Faltan parámetros requeridos"
            }), 400
        
        # Crear punto de interés
        point = ee.Geometry.Point([longitude, latitude])
        region = point.buffer(buffer_km * 1000)
        
        # Cargar colección Sentinel-2
        collection = ee.ImageCollection('COPERNICUS/S2_SR') \
            .filterBounds(region) \
            .filterDate(start_date, end_date) \
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
            .map(mask_clouds_sentinel2)
        
        # Calcular índices
        if 'NDVI' in indices:
            collection = collection.map(calculate_ndvi)
        if 'EVI' in indices:
            collection = collection.map(calculate_evi)
        if 'NDWI' in indices:
            collection = collection.map(calculate_ndwi)
        if 'SAVI' in indices:
            collection = collection.map(calculate_savi)
        
        # Obtener imagen compuesta (mediana)
        composite = collection.median()
        
        # Extraer valores en el punto
        values = composite.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=region,
            scale=10,
            maxPixels=1e9
        ).getInfo()
        
        # Obtener serie temporal
        def extract_values(image):
            date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd')
            vals = image.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=region,
                scale=10,
                maxPixels=1e9
            )
            return ee.Feature(None, vals.set('date', date))
        
        time_series = collection.map(extract_values).getInfo()
        
        # Organizar resultados
        result = {
            "location": {
                "latitude": latitude,
                "longitude": longitude,
                "buffer_km": buffer_km
            },
            "date_range": {
                "start": start_date,
                "end": end_date
            },
            "composite_values": values,
            "time_series": [f['properties'] for f in time_series['features']],
            "metadata": {
                "satellite": "Sentinel-2",
                "resolution": "10m",
                "cloud_threshold": "20%",
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        logger.error(f"Error procesando Sentinel-2: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/process/landsat8', methods=['POST'])
def process_landsat8():
    """
    Procesar imágenes Landsat-8 para temperatura superficial (LST)
    
    Body JSON:
    {
        "latitude": -13.1631,
        "longitude": -74.2236,
        "buffer_km": 1,
        "start_date": "2024-01-01",
        "end_date": "2024-12-31"
    }
    """
    try:
        data = request.get_json()
        
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        buffer_km = data.get('buffer_km', 1)
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if not all([latitude, longitude, start_date, end_date]):
            return jsonify({
                "success": False,
                "error": "Faltan parámetros requeridos"
            }), 400
        
        # Crear punto de interés
        point = ee.Geometry.Point([longitude, latitude])
        region = point.buffer(buffer_km * 1000)
        
        # Cargar colección Landsat-8
        collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2') \
            .filterBounds(region) \
            .filterDate(start_date, end_date) \
            .filter(ee.Filter.lt('CLOUD_COVER', 20))
        
        def calculate_lst(image):
            """Calcular Land Surface Temperature"""
            # Banda térmica B10
            thermal = image.select('ST_B10').multiply(0.00341802).add(149.0).subtract(273.15)
            return image.addBands(thermal.rename('LST'))
        
        # Aplicar cálculo de LST
        collection = collection.map(calculate_lst)
        
        # Imagen compuesta
        composite = collection.median()
        
        # Extraer valores
        values = composite.select('LST').reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=region,
            scale=30,
            maxPixels=1e9
        ).getInfo()
        
        # Serie temporal
        def extract_lst(image):
            date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd')
            lst_val = image.select('LST').reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=region,
                scale=30,
                maxPixels=1e9
            )
            return ee.Feature(None, lst_val.set('date', date))
        
        time_series = collection.map(extract_lst).getInfo()
        
        result = {
            "location": {
                "latitude": latitude,
                "longitude": longitude,
                "buffer_km": buffer_km
            },
            "date_range": {
                "start": start_date,
                "end": end_date
            },
            "lst_celsius": values.get('LST'),
            "time_series": [f['properties'] for f in time_series['features']],
            "metadata": {
                "satellite": "Landsat-8",
                "resolution": "30m (thermal)",
                "cloud_threshold": "20%",
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        logger.error(f"Error procesando Landsat-8: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/process/full-analysis', methods=['POST'])
def full_analysis():
    """
    Análisis completo: Sentinel-2 (NDVI, EVI, NDWI) + Landsat-8 (LST)
    
    Body JSON:
    {
        "latitude": -13.1631,
        "longitude": -74.2236,
        "buffer_km": 1,
        "start_date": "2024-01-01",
        "end_date": "2024-12-31"
    }
    """
    try:
        data = request.get_json()
        
        # Procesar Sentinel-2
        sentinel_data = data.copy()
        sentinel_data['indices'] = ['NDVI', 'EVI', 'NDWI', 'SAVI']
        
        with app.test_client() as client:
            sentinel_response = client.post('/process/sentinel2', 
                                           json=sentinel_data,
                                           content_type='application/json')
            sentinel_result = sentinel_response.get_json()
            
            # Procesar Landsat-8
            landsat_response = client.post('/process/landsat8',
                                          json=data,
                                          content_type='application/json')
            landsat_result = landsat_response.get_json()
        
        return jsonify({
            "success": True,
            "sentinel2": sentinel_result.get('data', {}),
            "landsat8": landsat_result.get('data', {}),
            "analysis_type": "full_spectral_thermal"
        })
        
    except Exception as e:
        logger.error(f"Error en análisis completo: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    host = os.getenv('HOST', '0.0.0.0')
    
    logger.info(f"🛰️ Servicio de Procesamiento de Imágenes Satelitales")
    logger.info(f"☁️  Plataforma: Google Cloud Run + Earth Engine")
    logger.info(f"📍 Host: {host}:{port}")
    logger.info(f"🚀 Starting...")
    
    app.run(host=host, port=port)

