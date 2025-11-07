/**
 * Script para generar PDF del Manual de Usuario
 * Sistema Chicoj
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Leer el archivo Markdown
const markdownPath = path.join(__dirname, 'MANUAL_USUARIO_CHICOJ.md');
const markdown = fs.readFileSync(markdownPath, 'utf-8');

// Convertir Markdown a HTML
const htmlContent = marked.parse(markdown);

// Crear HTML completo con estilos para PDF
const htmlTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manual de Usuario - Sistema Chicoj</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.8;
      color: #333;
      background: white;
      padding: 40px 60px;
      font-size: 11pt;
    }
    
    h1 {
      color: #2c3e50;
      font-size: 32pt;
      font-weight: 700;
      margin: 40px 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 4px solid #4CAF50;
      page-break-after: avoid;
    }
    
    h2 {
      color: #34495e;
      font-size: 22pt;
      font-weight: 700;
      margin: 30px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
      page-break-after: avoid;
    }
    
    h3 {
      color: #4CAF50;
      font-size: 16pt;
      font-weight: 600;
      margin: 20px 0 12px 0;
      page-break-after: avoid;
    }
    
    h4 {
      color: #555;
      font-size: 13pt;
      font-weight: 600;
      margin: 15px 0 10px 0;
      page-break-after: avoid;
    }
    
    p {
      margin: 0 0 12px 0;
      text-align: justify;
    }
    
    strong {
      color: #2c3e50;
      font-weight: 600;
    }
    
    em {
      font-style: italic;
      color: #666;
    }
    
    ul, ol {
      margin: 10px 0 15px 25px;
    }
    
    li {
      margin: 6px 0;
      line-height: 1.6;
    }
    
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 10pt;
      color: #c7254e;
    }
    
    pre {
      background: #f8f8f8;
      border: 1px solid #e0e0e0;
      border-left: 4px solid #4CAF50;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
      overflow-x: auto;
      page-break-inside: avoid;
    }
    
    pre code {
      background: none;
      padding: 0;
      color: #333;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      page-break-inside: avoid;
    }
    
    table th {
      background: #4CAF50;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #45a049;
    }
    
    table td {
      padding: 8px 10px;
      border: 1px solid #e0e0e0;
    }
    
    table tr:nth-child(even) {
      background: #f9f9f9;
    }
    
    blockquote {
      border-left: 4px solid #4CAF50;
      background: #f0f8f0;
      padding: 12px 20px;
      margin: 15px 0;
      border-radius: 4px;
      page-break-inside: avoid;
    }
    
    hr {
      border: none;
      border-top: 2px solid #e0e0e0;
      margin: 30px 0;
    }
    
    a {
      color: #4CAF50;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    /* Cajas de información */
    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #2196F3;
      padding: 12px 20px;
      margin: 15px 0;
      border-radius: 4px;
    }
    
    .warning-box {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 12px 20px;
      margin: 15px 0;
      border-radius: 4px;
    }
    
    .success-box {
      background: #f0f8f0;
      border-left: 4px solid #4CAF50;
      padding: 12px 20px;
      margin: 15px 0;
      border-radius: 4px;
    }
    
    /* Página de portada */
    .cover-page {
      page-break-after: always;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    
    .cover-title {
      font-size: 48pt;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 20px;
    }
    
    .cover-subtitle {
      font-size: 24pt;
      color: #4CAF50;
      margin-bottom: 40px;
    }
    
    .cover-version {
      font-size: 14pt;
      color: #666;
      margin-top: 60px;
    }
    
    /* Paginación */
    @page {
      margin: 2cm;
      
      @bottom-right {
        content: "Página " counter(page);
        font-size: 9pt;
        color: #666;
      }
      
      @bottom-left {
        content: "Manual de Usuario - Sistema Chicoj";
        font-size: 9pt;
        color: #666;
      }
    }
    
    /* Evitar saltos de página inapropiados */
    h1, h2, h3, h4 {
      page-break-after: avoid;
    }
    
    table, pre, blockquote {
      page-break-inside: avoid;
    }
    
    /* Tabla de contenidos */
    .toc {
      page-break-after: always;
    }
    
    .toc h2 {
      margin-top: 0;
    }
    
    .toc ul {
      list-style: none;
      margin-left: 0;
    }
    
    .toc li {
      margin: 8px 0;
    }
    
    .toc a {
      color: #2c3e50;
      text-decoration: none;
      border-bottom: 1px dotted #ccc;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
`;

// Guardar HTML temporal
const htmlPath = path.join(__dirname, 'MANUAL_USUARIO_CHICOJ.html');
fs.writeFileSync(htmlPath, htmlTemplate, 'utf-8');

console.log('✅ Archivo HTML generado:', htmlPath);
console.log('');
console.log('📄 Para convertir a PDF, ejecuta uno de estos comandos:');
console.log('');
console.log('Opción 1 (Chrome/Chromium):');
console.log('  Abre el archivo HTML en el navegador y usa Ctrl+P para imprimir a PDF');
console.log('');
console.log('Opción 2 (wkhtmltopdf):');
console.log('  wkhtmltopdf MANUAL_USUARIO_CHICOJ.html MANUAL_USUARIO_CHICOJ.pdf');
console.log('');
console.log('Opción 3 (Node.js con puppeteer):');
console.log('  npm install puppeteer');
console.log('  node convert-to-pdf.js');
console.log('');

