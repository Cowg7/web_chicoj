/**
 * SISTEMA DE NOTIFICACIONES TOAST PROFESIONAL
 * Notificaciones push modernas tipo toast
 */

(() => {
  'use strict';

  // Contenedor de notificaciones
  let toastContainer = null;
  let toastCounter = 0;

  // Inicializar contenedor
  function initToastContainer() {
    if (toastContainer) return;

    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.setAttribute('role', 'region');
    toastContainer.setAttribute('aria-label', 'Notificaciones');
    document.body.appendChild(toastContainer);
  }

  /**
   * Mostrar notificación toast
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duración en ms (0 = no auto-cerrar)
   * @param {object} options - Opciones adicionales
   */
  function showToast(message, type = 'info', duration = 5000, options = {}) {
    initToastContainer();

    const toast = document.createElement('div');
    const toastId = `toast-${++toastCounter}`;
    toast.id = toastId;
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    // Iconos según tipo
    const icons = {
      success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>`,
      error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>`,
      warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>`,
      info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <circle cx="12" cy="12" r="10"></circle>
               <line x1="12" y1="16" x2="12" y2="12"></line>
               <line x1="12" y1="8" x2="12.01" y2="8"></line>
             </svg>`
    };

    // Títulos según tipo
    const titles = {
      success: options.title || 'Éxito',
      error: options.title || 'Error',
      warning: options.title || 'Advertencia',
      info: options.title || 'Información'
    };

    toast.innerHTML = `
      <div class="toast-icon">
        ${icons[type] || icons.info}
      </div>
      <div class="toast-content">
        <div class="toast-title">${titles[type]}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Cerrar notificación">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      ${duration > 0 ? `<div class="toast-progress"></div>` : ''}
    `;

    // Botón cerrar
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toastId));

    // Agregar al contenedor
    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Barra de progreso
    if (duration > 0) {
      const progress = toast.querySelector('.toast-progress');
      if (progress) {
        progress.style.animation = `toast-progress ${duration}ms linear`;
      }

      // Auto-cerrar
      setTimeout(() => removeToast(toastId), duration);
    }

    // Sonido opcional
    if (options.sound) {
      playToastSound(type);
    }

    return toastId;
  }

  /**
   * Remover notificación
   */
  function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (!toast) return;

    toast.classList.remove('show');
    toast.classList.add('hide');

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  /**
   * Sonido de notificación
   */
  function playToastSound(type) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Frecuencias según tipo
      const frequencies = {
        success: [523.25, 659.25, 783.99], // C5, E5, G5
        error: [329.63, 293.66, 261.63],    // E4, D4, C4
        warning: [440, 554.37],             // A4, C#5
        info: [523.25, 587.33]              // C5, D5
      };

      const freq = frequencies[type] || frequencies.info;
      let time = audioContext.currentTime;

      freq.forEach((f, i) => {
        oscillator.frequency.setValueAtTime(f, time);
        gainNode.gain.setValueAtTime(0.1, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        time += 0.1;
      });

      oscillator.start(audioContext.currentTime);
      oscillator.stop(time);
    } catch (e) {
      console.warn('[TOAST] No se pudo reproducir sonido:', e);
    }
  }

  /**
   * Atajos para cada tipo
   */
  const Toast = {
    success: (message, duration, options) => showToast(message, 'success', duration, options),
    error: (message, duration, options) => showToast(message, 'error', duration, options),
    warning: (message, duration, options) => showToast(message, 'warning', duration, options),
    info: (message, duration, options) => showToast(message, 'info', duration, options),
    
    // Para compatibilidad con código existente
    show: showToast,
    remove: removeToast
  };

  // Exponer globalmente
  window.Toast = Toast;
  window.showToast = showToast;

  // Alias para compatibilidad con showNotification existente
  window.showNotification = (message, type = 'info', duration = 5000) => {
    showToast(message, type, duration);
  };

  console.log('[OK] Sistema de notificaciones Toast iniciado');
})();

