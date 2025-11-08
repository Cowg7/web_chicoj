/**
 * BFCACHE KILLER
 * Este script previene que las páginas se guarden en el back-forward cache del navegador
 * Fuerza que las páginas SIEMPRE se recarguen desde el servidor
 */

(function() {
  'use strict';
  
  console.log('💀 BFCache Killer activado');
  
  // Agregar evento unload para prevenir bfcache
  // Los navegadores no guardan en bfcache páginas con listeners de unload
  window.addEventListener('unload', function() {
    console.log('👋 Página descargada - Previniendo bfcache');
  });
  
  // También con beforeunload
  window.addEventListener('beforeunload', function() {
    console.log('[WARN] Página a punto de descargar');
  });
  
  // Verificar cuando la página viene del bfcache
  window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
      console.log('[WARN] PÁGINA RESTAURADA DESDE BFCACHE - FORZANDO RECARGA');
      
      const isLoginPage = window.location.pathname.includes('login');
      const hasToken = localStorage.getItem('auth_token');
      
      // Si no hay token y no es login, recargar completamente
      if (!isLoginPage && !hasToken) {
        console.log('[LOAD] Sin token detectado - Recargando página completa...');
        window.location.reload(true); // true = forzar desde servidor
      }
    }
  });
  
  // Verificar cuando la página se hace visible (cambio de pestaña)
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      const isLoginPage = window.location.pathname.includes('login');
      const hasToken = localStorage.getItem('auth_token');
      
      console.log('[VIEW] Página visible - Verificando token...');
      
      if (!isLoginPage && !hasToken) {
        console.log('[DENIED] Token perdido - Redirigiendo a login');
        window.location.replace('/templates/login?reason=token_lost');
      }
    }
  });
  
  // Deshabilitar cache con performance API
  if (window.performance && window.performance.navigation) {
    const navType = window.performance.navigation.type;
    
    if (navType === 2) {
      // 2 = TYPE_BACK_FORWARD (navegación con botón atrás/adelante)
      console.log('◀️ Navegación atrás/adelante detectada');
      
      const isLoginPage = window.location.pathname.includes('login');
      const hasToken = localStorage.getItem('auth_token');
      
      if (!isLoginPage && !hasToken) {
        console.log('[LOAD] Sin token - Forzando recarga...');
        window.location.replace('/templates/login?reason=back_navigation');
      }
    }
  }
  
  console.log('[OK] BFCache Killer inicializado');
})();



