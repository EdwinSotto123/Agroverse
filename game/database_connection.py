import psycopg2
import psycopg2.extras
from config_apis import DB_CONFIG
import logging
import os

logger = logging.getLogger(__name__)

class DatabaseConnection:
    def __init__(self):
        self.connection = None
        self.config = DB_CONFIG
    
    def connect(self):
        """Establece conexión a Google Cloud SQL."""
        try:
            # Detectar si estamos en Cloud Run (unix socket) o local (TCP)
            is_cloud_run = os.getenv("K_SERVICE") is not None
            
            if is_cloud_run:
                logger.info("🌐 Conectando a Google Cloud SQL desde Cloud Run (Unix socket)")
            else:
                logger.info("💻 Conectando a Google Cloud SQL desde desarrollo local (Cloud SQL Proxy)")
            
            # Preparar parámetros de conexión
            conn_params = {
                "host": self.config["host"],
                "port": self.config["port"],
                "database": self.config["database"],
                "user": self.config["user"],
                "password": self.config["password"],
                "connect_timeout": 30
            }
            
            # Agregar SSL solo si está configurado
            if self.config.get("sslmode"):
                conn_params["sslmode"] = self.config["sslmode"]
            
            if self.config.get("sslrootcert"):
                conn_params["sslrootcert"] = self.config["sslrootcert"]
            
            # Establecer conexión
            self.connection = psycopg2.connect(**conn_params)
            
            # Verificar conexión
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT version();")
                db_version = cursor.fetchone()[0]
                logger.info(f"✅ Conexión establecida a Google Cloud SQL")
                logger.info(f"📊 Versión PostgreSQL: {db_version[:50]}...")
            
            return self.connection
            
        except psycopg2.Error as e:
            logger.error(f"❌ Error conectando a Google Cloud SQL: {e}")
            logger.error(f"💡 Tip: Verifica que Cloud SQL Proxy esté ejecutándose localmente")
            logger.error(f"   Comando: gcloud sql connect INSTANCE_NAME --user=postgres")
            raise
        except Exception as e:
            logger.error(f"❌ Error inesperado: {e}")
            raise
    
    def test_connection(self):
        """Prueba la conexión y muestra información de la base de datos."""
        try:
            conn = self.connect()
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                # Información de la conexión
                cursor.execute("""
                    SELECT 
                        current_database() as database,
                        current_user as user,
                        inet_server_addr() as server_ip,
                        inet_server_port() as server_port,
                        version() as postgres_version
                """)
                conn_info = cursor.fetchone()
                
                # Verificar si es Cloud SQL
                cursor.execute("SHOW server_version_num;")
                version_num = cursor.fetchone()
                
                return {
                    "connection_info": dict(conn_info),
                    "version_num": version_num,
                    "platform": "Google Cloud SQL",
                    "status": "success"
                }
                
        except Exception as e:
            return {
                "error": str(e),
                "status": "failed"
            }
        finally:
            if self.connection:
                self.connection.close()
    
    def close(self):
        """Cierra la conexión."""
        if self.connection:
            self.connection.close()
            logger.info("Conexión cerrada")

# Función de utilidad para probar conexión
def test_gcp_cloud_sql_connection():
    """Prueba la conexión a Google Cloud SQL."""
    db = DatabaseConnection()
    result = db.test_connection()
    
    print("=== Prueba de Conexión Google Cloud SQL ===")
    print(f"Estado: {result['status']}")
    print(f"Plataforma: {result.get('platform', 'N/A')}")
    
    if result["status"] == "success":
        info = result["connection_info"]
        print(f"Base de datos: {info['database']}")
        print(f"Usuario: {info['user']}")
        print(f"Servidor: {info.get('server_ip', 'Unix socket')}")
        print(f"Puerto: {info.get('server_port', 'N/A')}")
        print(f"Versión PostgreSQL: {info['postgres_version']}")
    else:
        print(f"Error: {result.get('error', 'Desconocido')}")
    
    return result

if __name__ == "__main__":
    # Configurar logging
    logging.basicConfig(level=logging.INFO)
    
    # Probar conexión
    test_gcp_cloud_sql_connection()