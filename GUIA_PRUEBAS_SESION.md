# 🔐 GUÍA DE PRUEBAS - SISTEMA DE SESIÓN

## 📋 **CÓMO FUNCIONA TU SISTEMA ACTUAL**

Tu aplicación ya implementa esta lógica:

```javascript
if (sesion == null) {
    return pagina_login;  // Redirigir a login
} else {
    return view();        // Mostrar vista protegida
}
```

**Implementación real en tu código:**

```javascript
// En simple-auth.js (líneas 22-30):
const token = localStorage.getItem('auth_token');

if (!token) {
    // NO HAY SESIÓN → Redirigir
    window.location.replace('/templates/login');
} else {
    // HAY SESIÓN → Permitir acceso
    console.log('[OK] Token válido, acceso permitido');
}
```

---

## 🧪 **PRUEBAS QUE PUEDES HACER**

### **PRUEBA 1: Verificar Estado de Sesión Actual**

**Paso 1:** Abre cualquier página del sistema
**Paso 2:** Abre la consola (F12)
**Paso 3:** Ejecuta:

```javascript
// Ver si hay sesión activa
if (AuthManager.isAuthenticated()) {
    console.log('✅ HAY SESIÓN ACTIVA');
    console.log('Token:', AuthManager.getToken());
    console.log('Usuario:', AuthManager.getUser());
} else {
    console.log('❌ NO HAY SESIÓN');
}
```

**Resultado esperado:**
- Si estás logueado: `✅ HAY SESIÓN ACTIVA`
- Si no estás logueado: `❌ NO HAY SESIÓN` (y te redirige)

---

### **PRUEBA 2: Simular Pérdida de Sesión**

**Paso 1:** Estando logueado, abre la consola (F12)
**Paso 2:** Ejecuta:

```javascript
// Eliminar el token (simular sesión expirada)
localStorage.removeItem('auth_token');
console.log('Token eliminado');
```

**Paso 3:** Espera 1 segundo o recarga la página

**Resultado esperado:**
```
[DENIED] Token perdido durante navegación - Redirigiendo
→ Te redirige automáticamente al login
```

---

### **PRUEBA 3: Acceder sin Sesión**

**Paso 1:** Cierra sesión completamente
**Paso 2:** Intenta acceder directamente a:
```
http://localhost/templates/administracion/control-platillos
```

**Resultado esperado:**
```
[LOCK] Simple Auth: Verificando...
[DENIED] Simple Auth: SIN TOKEN - Redirigiendo a login
→ Te redirige inmediatamente al login
```

---

### **PRUEBA 4: Login y Verificación**

**Paso 1:** Ve al login
```
http://localhost/templates/login
```

**Paso 2:** Abre consola (F12) y ejecuta:

```javascript
// Ver el estado ANTES del login
console.log('Token antes:', localStorage.getItem('auth_token'));
// null o undefined
```

**Paso 3:** Haz login con:
- Usuario: `admin`
- Contraseña: `admin123`

**Paso 4:** En la consola verás:

```javascript
// Después del login exitoso:
console.log('Token después:', localStorage.getItem('auth_token'));
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

console.log('Usuario:', localStorage.getItem('user_data'));
// {"id":1,"username":"admin","nombre":"Admin",...}
```

---

### **PRUEBA 5: Verificación Automática (cada 1 segundo)**

Tu sistema verifica la sesión automáticamente cada segundo.

**Para probarlo:**

**Paso 1:** Loguéate y ve a cualquier vista
**Paso 2:** Abre consola (F12)
**Paso 3:** Ejecuta:

```javascript
// Eliminar token después de 5 segundos
setTimeout(() => {
    console.log('Eliminando token en 3...');
    setTimeout(() => console.log('2...'), 1000);
    setTimeout(() => console.log('1...'), 2000);
    setTimeout(() => {
        localStorage.removeItem('auth_token');
        console.log('¡Token eliminado!');
    }, 3000);
}, 2000);
```

**Resultado esperado:**
```
Eliminando token en 3...
2...
1...
¡Token eliminado!
[DENIED] Token perdido durante navegación - Redirigiendo
→ Te redirige automáticamente después de 1 segundo
```

---

### **PRUEBA 6: Botón Atrás del Navegador (bfcache)**

**Paso 1:** Loguéate
**Paso 2:** Navega a varias páginas internas
**Paso 3:** Haz logout
**Paso 4:** Presiona el botón "Atrás" del navegador

**Resultado esperado:**
```
[VIEW] Página restaurada desde bfcache (botón atrás detectado)
[DENIED] Sin token en bfcache - Redirigiendo a login
→ Te redirige incluso si intentas volver atrás
```

---

## 🎯 **ESCENARIOS DE USO REAL:**

### **Escenario 1: Usuario Normal**

```javascript
// 1. Usuario visita el sitio sin login
window.location.href = '/templates/administracion/control-platillos';
// → Redirigido a login

// 2. Usuario hace login
// → Token guardado en localStorage

// 3. Usuario accede a páginas protegidas
// → Permitido porque hay token

// 4. Usuario cierra sesión
AuthManager.logout();
// → Token eliminado, redirigido a login
```

### **Escenario 2: Token Expirado**

```javascript
// 1. Usuario está logueado desde hace días
// 2. El token expira (7 días por defecto)
// 3. Usuario intenta hacer una acción

// En api.js (líneas 40-43):
if (response.status === 401) {
    // Token inválido/expirado
    AuthManager.logout();  // Limpia todo
    return null;           // Redirige a login
}
```

### **Escenario 3: Múltiples Pestañas**

```javascript
// 1. Usuario tiene 3 pestañas abiertas
// 2. Cierra sesión en una pestaña
// 3. Las otras 2 pestañas detectan la pérdida de token

// En simple-auth.js (líneas 34-43):
setInterval(function() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        // Detecta que otra pestaña hizo logout
        window.location.replace('/templates/login');
    }
}, 1000);
```

---

## 🛠️ **CÓMO CREAR TU PROPIA VERIFICACIÓN:**

Si quieres agregar lógica personalizada en una vista específica:

```javascript
// En cualquier archivo .js de una vista:

async function init() {
    // ========== VERIFICACIÓN DE SESIÓN ==========
    const sesion = AuthManager.getToken();
    
    if (sesion == null) {
        // NO hay sesión → Redirigir a login
        console.log('[AUTH] Sesión no encontrada');
        window.location.href = '/templates/login';
        return;  // Detener ejecución
    } else {
        // SÍ hay sesión → Continuar con la vista
        console.log('[AUTH] Sesión válida');
        mostrarContenido();
    }
}

function mostrarContenido() {
    // Tu lógica aquí
    console.log('[VIEW] Mostrando contenido protegido');
    
    // Ejemplo: obtener datos del usuario
    const usuario = AuthManager.getUser();
    console.log('[USER] Bienvenido:', usuario.nombre);
    console.log('[USER] Rol:', usuario.rol);
    
    // Cargar datos de la vista
    cargarDatos();
}

async function cargarDatos() {
    try {
        const response = await API.menu.getAll();
        console.log('[DATA] Datos cargados:', response);
    } catch (error) {
        if (error.message.includes('401')) {
            // Token expirado
            console.log('[AUTH] Token expirado, cerrando sesión');
            AuthManager.logout();
        }
    }
}

// Ejecutar al cargar
init();
```

---

## 🧪 **PRUEBAS PASO A PASO:**

### **Test Case 1: Acceso SIN sesión**

```javascript
// 1. Eliminar token
localStorage.clear();

// 2. Intentar acceder a página protegida
window.location.href = '/templates/administracion/control-platillos';

// RESULTADO ESPERADO:
// → Redirigido inmediatamente a /templates/login
```

### **Test Case 2: Acceso CON sesión**

```javascript
// 1. Hacer login normal (usuario: admin, password: admin123)

// 2. Verificar en consola:
console.log(AuthManager.isAuthenticated());
// true

// 3. Navegar a cualquier vista
window.location.href = '/templates/administracion/control-platillos';

// RESULTADO ESPERADO:
// → Acceso permitido, vista se carga normalmente
```

### **Test Case 3: Sesión expirada durante uso**

```javascript
// 1. Estar logueado y en una vista
// 2. Abrir consola (F12)
// 3. Ejecutar:

setTimeout(() => {
    console.log('Simulando expiración de sesión...');
    localStorage.removeItem('auth_token');
}, 5000);

// RESULTADO ESPERADO después de 5 segundos:
// → El intervalo detecta la falta de token
// → Redirige automáticamente al login en el siguiente segundo
```

---

## 📊 **FLUJO COMPLETO DEL SISTEMA:**

```mermaid
Usuario intenta acceder a página
           ↓
    ┌──────────────┐
    │ simple-auth  │
    │  verifica    │
    └──────┬───────┘
           ↓
    ¿Hay token?
     /         \
   NO          SÍ
   ↓            ↓
Redirigir   Permitir
a login     acceso
   ↓            ↓
/login      Vista se
            carga
            ↓
        Verificación
        cada 1 seg
            ↓
        ¿Token?
         /    \
       NO     SÍ
       ↓      ↓
    Logout  Continuar
```

---

## 🎯 **COMANDOS ÚTILES PARA DEBUGGING:**

### **Ver todo el estado de autenticación:**

```javascript
console.log({
    token: localStorage.getItem('auth_token'),
    usuario: localStorage.getItem('user_data'),
    autenticado: AuthManager.isAuthenticated(),
    paginaActual: window.location.pathname
});
```

### **Forzar logout desde consola:**

```javascript
AuthManager.logout();
```

### **Ver cuándo expira el token:**

```javascript
const token = AuthManager.getToken();
if (token) {
    // Decodificar JWT (sin verificar firma)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    const expDate = new Date(payload.exp * 1000);
    console.log('Token expira el:', expDate.toLocaleString());
    console.log('Tiempo restante:', Math.floor((payload.exp * 1000 - Date.now()) / 1000 / 60 / 60), 'horas');
}
```

---

## ✅ **TU SISTEMA YA TIENE:**

1. ✅ Verificación automática al cargar cada página
2. ✅ Verificación cada 1 segundo (detecta logout en otra pestaña)
3. ✅ Verificación al volver a la pestaña (visibilitychange)
4. ✅ Verificación al usar botón atrás (bfcache)
5. ✅ Logout automático en error 401
6. ✅ Limpieza completa de sesión al hacer logout

---

## 🎓 **EJEMPLO PRÁCTICO:**

Abre la consola (F12) y ejecuta este código para ver la lógica en acción:

```javascript
// Test completo de sesión
(function testSesion() {
    console.log('====== TEST DE SESIÓN ======');
    
    // 1. Estado actual
    const hayToken = !!localStorage.getItem('auth_token');
    console.log('1. ¿Hay token?', hayToken ? 'SÍ' : 'NO');
    
    if (hayToken) {
        console.log('2. Token:', localStorage.getItem('auth_token').substring(0, 50) + '...');
        console.log('3. Usuario:', JSON.parse(localStorage.getItem('user_data')));
        console.log('4. Estado:', AuthManager.isAuthenticated() ? 'AUTENTICADO' : 'NO AUTENTICADO');
        
        // Simular eliminación de token
        console.log('\n5. Simulando pérdida de sesión en 3 segundos...');
        setTimeout(() => {
            localStorage.removeItem('auth_token');
            console.log('6. Token eliminado');
            console.log('7. Esperando detección automática...');
        }, 3000);
    } else {
        console.log('2. No hay sesión activa');
        console.log('3. Deberías estar viendo el login');
    }
    
    console.log('============================');
})();
```

---

## 🎉 **RESUMEN:**

Tu sistema **YA implementa** la lógica que mostraste:
- ✅ Verifica si hay sesión (token)
- ✅ Si NO hay → redirige a login
- ✅ Si SÍ hay → muestra la vista
- ✅ Verifica continuamente
- ✅ Logout automático en errores

**Para probarlo:** Usa las pruebas de arriba en la consola del navegador. 😊

