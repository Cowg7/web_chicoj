// Script global para manejar logout y prevenir acceso con botón "atrás"

(function() {
  console.log('[LOCK] Logout handler cargado');

  // Prevenir acceso con botón "atrás" después de logout
  function preventBackAfterLogout() {
    // Verificar si NO estamos en login y NO hay token
    const isLoginPage = window.location.pathname.includes('login');
    const hasToken = localStorage.getItem('auth_token');
    
    console.log('[CHECK] Verificando token:', { hasToken: !!hasToken, isLoginPage });
    
    if (!isLoginPage && !hasToken) {
      console.log('[DENIED] Sin token detectado, redirigiendo a login...');
      // Ocultar todo el contenido inmediatamente
      document.body.style.display = 'none';
      // Redirigir sin permitir historial
      window.location.replace('/templates/login');
      return false;
    }
    
    // Si estamos en login Y hay token, permitir continuar
    if (isLoginPage && hasToken) {
      console.log('[OK] Usuario ya autenticado en página de login');
    }
    
    // Mostrar el contenido si está autenticado
    if (!isLoginPage && hasToken) {
      console.log('[OK] Token válido, mostrando contenido');
      if (document.body) {
        document.body.style.display = '';
      }
    }
    
    return true;
  }

  // Ejecutar INMEDIATAMENTE al cargar la página
  preventBackAfterLogout();

  // Detectar navegación con botón atrás/adelante
  window.addEventListener('pageshow', function(event) {
    // event.persisted indica si la página viene del caché del navegador (botón atrás)
    if (event.persisted) {
      console.log(' Página cargada desde caché (botón atrás detectado)');
      preventBackAfterLogout();
    }
  });

  // Prevenir navegación atrás después de logout
  window.addEventListener('popstate', function(event) {
    const hasToken = localStorage.getItem('auth_token');
    const isLoginPage = window.location.pathname.includes('login');
    
    if (!isLoginPage && !hasToken) {
      console.log('[DENIED] Intento de navegar atrás sin token');
      window.location.replace('/templates/login');
    }
  });

  // Configurar headers para prevenir cache (solo en páginas protegidas)
  if (!window.location.pathname.includes('login')) {
    // Agregar meta tags para prevenir cache
    const metaNoCache = document.createElement('meta');
    metaNoCache.httpEquiv = 'Cache-Control';
    metaNoCache.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(metaNoCache);

    const metaPragma = document.createElement('meta');
    metaPragma.httpEquiv = 'Pragma';
    metaPragma.content = 'no-cache';
    document.head.appendChild(metaPragma);

    const metaExpires = document.createElement('meta');
    metaExpires.httpEquiv = 'Expires';
    metaExpires.content = '0';
    document.head.appendChild(metaExpires);
    
    console.log(' Cache deshabilitado para esta página');
  }

  // Función global para cerrar sesión desde cualquier vista
  window.handleLogout = async function(event) {
    if (event) {
      event.preventDefault();
    }
    
    console.log('[LOGOUT] Ejecutando logout...');
    
    // Confirmar
    const confirmarCierre = await showConfirm('¿Estás seguro de que deseas cerrar sesión?', {
      confirmText: 'Cerrar sesión',
      cancelText: 'Cancelar'
    });
    if (!confirmarCierre) {
      console.log('[ERROR] Logout cancelado por el usuario');
      return;
    }
    
    // Limpiar TODO
    localStorage.clear();
    sessionStorage.clear();
    
    // Limpiar cookies si existen
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('[OK] Sesión limpiada completamente');
    
    // Prevenir botón atrás
    window.history.pushState(null, '', window.location.href);
    
    // Redirigir (replace para no permitir volver)
    window.location.replace('/templates/login');
  };

  // Hacer disponible globalmente
  window.preventBackAfterLogout = preventBackAfterLogout;

  console.log('[OK] Logout handler inicializado');
})();


