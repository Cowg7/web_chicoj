// Script para crear/editar tours (tour.html)
console.log('[START] tour.js CARGADO - Versión 20251025c');

(function() {
  console.log('🎬 Iniciando IIFE de tour.js');
  
  // Elementos del DOM
  const $ = function(id) { return document.getElementById(id); };
  
  const form = $('form-ticket');
  const inputs = {
    id: $('id-tour'),
    fecha: $('fecha'),
    servicio: $('servicio'),
    precioServicio: $('precio-servicio'),
    tipo: $('tipo'),
    cantidadVisitante: $('cantidad-visitante'),
    idioma: $('idioma'),
    observaciones: $('observaciones'),
    precioTotal: $('precio-total')
  };

  // Estado
  let editMode = false;
  let tourId = null;

  // Inicializar
  async function init() {
    console.log('🏁 init() ejecutándose...');
    console.log('🔗 URL actual:', window.location.href);
    
    // Verificar autenticación
    console.log('[SECURE] Verificando autenticación...');
    if (!AuthManager.isAuthenticated()) {
      console.log('[ERROR] No autenticado, redirigiendo a login');
      window.location.href = '/templates/login';
      return;
    }
    console.log('[OK] Usuario autenticado');

    // Configurar fecha actual por defecto y máxima
    if (inputs.fecha) {
      const todayStr = new Date().toISOString().split('T')[0];
      inputs.fecha.value = todayStr;
      inputs.fecha.max = todayStr; // No permitir fechas futuras
      console.log('📅 Fecha configurada (hoy como máximo):', inputs.fecha.value);
    }

    // Verificar si estamos en modo edición
    const urlParams = new URLSearchParams(window.location.search);
    tourId = urlParams.get('id');
    
    console.log('[CHECK] Parámetros de URL:', {
      'search completo': window.location.search,
      'id extraído': tourId,
      'todos los params': Object.fromEntries(urlParams)
    });

    if (tourId) {
      console.log('[EDIT] MODO EDICIÓN ACTIVADO - ID:', tourId);
      editMode = true;
      await loadTour(tourId);
    } else {
      console.log('[ADD] MODO CREACIÓN - No hay ID en la URL');
    }

    // Event listeners
    console.log('🎧 Configurando event listeners...');
    setupEventListeners();
    console.log('[OK] init() completado');
  }

  // Cargar datos del tour
  async function loadTour(id) {
    try {
      console.log('[RECEIVE] Cargando tour para editar, ID:', id);
      console.log('[CHECK] Verificando inputs del DOM:', {
        'id': inputs.id ? 'OK' : 'FALTA',
        'fecha': inputs.fecha ? 'OK' : 'FALTA',
        'servicio': inputs.servicio ? 'OK' : 'FALTA',
        'precioServicio': inputs.precioServicio ? 'OK' : 'FALTA',
        'tipo': inputs.tipo ? 'OK' : 'FALTA',
        'cantidadVisitante': inputs.cantidadVisitante ? 'OK' : 'FALTA',
        'idioma': inputs.idioma ? 'OK' : 'FALTA',
        'observaciones': inputs.observaciones ? 'OK' : 'FALTA',
        'precioTotal': inputs.precioTotal ? 'OK' : 'FALTA'
      });
      
      const response = await API.tour.getById(id);
      console.log('[DATA] Respuesta completa del servidor:', JSON.stringify(response, null, 2));
      
      const data = response.data || response;
      console.log('[STATS] Data extraída:', JSON.stringify(data, null, 2));
      
      const tour = data.tour || data;
      console.log('🎫 Tour objeto final:', JSON.stringify(tour, null, 2));
      console.log('[AUTH] Campos del tour:', {
        'id_tour': tour.id_tour,
        'fecha': tour.fecha,
        'nombre_servicio': tour.nombre_servicio,
        'precio_servicio': tour.precio_servicio,
        'tipo_visitante': tour.tipo_visitante,
        'cantidad_visitante': tour.cantidad_visitante,
        'idioma': tour.idioma,
        'observaciones': tour.observaciones
      });

      if (tour && tour.id_tour) {
        console.log('[OK] Tour encontrado, cargando campos...');
        
        if (inputs.id) {
          inputs.id.value = tour.id_tour;
          console.log('  ✓ ID cargado:', inputs.id.value);
        } else {
          console.warn('  [WARN] Campo id no encontrado en DOM');
        }
        
        if (inputs.fecha) {
          inputs.fecha.value = tour.fecha ? tour.fecha.split('T')[0] : '';
          console.log('  ✓ Fecha cargada:', inputs.fecha.value);
        } else {
          console.warn('  [WARN] Campo fecha no encontrado en DOM');
        }
        
        if (inputs.servicio) {
          inputs.servicio.value = tour.nombre_servicio || '';
          console.log('  ✓ Servicio cargado:', inputs.servicio.value);
        } else {
          console.warn('  [WARN] Campo servicio no encontrado en DOM');
        }
        
        if (inputs.precioServicio) {
          inputs.precioServicio.value = tour.precio_servicio || '';
          console.log('  ✓ Precio servicio cargado:', inputs.precioServicio.value);
        } else {
          console.warn('  [WARN] Campo precioServicio no encontrado en DOM');
        }
        
        if (inputs.tipo) {
          inputs.tipo.value = tour.tipo_visitante || '';
          console.log('  ✓ Tipo cargado:', inputs.tipo.value);
        } else {
          console.warn('  [WARN] Campo tipo no encontrado en DOM');
        }
        
        if (inputs.cantidadVisitante) {
          inputs.cantidadVisitante.value = tour.cantidad_visitante || '';
          console.log('  ✓ Cantidad cargada:', inputs.cantidadVisitante.value);
        } else {
          console.warn('  [WARN] Campo cantidadVisitante no encontrado en DOM');
        }
        
        if (inputs.idioma) {
          inputs.idioma.value = tour.idioma || '';
          console.log('  ✓ Idioma cargado:', inputs.idioma.value);
        } else {
          console.warn('  [WARN] Campo idioma no encontrado en DOM');
        }
        
        if (inputs.observaciones) {
          inputs.observaciones.value = tour.observaciones || '';
          console.log('  ✓ Observaciones cargadas:', inputs.observaciones.value);
        } else {
          console.warn('  [WARN] Campo observaciones no encontrado en DOM');
        }
        
        // Calcular precio total
        calculateTotal();
        console.log('  ✓ Precio total calculado:', inputs.precioTotal ? inputs.precioTotal.value : 'N/A');
        
        console.log('[OK] Todos los campos cargados correctamente');
        showNotification('Tour cargado para edición', 'info');
      } else {
        console.error('[ERROR] No se encontró el tour o falta id_tour');
        showNotification('No se pudo cargar el tour', 'error');
      }
    } catch (error) {
      console.error('[ERROR] Error completo al cargar tour:', error);
      console.error('Stack trace:', error.stack);
      showNotification('Error al cargar tour: ' + error.message, 'error');
    }
  }

  // Configurar event listeners
  function setupEventListeners() {
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }

    // Calcular precio automáticamente
    if (inputs.precioServicio && inputs.cantidadVisitante) {
      inputs.precioServicio.addEventListener('input', calculateTotal);
      inputs.cantidadVisitante.addEventListener('input', calculateTotal);
    }
  }

  // Calcular precio total
  function calculateTotal() {
    let precioPorPersona = parseFloat(inputs.precioServicio ? inputs.precioServicio.value : 0);
    let cantidad = parseInt(inputs.cantidadVisitante ? inputs.cantidadVisitante.value : 0);
    
    // Validar que sean números positivos
    if (isNaN(precioPorPersona) || precioPorPersona < 0) {
      precioPorPersona = 0;
    }
    
    if (isNaN(cantidad) || cantidad < 0) {
      cantidad = 0;
    }
    
    const total = precioPorPersona * cantidad;
    
    if (inputs.precioTotal) {
      inputs.precioTotal.value = total.toFixed(2);
    }
  }

  // Manejar envío del formulario
  async function handleSubmit(e) {
    e.preventDefault();

    console.log('[LOAD] Iniciando envío del formulario...');
    console.log('[OK] VERSIÓN LIMPIA DE TOUR.JS (v20251024h)');

    // Validaciones
    if (!inputs.fecha || !inputs.fecha.value) {
      showNotification('Ingresa la fecha', 'error');
      return;
    }

    if (!inputs.servicio || !inputs.servicio.value) {
      showNotification('Selecciona el tipo de servicio', 'error');
      return;
    }

    // Validar precio por persona
    const precioServicio = parseFloat(inputs.precioServicio.value);
    if (!inputs.precioServicio || !inputs.precioServicio.value || isNaN(precioServicio) || precioServicio < 0) {
      showNotification('Ingresa un precio válido por persona (solo números positivos)', 'error');
      inputs.precioServicio.classList.add('error');
      inputs.precioServicio.focus();
      return;
    }
    inputs.precioServicio.classList.remove('error');

    if (!inputs.tipo || !inputs.tipo.value) {
      showNotification('Selecciona el tipo de visitante', 'error');
      return;
    }

    // Validar cantidad de visitantes
    const cantidadVisitante = parseInt(inputs.cantidadVisitante.value);
    if (!inputs.cantidadVisitante || !inputs.cantidadVisitante.value || isNaN(cantidadVisitante) || cantidadVisitante < 1 || !Number.isInteger(cantidadVisitante)) {
      showNotification('Ingresa una cantidad válida de visitantes (solo números enteros positivos, mínimo 1)', 'error');
      inputs.cantidadVisitante.classList.add('error');
      inputs.cantidadVisitante.focus();
      return;
    }
    inputs.cantidadVisitante.classList.remove('error');

    if (!inputs.idioma || !inputs.idioma.value.trim()) {
      showNotification('Ingresa el idioma', 'error');
      return;
    }

    // DEBUG: Verificar valores de inputs
    console.log('[CHECK] DEBUG - Valores de inputs:', {
      fecha: inputs.fecha.value,
      servicio: inputs.servicio.value,
      precioServicio: inputs.precioServicio.value,
      tipo: inputs.tipo.value,
      cantidadVisitante: inputs.cantidadVisitante.value,
      idioma: inputs.idioma.value,
      observaciones: inputs.observaciones ? inputs.observaciones.value : ''
    });

    // Preparar datos para el backend (asegurarse de valores positivos)
    const tourData = {
      fecha: inputs.fecha.value,
      nombre_servicio: inputs.servicio.value,
      precio_servicio: Math.abs(parseFloat(inputs.precioServicio.value)),
      tipo_visitante: inputs.tipo.value,
      cantidad_visitante: Math.abs(Math.round(parseInt(inputs.cantidadVisitante.value))),
      idioma: inputs.idioma.value.trim(),
      observaciones: inputs.observaciones ? inputs.observaciones.value.trim() : ''
    };

    console.log('[SEND] Enviando datos al backend:', tourData);

    try {
      let response;
      if (editMode && tourId) {
        // Actualizar
        response = await API.tour.update(tourId, tourData);
        console.log('[OK] Tour actualizado:', response);
        showNotification('Tour actualizado exitosamente', 'success');
      } else {
        // Crear
        response = await API.tour.create(tourData);
        console.log('[OK] Tour creado:', response);
        showNotification('Tour registrado exitosamente', 'success');
      }

      // Redirigir después de 1 segundo
      setTimeout(function() {
        window.location.href = '/templates/tour/tour-control';
      }, 1000);
    } catch (error) {
      console.error('[ERROR] Error completo:', error);
      const mensaje = error.message || (editMode ? 'Error al actualizar tour' : 'Error al registrar tour');
      showNotification(mensaje, 'error');
    }
  }

  // Mostrar notificación
  function showNotification(message, type) {
    type = type || 'info';
    
    // Si existe sistema de notificaciones global, usarlo
    if (window.showNotification && typeof window.showNotification === 'function') {
      window.showNotification(message, type);
      return;
    }

    // Fallback: alert simple
    const icon = type === 'success' ? '[OK]' : type === 'error' ? '[ERROR]' : 'ℹ️';
    alert(icon + ' ' + message);
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
