// Script para agregar/editar roles (agregar_roles.html)

(() => {
  // Elementos del DOM
  let form;
  let idInput;
  let nombreRolInput;
  let descripcionInput;

  // Estado
  let editMode = false;
  let editRoleId = null;

  // Inicializar
  async function init() {
    console.log('[START] Iniciando agregar-roles.js');
    
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login';
      return;
    }

    // Obtener elementos del DOM
    form = document.getElementById('form-roles');
    idInput = document.getElementById('id');
    nombreRolInput = document.getElementById('nombre_rol');
    descripcionInput = document.getElementById('descripcion');

    console.log('[INFO] Elementos del DOM encontrados:');
    console.log('  - form:', !!form);
    console.log('  - nombreRolInput:', !!nombreRolInput);
    console.log('  - descripcionInput:', !!descripcionInput);

    // Verificar si es modo edición
    const urlParams = new URLSearchParams(window.location.search);
    const roleId = urlParams.get('id');

    if (roleId) {
      editMode = true;
      editRoleId = roleId;
      await loadRoleForEdit(roleId);
    }

    // Configurar event listeners
    setupEventListeners();
    
    console.log('[OK] Inicialización completada');
  }

  // Configurar event listeners
  function setupEventListeners() {
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
    
    // Validación en tiempo real para nombre de rol
    if (nombreRolInput) {
      nombreRolInput.addEventListener('input', (e) => validateRoleName(e.target));
      nombreRolInput.addEventListener('blur', (e) => validateRoleName(e.target));
    }
  }
  
  // Validar nombre de rol (no puede ser solo números)
  function validateRoleName(input) {
    const value = input.value.trim();
    
    // Limpiar mensaje de error previo
    removeErrorMessage(input);
    
    if (value === '') {
      input.classList.remove('error', 'success');
      return false;
    }
    
    // Verificar que no sea solo números
    if (/^\d+$/.test(value)) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, 'El nombre del rol no puede ser solo números. Debe contener al menos una letra');
      return false;
    }
    
    // Verificar que tenga al menos una letra
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(value)) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, 'El nombre del rol debe contener al menos una letra');
      return false;
    }
    
    if (value.length < 2) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, 'El nombre del rol debe tener al menos 2 caracteres');
      return false;
    }
    
    input.classList.remove('error');
    input.classList.add('success');
    return true;
  }
  
  // Mostrar mensaje de error en campo
  function showFieldError(input, message) {
    const errorSpan = document.createElement('span');
    errorSpan.className = 'error-message';
    errorSpan.textContent = message;
    input.parentNode.insertBefore(errorSpan, input.nextSibling);
  }
  
  // Remover mensaje de error
  function removeErrorMessage(input) {
    const nextElement = input.nextSibling;
    if (nextElement && nextElement.classList && nextElement.classList.contains('error-message')) {
      nextElement.remove();
    }
  }

  // Cargar rol para editar
  async function loadRoleForEdit(id) {
    try {
      console.log('[NOTE] Cargando rol para editar, ID:', id);
      
      // Obtener el rol desde el backend
      const response = await API.users.getRoles();
      const data = response.data || response;
      const roles = data.roles || [];
      
      const role = roles.find(r => r.id_rol === parseInt(id));
      
      if (!role) {
        showError('No se encontró el rol');
        return;
      }

      // Llenar formulario
      if (idInput) idInput.value = role.id_rol;
      if (nombreRolInput) nombreRolInput.value = role.nombre_rol;
      if (descripcionInput) descripcionInput.value = role.descripcion || '';

      // Cambiar título
      const title = document.querySelector('.form-card h2, .encabezado-form h2');
      if (title) {
        title.textContent = 'Editar Rol';
      }

      // Cambiar texto del botón
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.textContent = 'Actualizar Rol';
      }

      console.log('[OK] Rol cargado para edición:', role.nombre_rol);
    } catch (error) {
      console.error('[ERROR] Error al cargar rol:', error);
      showError('No se pudo cargar el rol para editar');
    }
  }

  // Manejar envío del formulario
  async function handleSubmit(e) {
    e.preventDefault();

    console.log('[SEND] Enviando formulario de rol...');

    // Obtener valores
    const nombreRol = nombreRolInput?.value.trim();
    const descripcion = descripcionInput?.value.trim();

    // Validar
    if (!nombreRol) {
      showError('El nombre del rol es requerido');
      return;
    }
    
    // Validar que no sea solo números
    if (!validateRoleName(nombreRolInput)) {
      showError('Por favor corrige el nombre del rol. No puede ser solo números');
      return;
    }

    if (!descripcion) {
      showError('La descripción es requerida');
      return;
    }

    // Preparar datos
    const roleData = {
      nombre_rol: nombreRol,
      descripcion: descripcion
    };

    console.log('[INFO] Datos del rol a guardar:', roleData);

    try {
      let response;

      if (editMode && editRoleId) {
        // Actualizar rol existente
        console.log('[NOTE] Actualizando rol ID:', editRoleId);
        response = await API.users.updateRole(editRoleId, roleData);
        console.log('[OK] Rol actualizado:', response);
        showSuccess('Rol actualizado exitosamente');
      } else {
        // Crear nuevo rol
        console.log('[ADD] Creando nuevo rol...');
        response = await API.users.createRole(roleData);
        console.log('[OK] Rol creado:', response);
        showSuccess('Rol creado exitosamente');
      }

      // Redirigir a la lista de usuarios después de un momento
      setTimeout(() => {
        window.location.href = '/templates/administracion/control-usuarios';
      }, 1500);

    } catch (error) {
      console.error('[ERROR] Error al guardar rol:', error);
      showError(error.message || 'No se pudo guardar el rol');
    }
  }

  // Mostrar mensaje de éxito
  function showSuccess(message) {
    console.log('[OK]', message);
    Toast.success(message);
  }

  // Mostrar mensaje de error
  function showError(message) {
    console.error('[ERROR]', message);
    Toast.error(message);
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


