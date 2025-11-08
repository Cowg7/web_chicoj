/**
 * SCRIPT PARA LIMPIAR RUTAS .HTML
 * Elimina todas las extensiones .html de los archivos JavaScript
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando rutas .html de archivos JavaScript...\n');

const scriptsDir = path.join(__dirname, 'scripts');
let totalReemplazos = 0;
let archivosModificados = 0;

// Leer todos los archivos JS
const archivos = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));

archivos.forEach(archivo => {
  const rutaArchivo = path.join(scriptsDir, archivo);
  let contenido = fs.readFileSync(rutaArchivo, 'utf8');
  const contenidoOriginal = contenido;
  let reemplazosArchivo = 0;
  
  // Patrones a reemplazar:
  // 1. '/templates/xxx/xxx.html' → '/templates/xxx/xxx'
  // 2. '/main.html' → '/main'
  // 3. '/templates/login.html' → '/templates/login'
  // 4. Pero PRESERVAR: ?parametro, #hash, etc.
  
  // Reemplazar rutas con .html
  contenido = contenido.replace(
    /(['"`])(\/?[\w\-\/]+)\.html(?=['"?#]|$)/g,
    (match, quote, ruta) => {
      reemplazosArchivo++;
      return `${quote}${ruta}`;
    }
  );
  
  // Reemplazar window.location con .html
  contenido = contenido.replace(
    /window\.location\.(href|replace)\s*=\s*(['"`])(\/?[\w\-\/]+)\.html(['"`])/g,
    (match, metodo, quote1, ruta, quote2) => {
      reemplazosArchivo++;
      return `window.location.${metodo} = ${quote1}${ruta}${quote2}`;
    }
  );
  
  // Reemplazar window.location con .html y parámetros
  contenido = contenido.replace(
    /window\.location\.(href|replace)\s*=\s*(['"`])(\/?[\w\-\/]+)\.html\?/g,
    (match, metodo, quote, ruta) => {
      reemplazosArchivo++;
      return `window.location.${metodo} = ${quote}${ruta}?`;
    }
  );
  
  if (contenido !== contenidoOriginal) {
    fs.writeFileSync(rutaArchivo, contenido, 'utf8');
    console.log(`   ✅ ${archivo.padEnd(35)} ${reemplazosArchivo} reemplazos`);
    archivosModificados++;
    totalReemplazos += reemplazosArchivo;
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN:');
console.log('='.repeat(60));
console.log(`   ✅ Archivos modificados: ${archivosModificados}`);
console.log(`   🔄 Total de reemplazos: ${totalReemplazos}`);
console.log('='.repeat(60));
console.log('\n✅ Rutas limpias! Ahora ejecuta:\n');
console.log('   node chicoj-frontend/build-production.js');
console.log('   powershell -ExecutionPolicy Bypass -File deploy-ofuscado.ps1');
console.log('');



