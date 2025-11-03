// Script para visualizar órdenes (comanda-control.html)

(() => {
  // Elementos del DOM
  const $ = (id) => document.getElementById(id);
  
  const ordenId = $('orden-id');
  const ordenMesa = $('orden-mesa');
  const ordenFecha = $('orden-fecha');
  const ordenTotal = $('orden-total');
  const pos = $('pos');
  const tot = $('tot');
  const btnPrev = $('prev');
  const btnNext = $('next');
  const btnNuevaOrden = $('btn-nueva-orden');
  const btnEditarOrden = $('btn-editar-orden');
  const btnEnviarCocina = $('btn-enviar-cocina');
  const btnEliminarOrden = $('btn-eliminar-orden');
  const btnCerrarCuenta = $('btn-cerrar-cuenta');
  const tablaBody = document.querySelector('.tabla-orden tbody');
  const filtroOrdenes = $('filtro-ordenes');

  // Estado
  let orders = [];
  let allOrders = []; // Guardar todas las órdenes
  let currentIndex = 0;
  let refreshInterval = null; // Guardar referencia del intervalo
  let isLoading = false; // Evitar peticiones simultáneas
  let currentUserId = null; // ID del usuario actual

  // Inicializar
  async function init() {
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login';
      return;
    }

    // Obtener usuario actual
    const user = AuthManager.getUser();
    currentUserId = user?.id || user?.id_usuario || user?.userId;
    
    console.log('👤 Usuario actual:', user);
    console.log('🔑 User ID:', currentUserId);

    // Cargar preferencia de filtro desde localStorage
    const filtroGuardado = localStorage.getItem('filtro-ordenes') || 'mis-ordenes';
    
    // Si es admin o gerente, mostrar "todas" por defecto
    const rolUsuario = user?.rol || user?.role || '';
    const esAdminOGerente = ['Administrador', 'Gerente', 'Admin'].includes(rolUsuario);
    
    if (filtroOrdenes) {
      if (esAdminOGerente && !localStorage.getItem('filtro-ordenes')) {
        filtroOrdenes.value = 'todas';
      } else {
        filtroOrdenes.value = filtroGuardado;
      }
      
      console.log(`📋 Filtro inicial: ${filtroOrdenes.value} ${esAdminOGerente ? '(Admin/Gerente)' : ''}`);
    }

    // Verificar si viene de crear/editar (parámetro refresh en URL)
    const urlParams = new URLSearchParams(window.location.search);
    const shouldRefresh = urlParams.get('refresh');
    
    if (shouldRefresh) {
      console.log('🔄 Recarga forzada detectada desde creación/edición de orden');
      // Limpiar el parámetro de la URL sin recargar la página
      window.history.replaceState({}, '', '/templates/mesero/comanda-control');
    }

    // Cargar órdenes
    await loadOrders();

    // Event listeners
    setupEventListeners();

    // Mostrar primera orden
    if (orders.length > 0) {
      displayOrder(0);
    }

    // ⚠️ IMPORTANTE: Limpiar intervalo previo antes de crear uno nuevo
    if (refreshInterval) {
      clearInterval(refreshInterval);
      console.log('🧹 Intervalo anterior limpiado');
    }

    // Auto-refresh cada 30 segundos para ver cambios de estado
    refreshInterval = setInterval(async () => {
      console.log('🔄 Auto-refresh de órdenes...');
      await loadOrders();
      // Mantener la orden actual visible si existe
      if (orders.length > 0 && currentIndex < orders.length) {
        displayOrder(currentIndex);
      } else if (orders.length > 0) {
        currentIndex = 0;
        displayOrder(0);
      }
    }, 30000); // 30 segundos (30000 ms)

    console.log('✅ Auto-refresh configurado cada 30 segundos');
  }

  // Limpiar intervalo cuando se abandona la página
  window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      console.log('🧹 Intervalo limpiado al salir');
    }
  });

  // Limpiar intervalo al cambiar de visibilidad
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
      refreshInterval = setInterval(async () => {
        console.log('🔄 Auto-refresh de órdenes...');
        await loadOrders();
        if (orders.length > 0 && currentIndex < orders.length) {
          displayOrder(currentIndex);
        } else if (orders.length > 0) {
          currentIndex = 0;
          displayOrder(0);
        }
      }, 30000); // 30 segundos
      console.log('▶️ Auto-refresh reanudado (cada 30 segundos)');
      loadOrders().then(() => {
        if (orders.length > 0 && currentIndex < orders.length) {
          displayOrder(currentIndex);
        }
      });
    }
  });

  // Cargar órdenes
  async function loadOrders() {
    // Evitar peticiones simultáneas
    if (isLoading) {
      console.log('⏳ Ya hay una carga en proceso, saltando...');
      return;
    }

    try {
      isLoading = true;
      // Cargar órdenes normales y preparadas
      const [responseNormal, responseReady] = await Promise.all([
        API.orders.getAll(),
        API.orders.getReady().catch(() => ({ data: { orders: [] } }))
      ]);
      
      const dataNormal = responseNormal.data || responseNormal;
      const dataReady = responseReady.data || responseReady;
      
      const ordenesNormales = dataNormal.orders || dataNormal || [];
      const ordenesPreparadas = dataReady.orders || dataReady || [];
      
      // Combinar todas las órdenes
      const todasOrdenes = [...ordenesNormales, ...ordenesPreparadas];
      
      // Filtrar solo órdenes activas (excluir "En Caja" y "Finalizada")
      allOrders = todasOrdenes
        .filter(orden => {
          const estado = orden.estado || 'Pendiente';
          return estado !== 'En Caja' && estado !== 'Finalizada';
        })
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      // Aplicar filtro de usuario
      const filtroSeleccionado = filtroOrdenes?.value || 'mis-ordenes';
      applyFilter(filtroSeleccionado);

      console.log('📊 Órdenes totales:', allOrders.length, '| Mostrando:', orders.length, `(${filtroSeleccionado})`);

      if (tot) {
        tot.textContent = orders.length;
      }

      if (orders.length === 0) {
        // Limpiar encabezado
        if (ordenId) ordenId.innerHTML = 'No. Orden: <strong>-</strong>';
        if (ordenMesa) ordenMesa.innerHTML = 'Mesa: <strong>-</strong>';
        if (ordenFecha) ordenFecha.innerHTML = 'Fecha: <strong>-</strong>';
        if (ordenTotal) ordenTotal.innerHTML = 'Total: <strong>Q 0.00</strong>';
        if (pos) pos.textContent = '0';
        
        // Solo mostrar mensaje en la tabla, sin notificación
        if (tablaBody) {
          tablaBody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align: center; padding: 20px; color: #999;">
                No hay órdenes activas
              </td>
            </tr>
          `;
        }
        
        // Ocultar todos los botones de acción
        if (btnEditarOrden) btnEditarOrden.style.display = 'none';
        if (btnEnviarCocina) btnEnviarCocina.style.display = 'none';
        if (btnEliminarOrden) btnEliminarOrden.style.display = 'none';
        if (btnCerrarCuenta) btnCerrarCuenta.style.display = 'none';
      }
    } catch (error) {
      handleError(error, 'Error al cargar órdenes');
    } finally {
      // Siempre liberar el flag de carga
      isLoading = false;
    }
  }

  // Aplicar filtro de órdenes
  function applyFilter(filtro) {
    if (filtro === 'mis-ordenes') {
      // Filtrar solo órdenes del usuario actual
      orders = allOrders.filter(orden => {
        const ordenUserId = orden.id_usuario || orden.usuario?.id_usuario || orden.usuario_id;
        return ordenUserId === currentUserId;
      });
      console.log(`👤 Mostrando mis órdenes (User ID: ${currentUserId}):`, orders.length);
    } else {
      // Mostrar todas las órdenes
      orders = [...allOrders];
      console.log('👥 Mostrando todas las órdenes:', orders.length);
    }
    
    // Guardar preferencia
    if (filtroOrdenes) {
      localStorage.setItem('filtro-ordenes', filtro);
    }
    
    // Actualizar contador
    if (tot) {
      tot.textContent = orders.length;
    }
    
    // Ajustar índice actual si está fuera de rango
    if (currentIndex >= orders.length) {
      currentIndex = Math.max(0, orders.length - 1);
    }
    
    // Limpiar encabezado si no hay órdenes después de filtrar
    if (orders.length === 0) {
      if (ordenId) ordenId.innerHTML = 'No. Orden: <strong>-</strong>';
      if (ordenMesa) ordenMesa.innerHTML = 'Mesa: <strong>-</strong>';
      if (ordenFecha) ordenFecha.innerHTML = 'Fecha: <strong>-</strong>';
      if (ordenTotal) ordenTotal.innerHTML = 'Total: <strong>Q 0.00</strong>';
      if (pos) pos.textContent = '0';
      
      if (tablaBody) {
        tablaBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 20px; color: #999;">
              No hay órdenes activas
            </td>
          </tr>
        `;
      }
      
      // Ocultar botones de acción
      if (btnEditarOrden) btnEditarOrden.style.display = 'none';
      if (btnEnviarCocina) btnEnviarCocina.style.display = 'none';
      if (btnEliminarOrden) btnEliminarOrden.style.display = 'none';
      if (btnCerrarCuenta) btnCerrarCuenta.style.display = 'none';
    }
  }

  // Configurar event listeners
  function setupEventListeners() {
    if (btnPrev) {
      btnPrev.addEventListener('click', showPrevious);
    }

    if (btnNext) {
      btnNext.addEventListener('click', showNext);
    }

    // Event listener para el filtro de órdenes
    if (filtroOrdenes) {
      filtroOrdenes.addEventListener('change', (e) => {
        const nuevoFiltro = e.target.value;
        console.log(`🔄 Cambiando filtro a: ${nuevoFiltro}`);
        
        // Aplicar el nuevo filtro
        applyFilter(nuevoFiltro);
        
        // Mostrar primera orden del nuevo filtro
        if (orders.length > 0) {
          currentIndex = 0;
          displayOrder(0);
        } else {
          // Solo actualizar la vista, sin mostrar notificación
          if (tablaBody) {
            tablaBody.innerHTML = `
              <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #999;">
                  No hay órdenes activas
                </td>
              </tr>
            `;
          }
        }
      });
    }

    // Teclas de navegación
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') showPrevious();
      if (e.key === 'ArrowRight') showNext();
    });
  }

  // Mostrar orden anterior
  function showPrevious() {
    if (currentIndex > 0) {
      currentIndex--;
      displayOrder(currentIndex);
    }
  }

  // Mostrar orden siguiente
  function showNext() {
    if (currentIndex < orders.length - 1) {
      currentIndex++;
      displayOrder(currentIndex);
    }
  }

  // Mostrar orden
  async function displayOrder(index) {
    if (!orders[index]) return;

    const order = orders[index];

    // Cargar detalles completos de la orden
    let orderDetails = order;
    
    // Si no tenemos los items o comandas, cargar la orden completa
    if (!order.comandas && !order.items) {
      try {
        const orderId = order.id_orden || order.id;
        const response = await API.orders.getById(orderId);
        const data = response.data || response;
        orderDetails = data.order || data.orden || data;
      } catch (error) {
        handleError(error, 'Error al cargar detalles de la orden');
        return;
      }
    }

    // Actualizar información de cabecera
    const orderId = orderDetails.id_orden || orderDetails.id;
    // Formatear número de orden con padding (00001, 00002, etc.)
    const orderNumberFormatted = String(orderId).padStart(5, '0');
    const estado = orderDetails.estado || 'Pendiente';
    
    // Color según el estado
    let estadoColor = '#666';
    if (estado === 'Pendiente') estadoColor = '#FF9800';
    else if (estado === 'En Preparación') estadoColor = '#2196F3';
    else if (estado === 'Preparado') estadoColor = '#4CAF50';
    else if (estado === 'Finalizado') estadoColor = '#9E9E9E';
    
    if (ordenId) {
      ordenId.innerHTML = `No. Orden: <strong>${orderNumberFormatted}</strong> 
        <span style="color: ${estadoColor}; font-size: 0.9em;">(${estado})</span>`;
    }

    if (ordenFecha) {
      const fecha = new Date(orderDetails.fecha_creacion || orderDetails.createdAt || orderDetails.fecha);
      ordenFecha.innerHTML = `Fecha: <strong>${fecha.toLocaleDateString('es-GT')}</strong>`;
    }

    // Mostrar número de mesa
    if (ordenMesa) {
      const mesa = orderDetails.no_mesa || 'S/N';
      ordenMesa.innerHTML = `Mesa: <strong>${mesa}</strong>`;
    }

    // Calcular total de la orden
    const comandas = orderDetails.comandas || orderDetails.items || [];
    const total = comandas.reduce((sum, comanda) => {
      const subtotal = (comanda.precio_unitario || comanda.precio || 0) * (comanda.cantidad || 0);
      const extraPrecio = parseFloat(comanda.extra_precio || 0);
      return sum + subtotal + extraPrecio;
    }, 0);

    if (ordenTotal) {
      ordenTotal.innerHTML = `Total: <strong>Q ${total.toFixed(2)}</strong>`;
    }

    if (pos) {
      pos.textContent = index + 1;
    }

    // Actualizar tabla
    displayOrderItems(orderDetails);

    // Habilitar/deshabilitar botones de navegación
    if (btnPrev) {
      btnPrev.disabled = index === 0;
    }

    if (btnNext) {
      btnNext.disabled = index === orders.length - 1;
    }

    // Configurar botones según el estado
    if (btnEditarOrden && btnEnviarCocina && btnEliminarOrden && btnCerrarCuenta) {
      if (estado === 'Preparada') {
        // Orden preparada: ocultar editar y enviar, mostrar cerrar cuenta
        btnEditarOrden.style.display = 'none';
        btnEnviarCocina.style.display = 'none';
        btnEliminarOrden.style.display = 'none';
        btnCerrarCuenta.style.display = 'inline-block';
        btnCerrarCuenta.onclick = () => handleCerrarCuenta(orderId);
      } else if (estado === 'Pendiente') {
        // Orden pendiente: mostrar editar, enviar a cocina y eliminar
        btnEditarOrden.style.display = 'inline-block';
        btnEditarOrden.href = `/templates/mesero/mesero_comanda?edit=${orderId}`;
        btnEnviarCocina.style.display = 'inline-block';
        btnEnviarCocina.onclick = () => handleEnviarCocina(orderId);
        btnEliminarOrden.style.display = 'inline-block';
        btnEliminarOrden.onclick = () => handleEliminarOrden(orderId);
        btnCerrarCuenta.style.display = 'none';
      } else if (estado === 'En Preparación') {
        // Orden en preparación: mostrar editar y eliminar (ya está en cocina)
        btnEditarOrden.style.display = 'inline-block';
        btnEditarOrden.href = `/templates/mesero/mesero_comanda?edit=${orderId}`;
        btnEnviarCocina.style.display = 'none';
        btnEliminarOrden.style.display = 'inline-block';
        btnEliminarOrden.onclick = () => handleEliminarOrden(orderId);
        btnCerrarCuenta.style.display = 'none';
      } else {
        // Otros estados: ocultar todos
        btnEditarOrden.style.display = 'none';
        btnEnviarCocina.style.display = 'none';
        btnEliminarOrden.style.display = 'none';
        btnCerrarCuenta.style.display = 'none';
      }
    }
  }

  // Enviar orden a cocina
  async function handleEnviarCocina(orderId) {
    const confirmed = confirm('¿Enviar esta orden a cocina? Los platillos aparecerán en el KDS.');
    
    if (!confirmed) return;

    try {
      showNotification('Enviando orden a cocina...', 'info');
      
      await API.orders.sendToKDS(orderId);
      
      showNotification('Orden enviada a cocina exitosamente', 'success');
      
      // Recargar órdenes para actualizar el estado
      await loadOrders();
      
      // Mostrar la orden actualizada
      if (orders.length > 0 && currentIndex < orders.length) {
        displayOrder(currentIndex);
      }
    } catch (error) {
      handleError(error, 'Error al enviar orden a cocina');
    }
  }

  // Eliminar orden completa
  async function handleEliminarOrden(orderId) {
    const confirmed = confirm('⚠️ ¿Eliminar esta orden completa?\n\nEsta acción NO se puede deshacer.\n\n- Se eliminarán todos los platillos\n- Se eliminarán los tickets del KDS\n- La orden no se podrá recuperar\n\n¿Estás seguro?');
    
    if (!confirmed) return;

    try {
      showNotification('Eliminando orden...', 'info');
      
      await API.orders.cancel(orderId);
      
      showNotification('Orden eliminada exitosamente', 'success');
      
      // Recargar órdenes
      await loadOrders();
      
      // Mostrar la siguiente orden o la primera
      if (orders.length > 0) {
        // Si eliminamos la última, mostrar la nueva última
        if (currentIndex >= orders.length) {
          currentIndex = orders.length - 1;
        }
        displayOrder(currentIndex);
      } else {
        // Solo actualizar la vista sin notificación
        if (tablaBody) {
          tablaBody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align: center; padding: 20px; color: #999;">
                No hay órdenes activas
              </td>
            </tr>
          `;
        }
      }
    } catch (error) {
      handleError(error, 'Error al eliminar orden');
    }
  }

  // Cerrar cuenta (enviar orden a caja)
  async function handleCerrarCuenta(orderId) {
    const confirmed = confirm('¿El cliente pidió la cuenta? Esto enviará la orden a caja para su cobro.');
    
    if (!confirmed) return;

    try {
      console.log(`💰 Cerrando cuenta de orden ${orderId}`);
      await API.orders.close(orderId);
      
      showNotification('Cuenta cerrada. La orden se envió a caja.', 'success');
      
      // Recargar órdenes
      await loadOrders();
      
      // Mostrar la siguiente orden o la primera
      if (currentIndex >= orders.length) {
        currentIndex = Math.max(0, orders.length - 1);
      }
      if (orders.length > 0) {
        displayOrder(currentIndex);
      }
    } catch (error) {
      handleError(error, 'Error al cerrar la cuenta');
    }
  }

  // Mostrar items de la orden en la tabla
  function displayOrderItems(order) {
    if (!tablaBody) return;

    tablaBody.innerHTML = '';

    // Obtener comandas (items) de la orden
    const comandas = order.comandas || order.items || order.OrderItem || [];

    if (comandas.length === 0) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 20px;">
            No hay items en esta orden
          </td>
        </tr>
      `;
      return;
    }

    comandas.forEach(comanda => {
      // Obtener datos del platillo
      const platillo = comanda.platillo || comanda.Platillo || {};
      const nombrePlatillo = comanda.platillo_nombre || platillo.nombre || 'N/A';
      const precio = parseFloat(comanda.precio_unitario || comanda.precio || 0);
      const cantidad = parseInt(comanda.cantidad || 0);
      const observaciones = comanda.observaciones || '—';
      const extraObservacion = comanda.extra_observacion || '—';
      const extraPrecio = parseFloat(comanda.extra_precio || 0);
      
      // Calcular subtotal
      const subtotal = (precio * cantidad) + extraPrecio;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${cantidad}</td>
        <td>${nombrePlatillo}</td>
        <td>${observaciones}</td>
        <td>Q ${precio.toFixed(2)}</td>
        <td>${extraObservacion}</td>
        <td>Q ${extraPrecio.toFixed(2)}</td>
        <td>Q ${subtotal.toFixed(2)}</td>
      `;

      tablaBody.appendChild(row);
    });
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

