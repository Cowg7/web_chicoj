/**
 * Script para convertir HTML a PDF usando Puppeteer
 * Sistema Chicoj
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function convertToPDF() {
  const htmlPath = path.join(__dirname, 'MANUAL_USUARIO_CHICOJ.html');
  const pdfPath = path.join(__dirname, 'MANUAL_USUARIO_CHICOJ.pdf');
  
  // Verificar que existe el HTML
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ Error: No se encontró el archivo HTML');
    console.log('   Primero ejecuta: node generate-pdf-manual.js');
    process.exit(1);
  }
  
  console.log('📄 Generando PDF del Manual de Usuario...');
  console.log('');
  
  try {
    // Lanzar navegador
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Cargar el HTML
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generar PDF
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; font-size: 9px; padding: 0 15mm; color: #666; display: flex; justify-content: space-between;">
          <span>Manual de Usuario - Sistema Chicoj</span>
          <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
        </div>
      `
    });
    
    await browser.close();
    
    console.log('✅ PDF generado exitosamente!');
    console.log('');
    console.log('📁 Ubicación:', pdfPath);
    console.log('');
    
    // Mostrar tamaño del archivo
    const stats = fs.statSync(pdfPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 Tamaño: ${fileSizeInMB} MB`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error al generar PDF:', error.message);
    process.exit(1);
  }
}

// Ejecutar
convertToPDF();

