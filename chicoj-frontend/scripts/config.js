// Configuración centralizada de la aplicación

// Detectar URL base automáticamente
function getBaseURL() {
  const protocol = window.location.protocol; // http: o https:
  const hostname = window.location.hostname;
  
  // En producción, usar el mismo protocolo y hostname (sin puerto)
  // Nginx actúa como reverse proxy y redirige /api/ al backend
  return `${protocol}//${hostname}/api`;
}

// URL base de la API
const API_CONFIG = {
  // Se configura automáticamente según desde dónde accedas
  baseURL: getBaseURL(),
  
  // Endpoints
  endpoints: {
    // Auth
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    
    // Menu
    menu: '/menu',
    areas: '/menu/areas',
    
    // Orders
    orders: '/orders',
    
    // KDS
    kds: '/kds',
    kdsStats: '/kds/stats',
    
    // Cashier
    cashier: '/cashier',
    cashierPending: '/cashier/pending',
    cashierHistory: '/cashier/history',
    cashierStats: '/cashier/stats',
    
    // Tour
    tour: '/tour',
    tourStats: '/tour/stats',
    
    // Reports
    reports: '/reports',
    kpi: '/reports/kpi',
    sales: '/reports/sales',
    dashboard: '/reports/dashboard',
    
    // Employees
    employees: '/employees',
    employeesAvailable: '/employees/available',
    
    // Users (Admin)
    users: '/users',
    roles: '/users/roles'
  },
  
  // Timeouts
  timeout: 10000,
  
  // Headers por defecto
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
};

// Manejo de sesión
const AuthManager = {
  // Guardar token
  setToken(token) {
    try {
      localStorage.setItem('auth_token', token);
    } catch (e) {
      console.error('Error al guardar token:', e);
    }
  },
  
  // Obtener token
  getToken() {
    try {
      return localStorage.getItem('auth_token');
    } catch (e) {
      console.error('Error al obtener token:', e);
      return null;
    }
  },
  
  // Eliminar token
  removeToken() {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    } catch (e) {
      console.error('Error al eliminar token:', e);
    }
  },
  
  // Guardar datos de usuario
  setUser(userData) {
    try {
      localStorage.setItem('user_data', JSON.stringify(userData));
    } catch (e) {
      console.error('Error al guardar usuario:', e);
    }
  },
  
  // Obtener datos de usuario
  getUser() {
    try {
      const data = localStorage.getItem('user_data');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error al obtener usuario:', e);
      return null;
    }
  },
  
  // Verificar si está autenticado
  isAuthenticated() {
    return !!this.getToken();
  },
  
  // Cerrar sesión
  logout() {
    this.removeToken();
    window.location.href = '/templates/login.html';
  }
};

// Exportar para uso global
window.API_CONFIG = API_CONFIG;
window.AuthManager = AuthManager;

