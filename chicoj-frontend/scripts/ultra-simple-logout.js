/**
 * LOGOUT ULTRA SIMPLE
 * Solo limpia y redirige - SIN confirmación
 */

window.ultraSimpleLogout = function(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation(); // Prevenir otros event listeners
  }
  
  console.log('Cerrando sesión de usuario...');
  
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
  
  console.log('[OK] Storage completamente limpiado');
  
  // Verificar que se limpió
  const tokenCheck = localStorage.getItem('auth_token');
  console.log('[CHECK] Token después de limpiar:', tokenCheck === null ? 'NULL [OK]' : 'TODAVÍA EXISTE [ERROR]');
  
  // Ocultar página inmediatamente con pantalla profesional
  if (document.body) {
    document.body.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #F5F7FA 0%, #E5E7EB 100%);
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
      ">
        <div style="
          background: white;
          border-radius: 16px;
          padding: 3rem 4rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 500px;
          animation: fadeIn 0.3s ease;
        ">
          <!-- Logo/Icono -->
          <div style="
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(30, 64, 175, 0.3);
          ">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
          
          <!-- Título -->
          <h2 style="
            margin: 0 0 0.5rem 0;
            font-size: 1.75rem;
            font-weight: 600;
            color: #111827;
            letter-spacing: -0.025em;
          ">
            Cerrando sesión
          </h2>
          
          <!-- Descripción -->
          <p style="
            margin: 0 0 2rem 0;
            font-size: 1rem;
            color: #6B7280;
            line-height: 1.5;
          ">
            Su sesión se ha cerrado correctamente.<br>
            Redirigiendo al inicio de sesión...
          </p>
          
          <!-- Spinner de carga -->
          <div style="
            width: 40px;
            height: 40px;
            margin: 0 auto;
            border: 4px solid #E5E7EB;
            border-top-color: #1E40AF;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          "></div>
        </div>
      </div>
      
      <style>
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      </style>
    `;
  }
  
  // Redirigir inmediatamente con timestamp único
  window.location.replace('/templates/login?logout=' + Date.now());
  
  return false;
};

// Hacer disponible globalmente desde el inicio
if (typeof window !== 'undefined') {
  window.ultraSimpleLogout = window.ultraSimpleLogout;
}

console.log(' Sistema de cierre de sesión inicializado');

