// Script para agregar/editar usuarios (agregar_usuarios.html)

(() => {
  // Elementos del DOM
  const form = document.getElementById('form-usuarios');
  const empleadoSelect = document.getElementById('empleado');
  const rolSelect = document.getElementById('rol');
  const usuarioInput = document.getElementById('usuario');
  const pwdInput = document.getElementById('pwd');
  const pwd2Input = document.getElementById('pwd2');

  // Estado
  let editMode = false;
  let editUserId = null;
  let availableEmployees = [];
  let roles = [];

  // Inicializar
  async function init() {
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login.html';
      return;
    }

    // Cargar datos necesarios
    await Promise.all([
      loadAvailableEmployees(),
      loadRoles()
    ]);

    // Verificar si es modo edición
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (userId) {
      editMode = true;
      editUserId = userId;
      await loadUserForEdit(userId);
    }

    // Configurar event listeners
    setupEventListeners();
  }

  // Configurar event listeners
  function setupEventListeners() {
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
  }

  // Cargar empleados disponibles (sin usuario asignado)
  async function loadAvailableEmployees() {
    try {
      const response = await API.employees.getAvailable();
      const data = response.data || response;
      availableEmployees = data.employees || data || [];

      console.log('👥 Empleados disponibles:', availableEmployees.length);

      populateEmployeeSelect();
    } catch (error) {
      console.error('❌ Error al cargar empleados disponibles:', error);
      showError('No se pudieron cargar los empleados disponibles');
    }
  }

  // Cargar roles
  async function loadRoles() {
    try {
      const response = await API.users.getRoles();
      const data = response.data || response;
      roles = data.roles || data || [];

      console.log('🎭 Roles cargados:', roles.length);

      populateRoleSelect();
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
      showError('No se pudieron cargar los roles');
    }
  }

  // Poblar select de empleados
  function populateEmployeeSelect() {
    if (!empleadoSelect) return;

    // Limpiar opciones existentes (excepto la primera)
    empleadoSelect.innerHTML = '<option value="">Seleccionar…</option>';

    if (availableEmployees.length === 0 && !editMode) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No hay empleados disponibles';
      option.disabled = true;
      empleadoSelect.appendChild(option);
      return;
    }

    availableEmployees.forEach(employee => {
      const option = document.createElement('option');
      option.value = employee.id_empleado;
      option.textContent = `${employee.nombre} ${employee.apellidos}`;
      empleadoSelect.appendChild(option);
    });
  }

  // Poblar select de roles
  function populateRoleSelect() {
    if (!rolSelect) return;

    // Limpiar opciones existentes (excepto la primera)
    rolSelect.innerHTML = '<option value="">Seleccionar…</option>';

    roles.forEach(role => {
      const option = document.createElement('option');
      option.value = role.id_rol;
      option.textContent = role.nombre_rol;
      rolSelect.appendChild(option);
    });
  }

  // Cargar usuario para editar
  async function loadUserForEdit(id) {
    try {
      const response = await API.users.getById(id);
      const data = response.data || response;
      const user = data.user || data;

      // Agregar el empleado actual al select (aunque ya tenga usuario)
      if (user.empleado) {
        const option = document.createElement('option');
        option.value = user.id_empleado;
        option.textContent = `${user.empleado.nombre} ${user.empleado.apellidos}`;
        option.selected = true;
        empleadoSelect.appendChild(option);
        empleadoSelect.disabled = true; // No permitir cambiar de empleado
      }

      // Llenar formulario
      empleadoSelect.value = user.id_empleado || '';
      rolSelect.value = user.id_rol || '';
      usuarioInput.value = user.usuario_nombre || '';

      // Las contraseñas no se cargan (son opcionales en edición)
      pwdInput.required = false;
      pwd2Input.required = false;
      pwdInput.placeholder = 'Dejar en blanco para mantener la actual';
      pwd2Input.placeholder = 'Dejar en blanco para mantener la actual';

      // Cambiar título
      const title = document.querySelector('.form-card h2');
      if (title) {
        title.textContent = 'Editar Usuario';
      }

      // Cambiar texto del botón
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.textContent = 'Actualizar';
      }

      console.log(`📝 Modo edición: Usuario ${id} cargado`);
    } catch (error) {
      console.error('❌ Error al cargar usuario:', error);
      showError('No se pudo cargar el usuario para editar');
    }
  }

  // Manejar envío del formulario
  async function handleSubmit(e) {
    e.preventDefault();

    // Validar campos
    const empleadoId = empleadoSelect.value;
    const rolId = rolSelect.value;
    const usuario = usuarioInput.value.trim();
    const pwd = pwdInput.value;
    const pwd2 = pwd2Input.value;

    if (!empleadoId || !rolId || !usuario) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar contraseñas (solo si se están cambiando)
    if (pwd || pwd2) {
      if (pwd !== pwd2) {
        showError('Las contraseñas no coinciden');
        return;
      }

      if (pwd.length < 8) {
        showError('La contraseña debe tener al menos 8 caracteres');
        return;
      }
    } else if (!editMode) {
      // En modo creación, la contraseña es obligatoria
      showError('La contraseña es requerida');
      return;
    }

    // Preparar datos
    const userData = {
      id_empleado: parseInt(empleadoId),
      usuario_nombre: usuario,
      id_rol: parseInt(rolId)
    };

    // Solo incluir contraseña si se proporcionó
    if (pwd) {
      userData.contrasena = pwd;
    }

    try {
      let response;

      if (editMode && editUserId) {
        // Actualizar usuario existente
        response = await API.users.update(editUserId, userData);
        console.log('✅ Usuario actualizado:', response);
        showSuccess('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        response = await API.users.create(userData);
        console.log('✅ Usuario creado:', response);
        showSuccess('Usuario creado exitosamente');
      }

      // Redirigir a la lista de usuarios
      setTimeout(() => {
        window.location.href = '/templates/administracion/control-usuarios.html';
      }, 1000);

    } catch (error) {
      console.error('❌ Error al guardar usuario:', error);
      showError(error.message || 'No se pudo guardar el usuario');
    }
  }

  // Mostrar mensaje de éxito
  function showSuccess(message) {
    alert(`✅ ${message}`);
  }

  // Mostrar mensaje de error
  function showError(message) {
    alert(`❌ ${message}`);
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

