import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '../game');
const destDir = path.join(__dirname, '../dist/game');

// Función para copiar recursivamente
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Copiando archivos del juego...');
console.log(`Desde: ${sourceDir}`);
console.log(`Hacia: ${destDir}`);

try {
  if (fs.existsSync(sourceDir)) {
    copyRecursive(sourceDir, destDir);
    console.log('✅ Archivos del juego copiados exitosamente');
  } else {
    console.log('⚠️ No se encontró la carpeta del juego en la raíz del proyecto');
  }
} catch (error) {
  console.error('❌ Error copiando archivos del juego:', error);
  process.exit(1);
}
