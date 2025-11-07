// Script para gestionar categorías (gestion-categorias.html)

(() => {
  // Elementos del DOM
  const formCategoria = document.getElementById('form-categoria');
  const categoriasContainer = document.getElementById('categorias-container');
  const categoriasCount = document.getElementById('categorias-count');
  
  // Inputs del formulario
  const inputs = {
    id: document.getElementById('categoria-id'),
    area: document.getElementById('categoria-area'),
    nombre: document.getElementById('categoria-nombre'),
    descripcion: document.getElementById('categoria-descripcion')
  };
  
  const btnGuardar = document.getElementById('btn-guardar-categoria');
  const btnCancelar = document.getElementById('btn-cancelar-edicion');
  const formTitle = document.getElementById('form-title');
  
  // Estado
  let categorias = [];
  let areas = [];
  let categoriaEnEdicion = null;

  // Inicializar
  async function init() {
    console.log('[START] Inicializando gestión de categorías...');
    
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login';
      return;
    }

    // Cargar datos
    await Promise.all([
      loadAreas(),
      loadCategorias()
    ]);
    
    // Event listeners
    setupEventListeners();
  }
  
  // Configurar event listeners
  function setupEventListeners() {
    if (formCategoria) {
      formCategoria.addEventListener('submit', handleSubmit);
    }
    
    if (btnCancelar) {
      btnCancelar.addEventListener('click', resetForm);
    }
  }
  
  // Cargar áreas
  async function loadAreas() {
    try {
      console.log('[LOAD] Cargando áreas...');
      const response = await API.menu.getAreas();
      areas = response.data?.areas || [];
      
      console.log(`[OK] ${areas.length} áreas cargadas`);
      
      // Llenar select
      if (inputs.area && areas.length > 0) {
        inputs.area.innerHTML = '<option value="">Seleccione un área</option>';
        
        areas.forEach(area => {
          const option = document.createElement('option');
          option.value = area.id_area;
          option.textContent = area.nombre;
          inputs.area.appendChild(option);
        });
      }
    } catch (error) {
      console.error('[ERROR] Error al cargar áreas:', error);
      showNotification('Error al cargar áreas: ' + error.message, 'error');
    }
  }
  
  // Cargar categorías
  async function loadCategorias() {
    try {
      console.log('[LOAD] Cargando categorías...');
      const response = await API.categorias.getAll();
      categorias = response.data?.categorias || [];
      
      console.log(`[OK] ${categorias.length} categorías cargadas`);
      
      displayCategorias();
      updateCount();
    } catch (error) {
      console.error('[ERROR] Error al cargar categorías:', error);
      categoriasContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--muted); grid-column: 1 / -1;">
          <p style="font-size: 1.2rem; margin-bottom: 10px;">Error al cargar categorías</p>
          <p style="color: var(--danger);">${error.message}</p>
        </div>
      `;
    }
  }
  
  // Mostrar categorías
  function displayCategorias() {
    if (!categoriasContainer) return;
    
    if (categorias.length === 0) {
      categoriasContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--muted); grid-column: 1 / -1;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.3;">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <p style="font-size: 1.2rem; margin-bottom: 10px;">No hay categorías registradas</p>
          <p>Crea tu primera categoría usando el formulario de arriba</p>
        </div>
      `;
      return;
    }
    
    categoriasContainer.innerHTML = '';
    
    categorias.forEach(categoria => {
      const card = createCategoriaCard(categoria);
      categoriasContainer.appendChild(card);
    });
  }
  
  // Crear tarjeta de categoría
  function createCategoriaCard(categoria) {
    const card = document.createElement('div');
    card.className = 'categoria-card';
    if (!categoria.activa) {
      card.classList.add('inactiva');
    }
    
    const platillosCount = categoria._count?.platillos || 0;
    
    card.innerHTML = `
      <div class="categoria-card-header">
        <h3>${categoria.nombre}</h3>
        <span class="categoria-badge ${!categoria.activa ? 'inactiva' : ''}">${categoria.activa ? 'ACTIVA' : 'INACTIVA'}</span>
      </div>
      <div class="categoria-card-body">
        <div class="categoria-area">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${categoria.area.nombre}
        </div>
        ${categoria.descripcion ? `<div class="categoria-descripcion">${categoria.descripcion}</div>` : ''}
        <div class="categoria-platillos-count">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
          ${platillosCount} platillo${platillosCount === 1 ? '' : 's'} asociado${platillosCount === 1 ? '' : 's'}
        </div>
      </div>
      <div class="categoria-card-actions">
        <button class="btn btn-primary btn-editar" data-id="${categoria.id_categoria}">
          Editar
        </button>
        <button class="btn ${categoria.activa ? 'btn-warning' : 'btn-success'} btn-toggle" 
                data-id="${categoria.id_categoria}" 
                data-activa="${categoria.activa}">
          ${categoria.activa ? 'Desactivar' : 'Activar'}
        </button>
        <button class="btn btn-danger btn-eliminar" data-id="${categoria.id_categoria}">
           Eliminar
        </button>
      </div>
    `;
    
    // Event listeners
    const btnEditar = card.querySelector('.btn-editar');
    const btnToggle = card.querySelector('.btn-toggle');
    const btnEliminar = card.querySelector('.btn-eliminar');
    
    if (btnEditar) {
      btnEditar.addEventListener('click', () => editarCategoria(categoria));
    }
    
    if (btnToggle) {
      btnToggle.addEventListener('click', () => toggleCategoria(categoria.id_categoria, categoria.activa));
    }
    
    if (btnEliminar) {
      btnEliminar.addEventListener('click', () => eliminarCategoria(categoria.id_categoria, categoria.nombre));
    }
    
    return card;
  }
  
  // Actualizar contador
  function updateCount() {
    if (categoriasCount) {
      const activas = categorias.filter(c => c.activa).length;
      categoriasCount.textContent = `${categorias.length} categoría${categorias.length === 1 ? '' : 's'} (${activas} activa${activas === 1 ? '' : 's'})`;
    }
  }
  
  // Manejar envío del formulario
  async function handleSubmit(e) {
    e.preventDefault();
    
    const idCategoria = inputs.id.value;
    const nombre = inputs.nombre.value.trim();
    const descripcion = inputs.descripcion.value.trim();
    const idArea = inputs.area.value;
    
    if (!nombre || !idArea) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }
    
    // Validar que el nombre no sea solo números
    if (/^\d+$/.test(nombre)) {
      showNotification('El nombre de la categoría no puede ser solo números. Debe contener al menos una letra', 'error');
      inputs.nombre.classList.add('error');
      return;
    }
    
    // Validar que tenga al menos una letra
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(nombre)) {
      showNotification('El nombre de la categoría debe contener al menos una letra', 'error');
      inputs.nombre.classList.add('error');
      return;
    }
    
    const categoriaData = {
      nombre,
      descripcion: descripcion || null,
      id_area: parseInt(idArea)
    };
    
    try {
      if (idCategoria) {
        // Actualizar
        await API.categorias.update(idCategoria, categoriaData);
        showNotification('[OK] Categoría actualizada exitosamente', 'success');
      } else {
        // Crear
        await API.categorias.create(categoriaData);
        showNotification('[OK] Categoría creada exitosamente', 'success');
      }
      
      // Recargar y resetear
      await loadCategorias();
      resetForm();
      
      // Scroll al inicio para ver el resultado
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('[ERROR] Error:', error);
      showNotification(error.message, 'error');
    }
  }
  
  // Editar categoría
  function editarCategoria(categoria) {
    categoriaEnEdicion = categoria;
    
    formTitle.textContent = 'Editar Categoría';
    inputs.id.value = categoria.id_categoria;
    inputs.nombre.value = categoria.nombre;
    inputs.descripcion.value = categoria.descripcion || '';
    inputs.area.value = categoria.id_area;
    btnGuardar.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
      Actualizar Categoría
    `;
    btnCancelar.style.display = 'inline-flex';
    
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
    inputs.nombre.focus();
  }
  
  // Resetear formulario
  function resetForm() {
    categoriaEnEdicion = null;
    
    formTitle.textContent = 'Nueva Categoría';
    inputs.id.value = '';
    inputs.nombre.value = '';
    inputs.descripcion.value = '';
    inputs.area.value = '';
    btnGuardar.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
      Guardar Categoría
    `;
    btnCancelar.style.display = 'none';
  }
  
  // Toggle estado
  async function toggleCategoria(id, estadoActual) {
    const nuevoEstado = !estadoActual;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    const confirmed = await showConfirm(
      `¿Estás seguro de ${accion} esta categoría?\n\n` +
      (nuevoEstado ? 
        'La categoría estará disponible para asignar a platillos.' : 
        'La categoría se marcará como inactiva pero los platillos que la tengan asignada la conservarán.'),
      {
        confirmText: nuevoEstado ? 'Activar' : 'Desactivar',
        cancelText: 'Cancelar'
      }
    );
    
    if (!confirmed) return;
    
    try {
      await API.categorias.toggle(id, nuevoEstado);
      showNotification(`[OK] Categoría ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`, 'success');
      await loadCategorias();
    } catch (error) {
      console.error('[ERROR] Error:', error);
      showNotification(error.message, 'error');
    }
  }
  
  // Eliminar categoría
  async function eliminarCategoria(id, nombre) {
    const confirmed = await showConfirm(
      `¿Estás seguro de eliminar la categoría "${nombre}"?\n\n` +
      'Esta acción NO se puede deshacer.\n' +
      'Solo se pueden eliminar categorías sin platillos asociados.',
      {
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    );
    
    if (!confirmed) return;
    
    try {
      await API.categorias.delete(id);
      showNotification(`[OK] Categoría "${nombre}" eliminada exitosamente`, 'success');
      await loadCategorias();
      resetForm();
    } catch (error) {
      console.error('[ERROR] Error:', error);
      showNotification(error.message, 'error');
    }
  }
  
  // Mostrar notificación
  function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      background: ${type === 'success' ? '#A8B5A1' : type === 'error' ? '#C49A8A' : '#D4AF85'};
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 500px;
      min-width: 300px;
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.5;
    `;
    
    // Agregar estilos de animación
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
    
    const duration = type === 'error' && message.length > 100 ? 6000 : 3000;
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

