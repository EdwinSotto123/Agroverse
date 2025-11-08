#!/bin/bash

set -e

SERVICE_NAME="agroverse-gemini-rag"
REGION="us-central1" # Cambia esto a tu región preferida
PROJECT_ID=$(gcloud config get-value project)

echo "🚀 Desplegando el servicio Gemini + RAG de AgroVerse a Cloud Run..."
echo "Servicio: $SERVICE_NAME"
echo "Región: $REGION"
echo "Proyecto: $PROJECT_ID"
echo "====================================================================="

# 1. Construir la imagen de Docker
echo "📦 Construyendo imagen de Docker..."
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME .
echo "✅ Imagen construida."

# 2. Autenticar Docker con Google Container Registry (GCR)
echo "🔑 Autenticando Docker con GCR..."
gcloud auth configure-docker
echo "✅ Autenticación GCR completada."

# 3. Subir la imagen a Google Container Registry
echo "⬆️ Subiendo imagen a GCR..."
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME
echo "✅ Imagen subida a GCR."

# 4. Desplegar a Cloud Run
echo "☁️ Desplegando a Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="YOUR_GEMINI_API_KEY" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --port 8080 \
  --project $PROJECT_ID

echo "✅ Servicio $SERVICE_NAME desplegado en Cloud Run."
echo "====================================================================="
echo "🎉 ¡Despliegue completado!"
echo "Puedes acceder a tu servicio en la URL proporcionada por Cloud Run."
echo "Para ver los logs: gcloud run services logs $SERVICE_NAME --region $REGION --project $PROJECT_ID"
echo "Para actualizar el servicio: Ejecuta este script de nuevo."
echo ""
echo "⚠️  IMPORTANTE: Actualiza la variable GEMINI_API_KEY con tu API key real:"
echo "gcloud run services update $SERVICE_NAME --region $REGION --update-env-vars GEMINI_API_KEY=tu_api_key_aqui"
