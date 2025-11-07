// Script para agregar/editar usuarios (agregar_usuarios.html)

(() => {
  // Elementos del DOM (se obtienen en init para asegurar que el DOM esté listo)
  let form;
  let empleadoSelect;
  let rolSelect;
  let usuarioInput;
  let pwdInput;
  let pwd2Input;

  // Estado
  let editMode = false;
  let editUserId = null;
  let availableEmployees = [];
  let roles = [];

  // Inicializar
  async function init() {
    console.log('[START] Iniciando agregar-usuarios.js');
    
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login';
      return;
    }

    // Obtener elementos del DOM
    form = document.getElementById('form-usuarios');
    empleadoSelect = document.getElementById('empleado');
    rolSelect = document.getElementById('rol');
    usuarioInput = document.getElementById('usuario');
    pwdInput = document.getElementById('pwd');
    pwd2Input = document.getElementById('pwd2');

    console.log('[INFO] Elementos del DOM encontrados:');
    console.log('  - form:', !!form);
    console.log('  - empleadoSelect:', !!empleadoSelect);
    console.log('  - rolSelect:', !!rolSelect);
    console.log('  - usuarioInput:', !!usuarioInput);

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
    
    console.log('[OK] Inicialización completada');
  }

  // Configurar event listeners
  function setupEventListeners() {
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
    
    // Validación en tiempo real para usuario
    if (usuarioInput) {
      usuarioInput.addEventListener('input', (e) => validateUsername(e.target));
      usuarioInput.addEventListener('blur', (e) => validateUsername(e.target));
    }
    
    // Validación en tiempo real para contraseña
    if (pwdInput) {
      pwdInput.addEventListener('input', (e) => {
        validatePassword(e.target);
        updatePasswordStrength(e.target.value);
      });
      pwdInput.addEventListener('blur', (e) => validatePassword(e.target));
      
      // Prevenir copiar/cortar contraseña con mensaje
      pwdInput.addEventListener('copy', (e) => {
        e.preventDefault();
        Toast.warning('Por seguridad, no se puede copiar la contraseña. Debes escribirla manualmente en ambos campos');
      });
      pwdInput.addEventListener('cut', (e) => {
        e.preventDefault();
        Toast.warning('Por seguridad, no se puede cortar la contraseña');
      });
    }
    
    // Validación de coincidencia de contraseñas
    if (pwd2Input) {
      pwd2Input.addEventListener('input', (e) => validatePasswordMatch());
      pwd2Input.addEventListener('blur', (e) => validatePasswordMatch());
      
      // Prevenir pegar contraseña con mensaje
      pwd2Input.addEventListener('paste', (e) => {
        e.preventDefault();
        Toast.warning('Por seguridad, no se puede pegar la contraseña. Debes escribirla manualmente');
      });
    }
  }
  
  // Validar nombre de usuario (no puede ser solo números)
  function validateUsername(input) {
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
      showFieldError(input, 'El usuario no puede ser solo números. Debe contener al menos una letra');
      return false;
    }
    
    // Verificar que tenga al menos una letra
    if (!/[a-zA-Z]/.test(value)) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, 'El usuario debe contener al menos una letra');
      return false;
    }
    
    if (value.length < 3) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, 'El usuario debe tener al menos 3 caracteres');
      return false;
    }
    
    // Verificar que solo contenga caracteres permitidos
    if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos');
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
  
  // Validar contraseña
  function validatePassword(input) {
    const value = input.value;
    
    // Limpiar mensaje de error previo
    removeErrorMessage(input);
    
    if (value === '') {
      input.classList.remove('error', 'success');
      return false;
    }
    
    const errors = [];
    
    // Verificar longitud mínima
    if (value.length < 8) {
      errors.push('al menos 8 caracteres');
    }
    
    // Verificar mayúscula
    if (!/[A-Z]/.test(value)) {
      errors.push('una letra mayúscula');
    }
    
    // Verificar minúscula
    if (!/[a-z]/.test(value)) {
      errors.push('una letra minúscula');
    }
    
    // Verificar número
    if (!/[0-9]/.test(value)) {
      errors.push('un número');
    }
    
    if (errors.length > 0) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, `La contraseña debe tener: ${errors.join(', ')}`);
      return false;
    }
    
    input.classList.remove('error');
    input.classList.add('success');
    return true;
  }
  
  // Actualizar indicador de fortaleza de contraseña
  function updatePasswordStrength(password) {
    const strengthContainer = document.getElementById('password-strength');
    const strengthFill = strengthContainer?.querySelector('.strength-fill');
    const strengthText = strengthContainer?.querySelector('.strength-text');
    
    if (!strengthContainer || !strengthFill || !strengthText) return;
    
    if (password.length === 0) {
      strengthContainer.style.display = 'none';
      return;
    }
    
    strengthContainer.style.display = 'block';
    
    let strength = 0;
    let label = '';
    
    // Calcular fortaleza
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++; // Caracteres especiales
    
    // Remover clases previas
    strengthFill.classList.remove('weak', 'medium', 'strong');
    strengthText.classList.remove('weak', 'medium', 'strong');
    
    // Asignar fortaleza
    if (strength <= 2) {
      strengthFill.classList.add('weak');
      strengthText.classList.add('weak');
      label = '❌ Débil';
    } else if (strength <= 4) {
      strengthFill.classList.add('medium');
      strengthText.classList.add('medium');
      label = '⚠️ Media';
    } else {
      strengthFill.classList.add('strong');
      strengthText.classList.add('strong');
      label = '✅ Fuerte';
    }
    
    strengthText.textContent = label;
  }
  
  // Validar coincidencia de contraseñas
  function validatePasswordMatch() {
    if (!pwdInput || !pwd2Input) return false;
    
    const pwd = pwdInput.value;
    const pwd2 = pwd2Input.value;
    
    // Limpiar mensaje de error previo
    removeErrorMessage(pwd2Input);
    
    if (pwd2 === '') {
      pwd2Input.classList.remove('error', 'success');
      return false;
    }
    
    if (pwd !== pwd2) {
      pwd2Input.classList.add('error');
      pwd2Input.classList.remove('success');
      showFieldError(pwd2Input, 'Las contraseñas no coinciden');
      return false;
    }
    
    pwd2Input.classList.remove('error');
    pwd2Input.classList.add('success');
    return true;
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
      console.error('[ERROR] Error al cargar empleados disponibles:', error);
      showError('No se pudieron cargar los empleados disponibles');
    }
  }

  // Cargar roles
  async function loadRoles() {
    try {
      console.log('[LOAD] Cargando roles desde API...');
      const response = await API.users.getRoles();
      console.log('[DATA] Respuesta completa de roles:', response);
      
      const data = response.data || response;
      roles = data.roles || data || [];

      console.log('🎭 Roles cargados:', roles.length);
      console.log('[INFO] Roles:', roles);
      console.log('[CHECK] rolSelect existe?', !!rolSelect);
      console.log('[CHECK] rolSelect elemento:', rolSelect);

      populateRoleSelect();
    } catch (error) {
      console.error('[ERROR] Error al cargar roles:', error);
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
    if (!rolSelect) {
      console.error('[ERROR] rolSelect no encontrado');
      return;
    }

    console.log('[INFO] Poblando select de roles con', roles.length, 'roles');

    // Limpiar opciones existentes (excepto la primera)
    rolSelect.innerHTML = '<option value="">Seleccionar…</option>';

    if (roles.length === 0) {
      console.warn('[WARN] No hay roles para mostrar');
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No hay roles disponibles';
      option.disabled = true;
      rolSelect.appendChild(option);
      return;
    }

    roles.forEach(role => {
      console.log('  [ADD] Agregando rol:', role.nombre_rol, '(ID:', role.id_rol + ')');
      const option = document.createElement('option');
      option.value = role.id_rol;
      option.textContent = role.nombre_rol;
      rolSelect.appendChild(option);
    });

    console.log('[OK] Select de roles poblado con', rolSelect.options.length - 1, 'opciones');
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

      console.log(`[NOTE] Modo edición: Usuario ${id} cargado`);
    } catch (error) {
      console.error('[ERROR] Error al cargar usuario:', error);
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
    
    // Validar usuario (no puede ser solo números)
    if (!validateUsername(usuarioInput)) {
      showError('Por favor corrige el nombre de usuario. No puede ser solo números y debe contener al menos una letra');
      usuarioInput.focus();
      return;
    }

    // Validar contraseñas (solo si se están cambiando)
    if (pwd || pwd2) {
      // Validar fortaleza de la contraseña
      if (!validatePassword(pwdInput)) {
        showError('La contraseña no cumple con los requisitos de seguridad. Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
        pwdInput.focus();
        return;
      }
      
      // Validar coincidencia de contraseñas
      if (!validatePasswordMatch()) {
        showError('Las contraseñas no coinciden');
        pwd2Input.focus();
        return;
      }
    } else if (!editMode) {
      // En modo creación, la contraseña es obligatoria
      showError('La contraseña es requerida');
      pwdInput.focus();
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
        console.log('[OK] Usuario actualizado:', response);
        showSuccess('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        response = await API.users.create(userData);
        console.log('[OK] Usuario creado:', response);
        showSuccess('Usuario creado exitosamente');
      }

      // Redirigir a la lista de usuarios
      setTimeout(() => {
        window.location.href = '/templates/administracion/control-usuarios';
      }, 1000);

    } catch (error) {
      console.error('[ERROR] Error al guardar usuario:', error);
      showError(error.message || 'No se pudo guardar el usuario');
    }
  }

  // Mostrar mensaje de éxito
  function showSuccess(message) {
    Toast.success(message);
  }

  // Mostrar mensaje de error
  function showError(message) {
    Toast.error(message);
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

