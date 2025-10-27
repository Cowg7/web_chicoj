// Script para vista de Reportes
(() => {
  // Elementos del DOM
  const $ = (id) => document.getElementById(id);
  
  // Filtros
  const fechaDesde = $('fecha_desde');
  const fechaHasta = $('fecha_hasta');
  const tipoReporte = $('tipo_reporte');
  const btnGenerar = $('btn-generar');
  const btnLimpiar = $('btn-limpiar');
  
  // Stats
  const statVentasTotales = $('stat-ventas-totales');
  const statOrdenesTotales = $('stat-ordenes-totales');
  const statTicketPromedio = $('stat-ticket-promedio');
  
  // Contenedores
  const contentPlatillos = $('content-platillos');
  const contentHoras = $('content-horas');
  const contentAreas = $('content-areas');

  // Charts
  let chartPlatillos = null;
  let chartHoras = null;
  let chartAreas = null;

  // Colores de la paleta del sistema
  const COLORS = {
    primary: '#7FA1B3',
    success: '#A8B5A1',
    warning: '#D4AF85',
    danger: '#C49A8A',
    info: '#92A089',
    palette: [
      '#7FA1B3', '#A8B5A1', '#D4AF85', '#C49A8A', 
      '#92A089', '#6B8A9B', '#858F81', '#C49A7A',
      '#9BA597', '#5A7483'
    ]
  };

  // Inicializar
  async function init() {
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login.html';
      return;
    }

    // Mostrar info del usuario
    const user = AuthManager.getUser();
    if (user) {
      const nombreElement = $('usuario-nombre');
      if (nombreElement) {
        nombreElement.textContent = user.nombre || user.username || 'Usuario';
      }
    }

    // Configurar fechas por defecto (último mes)
    setDefaultDates();

    // Configurar event listeners
    setupEventListeners();

    // Cargar datos iniciales
    await loadAllReports();
  }

  // Configurar fechas por defecto
  function setDefaultDates() {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    if (fechaDesde) {
      fechaDesde.value = lastMonth.toISOString().split('T')[0];
    }
    if (fechaHasta) {
      fechaHasta.value = today.toISOString().split('T')[0];
    }
  }

  // Configurar event listeners
  function setupEventListeners() {
    // Logout
    const btnLogout = $('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        AuthManager.logout();
        window.location.href = '/templates/login.html';
      });
    }

    // Generar reporte
    if (btnGenerar) {
      btnGenerar.addEventListener('click', loadAllReports);
    }

    // Limpiar filtros
    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', () => {
        setDefaultDates();
        if (tipoReporte) tipoReporte.value = 'general';
        loadAllReports();
      });
    }

    // Generar PDF
    const btnGenerarPDF = $('btn-generar-pdf');
    if (btnGenerarPDF) {
      btnGenerarPDF.addEventListener('click', generatePDF);
    }
  }

  // Generar PDF
  async function generatePDF() {
    try {
      const params = getFilterParams();
      console.log('📄 Generando PDF con parámetros:', params);

      // Construir URL con parámetros
      const queryParams = new URLSearchParams();
      if (params.fecha_desde) queryParams.append('fecha_desde', params.fecha_desde);
      if (params.fecha_hasta) queryParams.append('fecha_hasta', params.fecha_hasta);

      const token = AuthManager.getToken();
      const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.reports}/pdf?${queryParams.toString()}`;

      // Descargar PDF
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al generar PDF');
      }

      // Crear blob y descargar
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `reporte-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      console.log('✅ PDF generado exitosamente');
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    }
  }

  // Obtener parámetros de filtro
  function getFilterParams() {
    const params = {};
    
    if (fechaDesde?.value) {
      params.fecha_desde = fechaDesde.value;
    }
    if (fechaHasta?.value) {
      params.fecha_hasta = fechaHasta.value;
    }
    
    console.log('📅 Parámetros de fecha:', params);
    
    return params;
  }

  // Cargar todos los reportes
  async function loadAllReports() {
    const params = getFilterParams();
    
    console.log('📊 Cargando reportes con parámetros:', params);

    // Cargar en paralelo
    await Promise.all([
      loadSalesSummary(params),
      loadTopDishes(params),
      loadPeakHours(params),
      loadRevenueByArea(params)
    ]);
  }

  // Cargar resumen de ventas
  async function loadSalesSummary(params) {
    try {
      const response = await API.reports.getSales(params);
      const data = response.data || response;

      console.log('💰 Resumen de ventas:', data);

      const totalVentas = parseFloat(data.total_ventas || 0);
      const totalOrdenes = parseInt(data.total_ordenes || 0);
      const ticketPromedio = totalOrdenes > 0 ? totalVentas / totalOrdenes : 0;

      if (statVentasTotales) {
        statVentasTotales.textContent = `Q ${totalVentas.toFixed(2)}`;
      }
      if (statOrdenesTotales) {
        statOrdenesTotales.textContent = totalOrdenes;
      }
      if (statTicketPromedio) {
        statTicketPromedio.textContent = `Q ${ticketPromedio.toFixed(2)}`;
      }

      // Update charts placeholders
      const chartVentas = $('chart-ventas');
      const chartOrdenes = $('chart-ordenes');
      const chartTicket = $('chart-ticket');

      if (chartVentas) {
        chartVentas.innerHTML = `<span style="color: #4CAF50;">✓ ${totalOrdenes} órdenes</span>`;
      }
      if (chartOrdenes) {
        chartOrdenes.innerHTML = `<span style="color: #2196F3;">Período: ${params.fecha_desde || 'N/A'} - ${params.fecha_hasta || 'N/A'}</span>`;
      }
      if (chartTicket) {
        chartTicket.innerHTML = `<span style="color: #FF9800;">Promedio por orden</span>`;
      }
    } catch (error) {
      console.error('❌ Error al cargar resumen de ventas:', error);
      if (statVentasTotales) statVentasTotales.textContent = 'Error';
      if (statOrdenesTotales) statOrdenesTotales.textContent = 'Error';
      if (statTicketPromedio) statTicketPromedio.textContent = 'Error';
    }
  }

  // Crear gráfica de platillos más vendidos
  function createDishesChart(dishes) {
    const canvas = $('chart-platillos');
    if (!canvas) return;

    // Destruir gráfica anterior si existe
    if (chartPlatillos) {
      chartPlatillos.destroy();
    }

    const ctx = canvas.getContext('2d');
    chartPlatillos = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dishes.map(d => d.nombre),
        datasets: [{
          label: 'Cantidad Vendida',
          data: dishes.map(d => d.cantidad_vendida || d.cantidad || 0),
          backgroundColor: COLORS.palette,
          borderColor: COLORS.palette.map(c => c + 'CC'),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Platillos Más Vendidos',
            font: { size: 16, weight: 'bold' },
            color: '#3d4a52'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#7a8891' }
          },
          x: {
            ticks: { 
              color: '#7a8891',
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });
  }

  // Crear gráfica de horas pico
  function createHoursChart(hours) {
    const canvas = $('chart-horas');
    if (!canvas) return;

    if (chartHoras) {
      chartHoras.destroy();
    }

    const ctx = canvas.getContext('2d');
    chartHoras = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hours.map(h => h.hora),
        datasets: [{
          label: 'Órdenes',
          data: hours.map(h => h.cantidad || h.total_ordenes || 0),
          backgroundColor: COLORS.primary + '30',
          borderColor: COLORS.primary,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: COLORS.primary,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Distribución de Órdenes por Hora',
            font: { size: 16, weight: 'bold' },
            color: '#3d4a52'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#7a8891' }
          },
          x: {
            ticks: { color: '#7a8891' }
          }
        }
      }
    });
  }

  // Crear gráfica de ventas por área
  function createAreasChart(areas) {
    const canvas = $('chart-areas');
    if (!canvas) return;

    if (chartAreas) {
      chartAreas.destroy();
    }

    const ctx = canvas.getContext('2d');
    chartAreas = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: areas.map(a => a.area || a.nombre || 'Sin área'),
        datasets: [{
          data: areas.map(a => parseFloat(a.total_ingresos || a.total_ventas || 0)),
          backgroundColor: COLORS.palette,
          borderColor: '#fff',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#3d4a52',
              font: { size: 12 },
              padding: 15
            }
          },
          title: {
            display: true,
            text: 'Distribución de Ventas por Área',
            font: { size: 16, weight: 'bold' },
            color: '#3d4a52'
          }
        }
      }
    });
  }

  // Cargar platillos más vendidos
  async function loadTopDishes(params) {
    try {
      const response = await API.reports.getTopDishes({ ...params, limit: 10 });
      const data = response.data || response;
      const dishes = data.top_platillos || data.top_dishes || [];

      console.log('🍽️ Top platillos:', dishes);

      if (!contentPlatillos) return;

      if (dishes.length === 0) {
        contentPlatillos.innerHTML = '<div class="no-data">No hay datos para mostrar en este período</div>';
        return;
      }

      // Crear gráfica
      createDishesChart(dishes);

      const html = `
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Platillo</th>
              <th>Cantidad Vendida</th>
            </tr>
          </thead>
          <tbody>
            ${dishes.map((dish, index) => `
              <tr>
                <td><strong>${index + 1}</strong></td>
                <td>${dish.nombre || 'N/A'}</td>
                <td><strong>${dish.cantidad_vendida || 0}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      contentPlatillos.innerHTML = html;
    } catch (error) {
      console.error('❌ Error al cargar platillos más vendidos:', error);
      if (contentPlatillos) {
        contentPlatillos.innerHTML = `<div class="error">Error al cargar datos: ${error.message}</div>`;
      }
    }
  }

  // Cargar horas pico
  async function loadPeakHours(params) {
    try {
      const response = await API.reports.getPeakHours({ ...params, groupBy: 'hour' });
      const data = response.data || response;
      const results = data.horarios || data.results || [];

      console.log('⏰ Horas pico:', results);

      if (!contentHoras) return;

      if (results.length === 0) {
        contentHoras.innerHTML = '<div class="no-data">No hay datos para mostrar en este período</div>';
        return;
      }

      // Los datos ya vienen en el formato correcto del backend
      const hoursArray = results.map(item => ({
        hora: item.hora || item.periodo,
        cantidad: item.total_ordenes || item.cantidad_ordenes || 0,
        ventas: item.total_ventas || 0
      })).sort((a, b) => b.cantidad - a.cantidad);

      // Crear gráfica
      createHoursChart(hoursArray);

      const html = `
        <table class="report-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Cantidad de Órdenes</th>
            </tr>
          </thead>
          <tbody>
            ${hoursArray.map(item => `
              <tr>
                <td>${item.hora}</td>
                <td><strong>${item.cantidad}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      contentHoras.innerHTML = html;
    } catch (error) {
      console.error('❌ Error al cargar horas pico:', error);
      if (contentHoras) {
        contentHoras.innerHTML = `<div class="error">Error al cargar datos: ${error.message}</div>`;
      }
    }
  }

  // Cargar ingresos por área
  async function loadRevenueByArea(params) {
    try {
      const response = await API.reports.getSalesByArea(params);
      const data = response.data || response;
      const areas = data.ventas_por_area || data.revenue_by_area || [];

      console.log('📍 Ingresos por área:', areas);

      if (!contentAreas) return;

      if (areas.length === 0) {
        contentAreas.innerHTML = '<div class="no-data">No hay datos para mostrar en este período</div>';
        return;
      }

      const total = areas.reduce((sum, area) => sum + parseFloat(area.total_ingresos || 0), 0);

      // Crear gráfica
      createAreasChart(areas);

      const html = `
        <table class="report-table">
          <thead>
            <tr>
              <th>Área</th>
              <th>Ingresos</th>
              <th>% del Total</th>
            </tr>
          </thead>
          <tbody>
            ${areas.map(area => {
              const ingresos = parseFloat(area.total_ingresos || 0);
              const porcentaje = total > 0 ? (ingresos / total * 100) : 0;
              return `
                <tr>
                  <td><strong>${area.area}</strong></td>
                  <td>Q ${ingresos.toFixed(2)}</td>
                  <td>${porcentaje.toFixed(1)}%</td>
                </tr>
              `;
            }).join('')}
            <tr style="background: #f5f5f5; font-weight: bold;">
              <td>TOTAL</td>
              <td>Q ${total.toFixed(2)}</td>
              <td>100%</td>
            </tr>
          </tbody>
        </table>
      `;

      contentAreas.innerHTML = html;
    } catch (error) {
      console.error('❌ Error al cargar ingresos por área:', error);
      if (contentAreas) {
        contentAreas.innerHTML = `<div class="error">Error al cargar datos: ${error.message}</div>`;
      }
    }
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

