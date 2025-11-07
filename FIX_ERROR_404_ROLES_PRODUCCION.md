# 🚨 ERROR 404 AL CREAR ROLES EN PRODUCCIÓN

## ❌ PROBLEMA

Al intentar crear un nuevo rol en producción (`https://coopechicoj.com`), aparece este error:

```
POST https://coopechicoj.com/api/users/roles 404 (Not Found)
Error: Error 404
```

---

## 🔍 DIAGNÓSTICO

El endpoint **SÍ existe** en el código del backend:

- **Frontend config.js:** `roles: '/users/roles'` ✅
- **Frontend api.js:** `createRole: (roleData) => api.post(API_CONFIG.endpoints.roles, roleData)` ✅
- **Backend users.routes.js:** `router.post('/roles', createRole)` ✅
- **Backend routes/index.js:** `router.use('/users', usersRoutes)` ✅
- **Backend app.js:** `app.use('/api', routes)` ✅

**Endpoint completo:** `POST /api/users/roles`

### El error 404 significa que:

1. ❌ El backend **NO está corriendo** en producción
2. ❌ El backend se inició **ANTES** de aplicar los cambios más recientes
3. ❌ Nginx **NO está redirigiendo** correctamente las peticiones `/api/*`
4. ❌ El módulo de usuarios **NO se registró** correctamente

---

## ✅ SOLUCIONES (Ejecutar en el SERVIDOR DE PRODUCCIÓN)

### **SOLUCIÓN 1: Verificar si el Backend está Corriendo**

```bash
# Ver contenedores corriendo
docker ps

# Buscar el contenedor del backend
docker ps | grep backend

# Ver logs del backend
docker logs chicoj-backend

# O con docker-compose
docker-compose ps
docker-compose logs backend
```

**Resultado esperado:**
- Debe haber un contenedor `chicoj-backend` corriendo
- Los logs deben mostrar: `✅ Servidor corriendo en puerto 3000`

---

### **SOLUCIÓN 2: Reiniciar el Backend**

```bash
# Con Docker Compose (RECOMENDADO)
docker-compose restart backend

# O manualmente
docker restart chicoj-backend
```

**Después de reiniciar, verificar logs:**
```bash
docker-compose logs -f backend
```

**Debes ver:**
```
✅ Conectado a la base de datos
✅ Servidor corriendo en puerto 3000
```

---

### **SOLUCIÓN 3: Verificar las Rutas del Backend**

**Ejecutar dentro del contenedor:**

```bash
# Entrar al contenedor del backend
docker exec -it chicoj-backend sh

# Verificar que existan los archivos de rutas
ls -la /app/src/routes/
ls -la /app/src/modules/users/

# Verificar el contenido del archivo de rutas
cat /app/src/routes/users.routes.js

# Salir del contenedor
exit
```

**Debe mostrar:**
```javascript
router.get('/roles', getRoles);
router.post('/roles', createRole);
router.patch('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);
```

---

### **SOLUCIÓN 4: Probar el Endpoint Directamente desde el Servidor**

**Desde el servidor de producción:**

```bash
# Probar el endpoint de health check
curl http://localhost:3000/api/health

# Debe responder:
# {"status":"OK","timestamp":"...","service":"Chicoj Backend API"}

# Probar el endpoint de roles (requiere token)
# Primero obtener token:
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"tu_password"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Luego probar GET roles
curl -X GET http://localhost:3000/api/users/roles \
  -H "Authorization: Bearer $TOKEN"

# Debe responder con la lista de roles
```

---

### **SOLUCIÓN 5: Verificar Configuración de Nginx**

**Ver la configuración actual:**

```bash
# Ver configuración de Nginx
docker exec chicoj-nginx cat /etc/nginx/conf.d/default.conf

# O si está en el servidor directamente
cat nginx/conf.d/default.conf
```

**Debe contener:**

```nginx
# Proxy para el backend
location /api/ {
    proxy_pass http://backend:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

**Si NO está correcto, editar y reiniciar Nginx:**

```bash
# Editar configuración
nano nginx/conf.d/default.conf

# Reiniciar Nginx
docker-compose restart nginx
```

---

### **SOLUCIÓN 6: Rebuild del Backend (Si nada más funciona)**

Si hiciste cambios recientes en el código:

```bash
# Detener servicios
docker-compose down

# Rebuild del backend
docker-compose build backend

# Iniciar todo de nuevo
docker-compose up -d

# Ver logs
docker-compose logs -f backend
```

---

## 🧪 VERIFICACIÓN DESPUÉS DE APLICAR SOLUCIONES

### **1. Probar desde el navegador (DevTools):**

```javascript
// Abrir consola del navegador en coopechicoj.com
// Pegar este código:

fetch('https://coopechicoj.com/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend OK:', d))
  .catch(e => console.error('❌ Backend error:', e));
```

**Resultado esperado:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-06T...",
  "service": "Chicoj Backend API"
}
```

---

### **2. Probar el endpoint de roles:**

```javascript
// Desde la consola del navegador (ya logueado en el sistema):

const token = localStorage.getItem('auth_token');

fetch('https://coopechicoj.com/api/users/roles', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(r => r.json())
  .then(d => console.log('✅ Roles:', d))
  .catch(e => console.error('❌ Error:', e));
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "roles": [
      { "id_rol": 1, "nombre_rol": "Administrador", "descripcion": "..." },
      { "id_rol": 2, "nombre_rol": "Mesero", "descripcion": "..." }
    ],
    "total": 8
  }
}
```

---

### **3. Probar creación de rol:**

```javascript
// Desde la consola del navegador:

const token = localStorage.getItem('auth_token');

fetch('https://coopechicoj.com/api/users/roles', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre_rol: 'Rol de Prueba',
    descripcion: 'Este es un rol de prueba'
  })
})
  .then(r => r.json())
  .then(d => console.log('✅ Rol creado:', d))
  .catch(e => console.error('❌ Error:', e));
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Rol creado exitosamente",
  "data": {
    "role": {
      "id_rol": 9,
      "nombre_rol": "Rol de Prueba",
      "descripcion": "Este es un rol de prueba"
    }
  }
}
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

- [ ] El contenedor del backend está corriendo
- [ ] Los logs del backend no muestran errores
- [ ] El endpoint `/api/health` responde correctamente
- [ ] El endpoint `/api/users/roles` responde con GET
- [ ] El endpoint `/api/users/roles` responde con POST
- [ ] Nginx está redirigiendo correctamente `/api/*`
- [ ] El token de autenticación es válido

---

## 🔧 COMANDOS ÚTILES DE DIAGNÓSTICO

```bash
# Ver TODOS los logs del sistema
docker-compose logs -f

# Ver solo logs del backend
docker-compose logs -f backend

# Ver solo logs de Nginx
docker-compose logs -f nginx

# Ver estado de los contenedores
docker-compose ps

# Ver recursos usados
docker stats

# Reiniciar TODO el sistema
docker-compose restart

# Verificar variables de entorno del backend
docker exec chicoj-backend env | grep -E "PORT|NODE_ENV|DATABASE"

# Verificar conectividad entre contenedores
docker exec chicoj-nginx ping -c 3 backend
```

---

## 🆘 SI NADA FUNCIONA

### **Opción 1: Revisar los logs completos**

```bash
# Guardar logs en un archivo
docker-compose logs backend > backend-logs.txt
docker-compose logs nginx > nginx-logs.txt

# Buscar errores específicos
cat backend-logs.txt | grep -i error
cat backend-logs.txt | grep -i "users"
```

---

### **Opción 2: Verificar que el código esté actualizado**

```bash
# Entrar al contenedor del backend
docker exec -it chicoj-backend sh

# Ver el contenido del archivo de rutas
cat /app/src/routes/users.routes.js

# Verificar que contenga:
# router.post('/roles', createRole);

# Salir
exit
```

Si **NO contiene** las rutas de roles, entonces necesitas:

```bash
# Hacer pull de los cambios más recientes
git pull origin main

# Rebuild del backend
docker-compose build backend

# Reiniciar
docker-compose up -d backend
```

---

### **Opción 3: Verificar la base de datos**

```bash
# Conectar a PostgreSQL
docker exec -it chicoj-postgres psql -U postgres -d restaurante_db

# Verificar que la tabla roles exista
\dt

# Ver los roles existentes
SELECT * FROM roles;

# Salir
\q
```

---

## 📝 INFORMACIÓN ADICIONAL

### **Archivos Importantes:**

- **Backend:**
  - `Chicoj_System_R-T/backend/src/app.js` (monta rutas en `/api`)
  - `Chicoj_System_R-T/backend/src/routes/index.js` (registra `/users`)
  - `Chicoj_System_R-T/backend/src/routes/users.routes.js` (define rutas de roles)
  - `Chicoj_System_R-T/backend/src/modules/users/users.controller.js` (lógica de roles)

- **Frontend:**
  - `chicoj-frontend/scripts/config.js` (define endpoint `roles: '/users/roles'`)
  - `chicoj-frontend/scripts/api.js` (funciones `createRole`, `updateRole`, etc.)
  - `chicoj-frontend/scripts/agregar-roles.js` (llama a `API.users.createRole()`)

- **Nginx:**
  - `nginx/conf.d/default.conf` (configuración de reverse proxy)

---

## ✅ RESULTADO ESPERADO

Después de aplicar las soluciones, deberías poder:

1. ✅ Ver la lista de roles existentes
2. ✅ Crear nuevos roles
3. ✅ Editar roles existentes
4. ✅ Eliminar roles

---

## 📞 CONTACTO

Si después de seguir todos estos pasos el error persiste, proporciona:

1. Logs del backend: `docker-compose logs backend > backend-logs.txt`
2. Logs de Nginx: `docker-compose logs nginx > nginx-logs.txt`
3. Resultado de: `docker-compose ps`
4. Resultado de: `curl http://localhost:3000/api/health`
5. Configuración de Nginx: `docker exec chicoj-nginx cat /etc/nginx/conf.d/default.conf`

---

**🎯 TL;DR - SOLUCIÓN RÁPIDA:**

```bash
# 1. Reiniciar backend
docker-compose restart backend

# 2. Verificar que esté corriendo
docker-compose logs backend | tail -20

# 3. Probar endpoint
curl http://localhost:3000/api/health

# Si no responde, hacer rebuild:
docker-compose down
docker-compose build backend
docker-compose up -d
```






