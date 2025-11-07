/**
 * SCRIPT DE BUILD PARA OFUSCAR CÓDIGO
 * Ofusca y minifica JavaScript para producción
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

console.log('🔐 Iniciando ofuscación de código...');

// Configuración de ofuscación
const obfuscationConfig = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false, // No usar en desarrollo
  debugProtectionInterval: 0,
  disableConsoleOutput: false, // Cambiar a true en producción
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

// Directorios
const sourceDir = path.join(__dirname, 'chicoj-frontend', 'scripts');
const distDir = path.join(__dirname, 'chicoj-frontend', 'dist');

// Crear carpeta dist si no existe
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Archivos a ofuscar
const filesToObfuscate = [
  'config.js',
  'api.js',
  'login.js',
  'comanda.js',
  'cocina.js',
  'tour.js',
  'caja.js',
  'reportes.js',
  'platillos.js',
  'access-control.js',
  'utils.js'
];

let totalObfuscated = 0;
let totalErrors = 0;

filesToObfuscate.forEach(filename => {
  const inputPath = path.join(sourceDir, filename);
  const outputPath = path.join(distDir, filename.replace('.js', '.min.js'));
  
  try {
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Saltando ${filename} (no existe)`);
      return;
    }
    
    const sourceCode = fs.readFileSync(inputPath, 'utf8');
    const obfuscated = JavaScriptObfuscator.obfuscate(sourceCode, obfuscationConfig);
    
    fs.writeFileSync(outputPath, obfuscated.getObfuscatedCode());
    
    const originalSize = (sourceCode.length / 1024).toFixed(2);
    const obfuscatedSize = (obfuscated.getObfuscatedCode().length / 1024).toFixed(2);
    
    console.log(`✅ ${filename.padEnd(25)} ${originalSize}KB → ${obfuscatedSize}KB`);
    totalObfuscated++;
    
  } catch (error) {
    console.error(`❌ Error ofuscando ${filename}:`, error.message);
    totalErrors++;
  }
});

console.log('\n📊 Resumen:');
console.log(`   ✅ Archivos ofuscados: ${totalObfuscated}`);
console.log(`   ❌ Errores: ${totalErrors}`);
console.log(`\n📁 Archivos guardados en: ${distDir}`);
console.log('\n💡 Próximo paso:');
console.log('   1. Actualiza los <script src> para usar archivos .min.js');
console.log('   2. Reinicia nginx: docker compose restart nginx');



