// Script para la gestión de comandas (mesero_comanda.html)

(() => {
  // Elementos del DOM
  const $ = (id) => document.getElementById(id);
  
  // Formulario y campos
  const noOrden = $('no-orden');
  const fecha = $('fecha');
  const mesa = $('mesa');
  const areaSelect = $('aria-label');
  const platilloSelect = $('platillo');
  const cantidad = $('cantidad');
  const precio = $('precio');
  const observaciones = $('observaciones');
  const subtotal = $('subtotal');
  const estado = $('estado');
  const total = $('total');
  const tablaBody = $('tabla-comanda')?.querySelector('tbody');
  const extraObservacion = $('extra-observacion');
  const extraPrecio = $('extra-precio');
  const btnSubmitOrder = $('btn-submit-order');

  // Estado local
  let menuItems = [];
  let currentOrder = {
    items: [],
    extras: [],
    total: 0
  };
  let editMode = false;
  let editOrderId = null;
  let listenersConfigured = false; // Flag para evitar duplicar listeners
  let isAddingItem = false; // Flag para prevenir múltiples ejecuciones simultáneas
  let editingItemIndex = -1; // Índice del item que se está editando (-1 = ninguno)

  // Inicializar
  async function init() {
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login.html';
      return;
    }

    // Verificar si estamos en modo edición
    const urlParams = new URLSearchParams(window.location.search);
    editOrderId = urlParams.get('edit');
    editMode = !!editOrderId;

    // Configurar fecha actual
    if (fecha) {
      fecha.value = new Date().toISOString().split('T')[0];
    }

    // Generar opciones de mesas (1-30)
    if (mesa) {
      for (let i = 1; i <= 30; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Mesa ${i}`;
        mesa.appendChild(option);
      }
    }

    // Cargar datos iniciales
    if (editMode) {
      await loadOrderForEdit(editOrderId);
    } else {
      await loadNextOrderNumber();
    }

    // Cargar áreas y menú
    await loadAreas();
    await loadMenu();

    // Event listeners
    setupEventListeners();

    // Limpiar tabla solo si NO estamos en modo edición
    // (en modo edición ya se cargaron los items)
    if (!editMode && tablaBody) {
      tablaBody.innerHTML = '';
    }
  }

  // Cargar orden existente para edición
  async function loadOrderForEdit(orderId) {
    try {
      console.log('🔄 Cargando orden para editar:', orderId);
      
      const response = await API.orders.getById(orderId);
      console.log('📥 Respuesta del API:', response);
      
      const data = response.data || response;
      const order = data.orden || data;
      
      console.log('📋 Orden extraída:', order);

      if (!order || !order.id_orden) {
        throw new Error('Datos de orden inválidos o incompletos');
      }

      // Mostrar número de orden
      if (noOrden) {
        const orderNumber = String(order.id_orden || order.id).padStart(5, '0');
        noOrden.value = orderNumber;
        noOrden.readOnly = true;
        noOrden.style.backgroundColor = '#f0f0f0';
      }

      // Bloquear cambio de mesa
      if (mesa) {
        mesa.value = order.no_mesa || '';
        mesa.disabled = true;
        mesa.style.backgroundColor = '#f0f0f0';
      }

      // Cambiar estado a "Edición"
      if (estado) {
        estado.value = 'Edición';
      }

      // Cambiar texto del botón
      if (btnSubmitOrder) {
        btnSubmitOrder.textContent = 'Actualizar Orden';
      }

      // Cargar items existentes en la orden
      const comandas = order.comandas || order.items || [];
      console.log('📦 Items de la orden:', comandas);
      
      currentOrder.items = comandas.map(item => {
        const precioUnitario = item.precio_unitario || item.precio || 0;
        const cant = item.cantidad || 0;
        const precioExt = parseFloat(item.extra_precio || 0);
        const subtotalCalc = (precioUnitario * cant) + precioExt;
        
        // Obtener el área del platillo (puede venir de varias formas)
        let area = '';
        if (item.platillo && item.platillo.area_nombre) {
          area = item.platillo.area_nombre;
        } else if (item.platillo && item.platillo.area && item.platillo.area.nombre) {
          area = item.platillo.area.nombre;
        } else if (item.area_nombre) {
          area = item.area_nombre;
        }
        
        return {
          id_comanda: item.id_comanda, // 👈 ID del item en la BD (para poder eliminarlo)
          platilloId: item.id_platillo,
          nombre: item.platillo_nombre || item.nombre || (item.platillo ? item.platillo.nombre : ''),
          area: area, // 👈 Agregar área del platillo
          cantidad: cant,
          precio: precioUnitario,
          observaciones: item.observaciones || '',
          observacionExtra: item.extra_observacion || '',
          precioExtra: precioExt,
          subtotal: subtotalCalc
        };
      });

      console.log('📝 Items procesados:', currentOrder.items);

      // Mostrar items en la tabla
      console.log('🔄 Actualizando tabla...');
      updateOrderTable();
      
      console.log('🔄 Actualizando total...');
      updateTotal();

      console.log('✅ Orden cargada para edición exitosamente');
    } catch (error) {
      console.error('❌ Error al cargar orden:', error);
      console.error('❌ Stack trace:', error.stack);
      console.error('❌ Detalles del error:', {
        message: error.message,
        name: error.name,
        orderId: orderId
      });
      alert(`No se pudo cargar la orden para editar:\n${error.message}`);
      // Comentar redirección temporalmente para debug
      // window.location.href = '/templates/mesero/comanda-control.html';
    }
  }

  // Obtener el próximo número de orden
  async function loadNextOrderNumber() {
    try {
      // Obtener todas las órdenes (incluyendo finalizadas) para calcular el siguiente número
      const response = await API.orders.getAll({ include_finalizadas: true });
      const data = response.data || response;
      const orders = data.orders || data || [];
      
      if (orders.length > 0 && noOrden) {
        // Obtener el ID de la última orden y sumarle 1
        const lastOrderId = orders[0].id_orden || orders[0].id || 0;
        const nextOrderNumber = lastOrderId + 1;
        // Formatear con padding de 5 dígitos (00001, 00002, etc.)
        noOrden.value = String(nextOrderNumber).padStart(5, '0');
      } else if (noOrden) {
        // Primera orden
        noOrden.value = '00001';
      }
    } catch (error) {
      console.error('Error al obtener número de orden:', error);
      // Si falla, usar 00001 como fallback
      if (noOrden) {
        noOrden.value = '00001';
      }
    }
  }

  // Cargar áreas
  async function loadAreas() {
    try {
      const response = await API.menu.getAreas();
      
      // El backend devuelve: { data: { areas: [...] } }
      const data = response.data || response;
      const areas = data.areas || data || [];
      
      console.log('Áreas cargadas:', areas);
      
      if (areaSelect && areas.length > 0) {
        areaSelect.innerHTML = '<option value="">Seleccionar…</option>';
        areas.forEach(area => {
          const option = document.createElement('option');
          // area puede ser un objeto { id_area, nombre } o un string
          const areaNombre = area.nombre || area;
          option.value = areaNombre;
          option.textContent = areaNombre.charAt(0).toUpperCase() + areaNombre.slice(1);
          areaSelect.appendChild(option);
        });
      }
    } catch (error) {
      handleError(error, 'Error al cargar áreas');
    }
  }

  // Cargar menú completo
  async function loadMenu() {
    try {
      const response = await API.menu.getAll();
      
      // El backend devuelve: { data: { menu: [{area, platillos: [...]}], total } }
      const data = response.data || response;
      
      // Aplanar el menú agrupado por área en un solo array
      if (data.menu && Array.isArray(data.menu)) {
        menuItems = data.menu.reduce((acc, grupo) => {
          if (grupo.platillos && Array.isArray(grupo.platillos)) {
            const platillosConArea = grupo.platillos.map(p => ({
              id: p.id_platillo,
              nombre: p.nombre,
              precio: p.precio,
              descripcion: p.descripcion,
              area: grupo.area.nombre,
              disponible: p.disponible !== undefined ? p.disponible : true
            }));
            return acc.concat(platillosConArea);
          }
          return acc;
        }, []);
      } else {
        menuItems = [];
      }
      
      console.log('Menú cargado:', menuItems);
    } catch (error) {
      handleError(error, 'Error al cargar menú');
    }
  }

  // Configurar event listeners
  function setupEventListeners() {
    // Evitar configurar listeners múltiples veces
    if (listenersConfigured) {
      console.log('⚠️ Listeners ya configurados, saltando...');
      return;
    }

    console.log('🔧 Configurando event listeners...');

    // Remover listeners previos por si acaso (aunque no deberían existir)
    if (areaSelect) {
      areaSelect.removeEventListener('change', handleAreaChange);
      areaSelect.addEventListener('change', handleAreaChange);
    }

    if (platilloSelect) {
      platilloSelect.removeEventListener('change', handlePlatilloChange);
      platilloSelect.addEventListener('change', handlePlatilloChange);
    }

    if (cantidad) {
      cantidad.removeEventListener('input', calculateSubtotal);
      cantidad.addEventListener('input', calculateSubtotal);
    }

    // Botón agregar - usar selector específico y remover listener previo
    const btnAgregar = document.querySelector('.btn-success');
    if (btnAgregar) {
      console.log('🎯 Configurando botón Agregar');
      btnAgregar.removeEventListener('click', addItemToOrder);
      btnAgregar.addEventListener('click', addItemToOrder, { once: false });
    }

    // Botón enviar orden
    const btnEnviar = document.querySelector('.btn-primary[type="submit"]');
    if (btnEnviar) {
      btnEnviar.removeEventListener('click', handleSubmitOrder);
      btnEnviar.addEventListener('click', handleSubmitOrder);
    }

    // Event delegation para botones de editar/eliminar en la tabla
    if (tablaBody) {
      tablaBody.addEventListener('click', (e) => {
        const target = e.target;
        
        // Botón editar
        if (target.classList.contains('btn-editar-item') || target.closest('.btn-editar-item')) {
          const btn = target.classList.contains('btn-editar-item') ? target : target.closest('.btn-editar-item');
          const index = parseInt(btn.dataset.index);
          if (!isNaN(index)) {
            editItem(index);
          }
        }
        
        // Botón eliminar
        if (target.classList.contains('btn-eliminar-item') || target.closest('.btn-eliminar-item')) {
          const btn = target.classList.contains('btn-eliminar-item') ? target : target.closest('.btn-eliminar-item');
          const index = parseInt(btn.dataset.index);
          if (!isNaN(index)) {
            deleteItem(index);
          }
        }
      });
      console.log('✅ Event delegation configurado para botones de tabla');
    }

    listenersConfigured = true;
    console.log('✅ Listeners configurados');
  }

  // Manejar cambio de área
  function handleAreaChange(e) {
    const selectedArea = e.target.value;
    
    if (!platilloSelect) return;

    // Filtrar platillos por área
    const filteredItems = selectedArea 
      ? menuItems.filter(item => item.area.toLowerCase() === selectedArea.toLowerCase())
      : menuItems;

    console.log('Platillos filtrados por área', selectedArea, ':', filteredItems);

    // Actualizar select de platillos
    platilloSelect.innerHTML = '<option value="">Seleccionar…</option>';
    
    if (filteredItems.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No hay platillos en esta área';
      option.disabled = true;
      platilloSelect.appendChild(option);
    } else {
      filteredItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        // Mostrar "(NO DISPONIBLE)" si el platillo está desactivado
        const disponible = item.disponible !== undefined ? item.disponible : true;
        option.textContent = disponible ? item.nombre : `${item.nombre} (NO DISPONIBLE)`;
        option.dataset.precio = item.precio;
        option.dataset.descripcion = item.descripcion || '';
        option.dataset.disponible = disponible;
        
        // Estilo visual para platillos no disponibles
        if (!disponible) {
          option.style.color = '#999';
          option.style.fontStyle = 'italic';
        }
        
        platilloSelect.appendChild(option);
      });
    }

    // Limpiar precio y subtotal
    if (precio) precio.value = '';
    if (subtotal) subtotal.value = '';
  }

  // Manejar cambio de platillo
  function handlePlatilloChange(e) {
    const selectedOption = e.target.selectedOptions[0];
    
    if (selectedOption && selectedOption.dataset.precio) {
      if (precio) {
        precio.value = parseFloat(selectedOption.dataset.precio).toFixed(2);
      }
      calculateSubtotal();
    }
    
    // Deshabilitar/habilitar botón Agregar según disponibilidad
    const btnAgregar = document.querySelector('.btn-success');
    const disponible = selectedOption?.dataset.disponible;
    
    if (btnAgregar) {
      if (disponible === 'false') {
        btnAgregar.disabled = true;
        btnAgregar.style.opacity = '0.5';
        btnAgregar.style.cursor = 'not-allowed';
        btnAgregar.title = 'Este platillo no está disponible';
        console.log('🚫 Botón Agregar deshabilitado - platillo no disponible');
      } else {
        btnAgregar.disabled = false;
        btnAgregar.style.opacity = '1';
        btnAgregar.style.cursor = 'pointer';
        btnAgregar.title = '';
        console.log('✅ Botón Agregar habilitado');
      }
    }
  }

  // Calcular subtotal
  function calculateSubtotal() {
    const precioVal = parseFloat(precio?.value || 0);
    const cantidadVal = parseInt(cantidad?.value || 0);
    const extraPrecioVal = parseFloat(extraPrecio?.value || 0);
    
    const subtotalVal = (precioVal * cantidadVal) + extraPrecioVal;
    
    if (subtotal) {
      subtotal.value = subtotalVal.toFixed(2);
    }
  }

  // Agregar item a la orden
  function addItemToOrder(e) {
    // Prevenir ejecución múltiple
    if (isAddingItem) {
      console.log('⚠️ Ya se está agregando un item, ignorando click duplicado');
      return;
    }
    
    isAddingItem = true;
    console.log('➕ addItemToOrder() llamado');
    console.log('📦 Items actuales antes de agregar:', currentOrder.items.length);
    console.log('📋 Filas en la tabla antes:', tablaBody?.children.length || 0);
    
    try {
      // Validaciones
      if (!platilloSelect?.value) {
        showNotification('Selecciona un platillo', 'error');
        return;
      }

      // NUEVA VALIDACIÓN: Verificar si el platillo está disponible
      const platilloOption = platilloSelect.selectedOptions[0];
      const disponible = platilloOption.dataset.disponible;
      
      if (disponible === 'false') {
        console.warn('⚠️ Intento de agregar platillo NO DISPONIBLE');
        showNotification('❌ Este platillo NO está disponible. No se puede agregar a la orden.', 'error');
        return;
      }

      if (!cantidad?.value || parseInt(cantidad.value) <= 0) {
        showNotification('Ingresa una cantidad válida', 'error');
        return;
      }

      // Obtener datos del item
      const item = {
        platilloId: parseInt(platilloSelect.value),
        nombre: platilloOption.textContent,
        area: areaSelect?.value || '',
        cantidad: parseInt(cantidad.value),
        precio: parseFloat(precio.value),
        observaciones: observaciones?.value || '',
        observacionExtra: extraObservacion?.value || '',
        precioExtra: parseFloat(extraPrecio?.value || 0),
        subtotal: parseFloat(subtotal.value)
      };

      console.log('🆕 Item:', item);

      // Verificar si estamos editando o agregando
      if (editingItemIndex >= 0 && editingItemIndex < currentOrder.items.length) {
        // EDITAR: Reemplazar item existente, pero preservar id_comanda si existe
        console.log(`✏️ Reemplazando item en índice ${editingItemIndex}`);
        const oldItem = currentOrder.items[editingItemIndex];
        
        // Preservar id_comanda del item original (si existe)
        if (oldItem.id_comanda) {
          item.id_comanda = oldItem.id_comanda;
          console.log(`📌 Preservando id_comanda: ${item.id_comanda}`);
        }
        
        currentOrder.items[editingItemIndex] = item;
        console.log('📦 Items después de editar:', currentOrder.items.length);
        showNotification('Platillo actualizado', 'success');
      } else {
        // AGREGAR: Nuevo item
        console.log('➕ Agregando nuevo item');
        currentOrder.items.push(item);
        console.log('📦 Items después de agregar:', currentOrder.items.length);
        showNotification('Platillo agregado a la orden', 'success');
      }
      
      // Re-renderizar toda la tabla desde cero (evita duplicados)
      console.log('🔄 Re-renderizando tabla completa...');
      updateOrderTable();
      console.log('📋 Filas en la tabla después:', tablaBody?.children.length || 0);

      // Calcular total
      updateTotal();

      // Limpiar formulario
      clearItemForm();

      console.log('✅ Operación completada exitosamente');
    } finally {
      // Liberar el flag después de un pequeño delay
      setTimeout(() => {
        isAddingItem = false;
        console.log('🔓 Flag isAddingItem liberado');
      }, 300);
    }
  }

  // Agregar item a la tabla
  function addItemToTable(item, index) {
    if (!tablaBody) return;

    // Asegurar que todos los valores numéricos sean números
    const cantidad = parseInt(item.cantidad) || 0;
    const precio = parseFloat(item.precio) || 0;
    const precioExtra = parseFloat(item.precioExtra) || 0;
    const subtotal = parseFloat(item.subtotal) || 0;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td data-label="Cantidad">${cantidad}</td>
      <td data-label="Platillo">${item.nombre || '—'}</td>
      <td data-label="Observaciones">${item.observaciones || '—'}</td>
      <td data-label="Precio">Q${precio.toFixed(2)}</td>
      <td data-label="Observacion Extra">${item.observacionExtra || '—'}</td>
      <td data-label="Precio Extra">Q${precioExtra.toFixed(2)}</td>
      <td data-label="Subtotal">Q${subtotal.toFixed(2)}</td>
      <td data-label="Acciones" class="acciones-cell">
        <button type="button" class="btn-editar-item" data-index="${index}" title="Editar platillo">
          ✏️ Editar
        </button>
        <button type="button" class="btn-eliminar-item" data-index="${index}" title="Eliminar platillo">
          🗑️ Eliminar
        </button>
      </td>
    `;

    tablaBody.appendChild(row);
  }

  // Actualizar tabla completa con todos los items
  function updateOrderTable() {
    if (!tablaBody) {
      console.log('⚠️ No se encontró tablaBody');
      return;
    }

    console.log('🧹 Limpiando tabla...');
    console.log('📊 Filas antes de limpiar:', tablaBody.children.length);
    
    // Limpiar tabla
    tablaBody.innerHTML = '';
    
    console.log('📊 Filas después de limpiar:', tablaBody.children.length);
    console.log('📦 Total items en currentOrder:', currentOrder.items.length);

    // Agregar todos los items
    currentOrder.items.forEach((item, index) => {
      console.log(`➕ Agregando item ${index + 1}:`, item.nombre);
      addItemToTable(item, index);
    });
    
    console.log('📊 Filas después de agregar todos:', tablaBody.children.length);
    console.log('✅ Tabla actualizada completamente');
  }

  // Actualizar total
  function updateTotal() {
    const totalVal = currentOrder.items.reduce((sum, item) => sum + item.subtotal, 0);
    currentOrder.total = totalVal;
    
    if (total) {
      total.value = totalVal.toFixed(2);
    }
  }

  // Limpiar formulario de item
  function clearItemForm() {
    if (platilloSelect) platilloSelect.value = '';
    if (cantidad) cantidad.value = '';
    if (precio) precio.value = '';
    if (observaciones) observaciones.value = '';
    if (extraObservacion) extraObservacion.value = '';
    if (extraPrecio) extraPrecio.value = '';
    if (subtotal) subtotal.value = '';
    editingItemIndex = -1; // Resetear índice de edición
  }

  // Editar un item existente
  function editItem(index) {
    console.log(`✏️ Editando item en índice ${index}`);
    
    const item = currentOrder.items[index];
    if (!item) {
      console.error('❌ Item no encontrado en índice:', index);
      return;
    }

    // Cargar datos del item en el formulario
    editingItemIndex = index;

    // Seleccionar área
    if (areaSelect && item.area) {
      areaSelect.value = item.area;
      handleAreaChange({ target: { value: item.area } });
    }

    // Seleccionar platillo
    setTimeout(() => {
      if (platilloSelect) {
        platilloSelect.value = item.platilloId;
        if (precio) precio.value = parseFloat(item.precio).toFixed(2);
      }
    }, 100);

    // Llenar otros campos
    if (cantidad) cantidad.value = item.cantidad;
    if (observaciones) observaciones.value = item.observaciones || '';
    if (extraObservacion) extraObservacion.value = item.observacionExtra || '';
    if (extraPrecio) extraPrecio.value = parseFloat(item.precioExtra || 0).toFixed(2);
    
    // Calcular subtotal
    calculateSubtotal();

    // Scroll al formulario
    document.querySelector('.item-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    showNotification('Modifica los datos y presiona "Agregar" para actualizar', 'info');
    console.log('📝 Datos cargados para edición:', item);
  }

  // Eliminar un item
  async function deleteItem(index) {
    console.log(`🗑️ Eliminando item en índice ${index}`);
    
    const item = currentOrder.items[index];
    if (!item) {
      console.error('❌ Item no encontrado en índice:', index);
      return;
    }

    // Confirmar eliminación
    if (!confirm(`¿Eliminar "${item.nombre}" de la orden?`)) {
      return;
    }

    try {
      // Si el item existe en la BD (tiene id_comanda), eliminarlo del backend inmediatamente
      if (item.id_comanda && editMode && editOrderId) {
        console.log(`🔄 Eliminando item de la BD: id_comanda=${item.id_comanda}`);
        await API.orders.deleteItem(editOrderId, item.id_comanda);
        console.log('✅ Item eliminado del backend');
      } else {
        console.log('📝 Item solo existe en frontend, no requiere eliminación en BD');
      }

      // Remover del array local
      currentOrder.items.splice(index, 1);
      console.log(`✅ Item eliminado del array. Items restantes: ${currentOrder.items.length}`);

      // Si estábamos editando este item, cancelar edición
      if (editingItemIndex === index) {
        editingItemIndex = -1;
        clearItemForm();
      } else if (editingItemIndex > index) {
        // Ajustar índice si estábamos editando un item posterior
        editingItemIndex--;
      }

      // Actualizar vista
      updateOrderTable();
      updateTotal();
      
      showNotification('Platillo eliminado', 'success');
    } catch (error) {
      console.error('❌ Error al eliminar item:', error);
      showNotification('Error al eliminar el platillo', 'error');
    }
  }

  // Enviar orden
  async function handleSubmitOrder(e) {
    e.preventDefault();

    // Validaciones
    if (!mesa?.value) {
      showNotification('Ingresa el número de mesa', 'error');
      return;
    }

    if (currentOrder.items.length === 0) {
      showNotification('Agrega al menos un platillo a la orden', 'error');
      return;
    }

    try {
      // Preparar datos de la orden según el formato que espera el backend
      const orderData = {
        no_mesa: mesa.value,  // Backend espera 'no_mesa'
        items: currentOrder.items.map(item => ({
          id_platillo: item.platilloId,  // Backend espera 'id_platillo'
          cantidad: item.cantidad,
          observaciones: item.observaciones || null,
          extra_observacion: item.observacionExtra || null,
          extra_precio: item.precioExtra || 0
        }))
      };

      // Si estamos en modo edición, agregar flag para reemplazar todos los items
      if (editMode && editOrderId) {
        orderData.replaceAllItems = true;
        console.log(`📝 Actualizando orden completa: ${currentOrder.items.length} items totales`);
      }

      console.log(editMode ? 'Actualizando orden:' : 'Enviando orden:', orderData);

      // Enviar a la API (crear o actualizar)
      let response;
      let ordenId;

      if (editMode && editOrderId) {
        // Actualizar orden existente (reemplazando todos los items)
        response = await API.orders.update(editOrderId, orderData);
        ordenId = editOrderId;
        showNotification('Orden actualizada exitosamente', 'success');
        console.log('Orden actualizada con ID:', ordenId);
        
        // Redirigir a comanda-control después de 1 segundo con parámetro refresh
        setTimeout(() => {
          window.location.href = '/templates/mesero/comanda-control.html?refresh=1&t=' + Date.now();
        }, 1000);
      } else {
        // Crear nueva orden
        response = await API.orders.create(orderData);
        showNotification('Orden creada exitosamente', 'success');
        
        // Obtener el ID de la orden
        const data = response.data || response;
        ordenId = data.orden?.id_orden || data.id_orden || data.id;
        console.log('Orden creada con ID:', ordenId);
        
        // Preguntar si enviar a cocina
        setTimeout(() => {
          if (confirm('¿Deseas enviar la orden a cocina ahora?')) {
            sendOrderToKDS(ordenId);
          } else {
            // Redirigir a comanda-control para ver la orden creada
            window.location.href = '/templates/mesero/comanda-control.html?refresh=1&t=' + Date.now();
          }
        }, 500);
      }
    } catch (error) {
      handleError(error, 'Error al crear la orden');
    }
  }

  // Enviar orden al KDS
  async function sendOrderToKDS(orderId) {
    try {
      await API.orders.sendToKDS(orderId);
      showNotification('Orden enviada a cocina', 'success');
      
      // Redirigir a comanda-control para ver las órdenes
      setTimeout(() => {
        window.location.href = '/templates/mesero/comanda-control.html?refresh=1&t=' + Date.now();
      }, 1000);
    } catch (error) {
      handleError(error, 'Error al enviar orden a cocina');
    }
  }

  // Resetear formulario
  async function resetForm() {
    console.log('🔄 Reseteando formulario...');
    
    // Limpiar campos
    if (mesa) {
      mesa.value = '';
      mesa.disabled = false;
      mesa.style.backgroundColor = '';
    }
    if (areaSelect) areaSelect.value = '';
    if (tablaBody) tablaBody.innerHTML = '';
    if (noOrden) {
      noOrden.readOnly = false;
      noOrden.style.backgroundColor = '';
    }
    if (estado) {
      estado.value = 'Pendiente';
    }
    if (btnSubmitOrder) {
      btnSubmitOrder.textContent = 'Enviar Orden';
    }
    
    // Resetear estado
    currentOrder = {
      items: [],
      extras: [],
      total: 0
    };
    editMode = false;
    editOrderId = null;
    
    // Generar nuevo número de orden
    await loadNextOrderNumber();
    
    updateTotal();
    clearItemForm();
    
    console.log('✅ Formulario reseteado');
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

