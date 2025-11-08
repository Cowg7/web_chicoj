/**
 * BUILD PARA PRODUCCIÓN
 * Ofusca JS, minifica CSS, optimiza HTML
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando build de producción...\n');

// Directorios
const frontendDir = path.join(__dirname, 'chicoj-frontend');
const scriptsDir = path.join(frontendDir, 'scripts');
const cssDir = path.join(frontendDir, 'css');
const distDir = path.join(frontendDir, 'dist');
const distScriptsDir = path.join(distDir, 'scripts');
const distCssDir = path.join(distDir, 'css');

// Crear carpetas dist
[distDir, distScriptsDir, distCssDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Creada carpeta: ${path.basename(dir)}`);
  }
});

// Configuración de ofuscación (ALTA seguridad)
const obfuscationConfig = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.8,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false, // Activar en producción final
  disableConsoleOutput: false, // Cambiar a true para ocultar console.log
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false, // No renombrar window, document, etc.
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayThreshold: 0.8,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

// Configuración LIGERA para archivos que necesitan ser más rápidos
const lightObfuscationConfig = {
  ...obfuscationConfig,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  selfDefending: false,
  stringArrayEncoding: [],
  stringArrayThreshold: 0.5
};

console.log('🔐 Ofuscando archivos JavaScript...\n');

// Archivos a ofuscar (HEAVY - ofuscación completa)
const heavyFiles = [
  'config.js',
  'access-control.js',
  'login.js'
];

// Archivos a ofuscar (MEDIUM)
const mediumFiles = [
  'api.js',
  'utils.js',
  'simple-auth.js',
  'ultra-simple-logout.js'
];

// Archivos a ofuscar (LIGHT - ofuscación ligera para mejor performance)
const lightFiles = [
  'comanda.js',
  'comanda-control.js',
  'cocina.js',
  'menu-cocina.js',
  'tour.js',
  'tour-control.js',
  'caja.js',
  'reportes.js',
  'reportes-pdf.js',
  'platillos.js',
  'control-platillos.js',
  'control-usuarios.js',
  'empleados-control.js',
  'agregar-usuarios.js',
  'agregar-empleados.js',
  'main.js',
  'notifications.js',
  'health-check.js'
];

let stats = {
  heavy: 0,
  medium: 0,
  light: 0,
  errors: 0,
  totalSaved: 0
};

function obfuscateFile(filename, config, type) {
  const inputPath = path.join(scriptsDir, filename);
  const outputPath = path.join(distScriptsDir, filename);
  
  try {
    if (!fs.existsSync(inputPath)) {
      console.log(`   ⚠️  ${filename} no encontrado, saltando...`);
      return;
    }
    
    const sourceCode = fs.readFileSync(inputPath, 'utf8');
    const obfuscated = JavaScriptObfuscator.obfuscate(sourceCode, config);
    const obfuscatedCode = obfuscated.getObfuscatedCode();
    
    fs.writeFileSync(outputPath, obfuscatedCode);
    
    const originalSize = sourceCode.length;
    const obfuscatedSize = obfuscatedCode.length;
    const saved = ((1 - obfuscatedSize / originalSize) * 100).toFixed(1);
    
    const typeLabel = type === 'heavy' ? '🔐 HEAVY' : type === 'medium' ? '🔒 MEDIUM' : '🔓 LIGHT';
    console.log(`   ${typeLabel} ${filename.padEnd(30)} ${(originalSize/1024).toFixed(1)}KB → ${(obfuscatedSize/1024).toFixed(1)}KB`);
    
    stats[type]++;
    
  } catch (error) {
    console.error(`   ❌ Error en ${filename}:`, error.message);
    stats.errors++;
  }
}

// Ofuscar archivos por categoría
console.log('🔐 Archivos con ofuscación ALTA (seguridad máxima):');
heavyFiles.forEach(f => obfuscateFile(f, obfuscationConfig, 'heavy'));

console.log('\n🔒 Archivos con ofuscación MEDIA (balance):');
mediumFiles.forEach(f => obfuscateFile(f, {...obfuscationConfig, controlFlowFlattening: false, deadCodeInjection: false}, 'medium'));

console.log('\n🔓 Archivos con ofuscación LIGERA (performance):');
lightFiles.forEach(f => obfuscateFile(f, lightObfuscationConfig, 'light'));

// Copiar archivos que no se ofuscan
console.log('\n📋 Copiando archivos adicionales...');
const filesToCopy = [
  'auth-guard.js',
  'bfcache-killer.js',
  'debug-auth.js',
  'logout-handler.js',
  'agregar-roles.js'
];

filesToCopy.forEach(filename => {
  const src = path.join(scriptsDir, filename);
  const dest = path.join(distScriptsDir, filename);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`   📄 Copiado: ${filename}`);
  }
});

// Minificar CSS
console.log('\n🎨 Minificando CSS...');
try {
  const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
  
  cssFiles.forEach(cssFile => {
    const inputPath = path.join(cssDir, cssFile);
    const outputPath = path.join(distCssDir, cssFile);
    
    // Leer y copiar (puedes usar cleancss aquí si quieres minificar)
    const cssContent = fs.readFileSync(inputPath, 'utf8');
    
    // Minificación simple: remover comentarios y espacios extras
    const minified = cssContent
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios
      .replace(/\s+/g, ' ') // Comprimir espacios
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';')
      .replace(/\s*:\s*/g, ':')
      .trim();
    
    fs.writeFileSync(outputPath, minified);
    console.log(`   🎨 ${cssFile.padEnd(30)} ${(cssContent.length/1024).toFixed(1)}KB → ${(minified.length/1024).toFixed(1)}KB`);
  });
} catch (error) {
  console.error('❌ Error minificando CSS:', error.message);
}

// Resumen final
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DEL BUILD:');
console.log('='.repeat(60));
console.log(`   🔐 Ofuscación ALTA:   ${stats.heavy} archivos`);
console.log(`   🔒 Ofuscación MEDIA:  ${stats.medium} archivos`);
console.log(`   🔓 Ofuscación LIGERA: ${stats.light} archivos`);
console.log(`   ❌ Errores:           ${stats.errors}`);
console.log(`   📁 Destino:           ${distDir}`);
console.log('='.repeat(60));

console.log('\n✅ Build completado!\n');
console.log('📝 Próximos pasos:');
console.log('   1. Revisa los archivos en: chicoj-frontend/dist/');
console.log('   2. Actualiza los HTML para usar /dist/scripts/*.js');
console.log('   3. Reinicia nginx: docker compose restart nginx');
console.log('');



