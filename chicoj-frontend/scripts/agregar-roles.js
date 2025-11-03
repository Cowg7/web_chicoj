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
    console.log('🚀 Iniciando agregar-roles.js');
    
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

    console.log('📋 Elementos del DOM encontrados:');
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
    
    console.log('✅ Inicialización completada');
  }

  // Configurar event listeners
  function setupEventListeners() {
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
  }

  // Cargar rol para editar
  async function loadRoleForEdit(id) {
    try {
      console.log('📝 Cargando rol para editar, ID:', id);
      
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

      console.log('✅ Rol cargado para edición:', role.nombre_rol);
    } catch (error) {
      console.error('❌ Error al cargar rol:', error);
      showError('No se pudo cargar el rol para editar');
    }
  }

  // Manejar envío del formulario
  async function handleSubmit(e) {
    e.preventDefault();

    console.log('📤 Enviando formulario de rol...');

    // Obtener valores
    const nombreRol = nombreRolInput?.value.trim();
    const descripcion = descripcionInput?.value.trim();

    // Validar
    if (!nombreRol) {
      showError('El nombre del rol es requerido');
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

    console.log('📋 Datos del rol a guardar:', roleData);

    try {
      let response;

      if (editMode && editRoleId) {
        // Actualizar rol existente
        console.log('📝 Actualizando rol ID:', editRoleId);
        response = await API.users.updateRole(editRoleId, roleData);
        console.log('✅ Rol actualizado:', response);
        showSuccess('Rol actualizado exitosamente');
      } else {
        // Crear nuevo rol
        console.log('➕ Creando nuevo rol...');
        response = await API.users.createRole(roleData);
        console.log('✅ Rol creado:', response);
        showSuccess('Rol creado exitosamente');
      }

      // Redirigir a la lista de usuarios después de un momento
      setTimeout(() => {
        window.location.href = '/templates/administracion/control-usuarios';
      }, 1500);

    } catch (error) {
      console.error('❌ Error al guardar rol:', error);
      showError(error.message || 'No se pudo guardar el rol');
    }
  }

  // Mostrar mensaje de éxito
  function showSuccess(message) {
    console.log('✅', message);
    alert(`✅ ${message}`);
  }

  // Mostrar mensaje de error
  function showError(message) {
    console.error('❌', message);
    alert(`❌ ${message}`);
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


