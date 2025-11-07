/**
 * Sistema de Control de Acceso Basado en Roles (RBAC)
 * Define qué vistas y acciones están permitidas para cada rol
 */

// Configuración de acceso por rol
const ROLE_CONFIG = {
  'administrador': {
    allowedViews: ['*'], // Acceso a todo
    canAccessAdmin: true,
    canAccessReports: true,
    canAccessCashier: true,
    canAccessOrders: true,
    canAccessKDS: true,
    canAccessTour: true,
    landingPage: '/main'
  },
  'gerente': {
    allowedViews: [
      '/templates/reportes/reportes'
    ],
    canAccessAdmin: false,
    canAccessReports: true,
    canAccessCashier: false,
    canAccessOrders: false,
    canAccessKDS: false,
    canAccessTour: false,
    landingPage: '/templates/reportes/reportes'
  },
  'cajero': {
    allowedViews: [
      '/templates/caja/caja',
      '/templates/reportes/reportes'
    ],
    canAccessAdmin: false,
    canAccessReports: true,
    canAccessCashier: true,
    canAccessOrders: false,
    canAccessKDS: false,
    canAccessTour: false,
    landingPage: '/templates/caja/caja'
  },
  'mesero': {
    allowedViews: [
      '/templates/mesero/mesero_comanda',
      '/templates/mesero/comanda-control'
    ],
    canAccessAdmin: false,
    canAccessReports: false,
    canAccessCashier: false,
    canAccessOrders: true,
    canAccessKDS: false,
    canAccessTour: false,
    landingPage: '/templates/mesero/mesero_comanda'
  },
  'cocina': {
    allowedViews: [
      '/templates/cocina/cocina?area=Cocina',
      '/templates/cocina/menu_cocina'
    ],
    allowedKDSAreas: ['Cocina'],
    canAccessAdmin: false,
    canAccessReports: false,
    canAccessCashier: false,
    canAccessOrders: false,
    canAccessKDS: true,
    canAccessTour: false,
    landingPage: '/templates/cocina/cocina?area=Cocina'
  },
  'bebidas': {
    allowedViews: [
      '/templates/cocina/cocina?area=Bebidas',
      '/templates/cocina/menu_cocina'
    ],
    allowedKDSAreas: ['Bebidas'],
    canAccessAdmin: false,
    canAccessReports: false,
    canAccessCashier: false,
    canAccessOrders: false,
    canAccessKDS: true,
    canAccessTour: false,
    landingPage: '/templates/cocina/cocina?area=Bebidas'
  },
  'coffee': {
    allowedViews: [
      '/templates/cocina/cocina?area=Coffee',
      '/templates/cocina/menu_cocina'
    ],
    allowedKDSAreas: ['Coffee'],
    canAccessAdmin: false,
    canAccessReports: false,
    canAccessCashier: false,
    canAccessOrders: false,
    canAccessKDS: true,
    canAccessTour: false,
    landingPage: '/templates/cocina/cocina?area=Coffee'
  },
  'tour': {
    allowedViews: [
      '/templates/tour/tour',
      '/templates/tour/tour-control'
    ],
    canAccessAdmin: false,
    canAccessReports: false,
    canAccessCashier: false,
    canAccessOrders: false,
    canAccessKDS: false,
    canAccessTour: true,
    landingPage: '/templates/tour/tour'
  }
};

class AccessControl {
  constructor() {
    this.currentUser = null;
    this.currentRole = null;
    this.config = null;
  }

  /**
   * Inicializar control de acceso
   */
  init() {
    this.currentUser = AuthManager.getUser();
    
    if (!this.currentUser) {
      console.warn('[WARN] Usuario no autenticado');
      return false;
    }

    this.currentRole = (this.currentUser.rol || this.currentUser.role || '').toLowerCase();
    this.config = ROLE_CONFIG[this.currentRole];

    if (!this.config) {
      console.error(`[ERROR] Rol desconocido: ${this.currentRole}`);
      return false;
    }

    console.log(`[OK] Control de acceso activado para: ${this.currentRole}`);
    return true;
  }

  /**
   * Verificar si el usuario puede acceder a la vista actual
   */
  checkCurrentPageAccess() {
    if (!this.init()) {
      this.redirectToLogin();
      return false;
    }

    // Admin tiene acceso a todo
    if (this.config.allowedViews.includes('*')) {
      console.log('[OK] Usuario Admin - Acceso total permitido');
      return true;
    }

    const currentPath = window.location.pathname;
    const currentFullPath = window.location.pathname + window.location.search;

    console.log('[CHECK] Verificando acceso...');
    console.log('   [POINT] Ruta actual:', currentFullPath);
    console.log('   [INFO] Rutas permitidas:', this.config.allowedViews);

    // Verificar si la vista está permitida
    const hasAccess = this.config.allowedViews.some(allowedView => {
      // Comparación exacta con query params
      if (allowedView.includes('?')) {
        const match = currentFullPath.includes(allowedView);
        console.log(`   🔎 Comparando "${currentFullPath}" con "${allowedView}": ${match ? '[OK]' : '[ERROR]'}`);
        return match;
      }
      // Comparación solo de path
      const match = currentPath.includes(allowedView);
      console.log(`   🔎 Comparando "${currentPath}" con "${allowedView}": ${match ? '[OK]' : '[ERROR]'}`);
      return match;
    });

    if (!hasAccess) {
      console.warn(`[DENIED] Acceso denegado a: ${currentFullPath}`);
      console.warn(`   [HOME] Redirigiendo a página de inicio: ${this.config.landingPage}`);
      this.redirectToLandingPage();
      return false;
    }

    console.log(`[OK] Acceso permitido a: ${currentFullPath}`);
    return true;
  }

  /**
   * Verificar si el usuario puede acceder a un área específica del KDS
   */
  checkKDSAreaAccess(area) {
    if (!this.config) return false;

    // Admin tiene acceso a todo
    if (this.config.allowedViews.includes('*')) {
      return true;
    }

    // Verificar si el área está permitida para este rol
    if (this.config.allowedKDSAreas) {
      return this.config.allowedKDSAreas.includes(area);
    }

    return false;
  }

  /**
   * Ocultar elementos del menú según permisos
   */
  applyMenuRestrictions() {
    if (!this.config) return;

    // Si es admin, mostrar todo
    if (this.config.allowedViews.includes('*')) {
      return;
    }

    // Ocultar elementos del menú según permisos
    const menuItems = {
      'admin': '.menu-admin, [href*="main"], [href*="control-platillos"], [href*="empleados"], [href*="menu_usuarios"]',
      'reports': '[href*="reportes"]',
      'cashier': '[href*="caja"]',
      'orders': '[href*="comanda"], [href*="mesero"]',
      'kds': '[href*="cocina"], [href*="menu_cocina"]',
      'tour': '[href*="tour"]'
    };

    Object.entries(menuItems).forEach(([permission, selector]) => {
      const permissionKey = `canAccess${permission.charAt(0).toUpperCase() + permission.slice(1)}`;
      
      if (!this.config[permissionKey]) {
        document.querySelectorAll(selector).forEach(el => {
          el.style.display = 'none';
          el.disabled = true;
        });
      }
    });
  }

  /**
   * Restringir áreas del KDS en menu_cocina.html
   */
  applyKDSRestrictions() {
    if (!this.config || !this.config.allowedKDSAreas) return;

    // Admin ve todo
    if (this.config.allowedViews.includes('*')) return;

    const allowedAreas = this.config.allowedKDSAreas;

    // Ocultar botones de áreas no permitidas
    const areaButtons = {
      'Cocina': '[href*="area=Cocina"]',
      'Bebidas': '[href*="area=Bebidas"]',
      'Coffee': '[href*="area=Coffee"]'
    };

    Object.entries(areaButtons).forEach(([area, selector]) => {
      if (!allowedAreas.includes(area)) {
        document.querySelectorAll(selector).forEach(el => {
          const card = el.closest('.card, .menu-item, .btn-container');
          if (card) {
            card.style.display = 'none';
          } else {
            el.style.display = 'none';
          }
        });
      }
    });
  }

  /**
   * Verificar permisos específicos
   */
  can(permission) {
    if (!this.config) return false;
    return this.config[permission] === true;
  }

  /**
   * Obtener rol actual
   */
  getRole() {
    return this.currentRole;
  }

  /**
   * Redirigir al login
   */
  redirectToLogin() {
    console.log('[LOCK] Redirigiendo al login...');
    setTimeout(() => {
      window.location.href = '/templates/login';
    }, 500);
  }

  /**
   * Redirigir a la página de inicio del rol
   */
  redirectToLandingPage() {
    if (!this.config) {
      this.redirectToLogin();
      return;
    }

    console.log(`[HOME] Redirigiendo a: ${this.config.landingPage}`);
    setTimeout(() => {
      window.location.href = this.config.landingPage;
    }, 1000);
  }

  /**
   * Mostrar mensaje de acceso denegado
   */
  showAccessDenied(message = 'No tienes permiso para acceder a esta página') {
    const container = document.body;
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
    `;
    overlay.innerHTML = `
      <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center; max-width: 400px;">
        <h2 style="color: #f44336; margin-bottom: 1rem;">[DENIED] Acceso Denegado</h2>
        <p style="margin-bottom: 1.5rem;">${message}</p>
        <button onclick="window.location.href='${this.config.landingPage}'" 
                style="padding: 0.75rem 2rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;">
          Ir a mi página de inicio
        </button>
      </div>
    `;
    container.appendChild(overlay);
  }
}

// Instancia global
const accessControl = new AccessControl();

// Auto-inicializar en todas las páginas (excepto login)
if (!window.location.pathname.includes('login')) {
  document.addEventListener('DOMContentLoaded', () => {
    // Verificar acceso a la página actual
    if (!accessControl.checkCurrentPageAccess()) {
      return; // Ya redirigió
    }

    // Aplicar restricciones de menú
    accessControl.applyMenuRestrictions();

    // Si estamos en menu_cocina, aplicar restricciones de KDS
    if (window.location.pathname.includes('menu_cocina')) {
      accessControl.applyKDSRestrictions();
    }

    // Si estamos en cocina.html, verificar área permitida
    if (window.location.pathname.includes('cocina') && window.location.search.includes('area=')) {
      const urlParams = new URLSearchParams(window.location.search);
      const area = urlParams.get('area');
      
      if (!accessControl.checkKDSAreaAccess(area)) {
        accessControl.showAccessDenied(`No tienes permiso para acceder al área de ${area}`);
        accessControl.redirectToLandingPage();
      }
    }
  });
}

// Exportar para uso global
window.AccessControl = accessControl;



