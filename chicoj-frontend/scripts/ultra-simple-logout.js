/**
 * LOGOUT ULTRA SIMPLE
 * Solo limpia y redirige - SIN confirmación
 */

window.ultraSimpleLogout = function(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation(); // Prevenir otros event listeners
  }
  
  console.log('🚪 Logout ultra simple iniciado...');
  
  // Limpiar TODO inmediatamente
  localStorage.clear();
  sessionStorage.clear();
  
  // Limpiar cookies
  try {
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
  } catch(e) {
    console.error('Error limpiando cookies:', e);
  }
  
  console.log('✅ Storage completamente limpiado');
  
  // Verificar que se limpió
  const tokenCheck = localStorage.getItem('auth_token');
  console.log('🔍 Token después de limpiar:', tokenCheck === null ? 'NULL ✅' : 'TODAVÍA EXISTE ❌');
  
  // Ocultar página inmediatamente
  if (document.body) {
    document.body.innerHTML = '<div style="background:#1a1a1a;color:#fff;height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:Arial,sans-serif;"><div style="font-size:48px;margin-bottom:20px;">🚪</div><div style="font-size:24px;font-weight:600;">Cerrando sesión...</div><div style="margin-top:20px;opacity:0.7;">Redirigiendo...</div></div>';
  }
  
  // Redirigir inmediatamente con timestamp único
  window.location.replace('/templates/login?logout=' + Date.now());
  
  return false;
};

// Hacer disponible globalmente desde el inicio
if (typeof window !== 'undefined') {
  window.ultraSimpleLogout = window.ultraSimpleLogout;
}

console.log('✅ Ultra Simple Logout listo - SIN confirmación');

