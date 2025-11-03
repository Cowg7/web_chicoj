/**
 * GUARDIA DE AUTENTICACIÓN REFORZADA
 * Bloquea acceso sin token incluso con bfcache (back-forward cache)
 */

(function() {
  'use strict';
  
  const isLoginPage = window.location.pathname.includes('login');
  
  // Función para verificar y bloquear acceso
  function verificarAcceso() {
    const hasToken = localStorage.getItem('auth_token');
    
    console.log('🛡️ Auth Guard: Verificando...', { 
      isLoginPage, 
      hasToken: !!hasToken,
      path: window.location.pathname 
    });
    
    if (!isLoginPage && !hasToken) {
      console.log('⛔ Auth Guard: SIN TOKEN - BLOQUEANDO ACCESO');
      
      // Ocultar TODO inmediatamente
      document.documentElement.style.visibility = 'hidden';
      document.documentElement.style.opacity = '0';
      document.documentElement.style.display = 'none';
      
      if (document.body) {
        document.body.style.display = 'none';
      }
      
      // Detener todos los scripts
      window.stop();
      
      // Limpiar cualquier dato residual
      localStorage.clear();
      sessionStorage.clear();
      
      // Forzar recarga COMPLETA desde el servidor (no desde caché)
      console.log('🔄 Forzando recarga desde servidor...');
      
      // Usar location.replace para no agregar al historial
      window.location.replace('/templates/login?reason=unauthorized&t=' + Date.now());
      
      // Detener ejecución
      throw new Error('⛔ ACCESO BLOQUEADO - Sin token');
    }
    
    // Si hay token O es página de login, mostrar
    if ((isLoginPage || hasToken)) {
      console.log('✅ Auth Guard: Acceso permitido');
      document.documentElement.style.visibility = 'visible';
      document.documentElement.style.opacity = '1';
      document.documentElement.style.display = '';
      
      if (document.body) {
        document.body.style.display = '';
      }
    }
  }
  
  // Ejecutar inmediatamente
  verificarAcceso();
  
  // Verificar cuando la página se muestra desde el bfcache
  window.addEventListener('pageshow', function(event) {
    // event.persisted = true significa que viene del bfcache
    if (event.persisted) {
      console.log('📜 Página restaurada desde bfcache - Re-verificando...');
      verificarAcceso();
    }
  });
  
  // Verificar cuando cambia la visibilidad de la página
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      console.log('👁️ Página visible - Re-verificando...');
      verificarAcceso();
    }
  });
  
  // Verificar cuando se hace focus en la ventana
  window.addEventListener('focus', function() {
    console.log('🔍 Ventana con focus - Re-verificando...');
    verificarAcceso();
  });
  
  // Prevenir navegación con botón atrás
  window.addEventListener('popstate', function() {
    console.log('◀️ Navegación detectada - Re-verificando...');
    verificarAcceso();
  });
  
})();

