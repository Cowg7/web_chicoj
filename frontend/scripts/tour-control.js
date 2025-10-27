// Script para listar y filtrar tours (tour-control.html)

(() => {
  // Elementos del DOM
  const $ = (id) => document.getElementById(id);
  
  const tablaBody = $('tabla-tickets')?.querySelector('tbody');
  const btnEditar = $('btn-editar');
  const filtros = {
    fechaDesde: $('f-fecha-desde'),
    fechaHasta: $('f-fecha-hasta'),
    servicio: $('f-servicio'),
    tipo: $('f-tipo')
  };
  const btnAplicar = $('btn-aplicar-filtros');
  const btnLimpiar = $('btn-limpiar-filtros');

  // Estado
  let tours = [];
  let filteredTours = [];
  let selectedTourId = null;

  // Inicializar
  async function init() {
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login.html';
      return;
    }

    // Configurar fechas por defecto (último mes)
    const hoy = new Date();
    const haceMes = new Date();
    haceMes.setMonth(haceMes.getMonth() - 1);
    
    if (filtros.fechaDesde) {
      filtros.fechaDesde.value = haceMes.toISOString().split('T')[0];
    }
    if (filtros.fechaHasta) {
      filtros.fechaHasta.value = hoy.toISOString().split('T')[0];
    }

    // Cargar tours
    await loadTours();

    // Event listeners
    setupEventListeners();
  }

  // Cargar tours
  async function loadTours() {
    try {
      console.log('🔄 Cargando tours...');
      console.log('✅ TOUR-CONTROL.JS v20251025a');
      
      const response = await API.tour.getAll();
      console.log('📦 Respuesta completa del servidor:', response);
      
      const data = response.data || response;
      console.log('📊 Data extraída:', data);
      
      tours = data.tours || data || [];
      console.log(`✅ ${tours.length} tours cargados:`, tours);
      
      if (tours.length > 0) {
        console.log('📋 Primer tour como ejemplo:', tours[0]);
      }
      
      filteredTours = [...tours];
      displayTours();
    } catch (error) {
      console.error('❌ Error al cargar tours:', error);
      console.error('📊 Detalles del error:', error.message, error.stack);
      showNotification('Error al cargar tours', 'error');
      
      if (tablaBody) {
        tablaBody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align: center; padding: 20px; color: #dc3545;">
              Error al cargar tours. Verifica la conexión.
            </td>
          </tr>
        `;
      }
    }
  }

  // Mostrar tours en la tabla
  function displayTours() {
    console.log('🎨 displayTours() llamado');
    console.log('📍 tablaBody existe:', !!tablaBody);
    console.log('📊 Tours a mostrar:', filteredTours.length);

    if (!tablaBody) {
      console.error('❌ tablaBody no encontrado');
      return;
    }

    tablaBody.innerHTML = '';

    if (filteredTours.length === 0) {
      console.log('⚠️ No hay tours para mostrar');
      tablaBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 20px; color: #999;">
            ${tours.length === 0 ? 'No hay tours registrados' : 'No se encontraron tours con los filtros aplicados'}
          </td>
        </tr>
      `;
      return;
    }

    console.log('📋 Renderizando tours...');
    filteredTours.forEach((tour, index) => {
      console.log(`  Tour ${index + 1}:`, tour);
      
      const row = document.createElement('tr');
      row.dataset.id = tour.id_tour;

      const fecha = new Date(tour.fecha);
      const precioServicio = parseFloat(tour.precio_servicio);
      const precioTotal = precioServicio * tour.cantidad_visitante;
      
      row.innerHTML = `
        <td>${tour.id_tour}</td>
        <td>${fecha.toLocaleDateString('es-GT')}</td>
        <td>${tour.nombre_servicio}</td>
        <td>Q${precioServicio.toFixed(2)}</td>
        <td>${tour.tipo_visitante}</td>
        <td>${tour.cantidad_visitante}</td>
        <td>${tour.idioma || '—'}</td>
        <td>${tour.observaciones || '—'}</td>
        <td><strong>Q${precioTotal.toFixed(2)}</strong></td>
      `;

      // Click para seleccionar
      row.addEventListener('click', () => handleRowClick(tour.id_tour, row));

      tablaBody.appendChild(row);
    });

    console.log(`✅ ${filteredTours.length} de ${tours.length} tours mostrados en la tabla`);
  }

  // Manejar click en fila
  function handleRowClick(tourId, row) {
    console.log('🖱️ Click en fila del tour ID:', tourId);
    
    // Quitar selección previa
    tablaBody?.querySelectorAll('tr').forEach(tr => tr.classList.remove('seleccionada'));
    
    // Agregar selección actual
    row.classList.add('seleccionada');
    selectedTourId = tourId;
    
    console.log('✅ Tour seleccionado:', tourId);
    console.log('💡 Ahora puedes hacer clic en el botón "Editar"');
  }

  // Configurar event listeners
  function setupEventListeners() {
    // Botón editar
    if (btnEditar) {
      btnEditar.addEventListener('click', handleEdit);
    }

    // Botón aplicar filtros
    if (btnAplicar) {
      btnAplicar.addEventListener('click', applyFilters);
    }

    // Botón limpiar filtros
    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', clearFilters);
    }

    // Enter en filtros aplica
    Object.values(filtros).forEach(filtro => {
      if (filtro) {
        filtro.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') applyFilters();
        });
      }
    });
  }

  // Manejar edición
  function handleEdit(e) {
    console.log('🖱️ Botón Editar clickeado');
    console.log('🎯 Tour seleccionado:', selectedTourId);
    
    if (!selectedTourId) {
      console.warn('⚠️ No hay tour seleccionado');
      showNotification('Por favor selecciona un tour primero (haz clic en la fila)', 'warning');
      e.preventDefault();
      return;
    }

    const url = `/templates/tour/tour.html?id=${selectedTourId}`;
    console.log('✅ Redirigiendo a:', url);
    window.location.href = url;
  }

  // Aplicar filtros
  function applyFilters() {
    console.log('🔍 Aplicando filtros...');
    
    filteredTours = tours.filter(tour => {
      // Filtro por rango de fechas
      if (filtros.fechaDesde?.value || filtros.fechaHasta?.value) {
        const tourFecha = new Date(tour.fecha);
        
        if (filtros.fechaDesde?.value) {
          const desde = new Date(filtros.fechaDesde.value);
          desde.setHours(0, 0, 0, 0);
          if (tourFecha < desde) return false;
        }
        
        if (filtros.fechaHasta?.value) {
          const hasta = new Date(filtros.fechaHasta.value);
          hasta.setHours(23, 59, 59, 999);
          if (tourFecha > hasta) return false;
        }
      }

      // Filtro por servicio (exacto)
      if (filtros.servicio?.value && filtros.servicio.value !== '') {
        if (tour.nombre_servicio !== filtros.servicio.value) {
          return false;
        }
      }

      // Filtro por tipo de visitante
      if (filtros.tipo?.value && filtros.tipo.value !== '') {
        if (tour.tipo_visitante !== filtros.tipo.value) return false;
      }

      return true;
    });

    displayTours();
    
    const mensaje = `Mostrando ${filteredTours.length} de ${tours.length} tours`;
    console.log(`✅ ${mensaje}`);
    showNotification(mensaje, 'info');
  }

  // Limpiar filtros
  function clearFilters() {
    // Limpiar valores
    if (filtros.fechaDesde) filtros.fechaDesde.value = '';
    if (filtros.fechaHasta) filtros.fechaHasta.value = '';
    if (filtros.servicio) filtros.servicio.value = '';
    if (filtros.tipo) filtros.tipo.value = '';

    // Configurar fechas por defecto (último mes)
    const hoy = new Date();
    const haceMes = new Date();
    haceMes.setMonth(haceMes.getMonth() - 1);
    
    if (filtros.fechaDesde) {
      filtros.fechaDesde.value = haceMes.toISOString().split('T')[0];
    }
    if (filtros.fechaHasta) {
      filtros.fechaHasta.value = hoy.toISOString().split('T')[0];
    }

    // Mostrar todos
    filteredTours = [...tours];
    displayTours();
    
    showNotification('Filtros limpiados', 'info');
  }

  // Mostrar notificación
  function showNotification(message, type = 'info') {
    // Si existe sistema de notificaciones global, usarlo
    if (window.showNotification) {
      window.showNotification(message, type);
      return;
    }

    // Fallback: console
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${icon} ${message}`);
  }

  // Agregar estilos para fila seleccionada
  const style = document.createElement('style');
  style.textContent = `
    .tabla-orden tbody tr {
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .tabla-orden tbody tr:hover {
      background-color: #f5f5f5;
    }
    
    .tabla-orden tbody tr.seleccionada {
      background-color: #e3f2fd;
      font-weight: 500;
    }

    .filtros {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }

    .filtros .campo {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .filtros label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #495057;
    }

    .filtros input,
    .filtros select {
      padding: 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .filtros button {
      align-self: flex-end;
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
