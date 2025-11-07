/**
 * SISTEMA DE AUTENTICACIÓN ULTRA SIMPLE
 * Sin interferir con la página
 */

(function() {
  'use strict';
  
  const isLoginPage = window.location.pathname.includes('login');
  
  console.log('[LOCK] Simple Auth: Verificando...', {
    ruta: window.location.pathname,
    esLogin: isLoginPage
  });
  
  if (isLoginPage) {
    console.log('ℹ️ Simple Auth: Página de login, permitiendo acceso');
    return;
  }
  
  // Verificar token
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    console.log('[DENIED] Simple Auth: SIN TOKEN - Redirigiendo a login');
    window.location.replace('/templates/login?auth=required&t=' + Date.now());
    throw new Error('Sin token');
  }
  
  console.log('[OK] Simple Auth: Token válido, acceso permitido');
})();

// Verificar cada 1 segundo (más suave que 500ms)
setInterval(function() {
  const isLoginPage = window.location.pathname.includes('login');
  if (isLoginPage) return;
  
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.log('[DENIED] Token perdido durante navegación - Redirigiendo');
    window.location.replace('/templates/login?auth=expired&t=' + Date.now());
  }
}, 1000);

// Verificar en pageshow (bfcache - botón atrás)
window.addEventListener('pageshow', function(e) {
  const isLoginPage = window.location.pathname.includes('login');
  if (isLoginPage) return;
  
  // Si viene del cache (botón atrás)
  if (e.persisted) {
    console.log('📜 Página restaurada desde bfcache (botón atrás detectado)');
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('[DENIED] Sin token en bfcache - Redirigiendo a login');
      window.location.replace('/templates/login?auth=cached&t=' + Date.now());
    } else {
      console.log('[WARN] Token encontrado en bfcache - Verificando validez...');
      // El problema: si acabamos de hacer logout, el token puede seguir aquí por un momento
      // Esperar un poco y verificar de nuevo
      setTimeout(function() {
        const tokenCheck = localStorage.getItem('auth_token');
        if (!tokenCheck) {
          console.log('[DENIED] Token ya no existe - Redirigiendo');
          window.location.replace('/templates/login?auth=expired&t=' + Date.now());
        } else {
          console.log('[OK] Token válido confirmado - Permitiendo acceso sin recargar');
          // NO hacemos nada - dejamos que la página funcione normalmente
        }
      }, 100);
    }
  }
});

// Verificar cuando la página se hace visible (cambio de pestaña)
document.addEventListener('visibilitychange', function() {
  const isLoginPage = window.location.pathname.includes('login');
  if (isLoginPage || document.hidden) return;
  
  console.log('[VIEW] Página ahora visible - Re-verificando token');
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.log('[DENIED] Sin token al volver a la pestaña - Redirigiendo');
    window.location.replace('/templates/login?auth=visibility&t=' + Date.now());
  }
});

console.log('[OK] Simple Auth cargado y activo');

