// Sistema de logging controlado para producción
// Solo muestra logs en desarrollo, los oculta en producción

const Logger = {
  // Detectar si estamos en desarrollo o producción
  isDevelopment() {
    // Considera desarrollo si:
    // - hostname es localhost
    // - hostname es una IP local (192.168.x.x, 127.0.0.1)
    // - puerto no estándar (no es 80 ni 443)
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      (port && port !== '80' && port !== '443' && port !== '')
    );
  },

  // Log normal
  log(...args) {
    if (this.isDevelopment()) {
      console.log(...args);
    }
  },

  // Errores (siempre se muestran)
  error(...args) {
    console.error(...args);
  },

  // Advertencias (siempre se muestran)
  warn(...args) {
    console.warn(...args);
  },

  // Info (solo en desarrollo)
  info(...args) {
    if (this.isDevelopment()) {
      console.info(...args);
    }
  },

  // Debug (solo en desarrollo)
  debug(...args) {
    if (this.isDevelopment()) {
      console.debug(...args);
    }
  },

  // Tabla (solo en desarrollo)
  table(data) {
    if (this.isDevelopment()) {
      console.table(data);
    }
  }
};

// Exportar para uso global
window.Logger = Logger;

// Opcional: También puedes sobrescribir console.log globalmente
// Descomenta las siguientes líneas si quieres que TODO console.log se controle automáticamente
/*
if (!Logger.isDevelopment()) {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  console.table = noop;
  // Mantenemos console.error y console.warn siempre activos
}
*/

