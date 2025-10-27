// Sistema de Notificaciones para Meseros
// Maneja la recepción y visualización de notificaciones de platillos listos

(() => {
  // Variables globales
  let notificationsRefreshInterval = null;
  let previousNotificationCount = 0;
  let isLoadingNotifications = false;

  // Elementos del DOM
  const btnNotifications = document.getElementById('btn-notifications');
  const notificationCount = document.getElementById('notification-count');
  const notificationsPanel = document.getElementById('notifications-panel');
  const btnCloseNotifications = document.getElementById('btn-close-notifications');
  const notificationsList = document.getElementById('notifications-list');
  const btnMarkAllRead = document.getElementById('btn-mark-all-read');
  const notificationSound = document.getElementById('notification-sound');

  // Inicializar sistema de notificaciones
  async function initNotifications() {
    console.log('🔔 Inicializando sistema de notificaciones...');

    // Cargar notificaciones iniciales
    await loadNotifications();

    // Event listeners
    if (btnNotifications) {
      btnNotifications.addEventListener('click', toggleNotificationsPanel);
    }

    if (btnCloseNotifications) {
      btnCloseNotifications.addEventListener('click', closeNotificationsPanel);
    }

    if (btnMarkAllRead) {
      btnMarkAllRead.addEventListener('click', markAllAsRead);
    }

    // Cerrar panel al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (notificationsPanel && 
          notificationsPanel.style.display !== 'none' &&
          !notificationsPanel.contains(e.target) &&
          !btnNotifications.contains(e.target)) {
        closeNotificationsPanel();
      }
    });

    // Auto-refresh cada 10 segundos
    notificationsRefreshInterval = setInterval(async () => {
      await loadNotifications();
    }, 10000);

    console.log('✅ Sistema de notificaciones iniciado');
  }

  // Cargar notificaciones del servidor
  async function loadNotifications() {
    if (isLoadingNotifications) return;

    try {
      isLoadingNotifications = true;

      console.log('📡 Consultando notificaciones al servidor...');
      console.log('🔑 Token:', AuthManager.getToken() ? 'Presente ✅' : 'Ausente ❌');
      console.log('👤 Usuario:', AuthManager.getUser());

      const response = await API.notifications.getUnread();
      console.log('📦 Respuesta completa del servidor:', response);
      
      const data = response.data || response;
      const notifications = data.notificaciones || [];
      const count = notifications.length;

      console.log(`🔔 ${count} notificaciones no leídas`);
      console.log('📋 Notificaciones recibidas:', notifications);

      // Actualizar badge de contador
      if (count > 0) {
        if (notificationCount) {
          notificationCount.textContent = count > 99 ? '99+' : count;
          notificationCount.style.display = 'flex';
        }

        // Si hay nuevas notificaciones, reproducir sonido
        if (count > previousNotificationCount) {
          playNotificationSound();
        }
      } else {
        if (notificationCount) {
          notificationCount.style.display = 'none';
        }
      }

      previousNotificationCount = count;

      // Renderizar notificaciones
      renderNotifications(notifications);
    } catch (error) {
      console.error('❌ Error al cargar notificaciones:', error);
      console.error('📊 Detalles del error:', {
        message: error.message,
        stack: error.stack
      });
      
      // Si es un error 401, puede ser que el token expiró
      if (error.message?.includes('401')) {
        console.error('🔒 Error de autenticación - El token puede haber expirado');
        console.error('💡 Intenta cerrar sesión y volver a iniciar sesión');
      }
    } finally {
      isLoadingNotifications = false;
    }
  }

  // Reproducir sonido de notificación
  function playNotificationSound() {
    if (notificationSound) {
      try {
        notificationSound.volume = 0.5;
        notificationSound.play().catch(err => {
          console.log('No se pudo reproducir sonido:', err);
        });
      } catch (error) {
        console.log('Error al reproducir sonido:', error);
      }
    }
  }

  // Renderizar lista de notificaciones
  function renderNotifications(notifications) {
    if (!notificationsList) return;

    if (notifications.length === 0) {
      notificationsList.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #999;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
          <p>No tienes notificaciones pendientes</p>
        </div>
      `;
      return;
    }

    const html = notifications.map(notif => {
      const fecha = new Date(notif.fecha_creacion);
      const timeAgo = getTimeAgo(fecha);
      const tipo = notif.tipo || 'info';
      const leida = notif.leida ? 'read' : 'unread';

      return `
        <div class="notification-item ${leida} ${tipo}" data-id="${notif.id_notificacion}">
          <button class="btn-delete" onclick="window.deleteNotification(${notif.id_notificacion})">🗑️</button>
          <div class="notification-title">${notif.titulo}</div>
          <div class="notification-message">${notif.mensaje}</div>
          ${notif.no_mesa ? `<div class="notification-message">📍 ${notif.no_mesa}</div>` : ''}
          <div class="notification-time">⏰ ${timeAgo}</div>
        </div>
      `;
    }).join('');

    notificationsList.innerHTML = html;

    // Agregar evento click para marcar como leída al hacer clic
    const items = notificationsList.querySelectorAll('.notification-item');
    items.forEach(item => {
      item.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-delete')) return;
        
        const id = item.getAttribute('data-id');
        await markAsRead(id);
      });
    });
  }

  // Calcular tiempo transcurrido
  function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins === 1) return 'Hace 1 minuto';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'Hace 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hace 1 día';
    return `Hace ${diffDays} días`;
  }

  // Abrir/cerrar panel de notificaciones
  function toggleNotificationsPanel() {
    if (!notificationsPanel) return;

    if (notificationsPanel.style.display === 'none') {
      notificationsPanel.style.display = 'flex';
      loadNotifications(); // Refrescar al abrir
    } else {
      notificationsPanel.style.display = 'none';
    }
  }

  // Cerrar panel de notificaciones
  function closeNotificationsPanel() {
    if (notificationsPanel) {
      notificationsPanel.style.display = 'none';
    }
  }

  // Marcar notificación como leída
  async function markAsRead(id) {
    try {
      await API.notifications.markAsRead(id);
      await loadNotifications(); // Recargar para actualizar
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  }

  // Marcar todas como leídas
  async function markAllAsRead() {
    try {
      await API.notifications.markAllAsRead();
      showNotification('Todas las notificaciones marcadas como leídas', 'success');
      await loadNotifications(); // Recargar
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      showNotification('Error al marcar notificaciones', 'error');
    }
  }

  // Eliminar notificación
  window.deleteNotification = async function(id) {
    try {
      await API.notifications.delete(id);
      await loadNotifications(); // Recargar
      showNotification('Notificación eliminada', 'success');
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      showNotification('Error al eliminar notificación', 'error');
    }
  };

  // Limpiar intervalo al salir
  window.addEventListener('beforeunload', () => {
    if (notificationsRefreshInterval) {
      clearInterval(notificationsRefreshInterval);
    }
  });

  // Pausar/reanudar cuando la pestaña cambia de visibilidad
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (notificationsRefreshInterval) {
        clearInterval(notificationsRefreshInterval);
        console.log('⏸️ Notificaciones pausadas (pestaña oculta)');
      }
    } else {
      // Reanudar
      if (notificationsRefreshInterval) {
        clearInterval(notificationsRefreshInterval);
      }
      notificationsRefreshInterval = setInterval(async () => {
        await loadNotifications();
      }, 10000);
      console.log('▶️ Notificaciones reanudadas');
      
      // Cargar inmediatamente al volver
      loadNotifications();
    }
  });

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
  } else {
    initNotifications();
  }

  // Exportar funciones para uso global
  window.NotificationsManager = {
    loadNotifications,
    markAsRead,
    markAllAsRead,
    playNotificationSound
  };
})();

