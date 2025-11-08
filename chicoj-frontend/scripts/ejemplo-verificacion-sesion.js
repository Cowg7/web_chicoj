// Ejemplo de verificación de sesión personalizada
// Similar a la lógica que mostraste: if (sesión == null) { return login } else { return view() }

function verificarSesionYMostrarVista() {
  // Obtener la sesión (token)
  const sesion = localStorage.getItem('auth_token');
  const usuario = localStorage.getItem('user_data');
  
  // Si NO hay sesión (sesión == null)
  if (sesion == null) {
    console.log('[AUTH] No hay sesión activa');
    console.log('[AUTH] Redirigiendo a página de login...');
    
    // Redirigir a login
    window.location.replace('/templates/login?reason=no_session');
    
    // No continuar con el resto del código
    return false;
  } 
  // Si SÍ hay sesión
  else {
    console.log('[AUTH] Sesión activa detectada');
    console.log('[AUTH] Token:', sesion);
    console.log('[AUTH] Usuario:', JSON.parse(usuario || '{}'));
    
    // Permitir que la vista se cargue
    mostrarVista();
    return true;
  }
}

// Función que muestra la vista (solo se ejecuta si hay sesión)
function mostrarVista() {
  console.log('[VIEW] Mostrando vista protegida...');
  console.log('[VIEW] Usuario autenticado, contenido disponible');
  
  // Aquí iría tu código de la vista
  // Por ejemplo: cargar datos, mostrar tablas, etc.
  
  // Ejemplo:
  const usuario = AuthManager.getUser();
  if (usuario) {
    console.log('[INFO] Bienvenido:', usuario.nombre);
    console.log('[INFO] Rol:', usuario.rol);
  }
}

// Ejecutar verificación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  console.log('[START] Verificando sesión...');
  verificarSesionYMostrarVista();
});

// Ejemplo de uso manual en consola:
// verificarSesionYMostrarVista();

