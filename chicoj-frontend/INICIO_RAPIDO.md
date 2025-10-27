# 🚀 Guía de Inicio Rápido - Chicoj

## ⚡ Instalación Express (5 minutos)

### 1️⃣ Backend (Terminal 1)

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

✅ Backend corriendo en: `http://localhost:3000`

### 2️⃣ Frontend (Terminal 2)

```bash
cd fronted
npm install
npm run dev
```

✅ Frontend corriendo en: `http://localhost:8080`

### 3️⃣ Abrir en el navegador

🌐 http://localhost:8080

## 🔑 Credenciales de Prueba

| Usuario | Password | Rol | Acceso |
|---------|----------|-----|--------|
| `admin` | `admin123` | Administrador | Dashboard completo |
| `mesero1` | `mesero123` | Mesero | Crear órdenes |

## 📝 Flujo de Prueba Rápido

### 1. Crear un platillo (como admin)

1. Login con `admin / admin123`
2. Ir a "Control de Platillos"
3. Click en "Agregar platillo"
4. Llenar formulario:
   - Nombre: Pizza Margherita
   - Precio: 45.00
   - Descripción: Pizza tradicional italiana
5. Click "Agregar"

### 2. Crear una orden (como mesero)

1. Logout y login con `mesero1 / mesero123`
2. Ya estás en "Crear Comanda"
3. Seleccionar:
   - Área: cocina
   - Platillo: Pizza Margherita
   - Cantidad: 2
   - Mesa: 5
4. Click "Agregar"
5. Click "Enviar Orden"
6. Click "Sí" para enviar a cocina

### 3. Ver en cocina (como cocinero)

1. Logout y login con el usuario de cocina (según tu seed)
2. Seleccionar área "Cocina"
3. Ver el ticket de la orden
4. Click en el ticket para marcarlo como completado
5. Click "Alertar mesero" para enviar a caja

### 4. Crear un tour (como tour)

1. Logout y login con el usuario de tour (según tu seed)
2. Ya estás en "Crear Ticket"
3. Llenar formulario:
   - Servicio: Cannopy
   - Tipo: Nacional
   - Cantidad: 4 personas
   - Idioma: Español
4. Click "Guardar Ticket"

## 🛠️ Comandos Útiles

### Backend

```bash
# Desarrollo con recarga automática
npm run dev

# Producción
npm start

# Resetear base de datos
npm run db:reset

# Ver base de datos en navegador
npm run db:studio
```

### Frontend

```bash
# Servidor de desarrollo
npm run dev

# Solo servidor (sin abrir navegador)
npm start
```

## 🔧 Configuración Rápida

### Cambiar URL de la API

Edita `fronted/scripts/config.js`:

```javascript
const API_CONFIG = {
  baseURL: 'http://localhost:3000/api', // ← Cambia esto
  ...
}
```

### Cambiar Puerto del Frontend

Edita `fronted/package.json`:

```json
{
  "scripts": {
    "dev": "http-server -p 8080 -c-1 -o" // ← Cambia 8080
  }
}
```

## 🐛 Problemas Comunes

### ❌ "Failed to fetch"

**Solución:**
```bash
# Verifica que el backend esté corriendo
cd backend
npm run dev
```

### ❌ CORS Error

**Solución:** Edita `backend/src/app.js`:

```javascript
app.use(cors({
  origin: 'http://localhost:8080', // ← Tu URL del frontend
  credentials: true
}));
```

### ❌ Token expirado

**Solución:** Cierra sesión y vuelve a entrar

### ❌ Scripts no cargan

**Solución:** Verifica las rutas en los HTML:

```html
<!-- Deben ser rutas absolutas desde la raíz -->
<script src="/scripts/config.js"></script>
<script src="/scripts/api.js"></script>
```

## 📱 URLs Principales

| Página | URL |
|--------|-----|
| Inicio | http://localhost:8080 |
| Login | http://localhost:8080/templates/login.html |
| Dashboard | http://localhost:8080/main.html |
| Crear Orden | http://localhost:8080/templates/mesero/mesero_comanda.html |
| Ver Órdenes | http://localhost:8080/templates/mesero/comanda-control.html |
| KDS Cocina | http://localhost:8080/templates/cocina/cocina.html |
| Control Platillos | http://localhost:8080/templates/administracion/control-platillos.html |
| Tours | http://localhost:8080/templates/tour/tour.html |

## 🔍 Verificar que Todo Funciona

### 1. Backend

```bash
curl http://localhost:3000/api/health
```

Deberías ver:
```json
{
  "status": "OK",
  "timestamp": "...",
  "service": "Chicoj Backend API"
}
```

### 2. Frontend

Abre: http://localhost:8080

Deberías ver la página de bienvenida.

### 3. API Connection

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Haz login
4. Deberías ver la petición POST a `/api/auth/login` con status 200

## 📊 Probar Todas las Funcionalidades

```bash
✅ Login
✅ Crear platillo
✅ Listar platillos
✅ Editar platillo
✅ Eliminar platillo
✅ Crear orden
✅ Ver órdenes
✅ Enviar orden a KDS
✅ Ver tickets en cocina
✅ Completar ticket
✅ Crear tour
✅ Listar tours
✅ Filtrar tours
✅ Logout
```

## 💡 Tips de Desarrollo

### 1. Ver logs en consola

```javascript
// En cualquier script, puedes hacer:
console.log('Debug:', variable);
```

### 2. Ver peticiones HTTP

- Abre DevTools (F12)
- Pestaña "Network"
- Filtra por "XHR" o "Fetch"

### 3. Ver errores JavaScript

- Abre DevTools (F12)
- Pestaña "Console"
- Los errores aparecen en rojo

### 4. Inspeccionar localStorage

```javascript
// En la consola del navegador:
localStorage.getItem('auth_token')
localStorage.getItem('user_data')
```

### 5. Forzar logout

```javascript
// En la consola del navegador:
AuthManager.logout()
```

## 🎯 Próximos Pasos

1. ✅ Familiarízate con la interfaz
2. ✅ Prueba cada módulo (mesero, cocina, admin, tour)
3. ✅ Revisa la documentación en `scripts/README.md`
4. ✅ Personaliza los estilos en `css/`
5. ✅ Adapta según tus necesidades

## 📚 Documentación Adicional

- 📖 **Scripts**: `scripts/README.md`
- 📖 **Instalación**: `INSTRUCCIONES.md`
- 📖 **Archivos**: `ARCHIVOS_CREADOS.md`

## 🎉 ¡Listo!

Tu sistema Chicoj está configurado y listo para usar.

**¿Necesitas ayuda?**
1. Revisa la consola del navegador (F12)
2. Revisa los logs del backend
3. Consulta la documentación

---

**¡Buen desarrollo! 🚀**

