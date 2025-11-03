// Script para el menú de cocina (menu_cocina.html)
// Este script maneja la selección de área de cocina

(() => {
  // Elementos del DOM
  const links = document.querySelectorAll('.card-opcion .btn-primary');

  // Inicializar
  function init() {
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login';
      return;
    }

    setupEventListeners();
  }

  // Configurar event listeners
  function setupEventListeners() {
    links.forEach((link, index) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Determinar área según el índice
        const areas = ['cocina', 'bebidas', 'coffee'];
        const area = areas[index] || 'cocina';
        
        // Guardar área seleccionada
        localStorage.setItem('kds_area', area);
        
        // Redirigir a la vista de cocina con el parámetro de área
        window.location.href = `/templates/cocina/cocina?area=${area}`;
      });
    });
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

