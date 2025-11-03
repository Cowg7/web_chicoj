// Script para listar y filtrar tours (tour-control.html)

(() => {
  // Elementos del DOM
  const $ = (id) => document.getElementById(id);
  
  const tablaBody = $('tabla-tickets')?.querySelector('tbody');
  const btnEditar = $('btn-editar');
  const btnDescargarPDF = $('btn-descargar-pdf');
  const btnDescargarExcel = $('btn-descargar-excel');
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
  
  // Paginación
  let currentPage = 1;
  let itemsPerPage = 20;
  let totalPages = 0;

  // Inicializar
  async function init() {
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login';
      return;
    }

    // Configurar fechas por defecto (último mes)
    const hoy = new Date();
    const haceMes = new Date();
    haceMes.setMonth(haceMes.getMonth() - 1);
    const hoyStr = hoy.toISOString().split('T')[0];
    
    if (filtros.fechaDesde) {
      filtros.fechaDesde.value = haceMes.toISOString().split('T')[0];
      filtros.fechaDesde.max = hoyStr; // No permitir fechas futuras
    }
    if (filtros.fechaHasta) {
      filtros.fechaHasta.value = hoyStr;
      filtros.fechaHasta.max = hoyStr; // No permitir fechas futuras
    }
    
    console.log('📅 Fechas de filtro limitadas hasta:', hoyStr);

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

  // Mostrar tours en la tabla con paginación
  function displayTours() {
    console.log('🎨 displayTours() llamado');
    console.log('📍 tablaBody existe:', !!tablaBody);
    console.log('📊 Tours a mostrar:', filteredTours.length);
    console.log('📄 Página actual:', currentPage);

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
      hidePagination();
      return;
    }

    // Calcular paginación
    totalPages = Math.ceil(filteredTours.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredTours.length);
    const toursToShow = filteredTours.slice(startIndex, endIndex);

    console.log(`📋 Renderizando tours ${startIndex + 1}-${endIndex} de ${filteredTours.length}...`);
    
    toursToShow.forEach((tour, index) => {
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

    console.log(`✅ ${toursToShow.length} tours mostrados (página ${currentPage} de ${totalPages})`);
    
    // Actualizar controles de paginación
    updatePaginationControls();
  }
  
  // Actualizar controles de paginación
  function updatePaginationControls() {
    const paginationContainer = $('pagination-container');
    const paginationInfo = $('pagination-info');
    const pageNumbers = $('page-numbers');
    const btnFirst = $('btn-first-page');
    const btnPrev = $('btn-prev-page');
    const btnNext = $('btn-next-page');
    const btnLast = $('btn-last-page');
    
    if (!paginationContainer) return;
    
    // Mostrar contenedor de paginación
    paginationContainer.style.display = filteredTours.length > itemsPerPage ? 'flex' : 'none';
    
    if (filteredTours.length <= itemsPerPage) return;
    
    // Actualizar información
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredTours.length);
    
    if (paginationInfo) {
      paginationInfo.textContent = `Mostrando ${startIndex}-${endIndex} de ${filteredTours.length} registros`;
    }
    
    // Habilitar/deshabilitar botones
    if (btnFirst) btnFirst.disabled = currentPage === 1;
    if (btnPrev) btnPrev.disabled = currentPage === 1;
    if (btnNext) btnNext.disabled = currentPage === totalPages;
    if (btnLast) btnLast.disabled = currentPage === totalPages;
    
    // Generar números de página
    if (pageNumbers) {
      pageNumbers.innerHTML = '';
      
      // Lógica para mostrar números de página
      // Siempre mostrar: primera, última, actual, ±2 de la actual
      const pagesToShow = new Set();
      
      // Primera página
      pagesToShow.add(1);
      
      // Páginas alrededor de la actual
      for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        pagesToShow.add(i);
      }
      
      // Última página
      if (totalPages > 1) {
        pagesToShow.add(totalPages);
      }
      
      // Convertir a array y ordenar
      const pagesArray = Array.from(pagesToShow).sort((a, b) => a - b);
      
      // Renderizar con elipsis
      pagesArray.forEach((pageNum, index) => {
        // Agregar elipsis si hay salto
        if (index > 0 && pageNum > pagesArray[index - 1] + 1) {
          const ellipsis = document.createElement('span');
          ellipsis.className = 'page-ellipsis';
          ellipsis.textContent = '...';
          pageNumbers.appendChild(ellipsis);
        }
        
        const pageBtn = document.createElement('button');
        pageBtn.type = 'button';
        pageBtn.className = 'page-number';
        pageBtn.textContent = pageNum;
        
        if (pageNum === currentPage) {
          pageBtn.classList.add('active');
        }
        
        pageBtn.addEventListener('click', () => goToPage(pageNum));
        pageNumbers.appendChild(pageBtn);
      });
    }
  }
  
  // Ir a una página específica
  function goToPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    currentPage = page;
    displayTours();
    
    // Scroll suave hacia arriba de la tabla
    const tabla = document.querySelector('.tabla-orden');
    if (tabla) {
      tabla.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  // Ocultar paginación
  function hidePagination() {
    const paginationContainer = $('pagination-container');
    if (paginationContainer) {
      paginationContainer.style.display = 'none';
    }
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

    // Botones de descarga
    if (btnDescargarPDF) {
      btnDescargarPDF.addEventListener('click', descargarPDF);
    }

    if (btnDescargarExcel) {
      btnDescargarExcel.addEventListener('click', descargarExcel);
    }

    // Botón aplicar filtros
    if (btnAplicar) {
      btnAplicar.addEventListener('click', applyFilters);
    }

    // Botón limpiar filtros
    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', clearFilters);
    }
    
    // Botones de paginación
    const btnFirst = $('btn-first-page');
    const btnPrev = $('btn-prev-page');
    const btnNext = $('btn-next-page');
    const btnLast = $('btn-last-page');
    
    if (btnFirst) {
      btnFirst.addEventListener('click', () => goToPage(1));
    }
    if (btnPrev) {
      btnPrev.addEventListener('click', () => goToPage(currentPage - 1));
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => goToPage(currentPage + 1));
    }
    if (btnLast) {
      btnLast.addEventListener('click', () => goToPage(totalPages));
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

    const url = `/templates/tour/tour?id=${selectedTourId}`;
    console.log('✅ Redirigiendo a:', url);
    window.location.href = url;
  }

  // Aplicar filtros
  function applyFilters() {
    console.log('🔍 Aplicando filtros...');
    
    // Resetear a la primera página
    currentPage = 1;
    
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
    // Resetear a la primera página
    currentPage = 1;
    
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

  // ========== FUNCIONES DE DESCARGA ==========

  // Descargar PDF
  function descargarPDF() {
    try {
      if (filteredTours.length === 0) {
        showNotification('No hay registros para descargar', 'warning');
        return;
      }

      // Usar jsPDF desde el CDN
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('l', 'mm', 'a4'); // landscape, milímetros, tamaño A4

      // Título
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Reporte de Tours - Restaurante Chicooj', 14, 15);

      // Información de filtros
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      let y = 25;
      
      if (filtros.fechaDesde?.value || filtros.fechaHasta?.value) {
        const desde = filtros.fechaDesde?.value || 'N/A';
        const hasta = filtros.fechaHasta?.value || 'N/A';
        doc.text(`Período: ${desde} a ${hasta}`, 14, y);
        y += 5;
      }

      if (filtros.servicio?.value) {
        doc.text(`Servicio: ${filtros.servicio.value}`, 14, y);
        y += 5;
      }

      if (filtros.tipo?.value) {
        doc.text(`Tipo visitante: ${filtros.tipo.value}`, 14, y);
        y += 5;
      }

      doc.text(`Total de registros: ${filteredTours.length}`, 14, y);
      y += 5;

      // Calcular total general
      const totalGeneral = filteredTours.reduce((sum, tour) => {
        return sum + (parseFloat(tour.precio_servicio) * tour.cantidad_visitante);
      }, 0);

      doc.setFont(undefined, 'bold');
      doc.text(`Total General: Q${totalGeneral.toFixed(2)}`, 14, y);
      y += 8;

      // Preparar datos para la tabla
      const headers = [
        ['ID', 'Fecha', 'Servicio', 'Precio', 'Tipo', 'Cant.', 'Idioma', 'Observaciones', 'Total']
      ];

      const data = filteredTours.map(tour => [
        tour.id_tour,
        new Date(tour.fecha).toLocaleDateString('es-GT'),
        tour.nombre_servicio,
        `Q${parseFloat(tour.precio_servicio).toFixed(2)}`,
        tour.tipo_visitante,
        tour.cantidad_visitante,
        tour.idioma || '—',
        (tour.observaciones || '—').substring(0, 30), // Limitar longitud
        `Q${(parseFloat(tour.precio_servicio) * tour.cantidad_visitante).toFixed(2)}`
      ]);

      // Generar tabla
      doc.autoTable({
        startY: y,
        head: headers,
        body: data,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [74, 144, 226], // Color azul
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 12 },  // ID
          1: { cellWidth: 22 },  // Fecha
          2: { cellWidth: 45 },  // Servicio
          3: { cellWidth: 20 },  // Precio
          4: { cellWidth: 25 },  // Tipo
          5: { cellWidth: 15 },  // Cantidad
          6: { cellWidth: 20 },  // Idioma
          7: { cellWidth: 50 },  // Observaciones
          8: { cellWidth: 25 }   // Total
        }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(
          `Página ${i} de ${pageCount} - Generado: ${new Date().toLocaleString('es-GT')}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }

      // Descargar
      const fecha = new Date().toISOString().split('T')[0];
      doc.save(`Tours_Chicooj_${fecha}.pdf`);
      
      showNotification('PDF descargado exitosamente', 'success');
      console.log('✅ PDF generado con', filteredTours.length, 'registros');

    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      showNotification('Error al generar PDF', 'error');
    }
  }

  // Descargar Excel
  function descargarExcel() {
    try {
      if (filteredTours.length === 0) {
        showNotification('No hay registros para descargar', 'warning');
        return;
      }

      // Preparar datos para Excel
      const datosExcel = filteredTours.map(tour => {
        const precioServicio = parseFloat(tour.precio_servicio);
        const precioTotal = precioServicio * tour.cantidad_visitante;
        
        return {
          'ID': tour.id_tour,
          'Fecha': new Date(tour.fecha).toLocaleDateString('es-GT'),
          'Servicio': tour.nombre_servicio,
          'Precio Servicio': precioServicio,
          'Tipo Visitante': tour.tipo_visitante,
          'Cantidad Visitantes': tour.cantidad_visitante,
          'Idioma': tour.idioma || '—',
          'Observaciones': tour.observaciones || '—',
          'Precio Total': precioTotal
        };
      });

      // Agregar fila de totales
      const totalGeneral = filteredTours.reduce((sum, tour) => {
        return sum + (parseFloat(tour.precio_servicio) * tour.cantidad_visitante);
      }, 0);

      const totalVisitantes = filteredTours.reduce((sum, tour) => {
        return sum + tour.cantidad_visitante;
      }, 0);

      datosExcel.push({});  // Fila vacía
      datosExcel.push({
        'ID': '',
        'Fecha': '',
        'Servicio': '',
        'Precio Servicio': 'TOTALES:',
        'Tipo Visitante': '',
        'Cantidad Visitantes': totalVisitantes,
        'Idioma': '',
        'Observaciones': '',
        'Precio Total': totalGeneral
      });

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(datosExcel);

      // Ajustar ancho de columnas
      ws['!cols'] = [
        { wch: 8 },   // ID
        { wch: 12 },  // Fecha
        { wch: 25 },  // Servicio
        { wch: 15 },  // Precio Servicio
        { wch: 15 },  // Tipo Visitante
        { wch: 18 },  // Cantidad Visitantes
        { wch: 12 },  // Idioma
        { wch: 40 },  // Observaciones
        { wch: 15 }   // Precio Total
      ];

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Tours');

      // Agregar información de filtros en otra hoja
      const infoFiltros = [];
      if (filtros.fechaDesde?.value || filtros.fechaHasta?.value) {
        infoFiltros.push({
          'Filtro': 'Período',
          'Valor': `${filtros.fechaDesde?.value || 'N/A'} a ${filtros.fechaHasta?.value || 'N/A'}`
        });
      }
      if (filtros.servicio?.value) {
        infoFiltros.push({
          'Filtro': 'Servicio',
          'Valor': filtros.servicio.value
        });
      }
      if (filtros.tipo?.value) {
        infoFiltros.push({
          'Filtro': 'Tipo visitante',
          'Valor': filtros.tipo.value
        });
      }
      infoFiltros.push({
        'Filtro': 'Total registros',
        'Valor': filteredTours.length
      });
      infoFiltros.push({
        'Filtro': 'Fecha generación',
        'Valor': new Date().toLocaleString('es-GT')
      });

      const wsInfo = XLSX.utils.json_to_sheet(infoFiltros);
      wsInfo['!cols'] = [{ wch: 20 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, wsInfo, 'Información');

      // Descargar
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Tours_Chicooj_${fecha}.xlsx`);
      
      showNotification('Excel descargado exitosamente', 'success');
      console.log('✅ Excel generado con', filteredTours.length, 'registros');

    } catch (error) {
      console.error('❌ Error al generar Excel:', error);
      showNotification('Error al generar Excel', 'error');
    }
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
