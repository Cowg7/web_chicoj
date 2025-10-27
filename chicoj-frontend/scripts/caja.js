// Script para vista de Caja
(() => {
  // Elementos del DOM
  const $ = (id) => document.getElementById(id);
  
  // Stats
  const statVentasDia = $('stat-ventas-dia');
  const statOrdenesDia = $('stat-ordenes-dia');
  const statPendientes = $('stat-pendientes');
  
  // Tablas
  const tablaPendientes = $('tabla-pendientes');
  const tablaHistorial = $('tabla-historial');
  
  // Modal
  const modalPago = $('modal-pago');
  const formPago = $('form-pago');
  const btnCancelarPago = $('btn-cancelar-pago');
  const closeModal = document.querySelector('.close');
  
  // Form fields
  const modalOrdenNumero = $('modal-orden-numero');
  const modalOrdenMesa = $('modal-orden-mesa');
  const modalOrdenTotal = $('modal-orden-total');
  const ordenIdInput = $('orden-id');
  const metodoPagoSelect = $('metodo_pago');
  const montoRecibidoInput = $('monto_recibido');
  const cambioDevueltoInput = $('cambio_devuelto');
  
  // Estado
  let currentOrder = null;
  let refreshInterval = null; // Guardar referencia del intervalo
  let isLoading = false; // Evitar peticiones simultáneas

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

    // Configurar event listeners
    setupEventListeners();

    // Cargar datos iniciales
    await loadStats();
    await loadPendingOrders();
    await loadHistorial();

    // ⚠️ IMPORTANTE: Limpiar intervalo previo antes de crear uno nuevo
    if (refreshInterval) {
      clearInterval(refreshInterval);
      console.log('🧹 Intervalo de caja anterior limpiado');
    }

    // Auto-refresh cada 20 segundos (optimizado para múltiples usuarios)
    refreshInterval = setInterval(async () => {
      console.log('🔄 Auto-refresh de caja...');
      await loadStats();
      await loadPendingOrders();
    }, 20000); // 20 segundos para soportar 3+ meseros simultáneos

    console.log('✅ Auto-refresh de caja configurado cada 20 segundos');
  }

  // Limpiar intervalo cuando se abandona la página
  window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      console.log('🧹 Intervalo de caja limpiado al salir');
    }
  });

  // Limpiar intervalo al cambiar de visibilidad
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        console.log('⏸️ Auto-refresh de caja pausado (pestaña oculta)');
      }
    } else {
      // Reanudar cuando vuelve a ser visible
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      refreshInterval = setInterval(async () => {
        console.log('🔄 Auto-refresh de caja...');
        await loadStats();
        await loadPendingOrders();
      }, 20000);
      console.log('▶️ Auto-refresh de caja reanudado');
      loadStats();
      loadPendingOrders();
    }
  });

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

    // Tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        switchTab(targetTab);
      });
    });

    // Modal
    if (closeModal) {
      closeModal.addEventListener('click', closePaymentModal);
    }
    if (btnCancelarPago) {
      btnCancelarPago.addEventListener('click', closePaymentModal);
    }
    if (modalPago) {
      modalPago.addEventListener('click', (e) => {
        if (e.target === modalPago) {
          closePaymentModal();
        }
      });
    }

    // Form
    if (formPago) {
      formPago.addEventListener('submit', handleSubmitPayment);
    }

    // Calcular cambio automáticamente
    if (montoRecibidoInput) {
      montoRecibidoInput.addEventListener('input', calculateChange);
    }
  }

  // Cambiar tab
  function switchTab(tabName) {
    // Actualizar botones
    document.querySelectorAll('.tab').forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    const targetContent = $(`tab-${tabName}`);
    if (targetContent) {
      targetContent.classList.add('active');
    }

    // Recargar datos si es historial
    if (tabName === 'historial') {
      loadHistorial();
    }
  }

  // Cargar estadísticas
  async function loadStats() {
    try {
      const response = await API.cashier.getStats();
      const data = response.data || response;

      if (statVentasDia) {
        statVentasDia.textContent = `Q ${parseFloat(data.total_ventas_hoy || 0).toFixed(2)}`;
      }
      if (statOrdenesDia) {
        statOrdenesDia.textContent = data.ordenes_finalizadas_hoy || 0;
      }
      if (statPendientes) {
        statPendientes.textContent = data.ordenes_en_caja || 0;
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }

  // Cargar órdenes pendientes
  async function loadPendingOrders() {
    // Evitar peticiones simultáneas
    if (isLoading) {
      console.log('⏳ Ya hay una carga en proceso, saltando loadPendingOrders...');
      return;
    }

    try {
      isLoading = true;
      const response = await API.cashier.getPending();
      const data = response.data || response;
      const orders = data.orders || data || [];

      if (!tablaPendientes) return;

      if (orders.length === 0) {
        tablaPendientes.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 2rem; color: #999;">
              No hay órdenes pendientes de pago
            </td>
          </tr>
        `;
        return;
      }

      tablaPendientes.innerHTML = orders.map(order => {
        const orderNum = String(order.id_orden).padStart(5, '0');
        const fecha = new Date(order.fecha).toLocaleString('es-GT');
        const total = parseFloat(order.total || 0).toFixed(2);

        return `
          <tr>
            <td><strong>${orderNum}</strong></td>
            <td>Mesa ${order.no_mesa}</td>
            <td>${fecha}</td>
            <td><strong>Q ${total}</strong></td>
            <td>
              <button class="btn-finalizar" onclick="window.cajaApp.openPaymentModal(${order.id_orden}, '${orderNum}', ${order.no_mesa}, ${order.total})">
                💳 Cobrar
              </button>
            </td>
          </tr>
        `;
      }).join('');
    } catch (error) {
      console.error('Error al cargar órdenes pendientes:', error);
      if (tablaPendientes) {
        tablaPendientes.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 2rem; color: #f44336;">
              Error al cargar órdenes: ${error.message}
            </td>
          </tr>
        `;
      }
    } finally {
      // Siempre liberar el flag de carga
      isLoading = false;
    }
  }

  // Cargar historial del día
  async function loadHistorial() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await API.cashier.getHistory({ fecha_desde: today, fecha_hasta: today });
      const data = response.data || response;
      const orders = data.orders || data || [];

      if (!tablaHistorial) return;

      if (orders.length === 0) {
        tablaHistorial.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 2rem; color: #999;">
              No hay órdenes finalizadas hoy
            </td>
          </tr>
        `;
        return;
      }

      tablaHistorial.innerHTML = orders.map(order => {
        const orderNum = String(order.id_orden).padStart(5, '0');
        const fecha = new Date(order.fecha).toLocaleString('es-GT');
        const total = parseFloat(order.total || 0).toFixed(2);
        const metodoPago = order.caja_comprobantes?.[0]?.metodo_pago || 'N/A';
        const comandasCount = order.comandas?.length || 0;

        return `
          <tr>
            <td><strong>${orderNum}</strong></td>
            <td>Mesa ${order.no_mesa}</td>
            <td>${fecha}</td>
            <td><strong>Q ${total}</strong></td>
            <td>${metodoPago}</td>
            <td style="text-align: center;">
              <button 
                class="btn btn-small" 
                onclick="window.cajaApp.verDetallesHistorial(${order.id_orden})"
                title="Ver ${comandasCount} platillo(s)">
                📋 Ver Detalles (${comandasCount})
              </button>
            </td>
          </tr>
        `;
      }).join('');
    } catch (error) {
      console.error('Error al cargar historial:', error);
      if (tablaHistorial) {
        tablaHistorial.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 2rem; color: #f44336;">
              Error al cargar historial: ${error.message}
            </td>
          </tr>
        `;
      }
    }
  }

  // Abrir modal de pago
  async function openPaymentModal(orderId, orderNum, mesa, total) {
    currentOrder = { id: orderId, numero: orderNum, mesa, total };

    if (ordenIdInput) ordenIdInput.value = orderId;
    if (modalOrdenNumero) modalOrdenNumero.value = orderNum;
    if (modalOrdenMesa) modalOrdenMesa.value = `Mesa ${mesa}`;
    if (modalOrdenTotal) modalOrdenTotal.value = `Q ${parseFloat(total).toFixed(2)}`;
    
    // Reset form
    if (metodoPagoSelect) metodoPagoSelect.value = '';
    if (montoRecibidoInput) montoRecibidoInput.value = '';
    if (cambioDevueltoInput) cambioDevueltoInput.value = 'Q 0.00';

    // Cargar detalles de platillos
    await loadOrderDetails(orderId);

    if (modalPago) {
      modalPago.style.display = 'block';
    }
  }

  // Cargar detalles de platillos de la orden
  async function loadOrderDetails(orderId) {
    const detallePlatillosBody = document.getElementById('modal-detalle-platillos');
    
    console.log('📋 Cargando detalles de orden:', orderId);
    console.log('📋 Elemento modal-detalle-platillos:', detallePlatillosBody ? 'Encontrado' : 'NO ENCONTRADO');
    
    if (!detallePlatillosBody) {
      console.error('❌ No se encontró el elemento modal-detalle-platillos');
      return;
    }

    try {
      // Mostrar loading
      detallePlatillosBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 1rem; color: #999;">
            Cargando detalles...
          </td>
        </tr>
      `;

      // Obtener detalles de la orden
      console.log('📡 Obteniendo detalles de orden desde API...');
      const response = await API.orders.getById(orderId);
      const orden = response.data || response;
      const comandas = orden.comandas || [];
      
      console.log('✅ Orden recibida:', orden);
      console.log('📦 Comandas:', comandas.length, 'items');

      if (comandas.length === 0) {
        console.warn('⚠️ La orden no tiene comandas');
        detallePlatillosBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; padding: 1rem; color: #999;">
              No hay platillos en esta orden
            </td>
          </tr>
        `;
        return;
      }

      console.log('🎨 Renderizando', comandas.length, 'platillos en la tabla...');
      
      // Renderizar platillos
      const htmlPlatillos = comandas.map((item, index) => {
        console.log(`  ${index + 1}. ${item.platillo_nombre || 'Sin nombre'}`);
        return item;
      }).map(item => {
        const cantidad = item.cantidad || 0;
        const precioUnit = parseFloat(item.precio_unitario || item.precio || 0);
        const precioExtra = parseFloat(item.extra_precio || 0);
        const subtotal = (precioUnit * cantidad) + precioExtra;
        const nombre = item.platillo_nombre || item.nombre || (item.platillo?.nombre) || 'N/A';
        
        // Agregar indicador de extras si los hay
        const extrasInfo = item.extra_observacion 
          ? `<br><small style="color: #666;">+ ${item.extra_observacion} (Q${precioExtra.toFixed(2)})</small>` 
          : '';
        
        return `
          <tr>
            <td style="padding: 0.5rem; border-bottom: 1px solid #f0f0f0; text-align: center;">
              ${cantidad}
            </td>
            <td style="padding: 0.5rem; border-bottom: 1px solid #f0f0f0;">
              ${nombre}${extrasInfo}
              ${item.observaciones ? `<br><small style="color: #999;">Obs: ${item.observaciones}</small>` : ''}
            </td>
            <td style="padding: 0.5rem; border-bottom: 1px solid #f0f0f0; text-align: right;">
              Q ${precioUnit.toFixed(2)}
            </td>
            <td style="padding: 0.5rem; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600;">
              Q ${subtotal.toFixed(2)}
            </td>
          </tr>
        `;
      }).join('');

      detallePlatillosBody.innerHTML = htmlPlatillos;
      console.log('✅ Tabla de platillos renderizada correctamente');

    } catch (error) {
      console.error('❌ Error al cargar detalles de platillos:', error);
      console.error('Stack:', error.stack);
      
      if (detallePlatillosBody) {
        detallePlatillosBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; padding: 1rem; color: #f44336;">
              ❌ Error al cargar detalles: ${error.message}
            </td>
          </tr>
        `;
      }
    }
  }

  // Cerrar modal
  function closePaymentModal() {
    if (modalPago) {
      modalPago.style.display = 'none';
    }
    currentOrder = null;
  }

  // Calcular cambio
  function calculateChange() {
    if (!currentOrder || !montoRecibidoInput || !cambioDevueltoInput) return;

    const montoRecibido = parseFloat(montoRecibidoInput.value) || 0;
    const total = parseFloat(currentOrder.total) || 0;
    const cambio = Math.max(0, montoRecibido - total);

    cambioDevueltoInput.value = `Q ${cambio.toFixed(2)}`;
  }

  // Enviar pago
  async function handleSubmitPayment(e) {
    e.preventDefault();

    if (!currentOrder) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay orden seleccionada',
        confirmButtonColor: '#2196F3'
      });
      return;
    }

    const montoRecibido = parseFloat(montoRecibidoInput.value) || 0;
    const total = parseFloat(currentOrder.total) || 0;

    if (montoRecibido < total) {
      Swal.fire({
        icon: 'warning',
        title: 'Monto insuficiente',
        html: `El monto recibido <strong>(Q ${montoRecibido.toFixed(2)})</strong> es menor al total de la orden <strong>(Q ${total.toFixed(2)})</strong>`,
        confirmButtonColor: '#2196F3'
      });
      return;
    }

    const cambio = montoRecibido - total;

    const paymentData = {
      metodo_pago: metodoPagoSelect.value,
      monto_recibido: montoRecibido,
      cambio_devuelto: cambio
    };

    try {
      console.log('💳 Finalizando pago de orden:', currentOrder.id, paymentData);
      
      const response = await API.cashier.finalize(currentOrder.id, paymentData);
      
      console.log('✅ Pago procesado:', response);
      
      await Swal.fire({
        icon: 'success',
        title: '✅ Pago Exitoso',
        html: `
          <div style="text-align: left; margin: 1rem 0;">
            <p style="margin: 0.5rem 0;"><strong>Orden:</strong> ${currentOrder.numero}</p>
            <p style="margin: 0.5rem 0;"><strong>Total:</strong> Q ${total.toFixed(2)}</p>
            <p style="margin: 0.5rem 0;"><strong>Recibido:</strong> Q ${montoRecibido.toFixed(2)}</p>
            <p style="margin: 0.5rem 0; font-size: 1.2rem; color: #4CAF50;"><strong>Cambio:</strong> Q ${cambio.toFixed(2)}</p>
          </div>
        `,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2196F3'
      });
      
      closePaymentModal();
      
      // Recargar datos
      await loadStats();
      await loadPendingOrders();
      await loadHistorial();
      
      // Cambiar a tab de historial
      switchTab('historial');
    } catch (error) {
      console.error('❌ Error al procesar pago:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al procesar pago',
        text: error.message || 'Ocurrió un error inesperado',
        confirmButtonColor: '#2196F3'
      });
    }
  }

  // Ver detalles de orden en historial
  async function verDetallesHistorial(orderId) {
    try {
      console.log('📋 Cargando detalles de orden del historial:', orderId);
      
      const response = await API.orders.getById(orderId);
      const orden = response.data || response;
      const comandas = orden.comandas || [];
      
      if (comandas.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin platillos',
          text: 'Esta orden no tiene platillos registrados.',
          confirmButtonColor: '#2196F3'
        });
        return;
      }
      
      // Crear tabla HTML de platillos
      let platillosHTML = `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
            <thead style="background: #f5f5f5; position: sticky; top: 0;">
              <tr>
                <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">Platillo</th>
                <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: center; width: 80px;">Cant.</th>
                <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: right; width: 100px;">Precio</th>
                <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: right; width: 100px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      comandas.forEach((item) => {
        const cantidad = item.cantidad || 0;
        const nombre = item.platillo_nombre || item.nombre || (item.platillo?.nombre) || 'N/A';
        const precioUnit = parseFloat(item.precio_unitario || item.precio || 0);
        const precioExtra = parseFloat(item.extra_precio || 0);
        const subtotal = (precioUnit * cantidad) + precioExtra;
        
        platillosHTML += `
          <tr>
            <td style="padding: 0.75rem; border: 1px solid #ddd;">
              <strong>${nombre}</strong>
              ${item.observaciones ? `<br><small style="color: #666;"><em>Obs: ${item.observaciones}</em></small>` : ''}
              ${precioExtra > 0 ? `<br><small style="color: #2196F3;"><strong>Extra:</strong> ${item.extra_observacion || 'Sin descripción'} (+Q ${precioExtra.toFixed(2)})</small>` : ''}
            </td>
            <td style="padding: 0.75rem; border: 1px solid #ddd; text-align: center;">${cantidad}</td>
            <td style="padding: 0.75rem; border: 1px solid #ddd; text-align: right;">Q ${precioUnit.toFixed(2)}</td>
            <td style="padding: 0.75rem; border: 1px solid #ddd; text-align: right;"><strong>Q ${subtotal.toFixed(2)}</strong></td>
          </tr>
        `;
      });
      
      platillosHTML += `
            </tbody>
            <tfoot style="background: #f9f9f9; font-weight: bold;">
              <tr>
                <td colspan="3" style="padding: 1rem; border: 1px solid #ddd; text-align: right; font-size: 1.1rem;">TOTAL:</td>
                <td style="padding: 1rem; border: 1px solid #ddd; text-align: right; font-size: 1.2rem; color: #2196F3;">Q ${parseFloat(orden.total || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
      
      // Mostrar con SweetAlert2
      Swal.fire({
        title: `📋 Orden #${String(orden.id_orden).padStart(5, '0')}`,
        html: `
          <div style="text-align: left; margin-bottom: 1rem;">
            <p style="margin: 0.5rem 0;"><strong>Mesa:</strong> ${orden.no_mesa}</p>
            <p style="margin: 0.5rem 0;"><strong>Estado:</strong> <span style="color: #4CAF50;">${orden.estado}</span></p>
            <p style="margin: 0.5rem 0;"><strong>Fecha:</strong> ${new Date(orden.fecha).toLocaleString('es-GT')}</p>
          </div>
          ${platillosHTML}
        `,
        width: '800px',
        confirmButtonText: '✅ Cerrar',
        confirmButtonColor: '#2196F3',
        customClass: {
          popup: 'detalle-orden-popup'
        }
      });
      
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los detalles de la orden: ' + error.message,
        confirmButtonColor: '#2196F3'
      });
    }
  }

  // Exponer funciones globales para onclick en HTML
  window.cajaApp = {
    openPaymentModal,
    verDetallesHistorial
  };

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

