// Funciones de utilidad para hacer peticiones HTTP a la API

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Headers por defecto
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Agregar token si existe
    const token = AuthManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Configuración de la petición
    const config = {
      method: options.method || 'GET',
      headers,
      ...options
    };

    // Si hay body, convertir a JSON
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Si es 401, redirigir a login
      if (response.status === 401) {
        AuthManager.logout();
        return null;
      }

      // Parsear respuesta
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // El backend puede enviar 'error' o 'message'
        const errorMessage = data.error || data.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('Error en petición:', error);
      throw error;
    }
  }

  // GET
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST
  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body
    });
  }

  // PATCH
  async patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body
    });
  }

  // DELETE
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

// Crear instancia global
const api = new ApiClient(API_CONFIG.baseURL);

// Funciones específicas para cada módulo
const API = {
  // Auth
  auth: {
    login: (username, password) => api.post(API_CONFIG.endpoints.login, { username, password }),
    register: (userData) => api.post(API_CONFIG.endpoints.register, userData),
    getMe: () => api.get(API_CONFIG.endpoints.me)
  },

  // Menu
  menu: {
    getAll: (params) => api.get(API_CONFIG.endpoints.menu, params),
    getById: (id) => api.get(`${API_CONFIG.endpoints.menu}/${id}`),
    getAreas: () => api.get(API_CONFIG.endpoints.areas),
    create: (platillo) => api.post(API_CONFIG.endpoints.menu, platillo),
    update: (id, platillo) => api.patch(`${API_CONFIG.endpoints.menu}/${id}`, platillo),
    delete: (id) => api.delete(`${API_CONFIG.endpoints.menu}/${id}`),
    toggleDisponibilidad: (id, disponible) => api.patch(`${API_CONFIG.endpoints.menu}/${id}/disponibilidad`, { disponible })
  },

  // Categorias
  categorias: {
    getAll: (params) => api.get('/categorias', params),
    getById: (id) => api.get(`/categorias/${id}`),
    create: (categoria) => api.post('/categorias', categoria),
    update: (id, categoria) => api.patch(`/categorias/${id}`, categoria),
    delete: (id) => api.delete(`/categorias/${id}`),
    toggle: (id, activa) => api.patch(`/categorias/${id}/toggle`, { activa })
  },

  // Orders
  orders: {
    getAll: (params) => api.get(API_CONFIG.endpoints.orders, params),
    getReady: () => api.get(`${API_CONFIG.endpoints.orders}/ready`),
    getById: (id) => api.get(`${API_CONFIG.endpoints.orders}/${id}`),
    create: (order) => api.post(API_CONFIG.endpoints.orders, order),
    update: (id, order) => api.patch(`${API_CONFIG.endpoints.orders}/${id}`, order),
    sendToKDS: (id) => api.post(`${API_CONFIG.endpoints.orders}/${id}/send`),
    close: (id) => api.post(`${API_CONFIG.endpoints.orders}/${id}/close`),
    deleteItem: (orderId, itemId) => api.delete(`${API_CONFIG.endpoints.orders}/${orderId}/items/${itemId}`),
    cancel: (id) => api.delete(`${API_CONFIG.endpoints.orders}/${id}`)
  },

  // KDS (Kitchen Display System)
  kds: {
    getAll: () => api.get(API_CONFIG.endpoints.kds),
    getByArea: (area) => api.get(`${API_CONFIG.endpoints.kds}/${area}`),
    completeTicket: (ticketId) => api.patch(`${API_CONFIG.endpoints.kds}/${ticketId}/complete`),
    sendToCashier: (ticketId) => api.post(`${API_CONFIG.endpoints.kds}/${ticketId}/send-to-cashier`),
    getStats: () => api.get(API_CONFIG.endpoints.kdsStats)
  },

  // Cashier
  cashier: {
    getPending: () => api.get(API_CONFIG.endpoints.cashierPending),
    getHistory: (params) => api.get(API_CONFIG.endpoints.cashierHistory, params),
    getStats: (params) => api.get(API_CONFIG.endpoints.cashierStats, params),
    finalize: (orderId, data) => api.post(`${API_CONFIG.endpoints.cashier}/${orderId}/finalize`, data)
  },

  // Reports
  reports: {
    getDashboard: () => api.get(`${API_CONFIG.endpoints.reports}/dashboard`),
    getSales: (params) => api.get(`${API_CONFIG.endpoints.reports}/sales`, params),
    getTopDishes: (params) => api.get(`${API_CONFIG.endpoints.reports}/top-dishes`, params),
    getPeakHours: (params) => api.get(`${API_CONFIG.endpoints.reports}/peak-hours`, params),
    getSalesByArea: (params) => api.get(`${API_CONFIG.endpoints.reports}/by-area`, params),
    generatePDF: (params) => api.get(`${API_CONFIG.endpoints.reports}/pdf`, params)
  },

  // Tour
  tour: {
    getAll: (params) => api.get(API_CONFIG.endpoints.tour, params),
    getById: (id) => api.get(`${API_CONFIG.endpoints.tour}/${id}`),
    getStats: () => api.get(API_CONFIG.endpoints.tourStats),
    create: (tour) => api.post(API_CONFIG.endpoints.tour, tour),
    update: (id, tour) => api.patch(`${API_CONFIG.endpoints.tour}/${id}`, tour),
    delete: (id) => api.delete(`${API_CONFIG.endpoints.tour}/${id}`)
  },

  // Employees
  employees: {
    getAll: () => api.get(API_CONFIG.endpoints.employees),
    getAvailable: () => api.get(API_CONFIG.endpoints.employeesAvailable),
    getById: (id) => api.get(`${API_CONFIG.endpoints.employees}/${id}`),
    create: (employee) => api.post(API_CONFIG.endpoints.employees, employee),
    update: (id, employee) => api.patch(`${API_CONFIG.endpoints.employees}/${id}`, employee),
    delete: (id) => api.delete(`${API_CONFIG.endpoints.employees}/${id}`)
  },

  // Users (Admin)
  users: {
    getAll: () => api.get(API_CONFIG.endpoints.users),
    getById: (id) => api.get(`${API_CONFIG.endpoints.users}/${id}`),
    getRoles: () => api.get(API_CONFIG.endpoints.roles),
    createRole: (roleData) => api.post(API_CONFIG.endpoints.roles, roleData),
    updateRole: (id, roleData) => api.patch(`${API_CONFIG.endpoints.roles}/${id}`, roleData),
    deleteRole: (id) => api.delete(`${API_CONFIG.endpoints.roles}/${id}`),
    create: (user) => api.post(API_CONFIG.endpoints.users, user),
    update: (id, user) => api.patch(`${API_CONFIG.endpoints.users}/${id}`, user),
    delete: (id) => api.delete(`${API_CONFIG.endpoints.users}/${id}`)
  },

  // Notifications
  notifications: {
    getAll: (params) => api.get('/notifications', params),
    getUnread: () => api.get('/notifications/unread'),
    getCount: () => api.get('/notifications/count'),
    markAsRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.post('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`)
  }
};

// Utilidades para manejo de errores
const handleError = (error, customMessage = 'Ocurrió un error') => {
  console.error('Error:', error);
  const message = error.message || customMessage;
  showNotification(message, 'error');
  return null;
};

// Sistema de notificaciones simple
const showNotification = (message, type = 'info') => {
  // Buscar si ya existe un contenedor de notificaciones
  let container = document.getElementById('notification-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
    `;
    document.body.appendChild(container);
  }

  const notification = document.createElement('div');
  notification.style.cssText = `
    background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
    color: white;
    padding: 16px 24px;
    border-radius: 4px;
    margin-bottom: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
  `;
  notification.textContent = message;

  container.appendChild(notification);

  // Remover después de 3 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

// Agregar estilos de animación
if (!document.getElementById('notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Exportar para uso global
window.api = api;
window.API = API;
window.handleError = handleError;
window.showNotification = showNotification;

