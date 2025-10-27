# 🔧 Solución al Error "Failed to fetch"

## ❌ Problema

Estás viendo este error:
```
TypeError: Failed to fetch
```

Esto ocurre porque el backend tiene CORS configurado para `http://localhost:5173` pero tu frontend está en `http://localhost:8080`.

## ✅ Soluciones

### **Solución 1: Actualizar archivo .env (RECOMENDADO)**

1. Ve a la carpeta `backend/`
2. Crea o edita el archivo `.env`
3. Agrega esta línea:

```env
ALLOWED_ORIGINS="http://localhost:8080,http://localhost:5173,http://127.0.0.1:8080"
```

**Archivo .env completo de ejemplo:**

```env
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/chicoj_db"

# JWT
JWT_SECRET="tu-secreto-super-seguro-cambiar-en-produccion"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# CORS - URLs permitidas separadas por comas
ALLOWED_ORIGINS="http://localhost:8080,http://localhost:5173,http://127.0.0.1:8080"

# Bcrypt
BCRYPT_ROUNDS=10
```

4. **IMPORTANTE**: Reinicia el servidor backend después de modificar el .env:

```bash
# Detén el servidor (Ctrl+C)
# Luego inícialo nuevamente:
npm run dev
```

---

### **Solución 2: Modificar directamente config/index.js (Temporal)**

Si no quieres usar .env, edita `backend/src/config/index.js`:

**Cambia esta línea (línea 27):**
```javascript
origins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
```

**Por esta:**
```javascript
origins: process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://127.0.0.1:8080'
],
```

Luego reinicia el servidor backend.

---

### **Solución 3: Cambiar puerto del frontend**

Cambia el puerto del frontend a 5173 para que coincida con el backend:

En `fronted/package.json`, cambia:
```json
"dev": "http-server -p 5173 -c-1 -o"
```

Luego:
```bash
cd fronted
npm run dev
```

Abre: `http://localhost:5173`

---

## 🧪 Verificar que funciona

Después de aplicar cualquiera de las soluciones:

1. **Reinicia el backend** (muy importante):
   ```bash
   cd backend
   # Ctrl+C para detener
   npm run dev
   ```

2. **Verifica que el backend esté corriendo**:
   - Deberías ver: `Servidor iniciado exitosamente` en la consola
   - Puerto: 3000

3. **Abre el frontend**:
   ```
   http://localhost:8080
   ```

4. **Intenta hacer login**:
   - Usuario: `admin`
   - Password: `admin123`

5. **Verifica en la consola del navegador** (F12):
   - No debería haber errores de CORS
   - La petición a `/api/auth/login` debería tener status 200

---

## 🔍 Diagnóstico Adicional

Si aún tienes problemas, verifica:

### 1. ¿El backend está corriendo?

Abre en el navegador: `http://localhost:3000/api/health`

Deberías ver:
```json
{
  "status": "OK",
  "timestamp": "...",
  "service": "Chicoj Backend API"
}
```

### 2. ¿CORS está actualizado?

En la consola del backend deberías ver algo como:
```
🚀 ========================================
   Servidor iniciado exitosamente
   Ambiente: development
   Puerto: 3000
   ...
========================================
```

### 3. ¿La URL en el frontend es correcta?

Verifica `fronted/scripts/config.js`:
```javascript
baseURL: 'http://localhost:3000/api'  // ← Debe ser esto
```

### 4. Verifica en la consola del navegador

1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Intenta hacer login
4. Busca la petición a `login`
5. Revisa los detalles:
   - **Headers**: Verifica el `Origin`
   - **Response**: Verifica si hay error de CORS

---

## 📝 Pasos Completos (Desde Cero)

```bash
# 1. Detener todos los servidores
# Ctrl+C en todas las terminales

# 2. Backend
cd backend

# Crear/editar .env y agregar:
# ALLOWED_ORIGINS="http://localhost:8080,http://localhost:5173"

# Reiniciar backend
npm run dev

# 3. Frontend (en otra terminal)
cd fronted
npm run dev

# 4. Abrir navegador
# http://localhost:8080

# 5. Login
# Usuario: admin
# Password: admin123
```

---

## ✅ Checklist de Verificación

- [ ] Archivo `.env` creado en `backend/` con `ALLOWED_ORIGINS`
- [ ] Backend reiniciado después de cambiar .env
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 8080
- [ ] `config.js` tiene `baseURL: 'http://localhost:3000/api'`
- [ ] Navegador abierto en `http://localhost:8080`
- [ ] Sin errores de CORS en consola del navegador

---

## 🆘 Si Nada Funciona

1. **Verifica los puertos**:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :8080
   ```

2. **Limpia caché del navegador**:
   - Ctrl+Shift+Delete
   - Borra caché y cookies

3. **Prueba con curl** (para verificar backend):
   ```bash
   curl http://localhost:3000/api/health
   ```

4. **Revisa los logs del backend**:
   - Busca errores en la terminal donde corre el backend

5. **Intenta con otro navegador**:
   - Chrome, Firefox, Edge

---

## 📞 Información de Depuración

Si necesitas más ayuda, revisa:

1. **Consola del Backend**: Errores en la terminal
2. **Consola del Navegador** (F12): Pestaña "Console"
3. **Network Tab** (F12): Detalles de la petición HTTP
4. **Puerto Backend**: Verifica que sea 3000
5. **Puerto Frontend**: Verifica que sea 8080

---

¡Aplica la **Solución 1** (archivo .env) y reinicia el backend! Eso debería resolver el problema. 🚀

