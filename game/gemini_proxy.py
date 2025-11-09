"""
Proxy para Gemini API - Evita problemas de CORS
Este servidor recibe peticiones desde el frontend y las reenvía a Gemini API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)  # Permite peticiones desde cualquier origen

# API Key de Gemini
GEMINI_API_KEY = ''
GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

@app.route('/api/gemini/generate', methods=['POST'])
def gemini_generate():
    """
    Proxy endpoint para Gemini API generateContent
    
    Recibe:
    {
        "model": "gemini-2.5-pro",
        "contents": [...],
        "generationConfig": {...},
        "safetySettings": [...]
    }
    
    Retorna la respuesta de Gemini tal cual
    """
    try:
        data = request.get_json()
        
        # Extraer el modelo del request
        model = data.get('model', 'gemini-2.5-pro')
        
        # Construir URL de Gemini
        url = f"{GEMINI_BASE_URL}/models/{model}:generateContent?key={GEMINI_API_KEY}"
        
        # Preparar body (sin el campo 'model' que no es parte del API de Gemini)
        body = {
            'contents': data.get('contents', []),
            'generationConfig': data.get('generationConfig', {}),
            'safetySettings': data.get('safetySettings', [])
        }
        
        # Hacer petición a Gemini
        print(f"[GEMINI PROXY] Enviando petición a {model}...")
        response = requests.post(
            url,
            json=body,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        # Verificar respuesta
        if response.status_code != 200:
            print(f"[GEMINI PROXY] Error: {response.status_code} - {response.text}")
            return jsonify({
                'error': f"Gemini API error: {response.status_code}",
                'details': response.text
            }), response.status_code
        
        # Retornar respuesta de Gemini
        gemini_response = response.json()
        print(f"[GEMINI PROXY] ✅ Respuesta recibida")
        return jsonify(gemini_response)
        
    except requests.Timeout:
        return jsonify({'error': 'Timeout: Gemini tardó más de 30 segundos'}), 504
    except requests.RequestException as e:
        return jsonify({'error': f'Error de red: {str(e)}'}), 503
    except Exception as e:
        print(f"[GEMINI PROXY] Error inesperado: {e}")
        return jsonify({'error': f'Error interno: {str(e)}'}), 500

@app.route('/api/gemini/health', methods=['GET'])
def health_check():
    """Endpoint para verificar que el proxy está funcionando"""
    return jsonify({
        'status': 'ok',
        'message': 'Gemini proxy is running',
        'api_configured': bool(GEMINI_API_KEY)
    })

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Gemini API Proxy Server")
    print("=" * 60)
    print("Endpoints disponibles:")
    print("  POST http://localhost:5002/api/gemini/generate")
    print("  GET  http://localhost:5002/api/gemini/health")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5002, debug=True)
