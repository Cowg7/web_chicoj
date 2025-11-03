// Script para lista de usuarios (control-usuarios.html)

(() => {
  // Estado
  let users = [];

  // Inicializar
  async function init() {
    // Verificar autenticación
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/templates/login';
      return;
    }

    // Cargar usuarios
    await loadUsers();
  }

  // Cargar usuarios
  async function loadUsers() {
    try {
      const response = await API.users.getAll();
      const data = response.data || response;
      users = data.users || data || [];

      console.log('👥 Usuarios cargados:', users.length);

      displayUsers();
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      showError('No se pudieron cargar los usuarios');
    }
  }

  // Mostrar usuarios
  function displayUsers() {
    const container = document.querySelector('.tabla-usuarios');
    if (!container) return;

    // Limpiar filas existentes (mantener encabezados)
    const rows = container.querySelectorAll('.fila:not(.encabezados)');
    rows.forEach(row => row.remove());

    if (users.length === 0) {
      const emptyRow = document.createElement('div');
      emptyRow.className = 'fila';
      emptyRow.innerHTML = `
        <div class="col" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #999;">
          No hay usuarios registrados. Agrega uno haciendo click en "+ Agregar usuario"
        </div>
      `;
      container.appendChild(emptyRow);
      return;
    }

    users.forEach(user => {
      const row = document.createElement('div');
      row.className = 'fila';
      row.setAttribute('role', 'row');

      const employeeName = user.empleado ? 
        `${user.empleado.nombre} ${user.empleado.apellidos}` : 
        'Sin empleado';

      const roleName = user.rol ? user.rol.nombre_rol : 'Sin rol';
      const rolClass = getRolClass(roleName);

      row.innerHTML = `
        <div class="col col-id" role="cell">${user.id_usuario}</div>
        <div class="col col-empleado" role="cell">${employeeName}</div>
        <div class="col col-usuario" role="cell">@${user.usuario_nombre}</div>
        <div class="col col-rol" role="cell">
          <span class="badge ${rolClass}">${roleName}</span>
        </div>
        <div class="col col-acciones" role="cell">
          <a class="btn btn-outline" href="/templates/administracion/agregar_usuarios?id=${user.id_usuario}">Editar</a>
          <button class="btn btn-danger btn-sm" onclick="window.deleteUser(${user.id_usuario})">Eliminar</button>
        </div>
      `;

      container.appendChild(row);
    });
  }

  // Obtener clase CSS para el badge de rol
  function getRolClass(roleName) {
    const roleLower = roleName.toLowerCase();
    if (roleLower.includes('admin')) return 'badge-admin';
    if (roleLower.includes('mesero')) return 'badge-mesero';
    if (roleLower.includes('caja')) return 'badge-caja';
    if (roleLower.includes('cocina')) return 'badge-cocina';
    if (roleLower.includes('bebidas')) return 'badge-bebidas';
    if (roleLower.includes('coffee')) return 'badge-coffee';
    if (roleLower.includes('gerente')) return 'badge-gerente';
    if (roleLower.includes('cajero')) return 'badge-caja';
    return 'badge-default';
  }

  // Eliminar usuario
  window.deleteUser = async function(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await API.users.delete(id);
      console.log(`✅ Usuario ${id} eliminado`);
      showSuccess('Usuario eliminado exitosamente');
      await loadUsers();
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      showError(error.message || 'No se pudo eliminar el usuario');
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

