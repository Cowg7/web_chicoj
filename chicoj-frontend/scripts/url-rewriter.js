/**
 * URL REWRITER - URLs Limpias
 * Remueve .html de todas las URLs del cliente
 */

(function() {
  'use strict';
  
  console.log('🔗 URL Rewriter cargado');
  
  // Función para limpiar URL (remover .html)
  function cleanURL(url) {
    if (!url) return url;
    
    // Si la URL tiene .html, removerla
    if (url.includes('.html')) {
      return url.replace(/\.html/g, '');
    }
    
    return url;
  }
  
  // Función para agregar .html si es necesario (para fetch/AJAX)
  function addHTMLIfNeeded(url) {
    // Si es una ruta relativa sin extensión y no es API
    if (url && !url.includes('.') && !url.includes('/api/') && !url.startsWith('http')) {
      // Si termina en /, no agregar nada
      if (url.endsWith('/')) {
        return url + 'index';
      }
      // Si es una ruta, agregar .html
      if (url.includes('/')) {
        return url + '.html';
      }
    }
    return url;
  }
  
  // Interceptar todos los clicks en enlaces
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    
    if (link && link.href) {
      const href = link.getAttribute('href');
      
      // Solo procesar enlaces relativos (no externos, no #)
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto')) {
        // Si tiene .html, limpiar
        if (href.includes('.html')) {
          e.preventDefault();
          const cleanHref = cleanURL(href);
          console.log('🔗 Navegando a:', cleanHref);
          window.location.href = cleanHref;
        }
      }
    }
  });
  
  // Limpiar URL actual si tiene .html
  function cleanCurrentURL() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('.html')) {
      const cleanPath = cleanURL(currentPath);
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      
      console.log('🔗 Limpiando URL actual:', currentPath, '→', cleanPath);
      
      // Reemplazar en el historial sin recargar
      window.history.replaceState({}, '', cleanPath + search + hash);
    }
  }
  
  // Limpiar URL al cargar
  cleanCurrentURL();
  
  // Exponer funciones globalmente por si se necesitan
  window.URLRewriter = {
    clean: cleanURL,
    addHTML: addHTMLIfNeeded
  };
  
  console.log('✅ URL Rewriter activo - URLs limpias habilitadas');
})();

