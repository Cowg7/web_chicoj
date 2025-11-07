# 🚨 URGENTE: ERROR 404 EN PRODUCCIÓN - ROLES

## ❌ PROBLEMA CRÍTICO

**Servidor:** https://coopechicoj.com  
**Endpoint:** `POST /api/users/roles`  
**Error:** 404 (Not Found)  
**Impacto:** NO se pueden crear nuevos roles desde el panel de administración

---

## 🔍 DIAGNÓSTICO RÁPIDO

El endpoint **existe en el código** pero **NO está respondiendo en producción**.

### **Causa más probable:**

✅ El código del backend en producción es **ANTERIOR** a la implementación de las rutas de roles.

---

## ⚡ SOLUCIÓN INMEDIATA (5 minutos)

### **OPCIÓN 1: Verificar si el backend está corriendo**

```bash
# 1. Conectar al servidor de producción por SSH
ssh usuario@coopechicoj.com

# 2. Ver contenedores
docker ps

# 3. Verificar logs del backend
docker logs chicoj-backend --tail 50

# 4. Probar el endpoint desde el servidor
curl http://localhost:3000/api/health
```

**Si el backend NO responde:**
```bash
docker-compose restart backend
```

---

### **OPCIÓN 2: Actualizar el código del backend (RECOMENDADO)**

El backend en producción probablemente tiene una versión antigua del código.

```bash
# 1. Conectar al servidor
ssh usuario@coopechicoj.com

# 2. Ir al directorio del proyecto
cd /ruta/al/proyecto/Chicoj_System_R-T/backend

# 3. Hacer backup del código actual
cp -r src src.backup-$(date +%Y%m%d)

# 4. Verificar el archivo de rutas de usuarios
cat src/routes/users.routes.js

# Si NO contiene las rutas de roles, necesitas actualizar el código
```

**Verificar que contenga:**
```javascript
// Rutas de roles
router.get('/roles', getRoles);
router.post('/roles', createRole);
router.patch('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);
```

**Si NO las tiene, actualiza el código:**
```bash
# Obtener los últimos cambios
git pull origin main

# O si no usas Git, sube manualmente los archivos:
# - src/routes/users.routes.js
# - src/modules/users/users.controller.js
```

---

### **OPCIÓN 3: Rebuild del backend**

```bash
# 1. Detener el backend
docker-compose stop backend

# 2. Rebuild con el código actualizado
docker-compose build backend

# 3. Iniciar el backend
docker-compose up -d backend

# 4. Ver logs
docker-compose logs -f backend
```

**Debes ver:**
```
✅ Conectado a la base de datos
✅ Servidor corriendo en puerto 3000
```

---

## 🔧 VERIFICACIÓN DESDE EL SERVIDOR

### **1. Probar health check:**
```bash
curl http://localhost:3000/api/health
```

**Respuesta esperada:**
```json
{"status":"OK","timestamp":"...","service":"Chicoj Backend API"}
```

---

### **2. Probar endpoint de roles (GET):**

Primero necesitas un token. Obtén uno así:

```bash
# Login para obtener token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"TU_PASSWORD"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"

# Probar GET roles
curl -X GET http://localhost:3000/api/users/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {"id_rol": 1, "nombre_rol": "Administrador", ...},
      ...
    ],
    "total": 8
  }
}
```

**Si responde 404:** El endpoint NO existe → Necesitas actualizar el código del backend.

---

### **3. Probar endpoint de roles (POST):**

```bash
curl -X POST http://localhost:3000/api/users/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre_rol":"Rol de Prueba","descripcion":"Test"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Rol creado exitosamente",
  "data": {...}
}
```

---

## 📋 CHECKLIST PARA EL DESARROLLADOR DE PRODUCCIÓN

- [ ] 1. Conectar al servidor de producción
- [ ] 2. Verificar que el backend esté corriendo
- [ ] 3. Probar el endpoint `/api/health`
- [ ] 4. Verificar que el archivo `users.routes.js` tenga las rutas de roles
- [ ] 5. Si NO las tiene, actualizar el código del backend
- [ ] 6. Hacer rebuild del backend: `docker-compose build backend`
- [ ] 7. Reiniciar el backend: `docker-compose up -d backend`
- [ ] 8. Verificar logs: `docker-compose logs backend`
- [ ] 9. Probar el endpoint con curl (GET y POST)
- [ ] 10. Confirmar desde el navegador que funciona

---

## 🆘 SOLUCIÓN TEMPORAL (Si no puedes actualizar el código ahora)

**Crear roles manualmente desde la base de datos:**

```bash
# Conectar a PostgreSQL
docker exec -it chicoj-postgres psql -U postgres -d restaurante_db

# Crear el rol Tour
INSERT INTO roles (nombre_rol, descripcion)
VALUES ('Tour', 'Gestión de tours y grupos turísticos');

# Verificar
SELECT * FROM roles;

# Salir
\q
```

**Esto te permite crear el rol manualmente, pero NO soluciona el problema del frontend.**

---

## 📞 ARCHIVOS QUE NECESITAS ACTUALIZAR EN PRODUCCIÓN

Si el código está desactualizado, estos son los archivos críticos:

### **1. Backend - Rutas de usuarios:**
`Chicoj_System_R-T/backend/src/routes/users.routes.js`

```javascript
// Debe contener:
router.get('/roles', getRoles);
router.post('/roles', createRole);
router.patch('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);
```

---

### **2. Backend - Controlador de usuarios:**
`Chicoj_System_R-T/backend/src/modules/users/users.controller.js`

Debe tener las funciones:
- `getRoles()`
- `createRole()`
- `updateRole()`
- `deleteRole()`

---

### **3. Verificar que estén registradas en:**
`Chicoj_System_R-T/backend/src/routes/index.js`

```javascript
router.use('/users', usersRoutes);
```

---

## 🎯 COMANDO TODO EN UNO (Ejecutar en producción)

```bash
# Ejecutar este script completo
cd /ruta/al/proyecto && \
echo "🔍 Verificando backend..." && \
docker ps | grep backend && \
echo "📋 Verificando rutas..." && \
docker exec chicoj-backend cat /app/src/routes/users.routes.js | grep "'/roles'" && \
echo "🏥 Probando health check..." && \
curl -s http://localhost:3000/api/health && \
echo "✅ Diagnóstico completado"
```

---

## 💡 RESUMEN EJECUTIVO

**El problema es simple:** El código del backend en producción **NO tiene las rutas de roles** implementadas.

**La solución es simple:** 
1. Actualizar el código del backend en producción
2. Hacer rebuild: `docker-compose build backend`
3. Reiniciar: `docker-compose up -d backend`

**Tiempo estimado:** 5-10 minutos  
**Riesgo:** Bajo (solo reinicia el backend)  
**Downtime:** ~30 segundos durante el reinicio

---

## 📧 PLANTILLA DE MENSAJE PARA EL DESARROLLADOR

```
Hola [Desarrollador],

Tenemos un error 404 en producción al intentar crear roles:

POST https://coopechicoj.com/api/users/roles → 404

El endpoint está implementado en el código más reciente, pero parece 
que producción tiene una versión antigua del backend.

¿Podrías:
1. Actualizar el código del backend en producción
2. Rebuild: docker-compose build backend
3. Reiniciar: docker-compose up -d backend

Archivos adjuntos con toda la documentación:
- FIX_ERROR_404_ROLES_PRODUCCION.md (guía completa)
- diagnosticar-error-404.sh (script de diagnóstico)
- URGENTE_PRODUCCION_ERROR_404_ROLES.md (este archivo)

¡Gracias!
```

---

## 📊 COMPARACIÓN: DESARROLLO vs PRODUCCIÓN

| Aspecto | Desarrollo | Producción |
|---------|-----------|-----------|
| Endpoint `/api/users/roles` | ✅ Funciona | ❌ Error 404 |
| Código actualizado | ✅ Sí | ❌ Probablemente no |
| Solución | - | Actualizar código + rebuild |

---

**🔴 PRIORIDAD ALTA - Esto impide crear nuevos roles desde el panel de administración.**

---

## ✅ DESPUÉS DE ARREGLAR

Prueba desde el navegador en https://coopechicoj.com:

```javascript
// Abrir consola del navegador
fetch('https://coopechicoj.com/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend:', d));

const token = localStorage.getItem('auth_token');
fetch('https://coopechicoj.com/api/users/roles', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log('Roles:', d));
```

---

**¿Necesitas más ayuda? Contáctame con los logs del servidor.**

