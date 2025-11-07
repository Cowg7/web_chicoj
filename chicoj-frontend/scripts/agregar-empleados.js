// Script para agregar/editar empleados (agregar_empleados.html)

(() => {
  // Elementos del DOM
  const form = document.getElementById('form-empleado');
  const nombreInput = document.getElementById('nombre');
  const apellidosInput = document.getElementById('apellidos');
  const edadInput = document.getElementById('edad');
  const correoInput = document.getElementById('correo');

  // Estado
  let editMode = false;
  let editEmployeeId = null;

  // Inicializar
  async function init() {
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login';
      return;
    }

    // Verificar si es modo edición
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get('id');

    if (employeeId) {
      editMode = true;
      editEmployeeId = employeeId;
      await loadEmployeeForEdit(employeeId);
    }

    // Configurar event listeners
    setupEventListeners();
  }

  // Configurar event listeners
  function setupEventListeners() {
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
    
    // Validación en tiempo real para nombre
    if (nombreInput) {
      nombreInput.addEventListener('input', (e) => validateTextInput(e.target, 'nombre'));
      nombreInput.addEventListener('blur', (e) => validateTextInput(e.target, 'nombre'));
    }
    
    // Validación en tiempo real para apellidos
    if (apellidosInput) {
      apellidosInput.addEventListener('input', (e) => validateTextInput(e.target, 'apellidos'));
      apellidosInput.addEventListener('blur', (e) => validateTextInput(e.target, 'apellidos'));
    }
    
    // Validación en tiempo real para edad
    if (edadInput) {
      edadInput.addEventListener('input', (e) => validateAge(e.target));
      edadInput.addEventListener('blur', (e) => validateAge(e.target));
    }
    
    // Validación en tiempo real para correo
    if (correoInput) {
      correoInput.addEventListener('input', (e) => validateEmail(e.target));
      correoInput.addEventListener('blur', (e) => validateEmail(e.target));
    }
  }
  
  // Validar campos de texto (nombre, apellidos)
  function validateTextInput(input, fieldName) {
    const value = input.value.trim();
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    
    // Limpiar mensaje de error previo
    removeErrorMessage(input);
    
    if (value === '') {
      input.classList.remove('error', 'success');
      return false;
    }
    
    if (!regex.test(value)) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, `El ${fieldName} solo puede contener letras (sin números ni símbolos)`);
      return false;
    }
    
    if (value.length < 2) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, `El ${fieldName} debe tener al menos 2 caracteres`);
      return false;
    }
    
    input.classList.remove('error');
    input.classList.add('success');
    return true;
  }
  
  // Validar edad
  function validateAge(input) {
    const value = input.value.trim();
    
    // Limpiar mensaje de error previo
    removeErrorMessage(input);
    
    if (value === '') {
      input.classList.remove('error', 'success');
      return false;
    }
    
    const edad = parseInt(value);
    
    if (isNaN(edad)) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, 'La edad debe ser un número válido');
      return false;
    }
    
    if (edad < 18) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, 'La edad mínima permitida es 18 años');
      return false;
    }
    
    if (edad > 100) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, 'La edad máxima permitida es 100 años');
      return false;
    }
    
    input.classList.remove('error');
    input.classList.add('success');
    return true;
  }
  
  // Validar correo electrónico
  function validateEmail(input) {
    const value = input.value.trim();
    
    // Limpiar mensaje de error previo
    removeErrorMessage(input);
    
    if (value === '') {
      input.classList.remove('error', 'success');
      return false;
    }
    
    // Regex más estricto para email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(value)) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, 'Ingresa un correo válido (ejemplo: usuario@dominio.com)');
      return false;
    }
    
    // Verificar que tenga extensión válida
    const parts = value.split('@');
    if (parts.length !== 2) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, 'El correo debe contener una @');
      return false;
    }
    
    const domain = parts[1];
    if (!domain.includes('.')) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, 'El correo debe tener una extensión válida (.com, .net, etc.)');
      return false;
    }
    
    const extension = domain.split('.').pop();
    if (extension.length < 2) {
      input.classList.add('error');
      input.classList.remove('success');
      showFieldError(input, 'La extensión del correo debe tener al menos 2 caracteres');
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

  // Cargar empleado para editar
  async function loadEmployeeForEdit(id) {
    try {
      const response = await API.employees.getById(id);
      const data = response.data || response;
      const employee = data.employee || data;

      // Llenar formulario
      nombreInput.value = employee.nombre || '';
      apellidosInput.value = employee.apellidos || '';
      edadInput.value = employee.edad || '';
      correoInput.value = employee.correo_electronico || '';

      // Cambiar título
      const title = document.querySelector('.form-card h2');
      if (title) {
        title.textContent = 'Editar Empleado';
      }

      // Cambiar texto del botón
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.textContent = 'Actualizar';
      }

      console.log(`[NOTE] Modo edición: Empleado ${id} cargado`);
    } catch (error) {
      console.error('[ERROR] Error al cargar empleado:', error);
      showError('No se pudo cargar el empleado para editar');
    }
  }

  // Manejar envío del formulario
  async function handleSubmit(e) {
    e.preventDefault();

    // Obtener valores
    const nombre = nombreInput.value.trim();
    const apellidos = apellidosInput.value.trim();
    const edad = edadInput.value.trim();
    const correo = correoInput.value.trim();

    // Validar todos los campos
    let isValid = true;
    const errors = [];

    // Validar nombre
    if (!nombre) {
      errors.push('El nombre es obligatorio');
      nombreInput.classList.add('error');
      isValid = false;
    } else if (!validateTextInput(nombreInput, 'nombre')) {
      errors.push('El nombre contiene caracteres inválidos');
      isValid = false;
    }

    // Validar apellidos
    if (!apellidos) {
      errors.push('Los apellidos son obligatorios');
      apellidosInput.classList.add('error');
      isValid = false;
    } else if (!validateTextInput(apellidosInput, 'apellidos')) {
      errors.push('Los apellidos contienen caracteres inválidos');
      isValid = false;
    }

    // Validar edad
    if (!edad) {
      errors.push('La edad es obligatoria');
      edadInput.classList.add('error');
      isValid = false;
    } else if (!validateAge(edadInput)) {
      errors.push('La edad no es válida (debe estar entre 18 y 100 años)');
      isValid = false;
    }

    // Validar correo
    if (!correo) {
      errors.push('El correo es obligatorio');
      correoInput.classList.add('error');
      isValid = false;
    } else if (!validateEmail(correoInput)) {
      errors.push('El correo no tiene un formato válido');
      isValid = false;
    }

    // Si hay errores, mostrarlos y detener
    if (!isValid) {
      showError('Por favor corrige los siguientes errores:\n\n' + errors.join('\n'));
      return;
    }

    // Preparar datos
    const employeeData = {
      nombre,
      apellidos,
      edad: edad ? parseInt(edad) : null,
      genero: null, // No hay campo en el formulario
      correo_electronico: correo
    };

    try {
      let response;

      if (editMode && editEmployeeId) {
        // Actualizar empleado existente
        response = await API.employees.update(editEmployeeId, employeeData);
        console.log('[OK] Empleado actualizado:', response);
        showSuccess('Empleado actualizado exitosamente');
      } else {
        // Crear nuevo empleado
        response = await API.employees.create(employeeData);
        console.log('[OK] Empleado creado:', response);
        showSuccess('Empleado creado exitosamente');
      }

      // Redirigir a la lista de empleados
      setTimeout(() => {
        window.location.href = '/templates/administracion/empleados_control';
      }, 1000);

    } catch (error) {
      console.error('[ERROR] Error al guardar empleado:', error);
      showError(error.message || 'No se pudo guardar el empleado');
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

