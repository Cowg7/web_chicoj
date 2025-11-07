# Scripts de Integración Frontend-Backend

Este directorio contiene los archivos JavaScript necesarios para conectar el frontend de Chicoj con las APIs del backend.

## Archivos Principales

### 1. `config.js`
Configuración centralizada de la aplicación:
- URL base de la API
- Endpoints disponibles
- Gestión de autenticación (tokens, localStorage)

**⚠️ IMPORTANTE**: Debes modificar la URL base de la API según tu entorno:
```javascript
const API_CONFIG = {
  baseURL: 'http://localhost:3000/api',  // Cambia esto según tu configuración
  ...
}
```

### 2. `api.js`
Cliente HTTP para hacer peticiones a la API:
- Clase `ApiClient` para peticiones HTTP
- Funciones específicas para cada módulo (menu, orders, kds, tour, etc.)
- Sistema de notificaciones
- Manejo de errores

### 3. Módulos Específicos

#### `login.js`
- Autenticación de usuarios
- Almacenamiento de tokens
- Redirección según rol

#### `comanda.js`
- Crear órdenes desde mesero
- Agregar platillos a la orden
- Enviar órdenes a cocina

#### `comanda-control.js`
- Visualizar órdenes existentes
- Navegación entre órdenes
- Ver detalles de cada orden

#### `cocina.js`
- Sistema KDS (Kitchen Display System)
- Ver tickets por área
- Marcar tickets como completados
- Enviar tickets a caja

#### `platillos.js`
- Crear nuevos platillos
- Editar platillos existentes
- Formulario de gestión

#### `control-platillos.js`
- Listar todos los platillos
- Eliminar platillos
- Navegación a formulario de edición

#### `tour.js`
- Crear nuevos tours
- Editar tours existentes
- Calcular precios automáticamente

#### `tour-control.js`
- Listar tours
- Filtrar por fecha, servicio, tipo
- Seleccionar y editar tours

## Configuración Inicial

### 1. Configurar la URL de la API

Edita el archivo `config.js` y cambia la URL base:

```javascript
const API_CONFIG = {
  baseURL: 'http://localhost:3000/api',  // Desarrollo local
  // baseURL: 'https://tu-servidor.com/api',  // Producción
  ...
}
```

### 2. Iniciar el Backend

Asegúrate de que el backend esté corriendo:

```bash
cd backend
npm run dev
```

### 3. Servir el Frontend

Puedes usar cualquier servidor web estático. Ejemplos:

**Con Node.js (http-server):**
```bash
npm install -g http-server
cd fronted
http-server -p 8080
```

**Con Python:**
```bash
cd fronted
python -m http.server 8080
```

**Con PHP:**
```bash
cd fronted
php -S localhost:8080
```

### 4. Abrir la Aplicación

Abre tu navegador en `http://localhost:8080/templates/login.html`

## Uso de las APIs

### Autenticación

Todos los scripts manejan la autenticación automáticamente. El token se guarda en `localStorage` y se envía en cada petición.

```javascript
// Ejemplo de login
const response = await API.auth.login(username, password);
// El token se guarda automáticamente

// Verificar si está autenticado
if (AuthManager.isAuthenticated()) {
  // Usuario autenticado
}

// Cerrar sesión
AuthManager.logout();
```

### Hacer Peticiones

```javascript
// Obtener todos los platillos
const platillos = await API.menu.getAll();

// Obtener un platillo específico
const platillo = await API.menu.getById(1);

// Crear un platillo
const nuevoPlatillo = await API.menu.create({
  nombre: 'Pizza',
  precio: 45.00,
  descripcion: 'Pizza italiana',
  area: 'cocina'
});

// Actualizar un platillo
await API.menu.update(1, { precio: 50.00 });

// Eliminar un platillo
await API.menu.delete(1);
```

### Crear una Orden

```javascript
const orden = await API.orders.create({
  mesaNumero: '5',
  items: [
    {
      platilloId: 1,
      cantidad: 2,
      precio: 45.00,
      observaciones: 'Sin cebolla',
      extras: [
        { descripcion: 'Extra queso', precio: 5.00 }
      ]
    }
  ]
});

// Enviar orden a cocina
await API.orders.sendToKDS(orden.id);
```

### Sistema KDS (Cocina)

```javascript
// Obtener tickets por área
const tickets = await API.kds.getByArea('cocina');

// Marcar ticket como completado
await API.kds.completeTicket(ticketId);

// Enviar a caja
await API.kds.sendToCashier(ticketId);
```

### Tours

```javascript
// Obtener todos los tours
const tours = await API.tour.getAll();

// Crear un tour
const tour = await API.tour.create({
  fecha: '2025-10-21',
  servicio: 'Cannopy',
  tipoVisitante: 'Nacional',
  cantidadVisitantes: 4,
  idioma: 'Español',
  observaciones: 'Grupo familiar',
  precioTotal: 200.00
});
```

## Sistema de Notificaciones

Los scripts incluyen un sistema de notificaciones incorporado:

```javascript
// Mostrar notificación de éxito
showNotification('Operación exitosa', 'success');

// Mostrar notificación de error
showNotification('Error al procesar', 'error');

// Mostrar notificación informativa
showNotification('Información importante', 'info');
```

## Manejo de Errores

Todos los módulos incluyen manejo de errores:

```javascript
try {
  const data = await API.menu.getAll();
} catch (error) {
  handleError(error, 'Mensaje personalizado');
}
```

Los errores 401 (no autorizado) redirigen automáticamente al login.

## Estructura de Datos

### Usuario
```javascript
{
  id: number,
  username: string,
  rol: string,
  nombre: string
}
```

### Platillo
```javascript
{
  id: number,
  nombre: string,
  precio: number,
  descripcion: string,
  area: string,
  disponible: boolean
}
```

### Orden
```javascript
{
  id: number,
  mesaNumero: string,
  total: number,
  status: string,
  items: [
    {
      platilloId: number,
      cantidad: number,
      precio: number,
      observaciones: string,
      extras: []
    }
  ]
}
```

### Tour
```javascript
{
  id: number,
  fecha: string,
  servicio: string,
  tipoVisitante: string,
  cantidadVisitantes: number,
  idioma: string,
  observaciones: string,
  precioTotal: number
}
```

## Solución de Problemas

### Error de CORS
Si recibes errores de CORS, asegúrate de que el backend tenga configurado CORS correctamente:

```javascript
// En el backend
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
```

### Token Expirado
Si el token expira, el usuario será redirigido automáticamente al login.

### API no responde
Verifica que:
1. El backend esté corriendo
2. La URL en `config.js` sea correcta
3. No haya errores en la consola del navegador

## Desarrollo

Para agregar nuevas funcionalidades:

1. Agrega el endpoint en `config.js`
2. Crea la función en `api.js`
3. Úsala en tus scripts específicos

Ejemplo:
```javascript
// En config.js
endpoints: {
  ...
  reportes: '/reports'
}

// En api.js
API = {
  ...
  reportes: {
    getVentas: () => api.get('/reports/sales')
  }
}
```

## Notas Importantes

- Todos los scripts se ejecutan cuando el DOM está listo
- La autenticación se verifica automáticamente en cada página
- Los tokens se guardan en `localStorage` (persistentes)
- Las notificaciones se muestran automáticamente
- Los formularios tienen validación antes de enviar

## Soporte

Para problemas o preguntas, revisa:
1. Consola del navegador (F12)
2. Network tab para ver las peticiones HTTP
3. Console para ver errores JavaScript




