#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# SCRIPT MAESTRO DE DEPLOYMENT - AGROVERSE
# Despliega todos los microservicios a Google Cloud Run
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════"
echo "   🌾 AGROVERSE - DEPLOYMENT COMPLETO A GOOGLE CLOUD RUN"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar que gcloud esté instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI no está instalado"
    echo "Instala desde: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo "Instala desde: https://docs.docker.com/get-docker/"
    exit 1
fi

# Obtener ID del proyecto
PROJECT_ID=$(gcloud config get-value project)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No se ha configurado un proyecto de GCP"
    echo "Ejecuta: gcloud config set project TU_PROJECT_ID"
    exit 1
fi

echo "📍 Proyecto GCP: $PROJECT_ID"
echo "📍 Región por defecto: us-central1"
echo ""

# Confirmar con el usuario
read -p "¿Deseas continuar con el deployment de TODOS los servicios? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelado"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   FASE 1/5: Database Service"
echo "════════════════════════════════════════════════════════════════"

cd server-database
if [ -f "deploy.sh" ]; then
    chmod +x deploy.sh
    ./deploy.sh
else
    echo "⚠️  deploy.sh no encontrado en server-database, saltando..."
fi
cd ..

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   FASE 2/5: Weather Service"
echo "════════════════════════════════════════════════════════════════"

cd satelital-data
if [ -f "deploy-cloudrun.sh" ]; then
    chmod +x deploy-cloudrun.sh
    ./deploy-cloudrun.sh
else
    echo "⚠️  deploy-cloudrun.sh no encontrado en satelital-data, saltando..."
fi
cd ..

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   FASE 3/5: Image Processing Service"
echo "════════════════════════════════════════════════════════════════"

cd image-processing-service
if [ -f "deploy.sh" ]; then
    chmod +x deploy.sh
    ./deploy.sh
else
    echo "⚠️  deploy.sh no encontrado en image-processing-service, saltando..."
fi
cd ..

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   FASE 4/5: Predictions Service"
echo "════════════════════════════════════════════════════════════════"

cd predictions-service
if [ ! -d "models" ] || [ -z "$(ls -A models)" ]; then
    echo "📦 Creando modelos ML vacíos..."
    python create_empty_models.py || echo "⚠️  No se pudieron crear modelos"
fi

if [ -f "deploy.sh" ]; then
    chmod +x deploy.sh
    ./deploy.sh
else
    echo "⚠️  deploy.sh no encontrado en predictions-service, saltando..."
fi
cd ..

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   FASE 5/5: Gemini + RAG Service"
echo "════════════════════════════════════════════════════════════════"

cd gemini-service
if [ ! -d "knowledge_base" ]; then
    mkdir -p knowledge_base
fi

if [ -f "deploy.sh" ]; then
    chmod +x deploy.sh
    ./deploy.sh
else
    echo "⚠️  deploy.sh no encontrado en gemini-service, saltando..."
fi
cd ..

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   ✅ DEPLOYMENT COMPLETADO"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Resumen de servicios desplegados:"
echo ""

# Listar servicios en Cloud Run
gcloud run services list --platform=managed --region=us-central1 | grep agroverse || echo "Sin servicios encontrados"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   🔧 PASOS SIGUIENTES"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "1. Obtener URLs de los servicios:"
echo "   gcloud run services list --platform=managed --format='table(name,url)'"
echo ""
echo "2. Actualizar game/config_services.js con las URLs reales"
echo ""
echo "3. Configurar variables de entorno sensibles:"
echo "   • GEMINI_API_KEY para gemini-service"
echo "   • DB_PASSWORD para todos los servicios que usen Cloud SQL"
echo ""
echo "   Ejemplo:"
echo "   gcloud run services update agroverse-gemini-rag \\"
echo "     --region us-central1 \\"
echo "     --update-env-vars GEMINI_API_KEY=tu_api_key_aqui"
echo ""
echo "4. Probar los servicios:"
echo "   curl https://agroverse-database.run.app/health"
echo "   curl https://agroverse-weather.run.app/health"
echo "   curl https://agroverse-image-processing.run.app/health"
echo "   curl https://agroverse-predictions.run.app/health"
echo "   curl https://agroverse-gemini-rag.run.app/health"
echo ""
echo "5. Ver logs en tiempo real:"
echo "   gcloud run services logs tail SERVICE_NAME --region=us-central1"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   🎉 ¡Listo para Intelligent Planet Hackathon 2025!"
echo "════════════════════════════════════════════════════════════════"

