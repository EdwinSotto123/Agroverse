#!/bin/bash
# Deploy Predictions Service a Google Cloud Run

set -e

echo "🤖 DEPLOYMENT SERVICIO DE PREDICCIONES - GOOGLE CLOUD RUN"
echo "=========================================================="

# Configuración
PROJECT_ID=${GCP_PROJECT_ID:-""}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME="agroverse-predictions"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: GCP_PROJECT_ID no está configurado${NC}"
    echo "Ejecuta: export GCP_PROJECT_ID='tu-project-id'"
    exit 1
fi

echo -e "${YELLOW}[1/6] Creando modelos base...${NC}"
python create_empty_models.py

echo -e "${YELLOW}[2/6] Autenticando con Google Cloud...${NC}"
gcloud auth configure-docker

echo -e "${YELLOW}[3/6] Construyendo imagen Docker...${NC}"
docker build -t ${IMAGE_NAME}:latest .

echo -e "${YELLOW}[4/6] Subiendo imagen a Google Container Registry...${NC}"
docker push ${IMAGE_NAME}:latest

echo -e "${YELLOW}[5/6] Desplegando a Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME}:latest \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10 \
    --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID},GCP_REGION=${REGION},MODEL_PATH=./models" \
    --project ${PROJECT_ID}

echo -e "${YELLOW}[6/6] Obteniendo URL del servicio...${NC}"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
    --platform managed \
    --region ${REGION} \
    --format 'value(status.url)')

echo ""
echo -e "${GREEN}✅ DEPLOYMENT COMPLETADO${NC}"
echo "======================================"
echo "🌐 URL del servicio: ${SERVICE_URL}"
echo ""
echo "📋 Prueba el servicio:"
echo "curl ${SERVICE_URL}/health"
echo ""
echo "🤖 Ejemplo de predicción de heladas:"
echo "curl -X POST ${SERVICE_URL}/predict/frost \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"temp_min\": 3.5, \"temp_max\": 18, \"humidity\": 55, \"wind_speed\": 2, \"cloud_cover\": 10}'"

