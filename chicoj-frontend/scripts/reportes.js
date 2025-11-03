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
      window.location.href = '/templates/login';
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
    
    // Establecer fecha máxima (hoy) para los inputs
    const todayStr = today.toISOString().split('T')[0];
    
    if (fechaDesde) {
      fechaDesde.value = lastMonth.toISOString().split('T')[0];
      fechaDesde.max = todayStr; // No permitir fechas futuras
    }
    if (fechaHasta) {
      fechaHasta.value = todayStr;
      fechaHasta.max = todayStr; // No permitir fechas futuras
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
        window.location.href = '/templates/login';
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

    // PDFs específicos (funciones definidas en reportes-pdf.js)
    const btnPdfPlatillos = $('btn-pdf-platillos');
    const btnPdfAreas = $('btn-pdf-areas');
    const btnPdfHoras = $('btn-pdf-horas');

    if (btnPdfPlatillos) {
      btnPdfPlatillos.addEventListener('click', () => {
        if (window.generarPDFPlatillos) window.generarPDFPlatillos();
      });
    }
    if (btnPdfAreas) {
      btnPdfAreas.addEventListener('click', () => {
        if (window.generarPDFAreas) window.generarPDFAreas();
      });
    }
    if (btnPdfHoras) {
      btnPdfHoras.addEventListener('click', () => {
        if (window.generarPDFHoras) window.generarPDFHoras();
      });
    }

    // Descargar Excel
    const btnDescargarExcel = $('btn-descargar-excel');
    if (btnDescargarExcel) {
      btnDescargarExcel.addEventListener('click', descargarExcel);
    }

    // Descargar gráficas individuales
    const btnDownloadPlatillos = $('btn-download-platillos');
    const btnDownloadHoras = $('btn-download-horas');
    const btnDownloadAreas = $('btn-download-areas');

    if (btnDownloadPlatillos) {
      btnDownloadPlatillos.addEventListener('click', () => descargarGrafica('chart-platillos', 'platillos-mas-vendidos'));
    }
    if (btnDownloadHoras) {
      btnDownloadHoras.addEventListener('click', () => descargarGrafica('chart-horas', 'horas-pico'));
    }
    if (btnDownloadAreas) {
      btnDownloadAreas.addEventListener('click', () => descargarGrafica('chart-areas', 'ingresos-por-area'));
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

  // Exportar función para uso desde reportes-pdf.js
  window.getFilterParams = getFilterParams;

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

  // ========== NUEVAS FUNCIONES DE DESCARGA ==========

  // Descargar gráfica individual como imagen PNG
  function descargarGrafica(canvasId, nombreArchivo) {
    try {
      const canvas = $(canvasId);
      if (!canvas) {
        console.error('❌ Canvas no encontrado:', canvasId);
        return;
      }

      // Convertir canvas a imagen
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Gráfica descargada:', nombreArchivo);
      });
    } catch (error) {
      console.error('❌ Error al descargar gráfica:', error);
      alert('Error al descargar la gráfica');
    }
  }

  // Descargar informe completo en Excel
  async function descargarExcel() {
    try {
      const params = getFilterParams();
      console.log('📊 Generando Excel con parámetros:', params);

      // Obtener todos los datos
      const [salesData, dishesData, hoursData, areasData] = await Promise.all([
        API.reports.getSales(params),
        API.reports.getTopDishes({ ...params, limit: 50 }),
        API.reports.getPeakHours({ ...params, groupBy: 'hour' }),
        API.reports.getSalesByArea(params)
      ]);

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();

      // Hoja 1: Resumen General
      const resumen = salesData.data || salesData;
      const totalVentas = parseFloat(resumen.total_ventas || 0);
      const totalOrdenes = parseInt(resumen.total_ordenes || 0);
      const ticketPromedio = totalOrdenes > 0 ? totalVentas / totalOrdenes : 0;

      const datosResumen = [
        { 'Métrica': 'Total de Ventas', 'Valor': `Q${totalVentas.toFixed(2)}` },
        { 'Métrica': 'Órdenes Completadas', 'Valor': totalOrdenes },
        { 'Métrica': 'Ticket Promedio', 'Valor': `Q${ticketPromedio.toFixed(2)}` },
        { 'Métrica': 'Período', 'Valor': `${params.fecha_desde || 'N/A'} a ${params.fecha_hasta || 'N/A'}` },
        { 'Métrica': 'Generado', 'Valor': new Date().toLocaleString('es-GT') }
      ];
      
      const wsResumen = XLSX.utils.json_to_sheet(datosResumen);
      wsResumen['!cols'] = [{ wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Hoja 2: Platillos Más Vendidos
      const dishesInfo = dishesData.data || dishesData;
      const platillos = dishesInfo.top_platillos || dishesInfo.top_dishes || [];
      
      const datosPlatillos = platillos.map((dish, index) => ({
        'Posición': index + 1,
        'Platillo': dish.nombre,
        'Cantidad Vendida': dish.cantidad_vendida || 0,
        'Área': dish.area || 'N/A',
        'Veces Ordenado': dish.veces_ordenado || 0,
        'Ingresos': parseFloat(dish.total_ingresos || 0).toFixed(2)
      }));

      if (datosPlatillos.length > 0) {
        const wsPlatillos = XLSX.utils.json_to_sheet(datosPlatillos);
        wsPlatillos['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 18 }, { wch: 15 }, { wch: 18 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsPlatillos, 'Platillos Más Vendidos');
      }

      // Hoja 3: Horas Pico
      const hoursInfo = hoursData.data || hoursData;
      const horas = hoursInfo.horarios || hoursInfo.results || [];
      
      const datosHoras = horas.map(item => ({
        'Hora': item.hora || item.periodo,
        'Total Órdenes': item.total_ordenes || item.cantidad_ordenes || 0,
        'Total Ventas': `Q${parseFloat(item.total_ventas || 0).toFixed(2)}`
      }));

      if (datosHoras.length > 0) {
        const wsHoras = XLSX.utils.json_to_sheet(datosHoras);
        wsHoras['!cols'] = [{ wch: 15 }, { wch: 18 }, { wch: 18 }];
        XLSX.utils.book_append_sheet(wb, wsHoras, 'Horas Pico');
      }

      // Hoja 4: Ingresos por Área
      const areasInfo = areasData.data || areasData;
      const areas = areasInfo.ventas_por_area || areasInfo.revenue_by_area || [];
      
      const datosAreas = areas.map(area => ({
        'Área': area.area,
        'Cantidad Items': area.cantidad_items || 0,
        'Ingresos': parseFloat(area.total_ingresos || 0).toFixed(2)
      }));

      // Agregar total
      const totalAreas = areas.reduce((sum, area) => sum + parseFloat(area.total_ingresos || 0), 0);
      datosAreas.push({
        'Área': 'TOTAL',
        'Cantidad Items': areas.reduce((sum, area) => sum + (area.cantidad_items || 0), 0),
        'Ingresos': totalAreas.toFixed(2)
      });

      if (datosAreas.length > 0) {
        const wsAreas = XLSX.utils.json_to_sheet(datosAreas);
        wsAreas['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 18 }];
        XLSX.utils.book_append_sheet(wb, wsAreas, 'Ingresos por Área');
      }

      // Descargar archivo
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Reporte_Completo_Chicoj_${fecha}.xlsx`);
      
      console.log('✅ Excel generado exitosamente');
      alert('✅ Reporte Excel descargado exitosamente');

    } catch (error) {
      console.error('❌ Error al generar Excel:', error);
      alert('Error al generar el Excel. Por favor intente nuevamente.');
    }
  }

  // ========== FUNCIONES DE PDF ESPECÍFICOS ==========

  // PDF de Platillos Vendidos por Fecha
  async function generarPDFPlatillos() {
    try {
      const params = getFilterParams();
      console.log('📄 Generando PDF de Platillos Vendidos...');

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');

      // Encabezado principal
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(74, 144, 226);
      doc.text('Restaurante Chicooj', 105, 15, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Reporte de Platillos Vendidos', 105, 23, { align: 'center' });

      // Línea separadora
      doc.setDrawColor(74, 144, 226);
      doc.setLineWidth(0.5);
      doc.line(14, 27, 196, 27);

      // Información del período
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Período: ${params.fecha_desde || 'Inicio'} a ${params.fecha_hasta || 'Hoy'}`, 14, 33);
      doc.text(`Generado: ${new Date().toLocaleString('es-GT')}`, 14, 38);

      let y = 45;

      // Obtener todos los datos
      const [salesData, dishesData, hoursData, areasData] = await Promise.all([
        API.reports.getSales(params),
        API.reports.getTopDishes({ ...params, limit: 20 }),
        API.reports.getPeakHours({ ...params, groupBy: 'hour' }),
        API.reports.getSalesByArea(params)
      ]);

      const resumen = salesData.data || salesData;
      const totalVentas = parseFloat(resumen.total_ventas || 0);
      const totalOrdenes = parseInt(resumen.total_ordenes || 0);
      const ticketPromedio = totalOrdenes > 0 ? totalVentas / totalOrdenes : 0;

      // Cuadro de resumen
      doc.setFillColor(240, 248, 255);
      doc.rect(14, y - 5, 182, 22, 'F');
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('RESUMEN EJECUTIVO', 105, y, { align: 'center' });
      y += 7;

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(`Ventas Totales: Q${totalVentas.toFixed(2)}`, 20, y);
      doc.text(`Órdenes: ${totalOrdenes}`, 90, y);
      doc.text(`Ticket Prom.: Q${ticketPromedio.toFixed(2)}`, 140, y);
      y += 12;

      // TABLA 1: Platillos Más Vendidos
      const dishesInfo = dishesData.data || dishesData;
      const platillos = dishesInfo.top_platillos || dishesInfo.top_dishes || [];
      
      if (platillos.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(74, 144, 226);
        doc.text('Top 20 - Platillos Más Vendidos', 14, y);
        y += 5;

        const datosPlatillos = platillos.map((dish, index) => [
          (index + 1).toString(),
          dish.nombre || 'N/A',
          (dish.cantidad_vendida || 0).toString(),
          dish.area || 'N/A',
          `Q${parseFloat(dish.total_ingresos || 0).toFixed(2)}`
        ]);

        doc.autoTable({
          startY: y,
          head: [['#', 'Platillo', 'Cant.', 'Área', 'Ingresos']],
          body: datosPlatillos,
          theme: 'striped',
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [74, 144, 226],
            textColor: 255,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 80 },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 35 },
            4: { cellWidth: 30, halign: 'right' }
          }
        });

        y = doc.lastAutoTable.finalY + 10;
      }

      // TABLA 2: Distribución por Horas
      const hoursInfo = hoursData.data || hoursData;
      const horas = hoursInfo.horarios || hoursInfo.results || [];
      
      if (horas.length > 0 && y + 40 < 280) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(74, 144, 226);
        doc.text('Distribución de Ventas por Hora', 14, y);
        y += 5;

        const datosHoras = horas.map(item => [
          item.hora || item.periodo,
          (item.total_ordenes || item.cantidad_ordenes || 0).toString(),
          `Q${parseFloat(item.total_ventas || 0).toFixed(2)}`
        ]);

        doc.autoTable({
          startY: y,
          head: [['Hora', 'Órdenes', 'Ventas']],
          body: datosHoras,
          theme: 'striped',
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [74, 144, 226],
            textColor: 255,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 60, halign: 'center' },
            1: { cellWidth: 60, halign: 'center' },
            2: { cellWidth: 60, halign: 'right' }
          }
        });

        y = doc.lastAutoTable.finalY + 10;
      }

      // TABLA 3: Ingresos por Área (nueva página si es necesario)
      const areasInfo = areasData.data || areasData;
      const areas = areasInfo.ventas_por_area || areasInfo.revenue_by_area || [];
      
      if (areas.length > 0) {
        if (y > 220) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(74, 144, 226);
        doc.text('Ingresos Detallados por Área de Cocina', 14, y);
        y += 5;

        const totalAreas = areas.reduce((sum, area) => sum + parseFloat(area.total_ingresos || 0), 0);
        
        const datosAreas = areas.map(area => {
          const ingresos = parseFloat(area.total_ingresos || 0);
          const porcentaje = totalAreas > 0 ? (ingresos / totalAreas * 100) : 0;
          return [
            area.area,
            (area.cantidad_items || 0).toString(),
            `Q${ingresos.toFixed(2)}`,
            `${porcentaje.toFixed(1)}%`
          ];
        });

        // Agregar fila de totales
        datosAreas.push([
          'TOTAL',
          areas.reduce((sum, area) => sum + (area.cantidad_items || 0), 0).toString(),
          `Q${totalAreas.toFixed(2)}`,
          '100.0%'
        ]);

        doc.autoTable({
          startY: y,
          head: [['Área', 'Items', 'Ingresos', '% Total']],
          body: datosAreas,
          theme: 'striped',
          styles: {
            fontSize: 9,
            cellPadding: 3
          },
          headStyles: {
            fillColor: [74, 144, 226],
            textColor: 255,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 35, halign: 'center' },
            2: { cellWidth: 40, halign: 'right' },
            3: { cellWidth: 25, halign: 'right' }
          },
          didParseCell: function(data) {
            // Resaltar fila de totales
            if (data.row.index === datosAreas.length - 1) {
              data.cell.styles.fillColor = [220, 220, 220];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        });
      }

      // Footer en todas las páginas
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(128, 128, 128);
        
        // Línea superior del footer
        doc.setDrawColor(200, 200, 200);
        doc.line(14, doc.internal.pageSize.height - 15, 196, doc.internal.pageSize.height - 15);
        
        doc.text(
          `Página ${i} de ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        
        doc.text(
          'Restaurante Chicooj - Sistema de Gestión',
          14,
          doc.internal.pageSize.height - 10
        );
      }

      // Descargar
      const fecha = new Date().toISOString().split('T')[0];
      doc.save(`Reporte_Detallado_Chicoj_${fecha}.pdf`);
      
      console.log('✅ PDF detallado generado exitosamente');
      alert('✅ Reporte PDF con registros detallados descargado');

    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    }
  }

  // Descargar gráfica individual
  function descargarGrafica(canvasId, nombreArchivo) {
    try {
      const canvas = $(canvasId);
      if (!canvas) {
        console.error('❌ Canvas no encontrado:', canvasId);
        alert('No se pudo descargar la gráfica');
        return;
      }

      // Convertir a blob y descargar
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fecha = new Date().toISOString().split('T')[0];
        a.download = `${nombreArchivo}_${fecha}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Gráfica descargada:', nombreArchivo);
      });
    } catch (error) {
      console.error('❌ Error al descargar gráfica:', error);
      alert('Error al descargar la gráfica');
    }
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

