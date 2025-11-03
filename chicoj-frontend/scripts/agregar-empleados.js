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

      console.log(`📝 Modo edición: Empleado ${id} cargado`);
    } catch (error) {
      console.error('❌ Error al cargar empleado:', error);
      showError('No se pudo cargar el empleado para editar');
    }
  }

  // Manejar envío del formulario
  async function handleSubmit(e) {
    e.preventDefault();

    // Validar campos
    const nombre = nombreInput.value.trim();
    const apellidos = apellidosInput.value.trim();
    const edad = edadInput.value.trim();
    const correo = correoInput.value.trim();

    if (!nombre || !apellidos || !correo) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      showError('Por favor ingresa un correo electrónico válido');
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
        console.log('✅ Empleado actualizado:', response);
        showSuccess('Empleado actualizado exitosamente');
      } else {
        // Crear nuevo empleado
        response = await API.employees.create(employeeData);
        console.log('✅ Empleado creado:', response);
        showSuccess('Empleado creado exitosamente');
      }

      // Redirigir a la lista de empleados
      setTimeout(() => {
        window.location.href = '/templates/administracion/empleados_control';
      }, 1000);

    } catch (error) {
      console.error('❌ Error al guardar empleado:', error);
      showError(error.message || 'No se pudo guardar el empleado');
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

