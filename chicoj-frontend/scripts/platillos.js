// Script para crear/editar platillos (platillo.html)

(() => {
  // Elementos del DOM
  const form = document.getElementById('form-platillo');
  const inputs = {
    id: document.getElementById('platillo-id'),
    nombre: document.getElementById('platillo-nombre'),
    area: document.getElementById('platillo-area'),
    categoria: document.getElementById('platillo-categoria'),
    precio: document.getElementById('platillo-precio'),
    descripcion: document.getElementById('platillo-descripcion')
  };
  const btnSubmit = form?.querySelector('.btn-success');

  // Estado
  let editMode = false;
  let platilloId = null;
  let areas = [];
  let categoriasPorArea = {}; // Categorías dinámicas cargadas desde la API

  // Inicializar
  async function init() {
    console.log('[START] Inicializando formulario de platillos...');
    
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login';
      return;
    }

    // Cargar áreas y categorías disponibles
    await Promise.all([
      loadAreas(),
      loadAllCategorias()
    ]);

    // Verificar si estamos en modo edición
    const urlParams = new URLSearchParams(window.location.search);
    platilloId = urlParams.get('id');

    if (platilloId) {
      editMode = true;
      console.log('[EDIT] Modo EDICIÓN - ID:', platilloId);
      await loadPlatillo(platilloId);
      
      if (btnSubmit) {
        btnSubmit.textContent = 'Actualizar';
      }
      
      // Cambiar título
      const titulo = document.querySelector('.encabezado-form h2');
      if (titulo) {
        titulo.textContent = 'Editar Platillo';
      }
    } else {
      console.log('[ADD] Modo CREACIÓN');
      // Generar ID automático
      if (inputs.id) {
        inputs.id.value = 'AUTO';
      }
    }

    // Event listeners
    setupEventListeners();
  }

  // Cargar áreas disponibles
  async function loadAreas() {
    try {
      console.log('[LOAD] Cargando áreas...');
      const response = await API.menu.getAreas();
      
      const data = response.data || response;
      areas = data.areas || data || [];
      
      console.log(`[OK] ${areas.length} áreas cargadas:`, areas.map(a => a.nombre));
      
      // Llenar el select
      if (inputs.area && areas.length > 0) {
        // Limpiar opciones excepto la primera
        inputs.area.innerHTML = '<option value="">Seleccionar área...</option>';
        
        areas.forEach(area => {
          const option = document.createElement('option');
          option.value = area.id_area;
          option.textContent = area.nombre;
          option.dataset.nombre = area.nombre;
          inputs.area.appendChild(option);
        });
        
        console.log('[OK] Select de áreas poblado');
      }
    } catch (error) {
      console.error('[ERROR] Error al cargar áreas:', error);
      showNotification('Error al cargar áreas: ' + error.message, 'error');
    }
  }

  // Cargar datos del platillo
  async function loadPlatillo(id) {
    try {
      console.log('[RECEIVE] Cargando platillo ID:', id);
      const response = await API.menu.getById(id);
      
      const data = response.data || response;
      const platillo = data.platillo || data;

      console.log('[INFO] Platillo cargado:', platillo);

      if (platillo) {
        const platilloId = platillo.id_platillo || platillo.id;
        
        if (inputs.id) inputs.id.value = platilloId;
        if (inputs.nombre) inputs.nombre.value = platillo.nombre;
        if (inputs.precio) inputs.precio.value = platillo.precio;
        if (inputs.descripcion) inputs.descripcion.value = platillo.descripcion || '';
        
        // Seleccionar área
        if (inputs.area && platillo.area) {
          const areaId = platillo.area.id_area || platillo.id_area;
          console.log('🏷️ Seleccionando área ID:', areaId);
          inputs.area.value = areaId;
          
          // Cargar categorías para esta área
          handleAreaChange({ target: inputs.area });
        }
        
        // Seleccionar categoría (ahora es id_categoria)
        if (inputs.categoria && platillo.id_categoria) {
          console.log('[FOLDER] Seleccionando categoría ID:', platillo.id_categoria);
          // Esperar un poco para que el select esté poblado
          setTimeout(() => {
            inputs.categoria.value = platillo.id_categoria;
          }, 100);
        }
        
        console.log('[OK] Datos cargados en el formulario');
      }
    } catch (error) {
      console.error('[ERROR] Error al cargar platillo:', error);
      showNotification('Error al cargar platillo: ' + error.message, 'error');
    }
  }

  // Configurar event listeners
  function setupEventListeners() {
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
    
    // Listener para cambio de área
    if (inputs.area) {
      inputs.area.addEventListener('change', handleAreaChange);
    }
  }
  
  // Cargar todas las categorías y agrupar por área
  async function loadAllCategorias() {
    try {
      console.log('[LOAD] Cargando categorías...');
      const response = await API.categorias.getAll({ activa: 'true' }); // Solo categorías activas
      
      const categorias = response.data?.categorias || [];
      console.log(`[OK] ${categorias.length} categorías cargadas`);
      
      // Agrupar por área
      categoriasPorArea = {};
      categorias.forEach(categoria => {
        const areaId = categoria.id_area;
        if (!categoriasPorArea[areaId]) {
          categoriasPorArea[areaId] = [];
        }
        categoriasPorArea[areaId].push(categoria);
      });
      
      console.log('[FOLDER] Categorías agrupadas por área:', categoriasPorArea);
    } catch (error) {
      console.error('[ERROR] Error al cargar categorías:', error);
      // No mostrar error al usuario, simplemente no habrá categorías disponibles
    }
  }
  
  // Manejar cambio de área
  function handleAreaChange(e) {
    const areaId = e.target.value;
    console.log('[POINT] Área seleccionada:', areaId);
    
    if (!areaId) {
      if (inputs.categoria) {
        inputs.categoria.innerHTML = '<option value="">Primero seleccione un área...</option>';
        inputs.categoria.disabled = true;
      }
      return;
    }
    
    // Obtener categorías para esta área
    const categorias = categoriasPorArea[areaId] || [];
    console.log('[FOLDER] Categorías disponibles:', categorias.length);
    
    // Actualizar select de categorías
    if (inputs.categoria) {
      if (categorias.length === 0) {
        inputs.categoria.innerHTML = '<option value="">No hay categorías para esta área</option>';
        inputs.categoria.disabled = true;
        showNotification('[WARN] No hay categorías creadas para esta área. Ve a "Gestionar Categorías" para crear una.', 'info');
      } else {
        inputs.categoria.disabled = false;
        inputs.categoria.innerHTML = '<option value="">Seleccionar categoría...</option>';
        
        categorias.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.id_categoria;
          option.textContent = cat.nombre;
          option.dataset.descripcion = cat.descripcion || '';
          inputs.categoria.appendChild(option);
        });
        
        console.log('[OK] Categorías cargadas en el select');
      }
    }
  }

  // Manejar envío del formulario
  async function handleSubmit(e) {
    e.preventDefault();

    console.log('[SEND] Enviando formulario...');

    // Validaciones
    if (!inputs.nombre?.value.trim()) {
      showNotification('Ingresa el nombre del platillo', 'error');
      return;
    }

    if (!inputs.area?.value) {
      showNotification('Selecciona el área del platillo', 'error');
      return;
    }

    // La categoría ahora es opcional, pero si hay categorías disponibles, se recomienda seleccionar una
    if (!inputs.categoria?.value && !inputs.categoria?.disabled) {
      const confirmar = await showConfirm('No has seleccionado una categoría. ¿Deseas continuar sin categoría?', {
        confirmText: 'Continuar sin categoría',
        cancelText: 'Cancelar'
      });
      if (!confirmar) return;
    }

    if (!inputs.precio?.value || parseFloat(inputs.precio.value) <= 0) {
      showNotification('Ingresa un precio válido', 'error');
      return;
    }

    // Preparar datos
    const categoriaId = inputs.categoria?.value ? parseInt(inputs.categoria.value) : null;
    const platilloData = {
      nombre: inputs.nombre.value.trim(),
      precio: parseFloat(inputs.precio.value),
      descripcion: inputs.descripcion?.value.trim() || '',
      id_area: parseInt(inputs.area.value),
      id_categoria: categoriaId // Ahora enviamos el ID de la categoría
    };

    console.log('[DATA] Datos a enviar:', platilloData);

    try {
      if (editMode && platilloId) {
        // Actualizar
        console.log('[LOAD] Actualizando platillo...');
        await API.menu.update(platilloId, platilloData);
        showNotification('[OK] Platillo actualizado exitosamente', 'success');
      } else {
        // Crear
        console.log('[ADD] Creando nuevo platillo...');
        await API.menu.create(platilloData);
        showNotification('[OK] Platillo creado exitosamente', 'success');
      }

      // Redirigir después de 1 segundo
      setTimeout(() => {
        window.location.href = '/templates/administracion/control-platillos';
      }, 1000);
    } catch (error) {
      console.error('[ERROR] Error:', error);
      const mensaje = error.message || (editMode ? 'Error al actualizar platillo' : 'Error al crear platillo');
      showNotification('[ERROR] ' + mensaje, 'error');
    }
  }

  // Mostrar notificación
  function showNotification(message, type = 'info') {
    const icon = type === 'success' ? '[OK]' : type === 'error' ? '[ERROR]' : 'ℹ️';
    console.log(`${icon} ${message}`);
    
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
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 400px;
    `;
    
    // Agregar estilos de animación si no existen
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

