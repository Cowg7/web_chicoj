// Script para verificar la conectividad con el backend

(() => {
  // Función para verificar health del backend
  async function checkBackendHealth() {
    const healthIndicator = document.getElementById('backend-health');
    
    if (!healthIndicator) {
      // Si no hay indicador en la página, no hacer nada
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.baseURL.replace('/api', '')}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.status === 'OK') {
        healthIndicator.innerHTML = `
          <span style="color: #4CAF50;">
            ● Backend conectado
          </span>
        `;
        healthIndicator.title = `Última verificación: ${new Date().toLocaleTimeString()}`;
        return true;
      } else {
        throw new Error('Backend respondió con error');
      }
    } catch (error) {
      healthIndicator.innerHTML = `
        <span style="color: #f44336;">
          ● Backend desconectado
        </span>
      `;
      healthIndicator.title = `Error: ${error.message}`;
      console.error('Error al conectar con backend:', error);
      return false;
    }
  }

  // Verificar conexión al cargar la página
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      checkBackendHealth();
      // Verificar cada 30 segundos
      setInterval(checkBackendHealth, 30000);
    });
  } else {
    checkBackendHealth();
    setInterval(checkBackendHealth, 30000);
  }

  // Exportar función para uso manual
  window.checkBackendHealth = checkBackendHealth;
})();




