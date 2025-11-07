/**
 * SISTEMA DE CONFIRMACIÓN MODAL MODERNO
 * Reemplaza confirm() del navegador
 */

(() => {
  'use strict';

  let confirmResolve = null;

  // Crear modal de confirmación
  function createConfirmModal() {
    const modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.className = 'confirm-modal-overlay';
    modal.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 999999;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease;
    `;

    modal.innerHTML = `
      <div class="confirm-modal-box" style="
        background: white;
        border-radius: 16px;
        padding: 0;
        max-width: 480px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
      ">
        <div class="confirm-modal-header" style="
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
          color: white;
        ">
          <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Confirmación
          </h3>
        </div>
        
        <div class="confirm-modal-body" style="
          padding: 2rem;
          font-size: 1.05rem;
          color: #111827;
          line-height: 1.6;
        ">
          <p id="confirm-message" style="margin: 0;"></p>
        </div>
        
        <div class="confirm-modal-footer" style="
          padding: 1.5rem 2rem;
          background: #F5F7FA;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        ">
          <button id="confirm-cancel" style="
            padding: 0.75rem 1.5rem;
            border: 2px solid #E5E7EB;
            background: white;
            color: #6B7280;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.2s;
          ">
            Cancelar
          </button>
          <button id="confirm-accept" style="
            padding: 0.75rem 1.5rem;
            border: none;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          ">
            Confirmar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Estilos adicionales
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(50px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      .confirm-modal-overlay.show {
        display: flex !important;
      }
      
      #confirm-cancel:hover {
        background: #F3F4F6;
        border-color: #9CA3AF;
      }
      
      #confirm-accept:hover {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
      }
      
      #confirm-cancel:active,
      #confirm-accept:active {
        transform: scale(0.98);
      }
    `;
    document.head.appendChild(style);

    return modal;
  }

  /**
   * Mostrar confirmación modal
   * @param {string} message - Mensaje de confirmación
   * @param {object} options - Opciones (title, confirmText, cancelText)
   * @returns {Promise<boolean>} - true si acepta, false si cancela
   */
  function showConfirm(message, options = {}) {
    return new Promise((resolve) => {
      let modal = document.getElementById('confirm-modal');
      
      if (!modal) {
        modal = createConfirmModal();
      }

      const messageEl = document.getElementById('confirm-message');
      const acceptBtn = document.getElementById('confirm-accept');
      const cancelBtn = document.getElementById('confirm-cancel');

      // Configurar mensaje
      if (messageEl) {
        messageEl.textContent = message;
      }

      // Configurar texto de botones
      if (options.confirmText && acceptBtn) {
        acceptBtn.textContent = options.confirmText;
      } else if (acceptBtn) {
        acceptBtn.textContent = 'Confirmar';
      }

      if (options.cancelText && cancelBtn) {
        cancelBtn.textContent = options.cancelText;
      } else if (cancelBtn) {
        cancelBtn.textContent = 'Cancelar';
      }

      // Event listeners
      const handleAccept = () => {
        closeModal();
        resolve(true);
      };

      const handleCancel = () => {
        closeModal();
        resolve(false);
      };

      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          handleCancel();
        }
      };

      // Limpiar listeners anteriores
      acceptBtn.replaceWith(acceptBtn.cloneNode(true));
      cancelBtn.replaceWith(cancelBtn.cloneNode(true));

      // Obtener referencias nuevas
      const newAcceptBtn = document.getElementById('confirm-accept');
      const newCancelBtn = document.getElementById('confirm-cancel');

      newAcceptBtn.addEventListener('click', handleAccept);
      newCancelBtn.addEventListener('click', handleCancel);
      document.addEventListener('keydown', handleEscape);

      // Cerrar al hacer click fuera
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          handleCancel();
        }
      });

      // Mostrar modal
      function closeModal() {
        modal.classList.remove('show');
        document.removeEventListener('keydown', handleEscape);
      }

      modal.classList.add('show');
      
      // Focus en botón de cancelar por defecto
      setTimeout(() => newCancelBtn.focus(), 100);
    });
  }

  // Exponer globalmente
  window.showConfirm = showConfirm;
  window.Confirm = showConfirm;

  // Sobrescribir confirm nativo (opcional)
  // window.confirm = showConfirm;

  console.log('[OK] Sistema de confirmación modal iniciado');
})();




