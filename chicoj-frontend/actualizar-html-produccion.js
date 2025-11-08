/**
 * ACTUALIZAR HTML PARA PRODUCCIÓN
 * Cambia todas las referencias de /scripts/*.js a /dist/scripts/*.js
 * Y de /css/*.css a /dist/css/*.css
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Actualizando archivos HTML para producción...\n');

const frontendDir = __dirname;
const templatesDir = path.join(frontendDir, 'templates');

let filesUpdated = 0;
let filesSkipped = 0;

// Función para procesar un archivo HTML
function processHtmlFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;
    
    // Cambiar referencias de scripts
    content = content.replace(
      /src="(\.\.\/)*scripts\/([^"]+\.js)(\?v=[^"]+)?"/g,
      (match, dots, filename, version) => {
        changes++;
        // Mantener el parámetro de versión si existe
        return `src="${dots || ''}dist/scripts/${filename}${version || ''}"`;
      }
    );
    
    // Cambiar referencias de CSS
    content = content.replace(
      /href="(\.\.\/)*css\/([^"]+\.css)(\?v=[^"]+)?"/g,
      (match, dots, filename, version) => {
        changes++;
        return `href="${dots || ''}dist/css/${filename}${version || ''}"`;
      }
    );
    
    // Solo escribir si hubo cambios
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`   ✅ ${path.relative(frontendDir, filePath).padEnd(60)} (${changes} cambios)`);
      filesUpdated++;
    } else {
      filesSkipped++;
    }
    
  } catch (error) {
    console.error(`   ❌ Error en ${filePath}:`, error.message);
  }
}

// Función recursiva para buscar HTML
function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.html')) {
      processHtmlFile(fullPath);
    }
  });
}

// Procesar archivos HTML en la raíz
console.log('📝 Actualizando archivos HTML en raíz:');
['index.html', 'main.html', 'diagnostico-acceso.html', 'limpiar-localStorage.html'].forEach(file => {
  const filePath = path.join(frontendDir, file);
  if (fs.existsSync(filePath)) {
    processHtmlFile(filePath);
  }
});

// Procesar templates
console.log('\n📁 Actualizando archivos en templates:');
if (fs.existsSync(templatesDir)) {
  processDirectory(templatesDir);
}

console.log('\n' + '='.repeat(80));
console.log('📊 RESUMEN:');
console.log('='.repeat(80));
console.log(`   ✅ Archivos actualizados: ${filesUpdated}`);
console.log(`   ⏭️  Archivos sin cambios:  ${filesSkipped}`);
console.log('='.repeat(80));
console.log('\n✅ Actualización completada!\n');



