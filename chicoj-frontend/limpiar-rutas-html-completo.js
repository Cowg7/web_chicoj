/**
 * SCRIPT PARA LIMPIAR RUTAS .HTML (COMPLETO)
 * Elimina todas las extensiones .html de archivos JavaScript Y HTML
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando rutas .html de TODO el frontend...\n');

let totalReemplazos = 0;
let archivosModificados = 0;

// Función para limpiar archivos
function limpiarArchivo(rutaArchivo, tipo) {
  let contenido = fs.readFileSync(rutaArchivo, 'utf8');
  const contenidoOriginal = contenido;
  let reemplazosArchivo = 0;
  
  if (tipo === 'js') {
    // Para JavaScript: limpiar rutas en strings y window.location
    contenido = contenido.replace(
      /(['"`])(\/?[\w\-\/]+)\.html(?=['"?#]|$)/g,
      (match, quote, ruta) => {
        reemplazosArchivo++;
        return `${quote}${ruta}`;
      }
    );
    
    contenido = contenido.replace(
      /window\.location\.(href|replace)\s*=\s*(['"`])(\/?[\w\-\/]+)\.html(['"`])/g,
      (match, metodo, quote1, ruta, quote2) => {
        reemplazosArchivo++;
        return `window.location.${metodo} = ${quote1}${ruta}${quote2}`;
      }
    );
    
    contenido = contenido.replace(
      /window\.location\.(href|replace)\s*=\s*(['"`])(\/?[\w\-\/]+)\.html\?/g,
      (match, metodo, quote, ruta) => {
        reemplazosArchivo++;
        return `window.location.${metodo} = ${quote}${ruta}?`;
      }
    );
  } else if (tipo === 'html') {
    // Para HTML: limpiar href y action
    // Patrón más específico para evitar URLs externas
    contenido = contenido.replace(
      /href=(["'])(\/?(?:main|templates)[\w\-\/]*)\.html(["'])/g,
      (match, quote1, ruta, quote2) => {
        reemplazosArchivo++;
        return `href=${quote1}${ruta}${quote2}`;
      }
    );
    
    contenido = contenido.replace(
      /action=(["'])(\/?[\w\-\/]+)\.html(["'])/g,
      (match, quote1, ruta, quote2) => {
        reemplazosArchivo++;
        return `action=${quote1}${ruta}${quote2}`;
      }
    );
  }
  
  if (contenido !== contenidoOriginal) {
    fs.writeFileSync(rutaArchivo, contenido, 'utf8');
    return reemplazosArchivo;
  }
  
  return 0;
}

// Función recursiva para procesar directorios
function procesarDirectorio(dir, extension) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      procesarDirectorio(fullPath, extension);
    } else if (item.endsWith(extension)) {
      const tipo = extension === '.js' ? 'js' : 'html';
      const reemplazos = limpiarArchivo(fullPath, tipo);
      
      if (reemplazos > 0) {
        const relativePath = path.relative(__dirname, fullPath);
        console.log(`   ✅ ${relativePath.padEnd(60)} ${reemplazos} reemplazos`);
        archivosModificados++;
        totalReemplazos += reemplazos;
      }
    }
  });
}

// Procesar archivos JavaScript
console.log('📜 Procesando archivos JavaScript...');
const scriptsDir = path.join(__dirname, 'scripts');
procesarDirectorio(scriptsDir, '.js');

// Procesar archivos HTML
console.log('\n📄 Procesando archivos HTML...');
const templatesDir = path.join(__dirname, 'templates');
procesarDirectorio(templatesDir, '.html');

// Procesar HTML en raíz
const rootFiles = ['index.html', 'main.html'];
rootFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const reemplazos = limpiarArchivo(fullPath, 'html');
    if (reemplazos > 0) {
      console.log(`   ✅ ${file.padEnd(60)} ${reemplazos} reemplazos`);
      archivosModificados++;
      totalReemplazos += reemplazos;
    }
  }
});

console.log('\n' + '='.repeat(70));
console.log('📊 RESUMEN:');
console.log('='.repeat(70));
console.log(`   ✅ Archivos modificados: ${archivosModificados}`);
console.log(`   🔄 Total de reemplazos: ${totalReemplazos}`);
console.log('='.repeat(70));
console.log('\n✅ Rutas completamente limpias!\n');
console.log('📝 Próximos pasos:');
console.log('   1. node chicoj-frontend/build-production.js');
console.log('   2. powershell -ExecutionPolicy Bypass -File deploy-ofuscado.ps1');
console.log('   3. Ctrl + Shift + R en el navegador');
console.log('');

