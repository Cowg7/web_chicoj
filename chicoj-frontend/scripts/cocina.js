// Script para el KDS (Kitchen Display System) - cocina.html

(() => {
  // Elementos del DOM
  const tablaBody = document.querySelector('.tabla-orden tbody');
  const btnAlertar = document.getElementById('alertar');

  // Estado
  let tickets = [];
  let currentArea = null;
  let refreshInterval = null; // Guardar referencia del intervalo
  let isLoading = false; // Evitar peticiones simultáneas

  // Inicializar
  async function init() {
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login';
      return;
    }

    // 🔧 LIMPIEZA AUTOMÁTICA: Verificar si hay valores antiguos incorrectos
    const oldArea = localStorage.getItem('kds_area');
    if (oldArea && (oldArea.toLowerCase() === 'coffe_shop' || oldArea.toLowerCase() === 'coffee_shop' || oldArea.toLowerCase() === 'bar')) {
      console.warn(`⚠️ Detectado área antigua incorrecta: "${oldArea}"`);
      localStorage.removeItem('kds_area');
      console.log('✅ localStorage limpiado automáticamente');
    }

    // Obtener área de la URL o localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const areaFromUrl = urlParams.get('area');
    
    // Si viene de URL, usarla y sobrescribir localStorage
    if (areaFromUrl) {
      currentArea = areaFromUrl;
      localStorage.setItem('kds_area', currentArea);
      console.log(`📍 Área desde URL: ${currentArea}`);
    } else {
      // Obtener de localStorage o usar default
      const areaFromStorage = localStorage.getItem('kds_area');
      
      // Validar áreas conocidas (capitalizar correctamente)
      const areasValidas = {
        'cocina': 'Cocina',
        'bebidas': 'Bebidas', 
        'coffee': 'Coffee',
        'coffe_shop': 'Coffee',  // Corrección de error de escritura antiguo
        'coffee_shop': 'Coffee',
        'bar': 'Bebidas'  // Alias
      };
      
      if (areaFromStorage) {
        const areaLower = areaFromStorage.toLowerCase();
        currentArea = areasValidas[areaLower] || areaFromStorage;
      } else {
        currentArea = 'Cocina';
      }
      
      // Guardar la versión corregida
      localStorage.setItem('kds_area', currentArea);
      console.log(`📍 Área desde localStorage (corregida): ${currentArea}`);
    }
    
    // Actualizar título con el área actual
    const areaNombre = document.getElementById('area-nombre');
    if (areaNombre) {
      areaNombre.textContent = currentArea;
    }
    document.title = `KDS - ${currentArea}`;

    // Cargar tickets
    await loadTickets();

    // ⚠️ IMPORTANTE: Limpiar intervalo previo antes de crear uno nuevo
    if (refreshInterval) {
      clearInterval(refreshInterval);
      console.log('🧹 Intervalo anterior limpiado');
    }

    // Configurar refresco automático cada 15 segundos (reducido para evitar sobrecarga)
    refreshInterval = setInterval(() => {
      console.log(`🔄 Auto-refresh de ${currentArea}...`);
      loadTickets();
    }, 15000); // Cambiado de 5000 a 10000 ms

    console.log(`✅ Auto-refresh configurado para ${currentArea} cada 15 segundos`);

    // Event listeners
    setupEventListeners();
  }

  // Limpiar intervalo cuando se abandona la página
  window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      console.log('🧹 Intervalo limpiado al salir');
    }
  });

  // Limpiar intervalo al cambiar de visibilidad (cuando cambias de pestaña)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        console.log('⏸️ Auto-refresh pausado (pestaña oculta)');
      }
    } else {
      // Reanudar cuando vuelve a ser visible
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      refreshInterval = setInterval(() => {
        console.log(`🔄 Auto-refresh de ${currentArea}...`);
        loadTickets();
      }, 15000);
      console.log('▶️ Auto-refresh reanudado');
      loadTickets(); // Cargar inmediatamente al volver
    }
  });

  // Cargar tickets del área
  async function loadTickets() {
    // Evitar peticiones simultáneas
    if (isLoading) {
      console.log('⏳ Ya hay una carga en proceso, saltando...');
      return;
    }

    try {
      isLoading = true;
      console.log(`🔄 Cargando tickets del área: ${currentArea}`);
      const response = await API.kds.getByArea(currentArea);
      console.log('📦 Respuesta del servidor:', response);
      
      // El backend devuelve: { success: true, data: { area, tickets, total } }
      tickets = response.data?.tickets || response.tickets || [];
      console.log(`✅ ${tickets.length} tickets cargados`);

      displayTickets();
    } catch (error) {
      console.error('❌ Error al cargar tickets:', error);
      handleError(error, 'Error al cargar tickets de cocina');
    } finally {
      // Siempre liberar el flag de carga
      isLoading = false;
    }
  }

  // Mostrar tickets en la tabla
  function displayTickets() {
    console.log('🎨 displayTickets() llamado');
    console.log('📍 tablaBody encontrado:', !!tablaBody);
    
    if (!tablaBody) {
      console.error('❌ No se encontró tablaBody');
      return;
    }

    tablaBody.innerHTML = '';
    console.log('🧹 Tabla limpiada');

    if (tickets.length === 0) {
      console.log('⚠️ No hay tickets para mostrar');
      tablaBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 20px;">
            No hay órdenes pendientes
          </td>
        </tr>
      `;
      return;
    }

    console.log(`📋 Renderizando ${tickets.length} tickets...`);
    
    // Cada ticket es un item individual
    tickets.forEach((ticket, idx) => {
      console.log(`  Ticket ${idx + 1}:`, ticket);
      const row = document.createElement('tr');
      row.dataset.ticketId = ticket.id_area_registro;
      row.dataset.ordenId = ticket.id_orden;
      row.dataset.comandaId = ticket.id_comanda;

      const observaciones = ticket.observaciones || '—';
      const observacionExtra = ticket.extra_observacion || '';
      const precioExtra = ticket.extra_precio ? `Q${parseFloat(ticket.extra_precio).toFixed(2)}` : '';
      const extras = [observacionExtra, precioExtra].filter(e => e).join(' - ') || '—';

      // Formatear hora de llegada
      const horaLlegada = ticket.fecha ? new Date(ticket.fecha).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : '—';
      
      // Formatear hora de terminado
      const horaTerminado = ticket.fecha_terminado ? new Date(ticket.fecha_terminado).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : '—';

      row.innerHTML = `
        <td>Orden #${ticket.id_orden}</td>
        <td>Mesa ${ticket.no_mesa}</td>
        <td>${ticket.cantidad}</td>
        <td>${ticket.platillo?.nombre || 'N/A'}</td>
        <td>${observaciones}</td>
        <td>${extras}</td>
        <td>${horaLlegada}</td>
        <td>${horaTerminado}</td>
        <td>
          <button class="btn btn-success btn-small" data-ticket-id="${ticket.id_area_registro}">
            ✓ Terminar
          </button>
        </td>
      `;

      // Click en botón terminar
      const btnTerminar = row.querySelector('.btn-success');
      if (btnTerminar) {
        btnTerminar.addEventListener('click', (e) => {
          e.stopPropagation(); // Evitar que se active el click de la fila
          handleCompleteTicket(ticket.id_area_registro, row);
        });
      }

      tablaBody.appendChild(row);
      console.log(`    ✅ Fila ${idx + 1} agregada al DOM`);
    });
    
    console.log(`📊 ${tickets.length} items mostrados en la tabla`);
    console.log(`📏 Filas en tbody:`, tablaBody.children.length);
    console.log(`🔍 Contenido de tbody:`, tablaBody.innerHTML.substring(0, 200));
  }

  // Manejar click en botón terminar
  async function handleCompleteTicket(ticketId, row) {
    if (row.classList.contains('completed')) {
      showNotification('Este ticket ya está completado', 'info');
      return;
    }

    const confirmed = confirm('¿Marcar este platillo como terminado?');
    
    if (!confirmed) return;

    try {
      console.log(`🏁 Completando ticket ID: ${ticketId}`);
      await API.kds.completeTicket(ticketId);
      
      // Animación de eliminación
      row.style.opacity = '0.5';
      row.style.transition = 'opacity 0.5s';
      
      showNotification('Platillo terminado', 'success');

      // Recargar tickets después de medio segundo
      setTimeout(() => {
        loadTickets();
      }, 500);
    } catch (error) {
      row.style.opacity = '1';
      handleError(error, 'Error al completar ticket');
    }
  }

  // Configurar event listeners
  function setupEventListeners() {
    // Botón alertar mesero
    if (btnAlertar) {
      btnAlertar.addEventListener('click', handleAlertWaiter);
    }
  }

  // Alertar mesero (enviar tickets completados a caja)
  async function handleAlertWaiter() {
    const completedTickets = tickets.filter(t => t.status === 'completed');

    if (completedTickets.length === 0) {
      showNotification('No hay tickets completados para enviar', 'info');
      return;
    }

    try {
      // Enviar cada ticket completado a caja
      for (const ticket of completedTickets) {
        await API.kds.sendToCashier(ticket.id);
      }

      showNotification('Tickets enviados a caja exitosamente', 'success');
      
      // Recargar tickets
      setTimeout(loadTickets, 1000);
    } catch (error) {
      handleError(error, 'Error al enviar tickets a caja');
    }
  }

  // Mostrar notificación
  function showNotification(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
  }

  // Manejar errores
  function handleError(error, defaultMessage) {
    console.error(defaultMessage, error);
    const message = error.message || error.error || defaultMessage;
    showNotification(message, 'error');
  }

  // Agregar estilos para estados
  const style = document.createElement('style');
  style.textContent = `
    .tabla-orden tbody tr {
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .tabla-orden tbody tr:hover {
      background-color: #f5f5f5;
    }
    
    .tabla-orden tbody tr.in-progress {
      background-color: #fff3cd;
    }
    
    .tabla-orden tbody tr.completed {
      background-color: #d4edda;
      opacity: 0.7;
      text-decoration: line-through;
    }
  `;
  document.head.appendChild(style);

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

