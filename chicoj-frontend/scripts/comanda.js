// Script para la gestión de comandas (mesero_comanda.html)

(() => {
  // Elementos del DOM
  const $ = (id) => document.getElementById(id);
  
  // Formulario y campos
  const noOrden = $('no-orden');
  const fecha = $('fecha');
  const mesa = $('mesa');
  const areaButtonsContainer = $('area-buttons');
  const categoriaContainer = $('categoria-container');
  const categoriaButtonsContainer = $('categoria-buttons');
  const platilloContainer = $('platillo-container');
  const platilloButtonsContainer = $('platillo-buttons');
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
  let areas = [];
  let selectedArea = null;
  let selectedCategoria = null;
  let categoriasPorArea = {}; // Mapa de categorías por área
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
      window.location.href = '/templates/login';
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
      console.log('[LOAD] Cargando orden para editar:', orderId);
      
      const response = await API.orders.getById(orderId);
      console.log('[RECEIVE] Respuesta del API:', response);
      
      const data = response.data || response;
      const order = data.orden || data;
      
      console.log('[INFO] Orden extraída:', order);

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
      console.log('[DATA] Items de la orden:', comandas);
      
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
        
        const itemProcesado = {
          id_comanda: item.id_comanda, // 👈 ID del item en la BD (para poder eliminarlo)
          platilloId: item.id_platillo,
          nombre: item.platillo_nombre || item.nombre || (item.platillo ? item.platillo.nombre : ''),
          area: area, // 👈 Agregar área del platillo
          categoria: item.categoria || (item.platillo ? item.platillo.categoria : ''),
          cantidad: cant,
          precio: precioUnitario,
          observaciones: item.observaciones || '',
          observacionExtra: item.extra_observacion || '',
          precioExtra: precioExt,
          subtotal: subtotalCalc,
          // Estados de KDS (del backend)
          en_kds: item.en_kds || false,
          estado_kds: item.estado_kds || null,
          bloqueado: item.bloqueado || false, // Si está preparado en KDS, no se puede editar
          puede_editar: item.puede_editar !== false // Por defecto true si no viene del backend
        };
        
        console.log(`[KDS] Item "${itemProcesado.nombre}":`, {
          en_kds: itemProcesado.en_kds,
          estado_kds: itemProcesado.estado_kds,
          bloqueado: itemProcesado.bloqueado,
          puede_editar: itemProcesado.puede_editar
        });
        
        return itemProcesado;
      });

      console.log('[NOTE] Items procesados:', currentOrder.items);
      console.log('[KDS] Resumen de estados:');
      currentOrder.items.forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.nombre}: bloqueado=${item.bloqueado}, estado=${item.estado_kds}`);
      });

      // Mostrar items en la tabla
      console.log('[LOAD] Actualizando tabla...');
      updateOrderTable();
      
      console.log('[LOAD] Actualizando total...');
      updateTotal();

      console.log('[OK] Orden cargada para edición exitosamente');
    } catch (error) {
      console.error('[ERROR] Error al cargar orden:', error);
      console.error('[ERROR] Stack trace:', error.stack);
      console.error('[ERROR] Detalles del error:', {
        message: error.message,
        name: error.name,
        orderId: orderId
      });
      Toast.error(`No se pudo cargar la orden para editar:\n${error.message}`, 5000);
      // Comentar redirección temporalmente para debug
      // window.location.href = '/templates/mesero/comanda-control';
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

  // Cargar áreas y crear botones
  async function loadAreas() {
    try {
      const response = await API.menu.getAreas();
      
      // El backend devuelve: { data: { areas: [...] } }
      const data = response.data || response;
      areas = data.areas || data || [];
      
      console.log('[OK] Áreas cargadas:', areas);
      
      if (areaButtonsContainer && areas.length > 0) {
        areaButtonsContainer.innerHTML = '';
        
        areas.forEach(area => {
          const areaNombre = area.nombre || area;
          const areaId = area.id_area;
          
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'area-button';
          button.dataset.area = areaNombre;
          button.dataset.areaId = areaId;
          button.textContent = areaNombre.charAt(0).toUpperCase() + areaNombre.slice(1);
          
          button.addEventListener('click', () => selectArea(areaNombre, areaId));
          
          areaButtonsContainer.appendChild(button);
        });
      }
    } catch (error) {
      handleError(error, 'Error al cargar áreas');
    }
  }

  // Seleccionar área
  async function selectArea(areaNombre, areaId) {
    console.log('[POINT] Área seleccionada:', areaNombre, areaId);
    
    // Actualizar estado
    selectedArea = { nombre: areaNombre, id: areaId };
    selectedCategoria = null;
    
    // Actualizar UI de botones
    document.querySelectorAll('.area-button').forEach(btn => {
      if (btn.dataset.area === areaNombre) {
        btn.classList.add('active');
        btn.classList.remove('disabled');
      } else {
        btn.classList.remove('active');
        btn.classList.add('disabled');
      }
    });
    
    // Resetear selecciones posteriores
    if (categoriaButtonsContainer) {
      categoriaButtonsContainer.innerHTML = '<p style="color: var(--muted);">Cargando categorías...</p>';
    }
    if (platilloButtonsContainer) {
      platilloButtonsContainer.innerHTML = '';
    }
    if (platilloContainer) {
      platilloContainer.style.display = 'none';
    }
    
    // Cargar categorías para esta área
    await loadCategorias(areaNombre, areaId);
    
    // Mostrar selector de categorías
    if (categoriaContainer) {
      console.log('[VIEW] Mostrando contenedor de categorías...');
      categoriaContainer.style.display = 'block';
      console.log('[OK] Contenedor visible. Display:', categoriaContainer.style.display);
      console.log('📏 Altura del contenedor:', categoriaContainer.offsetHeight, 'px');
    } else {
      console.error('[ERROR] categoriaContainer NO existe!');
    }
  }

  // Cargar categorías de un área
  async function loadCategorias(areaNombre, areaId) {
    try {
      console.log('[FOLDER] Cargando categorías para área:', areaNombre);
      
      // Obtener categorías del menú actual (dinámicamente desde los platillos)
      const platillosDelArea = menuItems.filter(item => 
        item.area.toLowerCase() === areaNombre.toLowerCase()
      );
      
      const categoriasEnUso = [...new Set(
        platillosDelArea
          .map(p => p.categoria)
          .filter(c => c && c !== 'null' && c !== '')
      )];
      
      console.log('[INFO] Categorías encontradas dinámicamente:', categoriasEnUso);
      
      // Ordenar alfabéticamente
      const categorias = categoriasEnUso.sort((a, b) => a.localeCompare(b));
      
      // También agregar "Sin Categoría" si hay platillos sin categoría
      const sinCategoria = platillosDelArea.some(p => !p.categoria || p.categoria === '');
      if (sinCategoria) {
        categorias.push('Sin Categoría');
      }
      
      categoriasPorArea[areaNombre] = categorias;
      
      // Crear botones de categorías
      if (categoriaButtonsContainer && categorias.length > 0) {
        console.log('🔧 Creando botones de categoría...');
        categoriaButtonsContainer.innerHTML = '';
        categorias.forEach(cat => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'categoria-button';
          button.dataset.categoria = cat;
          button.textContent = cat;
          
          button.addEventListener('click', () => selectCategoria(cat));
          
          categoriaButtonsContainer.appendChild(button);
          console.log('  [ADD] Botón creado:', cat);
        });
        console.log('[OK] Botones agregados al contenedor. Total:', categoriaButtonsContainer.children.length);
        console.log('📐 Contenedor visible:', categoriaButtonsContainer.offsetHeight, 'px');
      } else if (categoriaButtonsContainer) {
        categoriaButtonsContainer.innerHTML = '<p style="color: var(--muted);">No hay categorías disponibles</p>';
      } else {
        console.error('[ERROR] categoriaButtonsContainer NO existe!');
      }
      
      console.log('[OK] Categorías cargadas como botones:', categorias);
    } catch (error) {
      console.error('[ERROR] Error al cargar categorías:', error);
      if (categoriaSelect) {
        categoriaSelect.innerHTML = '<option value="">Error al cargar</option>';
      }
    }
  }

  // Seleccionar categoría
  function selectCategoria(categoria) {
    console.log('[FOLDER] Categoría seleccionada:', categoria);
    
    selectedCategoria = categoria;
    
    // Actualizar UI de botones de categoría
    document.querySelectorAll('.categoria-button').forEach(btn => {
      if (btn.dataset.categoria === categoria) {
        btn.classList.add('active');
        btn.classList.remove('disabled');
      } else {
        btn.classList.remove('active');
        btn.classList.add('disabled');
      }
    });
    
    // Cargar platillos
    loadPlatillosPorCategoria(categoria);
  }

  // Cargar platillos por categoría
  function loadPlatillosPorCategoria(categoria) {
    console.log('🍽️ Cargando platillos para categoría:', categoria, 'en área:', selectedArea ? selectedArea.nombre : 'ninguna');
    console.log('[DATA] Total de platillos en menú:', menuItems.length);
    
    if (!selectedArea) {
      console.error('[ERROR] No hay área seleccionada');
      return;
    }
    
    let platillosFiltrados;
    
    if (categoria === 'Sin Categoría') {
      // Mostrar platillos sin categoría
      platillosFiltrados = menuItems.filter(item => {
        const match = item.area.toLowerCase() === selectedArea.nombre.toLowerCase() &&
          (!item.categoria || item.categoria === '' || item.categoria === 'null') &&
          item.disponible;
        if (match) {
          console.log('✓ Platillo sin categoría encontrado:', item.nombre);
        }
        return match;
      });
    } else {
      // Filtrar por área y categoría
      platillosFiltrados = menuItems.filter(item => {
        const areaMatch = item.area.toLowerCase() === selectedArea.nombre.toLowerCase();
        const categoriaMatch = item.categoria === categoria;
        const disponibleMatch = item.disponible;
        
        if (areaMatch && disponibleMatch) {
          console.log(`  Platillo "${item.nombre}": área=${areaMatch}, categoría="${item.categoria}" (buscando "${categoria}") = ${categoriaMatch}`);
        }
        
        return areaMatch && categoriaMatch && disponibleMatch;
      });
    }
    
    console.log('[STATS] Platillos filtrados:', platillosFiltrados.length);
    console.log('[INFO] Platillos encontrados:', platillosFiltrados);
    
    // Crear botones de platillos
    if (platilloButtonsContainer) {
      platilloButtonsContainer.innerHTML = '';
      
      if (platillosFiltrados.length > 0) {
        platillosFiltrados.forEach(platillo => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'platillo-button';
          button.dataset.id = platillo.id;
          button.dataset.nombre = platillo.nombre;
          button.dataset.precio = platillo.precio;
          
          const nombreSpan = document.createElement('span');
          nombreSpan.className = 'nombre';
          nombreSpan.textContent = platillo.nombre;
          
          const precioSpan = document.createElement('span');
          precioSpan.className = 'precio';
          precioSpan.textContent = `Q${parseFloat(platillo.precio).toFixed(2)}`;
          
          button.appendChild(nombreSpan);
          button.appendChild(precioSpan);
          
          button.addEventListener('click', () => selectPlatillo(platillo));
          
          platilloButtonsContainer.appendChild(button);
        });
      } else {
        platilloButtonsContainer.innerHTML = '<p style="color: var(--warning); padding: 1rem; background: #fff3cd; border-radius: var(--r-sm); border: 1px solid #ffc107;">[WARN] No hay platillos disponibles en esta categoría</p>';
      }
    }
    
    // Mostrar contenedor de platillos
    if (platilloContainer) {
      platilloContainer.style.display = 'block';
    }
  }
  
  // Seleccionar platillo
  function selectPlatillo(platillo) {
    console.log('🍽️ Platillo seleccionado:', platillo.nombre);
    
    // Actualizar UI de botones
    document.querySelectorAll('.platillo-button').forEach(btn => {
      if (btn.dataset.id == platillo.id) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Actualizar precio y calcular subtotal
    if (precio) {
      precio.value = parseFloat(platillo.precio).toFixed(2);
    }
    calculateSubtotal();
    
    // Guardar selección actual para agregar a la orden
    window.currentPlatilloSelected = platillo;
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
              categoria: p.categoria || '', // Incluir categoría
              disponible: p.disponible !== undefined ? p.disponible : true
            }));
            return acc.concat(platillosConArea);
          }
          return acc;
        }, []);
      } else {
        menuItems = [];
      }
      
      console.log('[OK] Menú cargado:', menuItems.length, 'platillos');
      console.log('[STATS] Muestra de platillos:', menuItems.slice(0, 5));
      
      // Log de estadísticas
      const stats = {
        total: menuItems.length,
        conCategoria: menuItems.filter(p => p.categoria && p.categoria !== '').length,
        sinCategoria: menuItems.filter(p => !p.categoria || p.categoria === '').length,
        porArea: {}
      };
      
      menuItems.forEach(p => {
        if (!stats.porArea[p.area]) {
          stats.porArea[p.area] = { total: 0, conCategoria: 0 };
        }
        stats.porArea[p.area].total++;
        if (p.categoria && p.categoria !== '') {
          stats.porArea[p.area].conCategoria++;
        }
      });
      
      console.log('📈 Estadísticas del menú:', stats);
    } catch (error) {
      handleError(error, 'Error al cargar menú');
    }
  }

  // Configurar event listeners
  function setupEventListeners() {
    // Evitar configurar listeners múltiples veces
    if (listenersConfigured) {
      console.log('[WARN] Listeners ya configurados, saltando...');
      return;
    }

    console.log('🔧 Configurando event listeners...');

    if (cantidad) {
      cantidad.removeEventListener('input', calculateSubtotal);
      cantidad.addEventListener('input', calculateSubtotal);
    }

    // Botón agregar - usar selector específico y remover listener previo
    const btnAgregar = document.querySelector('.btn-success');
    if (btnAgregar) {
      console.log('[TARGET] Configurando botón Agregar');
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
      console.log('[OK] Event delegation configurado para botones de tabla');
    }

    listenersConfigured = true;
    console.log('[OK] Listeners configurados');
  }

  // Manejar cambio de área
  // Manejar cambio de categoría
  function handleCategoriaChange(e) {
    const categoria = e.target.value;
    console.log('[FOLDER] Categoría seleccionada:', categoria);
    
    if (!categoria || categoria === '') {
      // Ocultar selector de platillos si no hay categoría
      if (platilloContainer) {
        platilloContainer.style.display = 'none';
      }
      // Limpiar precio y subtotal
      if (precio) precio.value = '';
      if (subtotal) subtotal.value = '';
      return;
    }
    
    // Cargar platillos de esta categoría
    loadPlatillosPorCategoria(categoria);
    
    // Limpiar precio y subtotal
    if (precio) precio.value = '';
    if (subtotal) subtotal.value = '';
  }

  // Esta función ya no se usa (antes usábamos select de áreas)
  // Ahora usamos botones de área + selectArea()
  /*
  function handleAreaChange(e) {
    const selectedArea = e.target.value;
    // ... código anterior ...
  }
  */

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
        console.log('[OK] Botón Agregar habilitado');
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
      console.log('[WARN] Ya se está agregando un item, ignorando click duplicado');
      return;
    }
    
    isAddingItem = true;
    console.log('[ADD] addItemToOrder() llamado');
    console.log('[DATA] Items actuales antes de agregar:', currentOrder.items.length);
    console.log('[INFO] Filas en la tabla antes:', tablaBody?.children.length || 0);
    
    try {
      // Validaciones
      if (!window.currentPlatilloSelected) {
        showNotification('Selecciona un platillo', 'error');
        return;
      }

      const platillo = window.currentPlatilloSelected;

      if (!cantidad?.value || parseInt(cantidad.value) <= 0) {
        showNotification('Ingresa una cantidad válida', 'error');
        return;
      }

      // Obtener datos del item
      const item = {
        platilloId: platillo.id,
        nombre: platillo.nombre,
        area: selectedArea?.nombre || selectedArea || '',
        categoria: selectedCategoria || platillo.categoria || '',
        cantidad: parseInt(cantidad.value),
        precio: parseFloat(platillo.precio),
        observaciones: observaciones?.value || '',
        observacionExtra: extraObservacion?.value || '',
        precioExtra: parseFloat(extraPrecio?.value || 0),
        subtotal: parseFloat(subtotal.value)
      };
      
      console.log('[DATA] Item creado con categoría:', item.categoria);

      console.log('[NEW] Item:', item);

      // Verificar si estamos editando o agregando
      if (editingItemIndex >= 0 && editingItemIndex < currentOrder.items.length) {
        // EDITAR: Reemplazar item existente, pero preservar id_comanda si existe
        console.log(`[EDIT] Reemplazando item en índice ${editingItemIndex}`);
        const oldItem = currentOrder.items[editingItemIndex];
        
        // Preservar id_comanda del item original (si existe)
        if (oldItem.id_comanda) {
          item.id_comanda = oldItem.id_comanda;
          console.log(`📌 Preservando id_comanda: ${item.id_comanda}`);
        }
        
        currentOrder.items[editingItemIndex] = item;
        console.log('[DATA] Items después de editar:', currentOrder.items.length);
        showNotification('Platillo actualizado', 'success');
      } else {
        // AGREGAR: Nuevo item
        console.log('[ADD] Agregando nuevo item');
        currentOrder.items.push(item);
        console.log('[DATA] Items después de agregar:', currentOrder.items.length);
        showNotification('Platillo agregado a la orden', 'success');
      }
      
      // Re-renderizar toda la tabla desde cero (evita duplicados)
      console.log('[LOAD] Re-renderizando tabla completa...');
      updateOrderTable();
      console.log('[INFO] Filas en la tabla después:', tablaBody?.children.length || 0);

      // Calcular total
      updateTotal();

      // Limpiar formulario
      clearItemForm();

      console.log('[OK] Operación completada exitosamente');
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
    
    // Determinar si el item está bloqueado (confirmado en KDS)
    const bloqueado = item.bloqueado || false;
    const estadoKDS = item.estado_kds;
    const enKDS = item.en_kds || false;
    
    console.log(`[RENDER] Renderizando "${item.nombre}":`, {
      bloqueado,
      estadoKDS,
      enKDS,
      mostraraBotonesBloqueados: bloqueado ? 'SÍ' : 'NO'
    });

    const row = document.createElement('tr');
    
    // Estilo de fila según estado (sin badge redundante)
    if (bloqueado && estadoKDS === 'Preparado') {
      row.style.background = '#f0fdf4'; // Verde muy claro
      row.style.borderLeft = '4px solid #10B981'; // Borde verde
    } else if (enKDS && estadoKDS === 'Pendiente') {
      row.style.background = '#fffbeb'; // Amarillo muy claro
      row.style.borderLeft = '4px solid #f59e0b'; // Borde amarillo
    }
    
    // Botones de acción (deshabilitados si está bloqueado)
    const botonesAccion = bloqueado ? `
      <button type="button" class="btn-locked" disabled style="background: #9CA3AF; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: not-allowed; font-size: 0.8rem; opacity: 0.7;">
        🔒 Confirmado
      </button>
    ` : `
      <button type="button" class="btn-editar-item" data-index="${index}" title="Editar platillo">
        Editar
      </button>
      <button type="button" class="btn-eliminar-item" data-index="${index}" title="Eliminar platillo">
        Eliminar
      </button>
    `;
    
    row.innerHTML = `
      <td data-label="Cantidad">${cantidad}</td>
      <td data-label="Platillo">${item.nombre || '—'}</td>
      <td data-label="Observaciones">${item.observaciones || '—'}</td>
      <td data-label="Precio">Q${precio.toFixed(2)}</td>
      <td data-label="Observacion Extra">${item.observacionExtra || '—'}</td>
      <td data-label="Precio Extra">Q${precioExtra.toFixed(2)}</td>
      <td data-label="Subtotal">Q${subtotal.toFixed(2)}</td>
      <td data-label="Acciones" class="acciones-cell">
        ${botonesAccion}
      </td>
    `;

    tablaBody.appendChild(row);
  }

  // Actualizar tabla completa con todos los items
  function updateOrderTable() {
    if (!tablaBody) {
      console.log('[WARN] No se encontró tablaBody');
      return;
    }

    console.log('[CLEAN] Limpiando tabla...');
    console.log('[STATS] Filas antes de limpiar:', tablaBody.children.length);
    
    // Limpiar tabla
    tablaBody.innerHTML = '';
    
    console.log('[STATS] Filas después de limpiar:', tablaBody.children.length);
    console.log('[DATA] Total items en currentOrder:', currentOrder.items.length);

    // Agregar todos los items
    currentOrder.items.forEach((item, index) => {
      console.log(`[ADD] Agregando item ${index + 1}:`, item.nombre);
      addItemToTable(item, index);
    });
    
    console.log('[STATS] Filas después de agregar todos:', tablaBody.children.length);
    console.log('[OK] Tabla actualizada completamente');
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
    // Resetear selecciones de área, categoría y platillo
    selectedArea = null;
    selectedCategoria = null;
    
    // Limpiar botones de área
    document.querySelectorAll('.area-button').forEach(btn => btn.classList.remove('active', 'selected'));
    
    // Limpiar botones de categoría
    document.querySelectorAll('.categoria-button').forEach(btn => btn.classList.remove('active', 'selected'));
    
    // Limpiar botones de platillo
    document.querySelectorAll('.platillo-button').forEach(btn => btn.classList.remove('active', 'selected'));
    
    // Ocultar contenedores
    if (categoriaContainer) categoriaContainer.style.display = 'none';
    if (platilloContainer) platilloContainer.style.display = 'none';
    
    // Limpiar campos
    if (cantidad) cantidad.value = '1';
    if (precio) precio.value = '';
    if (observaciones) observaciones.value = '';
    if (extraObservacion) extraObservacion.value = '';
    if (extraPrecio) extraPrecio.value = '';
    if (subtotal) subtotal.value = '';
    
    editingItemIndex = -1; // Resetear índice de edición
  }

  // Editar un item existente
  function editItem(index) {
    console.log(`[EDIT] Editando item en índice ${index}`);
    
    const item = currentOrder.items[index];
    if (!item) {
      console.error('[ERROR] Item no encontrado en índice:', index);
      return;
    }
    
    // Verificar si el item está bloqueado (confirmado en KDS)
    if (item.bloqueado || (item.estado_kds === 'Preparado')) {
      Toast.warning(`No se puede editar "${item.nombre}" porque ya fue confirmado en cocina`, 5000);
      console.warn('[LOCK] Item bloqueado - No se puede editar');
      return;
    }

    // Cargar datos del item en el formulario
    editingItemIndex = index;

    console.log(`[LOAD] Cargando datos del item:`, {
      area: item.area,
      categoria: item.categoria,
      platillo: item.nombre,
      platilloId: item.platilloId,
      cantidad: item.cantidad
    });

    // PASO 1: Seleccionar área (botón) y cargar categorías
    if (item.area) {
      console.log(`[LOAD] Buscando botón de área: ${item.area}`);
      const areaBtns = document.querySelectorAll('.area-button');
      console.log(`[CHECK] Botones de área encontrados: ${areaBtns.length}`);
      let areaEncontrada = false;
      
      areaBtns.forEach(btn => {
        btn.classList.remove('active', 'selected');
        const btnText = btn.textContent.trim();
        console.log(`[COMPARE] Comparando "${btnText}" con "${item.area}"`);
        
        if (btnText === item.area) {
          btn.classList.add('active', 'selected');
          selectedArea = { nombre: item.area, id: btn.dataset.areaId }; // Establecer en estado ANTES del click
          btn.click(); // Simular click para cargar categorías
          areaEncontrada = true;
          console.log(`[OK] Área seleccionada: ${item.area}`);
        }
      });
      
      if (!areaEncontrada) {
        console.error(`[ERROR] No se encontró botón para área: ${item.area}`);
        console.log(`[INFO] Áreas disponibles:`, Array.from(areaBtns).map(b => b.textContent.trim()));
      }
    }

    // PASO 2: Esperar MÁS TIEMPO a que se carguen las categorías
    setTimeout(() => {
      console.log(`[WAIT] Esperando categorías... Verificando botones disponibles`);
      const categoriaBtns = document.querySelectorAll('.categoria-btn');
      console.log(`[CHECK] Botones de categoría encontrados: ${categoriaBtns.length}`);
      // Buscar la categoría del platillo en el menú
      let categoriaDelPlatillo = item.categoria;
      
      // Si no tiene categoría, buscarla en el menú
      if (!categoriaDelPlatillo && item.platilloId) {
        const platilloEnMenu = menuItems.find(p => p.id === parseInt(item.platilloId));
        if (platilloEnMenu) {
          categoriaDelPlatillo = platilloEnMenu.categoria;
          console.log(`[FIND] Categoría encontrada en menú: ${categoriaDelPlatillo}`);
        }
      }
      
      if (categoriaDelPlatillo) {
        console.log(`[LOAD] Buscando botón de categoría: ${categoriaDelPlatillo}`);
        const categoriaBtns = document.querySelectorAll('.categoria-button');
        console.log(`[CHECK] Botones de categoría encontrados después de espera: ${categoriaBtns.length}`);
        let categoriaEncontrada = false;
        
        categoriaBtns.forEach(btn => {
          btn.classList.remove('active', 'selected');
          const btnText = btn.textContent.trim();
          console.log(`[COMPARE] Comparando categoría "${btnText}" con "${categoriaDelPlatillo}"`);
          
          if (btnText === categoriaDelPlatillo) {
            btn.classList.add('active', 'selected');
            selectedCategoria = categoriaDelPlatillo; // Establecer en estado
            btn.click(); // Simular click para cargar platillos
            categoriaEncontrada = true;
            console.log(`[OK] Categoría seleccionada: ${categoriaDelPlatillo}`);
          }
        });
        
        if (!categoriaEncontrada) {
          console.warn(`[WARN] No se encontró botón para categoría: ${categoriaDelPlatillo}`);
          console.log(`[INFO] Categorías disponibles:`, Array.from(categoriaBtns).map(b => b.textContent.trim()));
        }
      } else {
        console.warn(`[WARN] Item no tiene categoría definida, continuando sin seleccionar categoría`);
      }
      
      // PASO 3: Esperar AÚN MÁS para que se carguen los platillos
      setTimeout(() => {
        console.log(`[WAIT] Esperando platillos... Verificando botones disponibles`);
        const platilloBtns = document.querySelectorAll('.platillo-btn');
        console.log(`[CHECK] Botones de platillo encontrados: ${platilloBtns.length}`);
        if (item.platilloId) {
          console.log(`[LOAD] Buscando botón de platillo ID: ${item.platilloId}`);
          const platilloBtns = document.querySelectorAll('.platillo-button');
          console.log(`[CHECK] Botones de platillo encontrados después de espera: ${platilloBtns.length}`);
          
          platilloBtns.forEach(btn => {
            btn.classList.remove('active', 'selected');
            const btnPlatilloId = btn.dataset.id; // Usar .id en lugar de .platilloId
            console.log(`[COMPARE] Comparando platillo ID "${btnPlatilloId}" con "${item.platilloId}"`);
            
            if (btnPlatilloId && parseInt(btnPlatilloId) === parseInt(item.platilloId)) {
              btn.classList.add('active', 'selected');
              
              // Simular click para cargar precio
              btn.click();
              
              // Destacar visualmente con animación SIN cambiar el fondo
              // (el CSS ya aplica gradiente naranja cuando está .active)
              btn.style.transform = 'scale(1.08)';
              btn.style.boxShadow = '0 6px 16px rgba(255, 152, 0, 0.4)';
              btn.style.borderWidth = '3px';
              
              setTimeout(() => {
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = '0 4px 10px rgba(255, 152, 0, 0.3)';
                btn.style.borderWidth = '2px';
              }, 2000);
              
              console.log(`[OK] Platillo seleccionado y destacado: ${item.nombre}`);
            }
          });
        }
        
        // PASO 4: Llenar campos numéricos y texto
        setTimeout(() => {
          if (cantidad) {
            cantidad.value = item.cantidad;
            cantidad.style.borderColor = '#2563EB';
            cantidad.style.background = '#EFF6FF';
          }
          
          if (precio) {
            precio.value = parseFloat(item.precio).toFixed(2);
          }
          
          if (observaciones) {
            observaciones.value = item.observaciones || '';
          }
          
          if (extraObservacion) {
            extraObservacion.value = item.observacionExtra || '';
          }
          
          if (extraPrecio) {
            extraPrecio.value = item.precioExtra ? parseFloat(item.precioExtra).toFixed(2) : '';
          }
          
          // Calcular subtotal
          calculateSubtotal();
          
          // Scroll al formulario
          const formElement = document.querySelector('.seccion_comanda');
          if (formElement) {
            formElement.style.borderColor = '#2563EB';
            formElement.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Quitar destacado después de 3 segundos
            setTimeout(() => {
              formElement.style.borderColor = '';
              formElement.style.boxShadow = '';
              if (cantidad) {
                cantidad.style.borderColor = '';
                cantidad.style.background = '';
              }
            }, 3000);
          }
          
          Toast.info(`Editando: ${item.nombre}. Modifica los campos y presiona "Agregar" para actualizar`, 5000);
          console.log('[NOTE] Datos cargados para edición completamente');
        }, 200);
      }, 700);
    }, 600);
  }

  // Eliminar un item
  async function deleteItem(index) {
    console.log(`[DELETE] Eliminando item en índice ${index}`);
    
    const item = currentOrder.items[index];
    if (!item) {
      console.error('[ERROR] Item no encontrado en índice:', index);
      return;
    }
    
    // Verificar si el item está bloqueado (confirmado en KDS)
    if (item.bloqueado || (item.estado_kds === 'Preparado')) {
      Toast.error(`No se puede eliminar "${item.nombre}" porque ya fue confirmado en cocina`, 5000);
      console.warn('[LOCK] Item bloqueado - No se puede eliminar');
      return;
    }

    // Confirmar eliminación
    const confirmed = await showConfirm(`¿Eliminar "${item.nombre}" de la orden?`, {
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });
    
    if (!confirmed) {
      console.log('[CANCEL] Eliminación cancelada por el usuario');
      return;
    }

    console.log(`[START] Iniciando eliminación de "${item.nombre}"...`);

    try {
      // Si el item existe en la BD (tiene id_comanda), eliminarlo del backend inmediatamente
      if (item.id_comanda && editMode && editOrderId) {
        console.log(`[API] Eliminando item de la BD: id_comanda=${item.id_comanda}`);
        await API.orders.deleteItem(editOrderId, item.id_comanda);
        console.log('[OK] Item eliminado del backend exitosamente');
      } else {
        console.log('[NOTE] Item solo existe en frontend, no requiere eliminación en BD');
      }

      // Remover del array local
      const itemNombre = item.nombre;
      currentOrder.items.splice(index, 1);
      console.log(`[OK] Item "${itemNombre}" eliminado del array`);
      console.log(`[STATS] Items restantes: ${currentOrder.items.length}`);

      // Si estábamos editando este item, cancelar edición
      if (editingItemIndex === index) {
        console.log('[EDIT] Cancelando edición del item eliminado');
        editingItemIndex = -1;
        clearItemForm();
      } else if (editingItemIndex > index) {
        // Ajustar índice si estábamos editando un item posterior
        editingItemIndex--;
        console.log(`[EDIT] Índice de edición ajustado a: ${editingItemIndex}`);
      }

      // FORZAR actualización de vista
      console.log('[UPDATE] Actualizando tabla...');
      
      // Limpiar tabla completamente
      if (tablaBody) {
        tablaBody.innerHTML = '';
        console.log('[CLEAN] Tabla limpiada');
      }
      
      // Re-renderizar todos los items
      updateOrderTable();
      updateTotal();
      
      console.log('[OK] Vista actualizada - Tabla debería estar limpia');
      
      // Notificación de éxito
      Toast.success(`"${itemNombre}" eliminado de la orden`, 3000);
      
      console.log('[COMPLETE] Eliminación completada exitosamente');
    } catch (error) {
      console.error('[ERROR] Error al eliminar item:', error);
      console.error('[STACK] Stack trace:', error.stack);
      Toast.error(`Error al eliminar "${item.nombre}": ${error.message}`, 6000);
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
      let itemsToSend = currentOrder.items;
      
      // Si estamos en modo edición, filtrar solo los items que NO están bloqueados
      if (editMode && editOrderId) {
        // Filtrar items: solo enviar los que NO están bloqueados (preparados)
        const itemsNoBloqueados = currentOrder.items.filter(item => !item.bloqueado);
        const itemsBloqueados = currentOrder.items.filter(item => item.bloqueado);
        
        console.log(`[FILTER] Total items: ${currentOrder.items.length}`);
        console.log(`[FILTER] Items bloqueados (preparados): ${itemsBloqueados.length}`);
        console.log(`[FILTER] Items a enviar (nuevos/editables): ${itemsNoBloqueados.length}`);
        
        if (itemsBloqueados.length > 0) {
          console.log('[INFO] Items bloqueados que se mantendrán:', itemsBloqueados.map(i => i.nombre));
        }
        
        itemsToSend = itemsNoBloqueados;
      }
      
      const orderData = {
        no_mesa: mesa.value,  // Backend espera 'no_mesa'
        items: itemsToSend.map(item => ({
          id_platillo: item.platilloId,  // Backend espera 'id_platillo'
          cantidad: item.cantidad,
          observaciones: item.observaciones || null,
          extra_observacion: item.observacionExtra || null,
          extra_precio: item.precioExtra || 0
        }))
      };

      // Si estamos en modo edición, agregar flag para reemplazar todos los items editables
      if (editMode && editOrderId) {
        orderData.replaceAllItems = true;
        console.log(`[NOTE] Actualizando orden - Enviando ${itemsToSend.length} items (${currentOrder.items.length - itemsToSend.length} bloqueados se mantienen)`);
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
          window.location.href = '/templates/mesero/comanda-control?refresh=1&t=' + Date.now();
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
        setTimeout(async () => {
          const enviarACocina = await showConfirm('¿Deseas enviar la orden a cocina ahora?', {
            confirmText: 'Enviar a cocina',
            cancelText: 'Más tarde'
          });
          
          if (enviarACocina) {
            sendOrderToKDS(ordenId);
          } else {
            // Redirigir a comanda-control para ver la orden creada
            window.location.href = '/templates/mesero/comanda-control?refresh=1&t=' + Date.now();
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
        window.location.href = '/templates/mesero/comanda-control?refresh=1&t=' + Date.now();
      }, 1000);
    } catch (error) {
      handleError(error, 'Error al enviar orden a cocina');
    }
  }

  // Resetear formulario
  async function resetForm() {
    console.log('[LOAD] Reseteando formulario...');
    
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
    
    console.log('[OK] Formulario reseteado');
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

