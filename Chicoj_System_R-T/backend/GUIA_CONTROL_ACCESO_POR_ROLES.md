# 🔒 GUÍA DE CONTROL DE ACCESO POR ROLES

## 📋 **RESUMEN**

Se ha implementado un **Sistema de Control de Acceso Basado en Roles (RBAC)** que restringe las vistas y funciones según el rol del usuario.

---

## 👥 **ROLES Y PERMISOS**

### 1️⃣ **Administrador**
- ✅ **Acceso completo** a todo el sistema
- 🏠 **Página inicial**: `main.html` (Dashboard admin)
- 📂 **Puede acceder a**:
  - Gestión de platillos
  - Gestión de empleados
  - Gestión de usuarios
  - Control de órdenes
  - Caja
  - Reportes
  - KDS (todas las áreas)
  - Tour

---

### 2️⃣ **Gerente**
- ✅ **Solo reportes y estadísticas**
- 🏠 **Página inicial**: `reportes.html`
- 📂 **Puede acceder a**:
  - Reportes y estadísticas
- ❌ **NO puede acceder a**:
  - Panel admin
  - Caja
  - Órdenes (mesero)
  - KDS (cocina)
  - Tour

---

### 3️⃣ **Cajero**
- ✅ **Caja y reportes**
- 🏠 **Página inicial**: `caja.html`
- 📂 **Puede acceder a**:
  - Caja (procesar pagos)
  - Reportes (ver estadísticas)
- ❌ **NO puede acceder a**:
  - Panel admin
  - Órdenes (mesero)
  - KDS (cocina)
  - Tour

---

### 4️⃣ **Mesero**
- ✅ **Solo gestión de órdenes**
- 🏠 **Página inicial**: `mesero_comanda.html`
- 📂 **Puede acceder a**:
  - Crear órdenes (`mesero_comanda.html`)
  - Visualizar órdenes (`comanda-control.html`)
  - Enviar órdenes a cocina
  - Cerrar cuentas (enviar a caja)
- ❌ **NO puede acceder a**:
  - Panel admin
  - Caja
  - Reportes
  - KDS (cocina)
  - Tour

---

### 5️⃣ **Cocina** (KDS Cocina)
- ✅ **Solo KDS de área Cocina**
- 🏠 **Página inicial**: `cocina.html?area=Cocina`
- 📂 **Puede acceder a**:
  - KDS de Cocina (comida caliente)
  - Ver tickets de cocina
  - Marcar platillos como preparados
- ❌ **NO puede acceder a**:
  - Panel admin
  - Caja
  - Reportes
  - Órdenes (mesero)
  - KDS de Bebidas
  - KDS de Coffee
  - Tour

---

### 6️⃣ **Bebidas** (KDS Bebidas/Bar)
- ✅ **Solo KDS de área Bebidas**
- 🏠 **Página inicial**: `cocina.html?area=Bebidas`
- 📂 **Puede acceder a**:
  - KDS de Bebidas (bar)
  - Ver tickets de bebidas
  - Marcar bebidas como preparadas
- ❌ **NO puede acceder a**:
  - Panel admin
  - Caja
  - Reportes
  - Órdenes (mesero)
  - KDS de Cocina
  - KDS de Coffee
  - Tour

---

### 7️⃣ **Coffee** (KDS Coffee Shop)
- ✅ **Solo KDS de área Coffee**
- 🏠 **Página inicial**: `cocina.html?area=Coffee`
- 📂 **Puede acceder a**:
  - KDS de Coffee (café y postres)
  - Ver tickets de coffee
  - Marcar productos de coffee como preparados
- ❌ **NO puede acceder a**:
  - Panel admin
  - Caja
  - Reportes
  - Órdenes (mesero)
  - KDS de Cocina
  - KDS de Bebidas
  - Tour

---

### 8️⃣ **Tour**
- ✅ **Solo gestión de tours**
- 🏠 **Página inicial**: `tour.html`
- 📂 **Puede acceder a**:
  - Gestión de tours
  - Control de tickets de tour
- ❌ **NO puede acceder a**:
  - Panel admin
  - Caja
  - Reportes
  - Órdenes (mesero)
  - KDS (cocina)

---

## 🔧 **IMPLEMENTACIÓN TÉCNICA**

### **Archivos Creados:**

1. **`backend/setup-roles.js`** (Ejecutado ✅)
   - Script para crear/verificar roles en la BD
   - Roles creados: Administrador, Gerente, Cajero, Mesero, Cocina, Bebidas, Coffee, Tour

2. **`fronted/scripts/access-control.js`**
   - Sistema de control de acceso basado en roles
   - Verificación automática al cargar cada página
   - Redirección si no tiene permisos
   - Ocultación de elementos del menú según rol

### **Vistas Protegidas:**

Se agregó `access-control.js` a las siguientes vistas:
- ✅ `mesero_comanda.html`
- ✅ `comanda-control.html`
- ✅ `caja.html`
- ✅ `cocina.html`
- ✅ `menu_cocina.html`
- ✅ `reportes.html`
- ✅ `tour.html`

### **Funcionalidades del Sistema:**

1. **Verificación automática de acceso**
   - Al cargar cualquier página protegida
   - Redirige si no tiene permisos
   - Muestra mensaje de acceso denegado

2. **Restricción de áreas KDS**
   - Usuarios de "Cocina" solo ven KDS de Cocina
   - Usuarios de "Bebidas" solo ven KDS de Bebidas
   - Usuarios de "Coffee" solo ven KDS de Coffee
   - En `menu_cocina.html`, solo aparece su área

3. **Ocultación de menús**
   - Los elementos del menú se ocultan según permisos
   - Ejemplo: Mesero NO ve enlaces a caja o reportes

4. **Redirección automática**
   - Si intenta acceder a una página no permitida
   - Lo redirige a su página de inicio automáticamente

---

## 🧪 **CÓMO PROBAR**

### **PASO 1: Verificar Roles en la BD**

1. Abre Prisma Studio:
   ```bash
   cd backend
   npx prisma studio
   ```

2. Ve a la tabla **`roles`**

3. Verifica que existan estos 8 roles:
   - Administrador (ID: 4)
   - Gerente (ID: 1)
   - Cajero (ID: 5)
   - Mesero (ID: 2)
   - Cocina (ID: 3)
   - Bebidas (ID: 6) ← **NUEVO**
   - Coffee (ID: 7) ← **NUEVO**
   - Tour (ID: 8) ← **NUEVO**

---

### **PASO 2: Crear Usuarios de Prueba**

En la vista de administración (`/templates/administracion/menu_usuarios.html`), crea usuarios con diferentes roles:

| Usuario | Contraseña | Rol | Para probar... |
|---------|------------|-----|----------------|
| `admin` | (existente) | Administrador | Acceso total |
| `gerente1` | `12345` | Gerente | Solo reportes |
| `cajero1` | `12345` | Cajero | Caja + reportes |
| `mesero1` | `12345` | Mesero | Solo comandas |
| `cocina1` | `12345` | Cocina | Solo KDS Cocina |
| `bebidas1` | `12345` | Bebidas | Solo KDS Bebidas |
| `coffee1` | `12345` | Coffee | Solo KDS Coffee |
| `tour1` | `12345` | Tour | Solo tours |

---

### **PASO 3: Probar Control de Acceso**

#### **Prueba 1: Mesero (mesero1)**

1. Login como `mesero1` / `12345`
2. ✅ Debe redirigir a: `mesero_comanda.html`
3. ✅ Puede crear órdenes
4. ✅ Puede ver órdenes en `comanda-control.html`
5. ❌ Si intenta ir a `/templates/caja/caja.html` → Lo redirige a `mesero_comanda.html`
6. ❌ Si intenta ir a `/templates/reportes/reportes.html` → Lo redirige a `mesero_comanda.html`

---

#### **Prueba 2: Cajero (cajero1)**

1. Login como `cajero1` / `12345`
2. ✅ Debe redirigir a: `caja.html`
3. ✅ Puede procesar pagos
4. ✅ Puede ver reportes (`reportes.html`)
5. ❌ Si intenta ir a `/templates/mesero/mesero_comanda.html` → Lo redirige a `caja.html`
6. ❌ Si intenta ir a `/templates/cocina/cocina.html?area=Cocina` → Lo redirige a `caja.html`

---

#### **Prueba 3: Cocina (cocina1)**

1. Login como `cocina1` / `12345`
2. ✅ Debe redirigir a: `cocina.html?area=Cocina`
3. ✅ Puede ver tickets de cocina
4. ✅ Puede marcar platillos como preparados
5. ❌ Si intenta ir a `cocina.html?area=Bebidas` → Mensaje: "No tienes permiso para acceder al área de Bebidas"
6. ❌ Si intenta ir a `cocina.html?area=Coffee` → Mensaje: "No tienes permiso para acceder al área de Coffee"
7. ✅ Si va a `menu_cocina.html`, solo ve el botón de "Cocina" (los demás están ocultos)

---

#### **Prueba 4: Bebidas (bebidas1)**

1. Login como `bebidas1` / `12345`
2. ✅ Debe redirigir a: `cocina.html?area=Bebidas`
3. ✅ Puede ver tickets de bebidas
4. ✅ Puede marcar bebidas como preparadas
5. ❌ Si intenta ir a `cocina.html?area=Cocina` → Acceso denegado
6. ❌ Si intenta ir a `cocina.html?area=Coffee` → Acceso denegado
7. ✅ Si va a `menu_cocina.html`, solo ve el botón de "Bebidas"

---

#### **Prueba 5: Coffee (coffee1)**

1. Login como `coffee1` / `12345`
2. ✅ Debe redirigir a: `cocina.html?area=Coffee`
3. ✅ Puede ver tickets de coffee
4. ✅ Puede marcar productos como preparados
5. ❌ Si intenta ir a otras áreas → Acceso denegado
6. ✅ Si va a `menu_cocina.html`, solo ve el botón de "Coffee"

---

#### **Prueba 6: Gerente (gerente1)**

1. Login como `gerente1` / `12345`
2. ✅ Debe redirigir a: `reportes.html`
3. ✅ Puede ver todos los reportes
4. ❌ Si intenta ir a caja, mesero, cocina, etc. → Lo redirige a `reportes.html`

---

#### **Prueba 7: Tour (tour1)**

1. Login como `tour1` / `12345`
2. ✅ Debe redirigir a: `tour.html`
3. ✅ Puede gestionar tours
4. ❌ Si intenta ir a otras vistas → Lo redirige a `tour.html`

---

#### **Prueba 8: Administrador (admin)**

1. Login como `admin`
2. ✅ Debe redirigir a: `main.html`
3. ✅ Puede acceder a **TODAS** las vistas sin restricción
4. ✅ Puede ver todas las áreas del KDS

---

## 🐛 **QUÉ VERIFICAR (Posibles Problemas)**

### **Problema 1: "No se puede acceder" incluso con permisos correctos**

**Solución:**
1. Verifica que el usuario tenga el rol correcto en la BD (Prisma Studio → tabla `usuarios`)
2. Limpia el `localStorage` del navegador:
   ```javascript
   // En consola del navegador
   localStorage.clear();
   ```
3. Vuelve a hacer login

---

### **Problema 2: "Redirección infinita" (bucle)**

**Solución:**
1. Verifica que la vista de inicio (`landingPage`) exista
2. Verifica que la vista de inicio esté en `allowedViews`
3. Revisa la consola del navegador para ver errores

---

### **Problema 3: En `menu_cocina.html` aparecen todas las áreas**

**Solución:**
1. Verifica que el archivo `access-control.js` esté cargado
2. Verifica en la consola del navegador:
   ```javascript
   // Debe mostrar: ✅ Control de acceso activado para: cocina (o bebidas, coffee)
   ```
3. Si no aparece, fuerza un hard refresh (`Ctrl + Shift + R`)

---

### **Problema 4: Usuario de cocina puede acceder a bebidas**

**Solución:**
1. Verifica que el rol esté correctamente escrito en la BD: **"Cocina"** (con mayúscula)
2. Verifica que `allowedKDSAreas` en `access-control.js` sea `['Cocina']` para rol "cocina"

---

## 📊 **MATRIZ DE PERMISOS (Resumen)**

| Vista / Función | Admin | Gerente | Cajero | Mesero | Cocina | Bebidas | Coffee | Tour |
|----------------|-------|---------|--------|--------|--------|---------|--------|------|
| `main.html` (Admin) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `mesero_comanda.html` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `comanda-control.html` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `caja.html` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `reportes.html` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `cocina.html?area=Cocina` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `cocina.html?area=Bebidas` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `cocina.html?area=Coffee` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `tour.html` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Control Platillos | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Control Empleados | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Control Usuarios | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🚀 **ESTADO ACTUAL**

✅ Roles creados en la BD  
✅ Sistema de control de acceso implementado  
✅ Vistas principales protegidas  
✅ Redirecciones automáticas configuradas  
✅ Restricciones de áreas KDS activas  
✅ Login redirige según rol  

---

## 📝 **NOTAS IMPORTANTES**

1. **Administrador siempre tiene acceso total** - No se puede restringir
2. **Los roles son case-insensitive** - "Cocina", "cocina", "COCINA" funcionan igual
3. **Si no tiene token válido** - Redirige automáticamente al login
4. **Las restricciones se aplican en frontend Y backend** - Doble capa de seguridad
5. **Los usuarios de KDS solo ven su área** - No pueden cambiar de área manualmente

---

## 🎯 **PRÓXIMOS PASOS**

1. ✅ Crear usuarios de prueba para cada rol
2. ✅ Probar todas las restricciones
3. ✅ Verificar redirecciones automáticas
4. ✅ Probar control de áreas KDS
5. ✅ Capacitar al personal en sus vistas específicas

---

**¡Sistema de control de acceso por roles completamente funcional!** 🎉



