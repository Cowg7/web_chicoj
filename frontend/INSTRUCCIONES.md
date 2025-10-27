# Instrucciones de Instalación y Configuración

## 📋 Requisitos Previos

1. **Node.js** (v14 o superior)
2. **PostgreSQL** (para el backend)
3. Navegador web moderno (Chrome, Firefox, Edge)

## 🚀 Configuración Rápida

### 1. Configurar el Backend

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crea un archivo .env basado en .env.example
# Configura la conexión a PostgreSQL

# Ejecutar migraciones de base de datos
npm run db:migrate

# Opcional: cargar datos de prueba
npm run db:seed

# Iniciar el servidor
npm run dev
```

El backend debería estar corriendo en `http://localhost:3000`

### 2. Configurar el Frontend

```bash
# Navegar a la carpeta fronted
cd fronted

# Editar el archivo de configuración
# Abre fronted/scripts/config.js y verifica que la URL sea correcta:
# baseURL: 'http://localhost:3000/api'
```

### 3. Servir el Frontend

Opción A - **Live Server (Recomendado para desarrollo)**
```bash
# Si usas VS Code, instala la extensión "Live Server"
# Haz clic derecho en index.html > "Open with Live Server"
```

Opción B - **http-server**
```bash
# Instalar http-server globalmente
npm install -g http-server

# Desde la carpeta fronted
http-server -p 8080 -c-1

# Abre http://localhost:8080 en tu navegador
```

Opción C - **Python**
```bash
# Python 3
python -m http.server 8080

# Abre http://localhost:8080 en tu navegador
```

Opción D - **PHP**
```bash
php -S localhost:8080

# Abre http://localhost:8080 en tu navegador
```

## 🔧 Configuración Detallada

### Configurar la URL de la API

Edita el archivo `fronted/scripts/config.js`:

```javascript
const API_CONFIG = {
  // Para desarrollo local
  baseURL: 'http://localhost:3000/api',
  
  // Para producción (cambia según tu dominio)
  // baseURL: 'https://api.chicoj.com/api',
  
  // ... resto de configuración
};
```

### Configurar CORS en el Backend

Asegúrate de que el backend permita peticiones desde tu frontend.

En `backend/src/app.js` o `backend/src/server.js`:

```javascript
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:8080', // URL de tu frontend
  credentials: true
}));
```

## 👤 Usuarios de Prueba

Si ejecutaste el seed del backend, deberías tener estos usuarios:

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| mesero1 | mesero123 | Mesero |

**Nota**: Estas son las credenciales creadas por el seed. Para ver todos los usuarios disponibles, revisa el archivo `backend/prisma/seed.js`.

## 📁 Estructura de Archivos

```
fronted/
├── index.html              # Página de inicio
├── main.html               # Dashboard principal
├── css/                    # Estilos
├── scripts/                # Scripts JavaScript
│   ├── config.js          # Configuración de la API
│   ├── api.js             # Cliente HTTP
│   ├── utils.js           # Utilidades comunes
│   ├── login.js           # Autenticación
│   ├── comanda.js         # Gestión de órdenes
│   ├── cocina.js          # Sistema KDS
│   ├── platillos.js       # Gestión de platillos
│   ├── tour.js            # Gestión de tours
│   └── README.md          # Documentación de scripts
└── templates/             # Plantillas HTML
    ├── login.html
    ├── mesero/
    ├── cocina/
    ├── administracion/
    └── tour/
```

## 🔍 Verificar que Todo Funciona

### 1. Verificar el Backend

Abre en tu navegador: `http://localhost:3000/api/health`

Deberías ver algo como:
```json
{
  "status": "OK",
  "timestamp": "2025-10-21T...",
  "service": "Chicoj Backend API"
}
```

### 2. Verificar el Frontend

Abre: `http://localhost:8080`

Deberías ver la página de bienvenida de Chicoj.

### 3. Probar el Login

1. Haz clic en "Iniciar Sesión"
2. Usa credenciales de prueba (admin/admin)
3. Deberías ser redirigido al dashboard

## ⚠️ Solución de Problemas

### Error: "Failed to fetch"

**Causa**: El backend no está corriendo o la URL es incorrecta.

**Solución**:
1. Verifica que el backend esté corriendo (`npm run dev`)
2. Verifica la URL en `config.js`
3. Revisa la consola del navegador (F12) para ver el error exacto

### Error de CORS

**Causa**: El backend no permite peticiones desde tu frontend.

**Solución**:
1. Verifica la configuración de CORS en el backend
2. Asegúrate de que el `origin` coincida con tu URL del frontend
3. Reinicia el servidor backend después de cambiar la configuración

### Las notificaciones no aparecen

**Causa**: Los archivos de scripts no se están cargando correctamente.

**Solución**:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Recarga la página y verifica que todos los scripts se carguen (status 200)
4. Verifica las rutas de los scripts en los archivos HTML

### Token expirado

**Causa**: El token de autenticación ha expirado.

**Solución**:
1. Cierra sesión
2. Vuelve a iniciar sesión
3. El sistema debería redirigir automáticamente al login cuando expire

## 🧪 Modo de Desarrollo

Para desarrollar con recarga automática:

1. **Backend**: usa `npm run dev` (nodemon recargará automáticamente)
2. **Frontend**: usa Live Server o similar para recarga automática del navegador

## 📝 Notas Importantes

1. **Seguridad**: En producción, cambia todas las contraseñas por defecto
2. **HTTPS**: En producción, usa HTTPS para todas las peticiones
3. **Tokens**: Los tokens se guardan en localStorage (considera usar httpOnly cookies en producción)
4. **Validación**: Implementa validación del lado del servidor
5. **Backup**: Haz backups regulares de la base de datos

## 📞 Soporte

Si encuentras problemas:

1. Revisa la consola del navegador (F12)
2. Revisa los logs del servidor backend
3. Verifica que las rutas en los archivos HTML coincidan con la estructura de carpetas
4. Asegúrate de que todos los archivos JavaScript estén cargándose correctamente

## 🎯 Próximos Pasos

Después de configurar:

1. Explora el sistema con las diferentes cuentas de usuario
2. Crea algunos platillos de prueba
3. Genera órdenes desde el módulo de mesero
4. Prueba el sistema KDS en cocina
5. Crea tours de prueba
6. Revisa los reportes

## 📚 Recursos Adicionales

- **Documentación de Scripts**: Ver `scripts/README.md`
- **API Endpoints**: Ver documentación del backend
- **Base de Datos**: Ver `backend/prisma/schema.prisma`

---

¡Éxito con tu sistema Chicoj! 🎉

