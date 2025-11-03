/**
 * SCRIPT DE DEBUGGING
 * Muestra información visible en pantalla sobre el estado de autenticación
 */

(function() {
  'use strict';
  
  console.log('🐛 DEBUG AUTH: Script cargado');
  
  // Crear panel de debug visible en pantalla
  const panel = document.createElement('div');
  panel.id = 'debug-panel';
  panel.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.9);
    color: #00ff00;
    padding: 20px;
    border-radius: 10px;
    font-family: monospace;
    font-size: 14px;
    z-index: 999999;
    max-width: 400px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    border: 2px solid #00ff00;
  `;
  
  function actualizarPanel() {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    const path = window.location.pathname;
    const isLoginPage = path.includes('login');
    
    panel.innerHTML = `
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #fff;">
        🐛 DEBUG AUTH PANEL
      </div>
      <div style="border-top: 1px solid #00ff00; padding-top: 10px;">
        <div style="margin: 5px 0;">
          <strong>Página:</strong> ${path}
        </div>
        <div style="margin: 5px 0;">
          <strong>Es Login:</strong> <span style="color: ${isLoginPage ? '#00ff00' : '#ff0000'}">${isLoginPage ? 'SÍ' : 'NO'}</span>
        </div>
        <div style="margin: 5px 0;">
          <strong>Token:</strong> <span style="color: ${token ? '#00ff00' : '#ff0000'}">${token ? '✅ EXISTE' : '❌ NO EXISTE'}</span>
        </div>
        <div style="margin: 5px 0;">
          <strong>User Data:</strong> <span style="color: ${userData ? '#00ff00' : '#ff0000'}">${userData ? '✅ EXISTE' : '❌ NO EXISTE'}</span>
        </div>
        <div style="margin: 10px 0; padding-top: 10px; border-top: 1px solid #00ff00;">
          <strong>Decisión:</strong>
          ${!isLoginPage && !token 
            ? '<span style="color: #ff0000;">⛔ DEBERÍA REDIRIGIR A LOGIN</span>' 
            : '<span style="color: #00ff00;">✅ ACCESO PERMITIDO</span>'}
        </div>
        <div style="margin-top: 10px;">
          <button onclick="localStorage.clear(); location.reload();" style="background: #ff0000; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
            🗑️ Limpiar y Recargar
          </button>
        </div>
      </div>
    `;
  }
  
  // Agregar panel al body cuando esté listo
  function agregarPanel() {
    if (document.body) {
      document.body.appendChild(panel);
      actualizarPanel();
    } else {
      setTimeout(agregarPanel, 100);
    }
  }
  
  agregarPanel();
  
  // Actualizar cada segundo
  setInterval(actualizarPanel, 1000);
  
  // Verificación de autenticación con logs visibles
  const isLoginPage = window.location.pathname.includes('login');
  const token = localStorage.getItem('auth_token');
  
  console.log('🐛 DEBUG AUTH: Verificando...');
  console.log('   → Ruta:', window.location.pathname);
  console.log('   → Es Login?', isLoginPage);
  console.log('   → Tiene Token?', !!token);
  
  if (!isLoginPage && !token) {
    console.log('⛔ DEBUG AUTH: SIN TOKEN - REDIRIGIENDO');
    
    // Redirigir INMEDIATAMENTE
    window.location.replace('/templates/login?blocked=' + Date.now());
    
    // Detener ejecución
    throw new Error('⛔ ACCESO BLOQUEADO - Sin token');
  }
  
  console.log('✅ DEBUG AUTH: Acceso permitido - Token encontrado');
})();

