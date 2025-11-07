# 🧹 GUÍA DE CACHÉ DEL NAVEGADOR

## ❓ **TU PROBLEMA:**

```
Modo Normal:    No se ven los cambios ❌
Modo Incógnito: SÍ se ven los cambios ✅

¿Por qué?  →  CACHÉ DEL NAVEGADOR
```

---

## 🔍 **¿QUÉ ES LA CACHÉ?**

La **caché** es como una "memoria" del navegador que guarda archivos (CSS, JS, HTML, imágenes) para cargar las páginas más rápido.

### **Cómo Funciona:**

**Primera Visita:**
```
Navegador → Descarga todo desde servidor
          → Guarda copia en caché
          → Muestra la página
```

**Visitas Siguientes:**
```
Navegador → "Ya tengo esto guardado"
          → Usa la versión de caché (ANTIGUA)
          → NO descarga la nueva ❌
```

**Modo Incógnito:**
```
Navegador → NO tiene caché
          → Descarga todo fresco
          → Muestra versión actual ✅
```

---

## 🛠️ **SOLUCIONES RÁPIDAS:**

### **SOLUCIÓN 1: Hard Refresh (La más rápida)**

**Windows/Linux:**
```
Ctrl + Shift + R
```
o
```
Ctrl + F5
```

**Mac:**
```
Cmd + Shift + R
```

**¿Qué hace?**
- Borra la caché de la página actual
- Descarga todo de nuevo
- Muestra los cambios ✅

---

### **SOLUCIÓN 2: Vaciar Caché en DevTools**

**Paso 1:** Abre DevTools
```
F12
```

**Paso 2:** Click derecho en el botón de Recargar (🔄)

**Paso 3:** Selecciona:
```
"Vaciar caché y volver a cargar de manera forzada"
```

---

### **SOLUCIÓN 3: Limpiar Caché Manual**

**Chrome/Edge:**
1. `Ctrl + Shift + Delete`
2. Selecciona: "Imágenes y archivos en caché"
3. Rango: "Desde siempre"
4. Click: "Borrar datos"

**Firefox:**
1. `Ctrl + Shift + Delete`
2. Selecciona: "Caché"
3. Rango: "Todo"
4. Click: "Aceptar"

---

### **SOLUCIÓN 4: Desactivar Caché (Para desarrollo)**

**Mientras desarrollas:**

1. Abre DevTools: `F12`
2. Ve a pestaña: **"Network"** (Red)
3. Marca: **"Disable cache"** (Desactivar caché)
4. **Deja DevTools abierto**

Ahora mientras trabajas, no guardará caché.

---

### **SOLUCIÓN 5: Usar la Página de Limpieza**

He creado una página especial para ti:

```
http://localhost/templates/limpiar-cache
```

**¿Qué hace?**
- Limpia localStorage
- Limpia sessionStorage
- Limpia cookies
- Limpia Cache API
- Limpia IndexedDB
- Recarga la página

**Úsala cuando:**
- Los cambios no se ven
- Tienes problemas de sesión
- Quieres empezar "fresco"

---

## 🎯 **TU SISTEMA YA TIENE VERSIONADO**

Tu sistema **ya previene** este problema con versiones en los archivos:

```html
<!-- Ejemplo: -->
<link rel="stylesheet" href="/css/base.css?v=20251107g">
<script src="/scripts/gestion-categorias.js?v=20251107n"></script>
                                              ↑
                                  Cambia con cada actualización
```

**Cuando cambiamos el `?v=...`:**
- El navegador lo ve como archivo nuevo
- Lo descarga de nuevo
- Muestra los cambios ✅

---

## 📊 **TIPOS DE CACHÉ:**

### **1. Caché del Navegador (Browser Cache)**
```
Archivos: HTML, CSS, JS, imágenes
Solución: Ctrl + Shift + R
```

### **2. localStorage**
```
Datos: Token, usuario, preferencias
Solución: localStorage.clear()
```

### **3. sessionStorage**
```
Datos: Datos temporales de sesión
Solución: sessionStorage.clear()
```

### **4. Cookies**
```
Datos: Sesiones, preferencias
Solución: Limpiar cookies
```

### **5. Service Workers**
```
Archivos: Caché offline
Solución: Desregistrar SW
```

---

## 🧪 **CÓMO PROBAR SI ES CACHÉ:**

### **Test 1: Modo Incógnito**
```
1. Abre ventana incógnita: Ctrl + Shift + N
2. Ve a tu sitio
3. ¿Se ven los cambios?
   - SÍ → Es problema de caché ✅
   - NO → Es otro problema ❌
```

### **Test 2: Hard Refresh**
```
1. En la página con problemas
2. Ctrl + Shift + R
3. ¿Se ven los cambios?
   - SÍ → Era caché ✅
   - NO → Puede ser el servidor ❌
```

### **Test 3: Otro Navegador**
```
1. Abre otro navegador (Chrome → Firefox)
2. Ve a tu sitio
3. ¿Se ven los cambios?
   - SÍ → Caché del navegador original ✅
   - NO → Problema en servidor ❌
```

---

## 💡 **PREVENIR PROBLEMAS DE CACHÉ:**

### **Durante Desarrollo:**

**1. DevTools siempre abierto con caché desactivada**
```
F12 → Network → ✓ Disable cache
```

**2. Usar versionado en archivos**
```html
<!-- SIEMPRE cambiar el ?v=... al actualizar -->
<script src="/scripts/archivo.js?v=20251107a"></script>
                                   ↑ Cambiar esto
```

**3. Headers de caché en servidor (nginx)**
```nginx
# Para archivos estáticos en desarrollo
location ~* \.(js|css|html)$ {
    expires -1;  # No cachear
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

---

## 🎓 **COMANDOS DESDE CONSOLA:**

### **Ver tamaño de caché:**
```javascript
// En consola (F12):
console.log('localStorage:', localStorage.length, 'items');
console.log('sessionStorage:', sessionStorage.length, 'items');

// Ver todas las cachés
caches.keys().then(names => {
    console.log('Cachés:', names);
});
```

### **Limpiar todo desde consola:**
```javascript
// Limpiar localStorage
localStorage.clear();
console.log('✅ localStorage limpio');

// Limpiar sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpio');

// Limpiar cookies
document.cookie.split(";").forEach(c => {
    document.cookie = c.replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
console.log('✅ Cookies limpias');

// Recargar
location.reload(true);
```

---

## 📋 **CHECKLIST PARA TUS CAMBIOS:**

Cuando hagas cambios en el frontend:

```
☐ 1. Haz tus cambios en HTML/CSS/JS
☐ 2. Guarda los archivos
☐ 3. Reinicia nginx: docker-compose restart nginx
☐ 4. Actualiza versiones en HTML: ?v=20251107x
☐ 5. Hard Refresh: Ctrl + Shift + R
☐ 6. Verifica que se vean los cambios
☐ 7. Si no se ven → Limpiar caché completa
```

---

## 🚀 **FLUJO RECOMENDADO:**

### **Para Desarrollo Diario:**

```bash
# 1. Hacer cambios
# 2. Guardar archivos
# 3. Reiniciar nginx
docker-compose restart nginx

# 4. En el navegador:
Ctrl + Shift + R
```

### **Para Cambios Grandes:**

```bash
# 1. Hacer cambios
# 2. Actualizar versiones en HTML
# Cambiar todos los ?v=... a una nueva versión

# 3. Reiniciar nginx
docker-compose restart nginx

# 4. Limpiar caché completa
http://localhost/templates/limpiar-cache
```

---

## 🎯 **CASOS COMUNES:**

### **Caso 1: "Cambié CSS pero no se ve"**
```
Solución: Ctrl + Shift + R
Causa: Caché del archivo CSS
```

### **Caso 2: "Cambié JS pero sigue ejecutando código viejo"**
```
Solución: Ctrl + Shift + R + Actualizar ?v=...
Causa: Caché del archivo JS
```

### **Caso 3: "Cambié HTML pero veo la versión anterior"**
```
Solución: Ctrl + Shift + R
Causa: Caché de la página HTML
```

### **Caso 4: "En incógnito funciona, en normal no"**
```
Solución: Limpiar caché completa
Causa: Caché acumulada
```

### **Caso 5: "Nada funciona"**
```
Solución: 
1. Limpiar caché completa
2. Verificar docker-compose restart nginx
3. Verificar que archivos estén guardados
4. Verificar logs: docker logs chicoj-nginx
```

---

## ✅ **RESUMEN RÁPIDO:**

**Tu Problema:**
```
Normal: No se ve ❌  →  Caché antigua
Incógnito: Se ve ✅  →  Sin caché
```

**Solución Inmediata:**
```
Ctrl + Shift + R  (Hard Refresh)
```

**Solución Completa:**
```
http://localhost/templates/limpiar-cache
```

**Para Desarrollo:**
```
F12 → Network → ✓ Disable cache
(Dejar DevTools abierto)
```

**Actualizar Versiones:**
```html
<!-- Cambiar esto en cada actualización -->
<script src="...?v=20251107x"></script>
              ↑ Cambiar versión
```

---

## 🎉 **¡LISTO!**

Ahora ya sabes:
- ✅ Por qué pasa (caché)
- ✅ Cómo solucionarlo (hard refresh)
- ✅ Cómo prevenirlo (disable cache)
- ✅ Herramientas que tienes (limpiar-cache.html)

**La próxima vez que no veas cambios:**
```
1. Ctrl + Shift + R
2. Si no funciona → limpiar-cache.html
3. Si aún no → Verificar nginx y archivos
```

😊

