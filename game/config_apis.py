import os

# Configuración de base de datos Google Cloud SQL
# Para conexión desde Cloud Run/Cloud Functions, usa el socket Unix
# Para conexión desde desarrollo local, usa proxy de Cloud SQL
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME"),  # Unix socket para Cloud Run
    "port": "5432", 
    "database": os.getenv("DB_NAME", "agroverse"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
    "schema": "agroverse_app",
    # Configuración SSL para Google Cloud SQL
    "sslmode": "prefer",  # Cloud SQL maneja SSL automáticamente
    "sslcert": None,
    "sslkey": None,
    "sslrootcert": None,
    "sslcrl": None
}

# Configuración alternativa para desarrollo local con Cloud SQL Proxy
# Ejecutar: cloud-sql-proxy PROJECT_ID:REGION:INSTANCE_NAME
DB_CONFIG_LOCAL = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": "5432", 
    "database": os.getenv("DB_NAME", "agroverse"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
    "schema": "agroverse_app",
    "sslmode": "disable"  # No necesario con Cloud SQL Proxy
}

# Variables de entorno de Google Cloud
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
GCP_REGION = os.getenv("GCP_REGION", "us-central1")
GCP_CLOUD_SQL_INSTANCE = os.getenv("GCP_CLOUD_SQL_INSTANCE", "")