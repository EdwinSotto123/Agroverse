#!/bin/bash
# Deploy Image Processing Service a Google Cloud Run

set -e

echo "🛰️ DEPLOYMENT SERVICIO PROCESAMIENTO DE IMÁGENES - GOOGLE CLOUD RUN"
echo "====================================================================="

# Configuración
PROJECT_ID=${GCP_PROJECT_ID:-""}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME="agroverse-image-processing"
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

echo -e "${YELLOW}[1/5] Autenticando con Google Cloud...${NC}"
gcloud auth configure-docker

echo -e "${YELLOW}[2/5] Construyendo imagen Docker...${NC}"
docker build -t ${IMAGE_NAME}:latest .

echo -e "${YELLOW}[3/5] Subiendo imagen a Google Container Registry...${NC}"
docker push ${IMAGE_NAME}:latest

echo -e "${YELLOW}[4/5] Desplegando a Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME}:latest \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10 \
    --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID},GCP_REGION=${REGION}" \
    --project ${PROJECT_ID}

echo -e "${YELLOW}[5/5] Obteniendo URL del servicio...${NC}"
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
echo "🛰️ Ejemplo de uso:"
echo "curl -X POST ${SERVICE_URL}/process/sentinel2 \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"latitude\": -13.1631, \"longitude\": -74.2236, \"start_date\": \"2024-01-01\", \"end_date\": \"2024-12-31\"}'"

