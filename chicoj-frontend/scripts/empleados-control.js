// Script para lista de empleados (empleados_control.html)

(() => {
  // Estado
  let employees = [];

  // Inicializar
  async function init() {
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login';
      return;
    }

    // Cargar empleados
    await loadEmployees();
  }

  // Cargar empleados
  async function loadEmployees() {
    try {
      const response = await API.employees.getAll();
      const data = response.data || response;
      employees = data.employees || data || [];

      console.log('👥 Empleados cargados:', employees.length);

      displayEmployees();
    } catch (error) {
      console.error('❌ Error al cargar empleados:', error);
      showError('No se pudieron cargar los empleados');
    }
  }

  // Mostrar empleados
  function displayEmployees() {
    const container = document.querySelector('.tabla-empleados');
    if (!container) return;

    // Limpiar filas existentes (mantener encabezados)
    const rows = container.querySelectorAll('.fila:not(.encabezados)');
    rows.forEach(row => row.remove());

    if (employees.length === 0) {
      const emptyRow = document.createElement('div');
      emptyRow.className = 'fila';
      emptyRow.innerHTML = `
        <div class="col" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #999;">
          No hay empleados registrados. Agrega uno haciendo click en "+ Agregar empleado"
        </div>
      `;
      container.appendChild(emptyRow);
      return;
    }

    employees.forEach(employee => {
      const row = document.createElement('div');
      row.className = 'fila';
      row.setAttribute('role', 'row');

      // usuarios es un objeto (relación uno a uno), no un array
      const hasUser = employee.usuarios ? true : false;
      const userInfo = employee.usuarios || null;

      row.innerHTML = `
        <div class="col col-id" role="cell">${employee.id_empleado}</div>
        <div class="col col-nombre" role="cell">${employee.nombre}</div>
        <div class="col col-apellidos" role="cell">${employee.apellidos}</div>
        <div class="col col-edad" role="cell">${employee.edad || 'N/A'}</div>
        <div class="col col-correo" role="cell">${employee.correo_electronico}</div>
        <div class="col col-acciones" role="cell">
          <a class="btn btn-outline" href="/templates/administracion/agregar_empleados?id=${employee.id_empleado}">Editar</a>
          ${!hasUser ? `<button class="btn btn-danger btn-sm" onclick="window.deleteEmployee(${employee.id_empleado})">Eliminar</button>` : ''}
        </div>
      `;

      container.appendChild(row);
    });
  }

  // Eliminar empleado
  window.deleteEmployee = async function(id) {
    if (!confirm('¿Estás seguro de eliminar este empleado? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await API.employees.delete(id);
      console.log(`✅ Empleado ${id} eliminado`);
      showSuccess('Empleado eliminado exitosamente');
      await loadEmployees();
    } catch (error) {
      console.error('❌ Error al eliminar empleado:', error);
      showError(error.message || 'No se pudo eliminar el empleado');
    }
  };

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

