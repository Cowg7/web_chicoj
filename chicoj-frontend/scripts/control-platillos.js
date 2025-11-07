// Script para listar y gestionar platillos agrupados por área (control-platillos.html)

(() => {
  // Elementos del DOM
  const container = document.querySelector('.tabla-platillos');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  const searchResultsInfo = document.getElementById('search-results-info');
  
  // Estado
  let platillos = [];
  let menuPorArea = [];
  let searchTerm = '';

  // Inicializar
  async function init() {
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login';
      return;
    }

    // Cargar platillos
    await loadPlatillos();
    
    // Configurar búsqueda
    setupSearch();
  }
  
  // Configurar barra de búsqueda
  function setupSearch() {
    if (searchInput) {
      // Búsqueda en tiempo real
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim();
        
        // Mostrar/ocultar botón de limpiar
        if (clearSearchBtn) {
          clearSearchBtn.style.display = searchTerm ? 'flex' : 'none';
        }
        
        // Filtrar y mostrar
        filterAndDisplay();
      });
    }
    
    // Botón limpiar
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchTerm = '';
        clearSearchBtn.style.display = 'none';
        filterAndDisplay();
        searchInput.focus();
      });
    }
  }
  
  // Filtrar y mostrar platillos
  function filterAndDisplay() {
    if (!searchTerm) {
      // Sin búsqueda, mostrar todo
      displayPlatillosPorArea(menuPorArea);
      if (searchResultsInfo) {
        searchResultsInfo.textContent = '';
        searchResultsInfo.className = 'search-results-info';
      }
      return;
    }
    
    // Filtrar áreas y platillos
    const searchLower = searchTerm.toLowerCase();
    const filteredMenu = menuPorArea.map(grupo => {
      const platillosFiltrados = grupo.platillos.filter(p => 
        p.nombre.toLowerCase().includes(searchLower)
      );
      
      return {
        area: grupo.area,
        platillos: platillosFiltrados,
        totalOriginal: grupo.platillos.length
      };
    }).filter(grupo => grupo.platillos.length > 0); // Solo áreas con resultados
    
    // Contar resultados
    const totalEncontrados = filteredMenu.reduce((sum, g) => sum + g.platillos.length, 0);
    
    // Mostrar resultados
    displayPlatillosPorArea(filteredMenu, searchTerm);
    
    // Actualizar info de búsqueda
    if (searchResultsInfo) {
      if (totalEncontrados === 0) {
        searchResultsInfo.textContent = `No se encontraron platillos con "${searchTerm}"`;
        searchResultsInfo.className = 'search-results-info';
      } else {
        searchResultsInfo.textContent = `${totalEncontrados} platillo${totalEncontrados === 1 ? '' : 's'} encontrado${totalEncontrados === 1 ? '' : 's'}`;
        searchResultsInfo.className = 'search-results-info highlight';
      }
    }
  }

  // Cargar platillos
  async function loadPlatillos() {
    try {
      console.log('Cargando platillos...');
      const response = await API.menu.getAll();
      
      // El backend devuelve: { data: { menu: [{area, platillos: [...]}], total } }
      const data = response.data || response;
      
      if (data.menu && Array.isArray(data.menu)) {
        menuPorArea = data.menu;
        console.log(`${menuPorArea.length} áreas cargadas`);
      } else {
        menuPorArea = [];
      }

      displayPlatillosPorArea(menuPorArea);
    } catch (error) {
      console.error('Error al cargar platillos:', error);
      showNotification('Error al cargar platillos: ' + error.message, 'error');
    }
  }

  // Mostrar platillos agrupados por área
  function displayPlatillosPorArea(menu = menuPorArea, highlightTerm = '') {
    if (!container) {
      console.error('Container no encontrado');
      return;
    }

    // Limpiar todo
    container.innerHTML = '';

    if (menu.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--muted);">
          <p style="font-size: 1.2rem; margin-bottom: 10px;">${highlightTerm ? 'No se encontraron resultados' : 'No hay platillos registrados'}</p>
          ${!highlightTerm ? '<a href="/templates/administracion/platillo" class="btn btn-success">+ Agregar primer platillo</a>' : ''}
        </div>
      `;
      return;
    }

    // Crear una sección por cada área
    menu.forEach(grupo => {
      const areaSection = document.createElement('div');
      areaSection.className = 'area-section';
      
      // Título del área
      const areaHeader = document.createElement('div');
      areaHeader.className = 'area-header';
      areaHeader.innerHTML = `
        <h3>${grupo.area.nombre}</h3>
        <span class="area-badge">${grupo.platillos.length} platillos</span>
      `;
      areaSection.appendChild(areaHeader);

      // Tabla de platillos de esta área
      const tablaArea = document.createElement('div');
      tablaArea.className = 'tabla-platillos-area';
      tablaArea.setAttribute('role', 'table');

      // Encabezados
      const encabezados = document.createElement('div');
      encabezados.className = 'fila encabezados';
      encabezados.innerHTML = `
        <div class="col col-id">ID</div>
        <div class="col col-nombre">Nombre</div>
        <div class="col col-precio">Precio</div>
        <div class="col col-desc">Descripción</div>
        <div class="col col-estado">Estado</div>
        <div class="col col-acciones">Acciones</div>
      `;
      tablaArea.appendChild(encabezados);

      // Filas de platillos
      if (grupo.platillos && grupo.platillos.length > 0) {
        grupo.platillos.forEach(platillo => {
          const row = createPlatilloRow(platillo, highlightTerm);
          tablaArea.appendChild(row);
        });
      } else {
        const emptyRow = document.createElement('div');
        emptyRow.className = 'fila';
        emptyRow.innerHTML = '<div class="col" style="grid-column: 1 / -1; text-align: center; color: #999;">No hay platillos en esta área</div>';
        tablaArea.appendChild(emptyRow);
      }

      areaSection.appendChild(tablaArea);
      container.appendChild(areaSection);
    });
  }

  // Crear fila de platillo
  function createPlatilloRow(platillo, highlightTerm = '') {
    const row = document.createElement('div');
    row.className = 'fila';
    row.setAttribute('role', 'row');
    
    const platilloId = platillo.id_platillo || platillo.id;
    const disponible = platillo.disponible !== undefined ? platillo.disponible : true;
    
    row.dataset.id = platilloId;
    if (!disponible) {
      row.classList.add('no-disponible');
    }

    const estadoBadge = disponible 
      ? '<span class="badge badge-success">DISPONIBLE</span>'
      : '<span class="badge badge-danger">NO DISPONIBLE</span>';

    const toggleBtn = disponible
      ? `<button class="btn btn-warning btn-toggle" data-id="${platilloId}" data-disponible="true" title="Desactivar platillo">Desactivar</button>`
      : `<button class="btn btn-success btn-toggle" data-id="${platilloId}" data-disponible="false" title="Activar platillo">Activar</button>`;

    // Resaltar texto de búsqueda en el nombre
    let nombreDisplay = platillo.nombre;
    if (highlightTerm) {
      const regex = new RegExp(`(${highlightTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      nombreDisplay = platillo.nombre.replace(regex, '<span class="highlight-text">$1</span>');
    }

    row.innerHTML = `
      <div class="col col-id">${platilloId}</div>
      <div class="col col-nombre">${nombreDisplay}</div>
      <div class="col col-precio">Q ${parseFloat(platillo.precio).toFixed(2)}</div>
      <div class="col col-desc">${platillo.descripcion || 'Sin descripción'}</div>
      <div class="col col-estado">${estadoBadge}</div>
      <div class="col col-acciones">
        ${disponible 
          ? '<button class="btn btn-desactivar btn-toggle" data-id="' + platilloId + '" data-disponible="true">Desactivar</button>'
          : '<button class="btn btn-activar btn-toggle" data-id="' + platilloId + '" data-disponible="false">Activar</button>'
        }
        <a class="btn btn-editar" href="/templates/administracion/platillo?id=${platilloId}">Editar</a>
        <button class="btn btn-eliminar" data-id="${platilloId}">Eliminar</button>
      </div>
    `;

    // Event listener para toggle disponibilidad
    const btnToggle = row.querySelector('.btn-toggle');
    if (btnToggle) {
      btnToggle.addEventListener('click', () => handleToggleDisponibilidad(platilloId, disponible));
    }

    // Event listener para eliminar
    const btnEliminar = row.querySelector('.btn-eliminar');
    if (btnEliminar) {
      btnEliminar.addEventListener('click', () => handleEliminarPlatillo(platilloId, platillo.nombre));
    }

    return row;
  }

  // Manejar cambio de disponibilidad
  async function handleToggleDisponibilidad(id, disponibleActual) {
    const accion = disponibleActual ? 'desactivar' : 'activar';
    const nuevoEstado = !disponibleActual;
    
    const confirmed = await showConfirm(
      `¿Estás seguro de ${accion} este platillo?\n\n` +
      (nuevoEstado ? 
        'El platillo estará DISPONIBLE para los meseros.' : 
        'El platillo se mostrará como NO DISPONIBLE a los meseros.'),
      {
        confirmText: nuevoEstado ? 'Activar' : 'Desactivar',
        cancelText: 'Cancelar'
      }
    );
    
    if (!confirmed) return;

    try {
      console.log(`Cambiando disponibilidad del platillo ${id} a:`, nuevoEstado);
      
      await API.menu.toggleDisponibilidad(id, nuevoEstado);
      
      showNotification(
        `Platillo ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
        'success'
      );
      
      // Recargar platillos
      await loadPlatillos();
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error);
      showNotification('Error al cambiar disponibilidad: ' + error.message, 'error');
    }
  }

  // Manejar eliminación de platillo
  async function handleEliminarPlatillo(id, nombre) {
    const confirmed = await showConfirm(
      `¿Estás seguro de eliminar el platillo "${nombre}"?\n\n` +
      'Esta acción NO se puede deshacer.\n' +
      'El platillo será eliminado permanentemente del sistema.',
      {
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    );
    
    if (!confirmed) return;

    try {
      console.log(`Eliminando platillo ${id}: ${nombre}`);
      
      await API.menu.delete(id);
      
      showNotification(
        `Platillo "${nombre}" eliminado exitosamente`,
        'success'
      );
      
      // Recargar platillos
      await loadPlatillos();
    } catch (error) {
      console.error('Error al eliminar platillo:', error);
      
      // Mostrar el mensaje completo del servidor
      const errorMessage = error.message;
      showNotification(errorMessage, 'error');
    }
  }

  // Mostrar notificación
  function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Crear notificación visual
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      background: ${type === 'success' ? '#A8B5A1' : type === 'error' ? '#C49A8A' : '#D4AF85'};
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 500px;
      min-width: 300px;
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.5;
    `;
    
    document.body.appendChild(notification);
    
    // Los errores largos se muestran por más tiempo
    const duration = type === 'error' && message.length > 100 ? 6000 : 3000;
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  // Estilos adicionales
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }

    .area-section {
      margin-bottom: 40px;
    }

    .area-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 20px;
      background: linear-gradient(135deg, #7FA1B3 0%, #6B8A9B 100%);
      color: white;
      border-radius: 8px 8px 0 0;
      margin-bottom: 0;
    }

    .area-header h3 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .area-badge {
      background: rgba(255, 255, 255, 0.25);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .tabla-platillos-area {
      background: white;
      border: 1px solid #e5e9ec;
      border-top: none;
      border-radius: 0 0 8px 8px;
      overflow: hidden;
    }

    .fila.no-disponible {
      opacity: 0.6;
      background: #f8f9fa;
    }

    .fila.no-disponible .col-nombre {
      text-decoration: line-through;
      color: #a0aab3;
    }

    .col-estado {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .badge-success {
      background: rgba(168, 181, 161, 0.15);
      color: #A8B5A1;
      border: 1px solid #A8B5A1;
    }

    .badge-danger {
      background: rgba(196, 154, 138, 0.15);
      color: #C49A8A;
      border: 1px solid #C49A8A;
    }

    .btn-toggle {
      margin-right: 8px;
      font-size: 0.875rem;
      padding: 8px 12px;
    }

    .btn-warning {
      background: #D4AF85;
      color: white;
      border-color: #D4AF85;
    }

    .btn-warning:hover {
      background: #C49A7A;
      border-color: #C49A7A;
    }

    .btn-danger {
      background: #C49A8A;
      color: white;
      border-color: #C49A8A;
      font-size: 0.875rem;
      padding: 8px 12px;
    }

    .btn-danger:hover {
      background: #B8897A;
      border-color: #B8897A;
    }

    .col-acciones {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    /* Ajustar anchos de columnas para incluir más botones */
    .fila {
      display: grid;
      grid-template-columns: 60px 1.5fr 100px 2fr 150px 2.5fr;
      gap: 10px;
      align-items: center;
    }

    @media (max-width: 1200px) {
      .fila {
        grid-template-columns: 50px 1fr 90px 1.5fr 140px 2fr;
      }
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
