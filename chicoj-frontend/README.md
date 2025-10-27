# 🍽️ Chicoj - Sistema de Gestión Frontend

Sistema integral de gestión para restaurante y tours, desarrollado con HTML, CSS y JavaScript vanilla.

## 📋 Descripción

Frontend completo para el sistema Chicoj que incluye:

- 🔐 **Autenticación** - Login seguro con gestión de tokens
- 📝 **Gestión de Órdenes** - Sistema completo para meseros
- 👨‍🍳 **KDS** - Kitchen Display System para cocina
- 🍕 **Menú** - Gestión de platillos y áreas
- 🏞️ **Tours** - Sistema de reservas y gestión de tours
- 💰 **Caja** - Control de pagos y cobros
- 📊 **Reportes** - Estadísticas y análisis

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias (opcional, para servidor de desarrollo)
npm install

# 2. Configurar la URL de la API
# Edita scripts/config.js y cambia baseURL

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:8080
```

**Sin npm:**
```bash
# Cualquier servidor web estático funciona:
python -m http.server 8080
# o
php -S localhost:8080
```

## 📁 Estructura del Proyecto

```
fronted/
├── index.html              # Página de bienvenida
├── main.html               # Dashboard principal
├── css/                    # Estilos CSS
│   ├── base.css           # Estilos base
│   ├── components.css     # Componentes reutilizables
│   └── utilities.css      # Utilidades CSS
├── scripts/                # JavaScript
│   ├── config.js          # ⚙️ Configuración de la API
│   ├── api.js             # 🔌 Cliente HTTP
│   ├── utils.js           # 🛠️ Utilidades comunes
│   ├── login.js           # 🔐 Autenticación
│   ├── comanda.js         # 📝 Crear órdenes
│   ├── comanda-control.js # 👁️ Ver órdenes
│   ├── cocina.js          # 👨‍🍳 Sistema KDS
│   ├── platillos.js       # 🍕 Gestión de platillos
│   ├── tour.js            # 🏞️ Gestión de tours
│   └── ...                # Y más módulos
└── templates/             # Vistas HTML
    ├── login.html
    ├── mesero/
    ├── cocina/
    ├── administracion/
    └── tour/
```

## 🔧 Configuración

### 1. Configurar URL de la API

Edita `scripts/config.js`:

```javascript
const API_CONFIG = {
  baseURL: 'http://localhost:3000/api', // ← Cambia esto
  ...
}
```

### 2. Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| mesero1 | mesero123 | Mesero |

## 📖 Documentación

- 📘 **[Inicio Rápido](INICIO_RAPIDO.md)** - Configuración en 5 minutos
- 📗 **[Instrucciones](INSTRUCCIONES.md)** - Guía completa de instalación
- 📙 **[Scripts](scripts/README.md)** - Documentación de JavaScript
- 📕 **[Archivos Creados](ARCHIVOS_CREADOS.md)** - Resumen de archivos

## ✨ Características

### 🔐 Sistema de Autenticación
- Login con API REST
- Tokens JWT almacenados en localStorage
- Redirección automática según rol
- Verificación de autenticación en cada página

### 📝 Gestión de Órdenes (Mesero)
- Crear órdenes con múltiples platillos
- Selección dinámica por área
- Cálculo automático de totales
- Envío directo a cocina
- Visualización de órdenes existentes

### 👨‍🍳 Sistema KDS (Cocina)
- Vista por área (cocina, bebidas, café)
- Actualización automática cada 30s
- Marcar tickets como completados
- Enviar a caja automáticamente
- Indicadores visuales de estado

### 🍕 Gestión de Platillos (Admin)
- CRUD completo de platillos
- Organización por áreas
- Validación de formularios
- Confirmación antes de eliminar

### 🏞️ Gestión de Tours
- Crear y editar tours
- Filtros avanzados
- Cálculo automático de precios
- Soporte multiidioma
- Tipos de visitantes

### 🔔 Sistema de Notificaciones
- Notificaciones de éxito/error
- Animaciones suaves
- Auto-desaparición
- Apilamiento de múltiples notificaciones

## 🛠️ Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos, responsive
- **JavaScript ES6+** - Vanilla JS, sin frameworks
- **Fetch API** - Peticiones HTTP
- **localStorage** - Persistencia de sesión

## 📱 Compatibilidad

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Responsive (móvil, tablet, desktop)

## 🔌 APIs Utilizadas

El frontend se conecta con el backend a través de estos endpoints:

- `/api/auth/*` - Autenticación
- `/api/menu/*` - Gestión de menú
- `/api/orders/*` - Gestión de órdenes
- `/api/kds/*` - Kitchen Display System
- `/api/tour/*` - Gestión de tours
- `/api/cashier/*` - Sistema de caja
- `/api/reports/*` - Reportes y estadísticas

## 🐛 Solución de Problemas

### Error: "Failed to fetch"
**Causa:** Backend no está corriendo o URL incorrecta  
**Solución:** Verifica que el backend esté en `http://localhost:3000` o ajusta `config.js`

### Error de CORS
**Causa:** Backend no permite peticiones desde tu frontend  
**Solución:** Configura CORS en el backend para permitir tu origin

### Scripts no cargan
**Causa:** Rutas incorrectas en los HTML  
**Solución:** Usa rutas absolutas desde la raíz: `/scripts/config.js`

### Más problemas?
Consulta [INSTRUCCIONES.md](INSTRUCCIONES.md#solución-de-problemas)

## 📝 Ejemplos de Uso

### Hacer una petición a la API

```javascript
// Obtener todos los platillos
const platillos = await API.menu.getAll();

// Crear un platillo
const nuevo = await API.menu.create({
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

### Mostrar una notificación

```javascript
showNotification('¡Operación exitosa!', 'success');
showNotification('Error al procesar', 'error');
showNotification('Información importante', 'info');
```

### Formatear moneda

```javascript
Utils.formatCurrency(45.50); // "Q45.50"
```

## 🎯 Roadmap

- [ ] Modo offline con sincronización
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] PWA (Progressive Web App)
- [ ] Impresión de tickets
- [ ] Gráficas y reportes avanzados
- [ ] Multi-idioma
- [ ] Tema oscuro

## 🤝 Contribuir

1. Familiarízate con la estructura del proyecto
2. Lee la documentación en `scripts/README.md`
3. Sigue las convenciones de código existentes
4. Prueba tus cambios antes de commit

## 📄 Licencia

ISC

## 👥 Soporte

Para problemas o preguntas:
1. Revisa la documentación
2. Inspecciona la consola del navegador (F12)
3. Verifica las peticiones HTTP en Network tab
4. Consulta los logs del backend

---

**Desarrollado para Restaurante Chicoj** 🌟

**¿Listo para empezar?** Lee [INICIO_RAPIDO.md](INICIO_RAPIDO.md)

