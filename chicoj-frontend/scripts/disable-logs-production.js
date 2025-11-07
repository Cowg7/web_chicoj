// Desactiva console.log en producción automáticamente
// Mantiene console.error y console.warn para debugging crítico

(() => {
  // Detectar si estamos en producción
  const isProduction = () => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Producción si:
    // - NO es localhost
    // - NO es IP local
    // - Usa puerto estándar (80, 443) o sin puerto
    return (
      hostname !== 'localhost' &&
      hostname !== '127.0.0.1' &&
      !hostname.startsWith('192.168.') &&
      !hostname.startsWith('10.') &&
      (!port || port === '80' || port === '443')
    );
  };

  // Si estamos en producción, desactivar logs
  if (isProduction()) {
    // Función vacía que no hace nada
    const noop = () => {};
    
    // Sobrescribir métodos de consola (excepto error y warn)
    console.log = noop;
    console.info = noop;
    console.debug = noop;
    console.table = noop;
    console.trace = noop;
    console.group = noop;
    console.groupCollapsed = noop;
    console.groupEnd = noop;
    
    // Mantener solo error y warn para debugging crítico
    // console.error se mantiene
    // console.warn se mantiene
    
    console.error('[SYSTEM] Logs desactivados en producción');
  } else {
    console.log('[SYSTEM] Modo desarrollo - Logs activos');
  }
})();

