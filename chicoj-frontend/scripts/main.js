// Script principal para la página de inicio (main.html)

(() => {
  // Inicializar
  async function init() {
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login';
      return;
    }

    // Cargar información del usuario
    await loadUserInfo();

    // Cargar estadísticas si está disponible
    loadDashboardStats();
  }

  // Cargar información del usuario
  async function loadUserInfo() {
    try {
      const user = AuthManager.getUser();
      
      if (user) {
        // Actualizar UI con información del usuario
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
          el.textContent = user.nombre || user.username;
        });

        const userRoleElements = document.querySelectorAll('.user-role');
        userRoleElements.forEach(el => {
          el.textContent = user.rol || user.role || 'Usuario';
        });
      }
    } catch (error) {
      console.error('Error al cargar información del usuario:', error);
    }
  }

  // Cargar estadísticas del dashboard
  async function loadDashboardStats() {
    try {
      const stats = await API.reports.getDashboard();
      
      if (stats) {
        // Actualizar estadísticas en la UI
        updateStats(stats);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }

  // Actualizar estadísticas en la UI
  function updateStats(stats) {
    // Ventas del día
    const salesElement = document.getElementById('total-sales');
    if (salesElement && stats.totalSales) {
      salesElement.textContent = Utils.formatCurrency(stats.totalSales);
    }

    // Órdenes pendientes
    const ordersElement = document.getElementById('pending-orders');
    if (ordersElement && stats.pendingOrders !== undefined) {
      ordersElement.textContent = stats.pendingOrders;
    }

    // Tours del día
    const toursElement = document.getElementById('tours-today');
    if (toursElement && stats.toursToday !== undefined) {
      toursElement.textContent = stats.toursToday;
    }
  }

  // NOTA: El logout ahora se maneja con ultraSimpleLogout() directamente en el onclick
  // Ya no es necesario agregar event listeners aquí

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();




