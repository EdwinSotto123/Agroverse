# Dockerfile para servicio de predicciones con ML
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python (puede tardar)
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código y modelos
COPY server.py .
COPY create_empty_models.py .
COPY models/ ./models/

# Variables de entorno
ENV PORT=8080
ENV PYTHONUNBUFFERED=1
ENV MODEL_PATH=./models

# Usuario no root
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Exponer puerto
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/health')"

# Comando de inicio
CMD ["python", "server.py"]

