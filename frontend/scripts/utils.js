// Utilidades comunes para toda la aplicación

// Formatear moneda
function formatCurrency(amount) {
  return `Q${parseFloat(amount).toFixed(2)}`;
}

// Formatear fecha
function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

// Formatear fecha y hora
function formatDateTime(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Validar email
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validar teléfono guatemalteco
function isValidPhone(phone) {
  // Formato: 8 dígitos o con código de país +502
  const regex = /^(\+502)?[0-9]{8}$/;
  return regex.test(phone.replace(/\s/g, ''));
}

// Debounce function (útil para búsquedas)
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Sanitizar HTML para prevenir XSS
function sanitizeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Copiar al portapapeles
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Copiado al portapapeles', 'success');
    return true;
  } catch (err) {
    console.error('Error al copiar:', err);
    showNotification('Error al copiar', 'error');
    return false;
  }
}

// Descargar JSON como archivo
function downloadJSON(data, filename = 'data.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Descargar CSV
function downloadCSV(data, filename = 'data.csv', headers = null) {
  if (!data || data.length === 0) {
    showNotification('No hay datos para exportar', 'error');
    return;
  }

  // Si no se proporcionan headers, usar las keys del primer objeto
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Crear filas CSV
  const rows = data.map(obj => 
    csvHeaders.map(header => {
      const value = obj[header] || '';
      // Escapar comillas y envolver en comillas si contiene comas
      return typeof value === 'string' && value.includes(',') 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
    }).join(',')
  );
  
  // Agregar header
  const csv = [csvHeaders.join(','), ...rows].join('\n');
  
  // Descargar
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('Archivo descargado exitosamente', 'success');
}

// Imprimir tabla
function printTable(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    showNotification('Tabla no encontrada', 'error');
    return;
  }

  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>Imprimir</title>');
  printWindow.document.write('<style>');
  printWindow.document.write('table { border-collapse: collapse; width: 100%; }');
  printWindow.document.write('th, td { border: 1px solid black; padding: 8px; text-align: left; }');
  printWindow.document.write('th { background-color: #f2f2f2; }');
  printWindow.document.write('</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(table.outerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

// Generar ID único
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Calcular tiempo transcurrido (ej: "hace 5 minutos")
function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now - past) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `hace ${interval} años`;
  if (interval === 1) return 'hace 1 año';

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `hace ${interval} meses`;
  if (interval === 1) return 'hace 1 mes';

  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `hace ${interval} días`;
  if (interval === 1) return 'hace 1 día';

  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `hace ${interval} horas`;
  if (interval === 1) return 'hace 1 hora';

  interval = Math.floor(seconds / 60);
  if (interval > 1) return `hace ${interval} minutos`;
  if (interval === 1) return 'hace 1 minuto';

  return 'hace un momento';
}

// Validar formulario
function validateForm(formElement) {
  if (!formElement) return false;

  const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
  let isValid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      isValid = false;
    } else {
      input.classList.remove('error');
    }
  });

  if (!isValid) {
    showNotification('Por favor completa todos los campos requeridos', 'error');
  }

  return isValid;
}

// Limpiar formulario
function clearForm(formElement) {
  if (!formElement) return;

  const inputs = formElement.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (input.type === 'checkbox' || input.type === 'radio') {
      input.checked = false;
    } else if (!input.readOnly && !input.disabled) {
      input.value = '';
    }
    input.classList.remove('error');
  });
}

// Crear modal simple
function createModal(title, content, buttons = []) {
  // Remover modal existente si hay
  const existingModal = document.getElementById('custom-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'custom-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    padding: 24px;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  `;

  const modalTitle = document.createElement('h3');
  modalTitle.textContent = title;
  modalTitle.style.marginTop = '0';

  const modalBody = document.createElement('div');
  modalBody.innerHTML = content;
  modalBody.style.margin = '16px 0';

  const modalFooter = document.createElement('div');
  modalFooter.style.cssText = 'display: flex; gap: 8px; justify-content: flex-end;';

  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.textContent = btn.text;
    button.className = btn.class || 'btn';
    button.onclick = () => {
      if (btn.onClick) btn.onClick();
      modal.remove();
    };
    modalFooter.appendChild(button);
  });

  modalContent.appendChild(modalTitle);
  modalContent.appendChild(modalBody);
  modalContent.appendChild(modalFooter);
  modal.appendChild(modalContent);

  document.body.appendChild(modal);

  // Cerrar al hacer click fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  return modal;
}

// Confirmar acción
function confirmAction(message, onConfirm, onCancel = null) {
  return createModal(
    'Confirmar acción',
    message,
    [
      {
        text: 'Cancelar',
        class: 'btn btn-outline',
        onClick: onCancel
      },
      {
        text: 'Confirmar',
        class: 'btn btn-primary',
        onClick: onConfirm
      }
    ]
  );
}

// Cargar imagen como base64
function loadImageAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Exportar todas las funciones
window.Utils = {
  formatCurrency,
  formatDate,
  formatDateTime,
  isValidEmail,
  isValidPhone,
  debounce,
  sanitizeHTML,
  copyToClipboard,
  downloadJSON,
  downloadCSV,
  printTable,
  generateUUID,
  timeAgo,
  validateForm,
  clearForm,
  createModal,
  confirmAction,
  loadImageAsBase64
};

// Agregar estilos para inputs con error
if (!document.getElementById('utils-styles')) {
  const style = document.createElement('style');
  style.id = 'utils-styles';
  style.textContent = `
    input.error, select.error, textarea.error {
      border-color: #f44336 !important;
      background-color: #ffebee !important;
    }
  `;
  document.head.appendChild(style);
}




