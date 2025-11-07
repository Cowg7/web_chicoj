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
    console.log('[NOTIF] Inicializando sistema de notificaciones...');

    // Solicitar permisos de notificaciones del navegador
    requestNotificationPermission();

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

    console.log('[OK] Sistema de notificaciones iniciado');
  }

  // Cargar notificaciones del servidor
  async function loadNotifications() {
    if (isLoadingNotifications) return;

    try {
      isLoadingNotifications = true;

      console.log('[FETCH] Consultando notificaciones al servidor...');
      console.log('[AUTH] Token:', AuthManager.getToken() ? 'Presente [OK]' : 'Ausente [ERROR]');
      console.log('[USER] Usuario:', AuthManager.getUser());

      const response = await API.notifications.getUnread();
      console.log('[DATA] Respuesta completa del servidor:', response);
      
      const data = response.data || response;
      const notifications = data.notificaciones || [];
      const count = notifications.length;

      console.log(`[NOTIF] ${count} notificaciones no leídas`);
      console.log('[INFO] Notificaciones recibidas:', notifications);

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
      console.error('[ERROR] Error al cargar notificaciones:', error);
      console.error('[STATS] Detalles del error:', {
        message: error.message,
        stack: error.stack
      });
      
      // Si es un error 401, puede ser que el token expiró
      if (error.message?.includes('401')) {
        console.error('[LOCK] Error de autenticación - El token puede haber expirado');
        console.error('[TIP] Intenta cerrar sesión y volver a iniciar sesión');
      }
    } finally {
      isLoadingNotifications = false;
    }
  }

  // Solicitar permisos de notificaciones del navegador
  function requestNotificationPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        console.log('[NOTIF] Solicitando permisos de notificación...');
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('[OK] Permisos de notificación otorgados');
            // Mostrar notificación de prueba
            new Notification('[OK] Notificaciones Activadas', {
              body: 'Ahora recibirás alertas de platillos listos',
              icon: '/assets/favicon-96x96.png',
              tag: 'chicoj-welcome'
            });
          } else {
            console.log('[WARN] Permisos de notificación denegados');
          }
        });
      } else if (Notification.permission === 'granted') {
        console.log('[OK] Permisos de notificación ya otorgados');
      } else {
        console.log('[ERROR] Permisos de notificación denegados');
      }
    } else {
      console.log('[WARN] Este navegador no soporta notificaciones');
    }
  }

  // Crear sonido de notificación con Web Audio API
  function createNotificationBeep() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      
      // Crear tres tonos ascendentes (Do-Mi-Sol)
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
      const duration = 0.15;
      const gap = 0.05;
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (index * (duration + gap));
        const endTime = startTime + duration;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
        
        oscillator.start(startTime);
        oscillator.stop(endTime);
      });
      
      console.log('[SOUND] Beep melódico reproducido');
    } catch (error) {
      console.log('[WARN] Error al crear beep:', error.message);
    }
  }

  // Reproducir sonido de notificación
  function playNotificationSound() {
    console.log('[AUDIO] Reproduciendo sonido de notificación...');
    
    // 1. Sonido melódico con Web Audio API
    createNotificationBeep();
    
    // 2. Vibración (si el dispositivo lo soporta)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]); // Vibrar: 200ms, pausa 100ms, 200ms
    }
    
    // 3. Mostrar notificación del navegador (si tiene permisos)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('[NOTIF] Platillo Listo', {
        body: 'Tienes una nueva notificación',
        icon: '/assets/favicon-96x96.png',
        badge: '/assets/favicon-96x96.png',
        tag: 'chicoj-notification',
        requireInteraction: false,
        silent: false // Usar el sonido del sistema
      });
    }
    
    // 4. Flash visual en el badge
    if (notificationCount) {
      notificationCount.style.animation = 'none';
      setTimeout(() => {
        notificationCount.style.animation = 'pulse 0.5s ease-in-out 3';
      }, 10);
    }
  }

  // Renderizar lista de notificaciones
  function renderNotifications(notifications) {
    if (!notificationsList) return;

    if (notifications.length === 0) {
      notificationsList.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #999;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
          <p style="color: #6B7280; font-size: 0.95rem;">No tienes notificaciones pendientes</p>
        </div>
      `;
      return;
    }

    const html = notifications.map(notif => {
      const fecha = new Date(notif.fecha_creacion);
      const timeAgo = getTimeAgo(fecha);
      const tipo = notif.tipo || 'info';
      const leida = notif.leida ? 'read' : 'unread';
      
      // Icono según el tipo de notificación
      let statusIcon = '✅';
      let statusColor = '#10B981';
      let statusLabel = 'Completado';
      
      if (tipo === 'success' || tipo === 'order_ready') {
        statusIcon = '✅';
        statusColor = '#10B981';
        statusLabel = 'Listo';
      } else if (tipo === 'warning') {
        statusIcon = '⚠️';
        statusColor = '#F59E0B';
        statusLabel = 'Atención';
      } else if (tipo === 'error') {
        statusIcon = '❌';
        statusColor = '#EF4444';
        statusLabel = 'Error';
      } else if (tipo === 'info') {
        statusIcon = 'ℹ️';
        statusColor = '#3B82F6';
        statusLabel = 'Info';
      }

      return `
        <div class="notification-item ${leida} ${tipo}" data-id="${notif.id_notificacion}">
          <div class="notification-header">
            <span class="notification-status-badge" style="background: ${statusColor}15; color: ${statusColor}; border: 1px solid ${statusColor}30;">
              <span style="font-size: 0.9rem;">${statusIcon}</span>
              <span style="font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">${statusLabel}</span>
            </span>
            <button class="btn-delete-modern" onclick="window.deleteNotification(${notif.id_notificacion})" title="Eliminar notificación">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="notification-title">${notif.titulo}</div>
          <div class="notification-message">${notif.mensaje}</div>
          ${notif.no_mesa ? `
            <div class="notification-badge-container">
              <span class="notification-badge-mesa">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
                <span>Mesa ${notif.no_mesa}</span>
              </span>
            </div>
          ` : ''}
          <div class="notification-time">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>${timeAgo}</span>
          </div>
        </div>
      `;
    }).join('');

    notificationsList.innerHTML = html;

    // Agregar evento click para marcar como leída al hacer clic
    const items = notificationsList.querySelectorAll('.notification-item');
    items.forEach(item => {
      item.addEventListener('click', async (e) => {
        if (e.target.closest('.btn-delete-modern')) return;
        
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
        console.log('[PAUSE] Notificaciones pausadas (pestaña oculta)');
      }
    } else {
      // Reanudar
      if (notificationsRefreshInterval) {
        clearInterval(notificationsRefreshInterval);
      }
      notificationsRefreshInterval = setInterval(async () => {
        await loadNotifications();
      }, 10000);
      console.log('[PLAY] Notificaciones reanudadas');
      
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

