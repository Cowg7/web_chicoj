# 🔧 SOLUCIÓN ERROR 429 - Too Many Requests en KDS

## 🎯 **PROBLEMA:**
```
Error 429: Too Many Requests
```

Al cargar la vista de cocina/bebidas/coffee, aparece este error porque el navegador está haciendo **demasiadas peticiones** al servidor en poco tiempo.

---

## ✅ **CAUSAS COMUNES:**

1. **Múltiples pestañas abiertas** del mismo KDS → cada una hace peticiones cada 5-10 segundos
2. **Recargas frecuentes** de la página → se crean múltiples `setInterval` que no se limpian
3. **Intervalo muy agresivo** (5 segundos) → demasiadas peticiones por minuto
4. **Intervalos huérfanos** → se quedan ejecutándose en segundo plano

---

## 🚀 **SOLUCIÓN INMEDIATA (3 pasos):**

### **1️⃣ Cierra TODAS las pestañas de KDS**
```
✅ Cierra todas las pestañas de:
   - cocina.html
   - cocina.html?area=Cocina
   - cocina.html?area=Bebidas  
   - cocina.html?area=Coffee
```

### **2️⃣ Hard Refresh para actualizar el código**
```
1. Abre UNA SOLA pestaña de cocina:
   http://localhost:8080/templates/cocina/cocina.html?area=Cocina

2. Presiona: Ctrl + Shift + R

3. ✅ El código actualizado se cargará
```

### **3️⃣ Verifica en la consola**
```
1. F12 (abrir consola del navegador)
2. Deberías ver:
   ✅ Auto-refresh configurado para Cocina cada 10 segundos
   ✅ 🔄 Cargando tickets del área: Cocina
   ✅ ✅ X tickets cargados

3. NO deberías ver:
   ❌ Error 429
   ❌ Too Many Requests
```

---

## 📊 **MEJORAS IMPLEMENTADAS:**

### **1. Limpieza automática de intervalos**
✅ Se limpia el intervalo anterior antes de crear uno nuevo
✅ Se limpia al cerrar/salir de la página
✅ Se pausa cuando cambias de pestaña

### **2. Control de peticiones simultáneas**
✅ Solo una petición a la vez
✅ Si hay una en curso, se salta la siguiente hasta que termine

### **3. Intervalo aumentado**
✅ Antes: cada 5 segundos = 12 peticiones/minuto
✅ Ahora: cada 10 segundos = 6 peticiones/minuto
✅ 50% menos de carga al servidor

### **4. Pausa inteligente**
✅ Si cambias de pestaña, se pausa automáticamente
✅ Al volver, se reanuda y carga inmediatamente
✅ Ahorra recursos del servidor

---

## 🧪 **PRUEBA COMPLETA:**

### **Test 1: Una sola pestaña**
```
1. Cierra todas las pestañas de KDS
2. Abre: http://localhost:8080/templates/cocina/cocina.html?area=Cocina
3. Ctrl + Shift + R
4. F12 → pestaña Console
5. Espera 30 segundos
6. Deberías ver logs cada 10 segundos:
   🔄 Auto-refresh de Cocina...
   🔄 Cargando tickets del área: Cocina
   ✅ X tickets cargados
```

✅ **Resultado esperado:** Sin errores 429, carga fluida cada 10 segundos

---

### **Test 2: Múltiples áreas (pero una pestaña por área)**
```
1. Pestaña 1: cocina.html?area=Cocina
2. Pestaña 2: cocina.html?area=Bebidas
3. Pestaña 3: cocina.html?area=Coffee

✅ Cada pestaña hace peticiones cada 10 segundos a su área
✅ No deberían interferir entre sí
✅ Total: 18 peticiones/minuto (3 áreas × 6 pet/min)
```

---

### **Test 3: Cambio de pestaña (pausa inteligente)**
```
1. Abre KDS de Cocina
2. F12 → Console
3. Cambia a otra pestaña del navegador (ejemplo: Google)
4. Espera 15 segundos
5. Vuelve a la pestaña de KDS

✅ Deberías ver en consola:
   ⏸️ Auto-refresh pausado (pestaña oculta)
   [nada durante 15 segundos]
   ▶️ Auto-refresh reanudado
   🔄 Cargando tickets del área: Cocina
```

---

## ⚠️ **SI PERSISTE EL ERROR 429:**

### **Opción 1: Reiniciar el backend**
```bash
cd backend

# Detener el servidor (Ctrl+C)

# Limpiar caché de Node
npm cache clean --force

# Reiniciar
npm run dev
```

---

### **Opción 2: Aumentar el intervalo aún más**
Editar `fronted/scripts/cocina.js` línea 81-84:

```javascript
// Cambiar de 10000 a 15000 (15 segundos) o 30000 (30 segundos)
refreshInterval = setInterval(() => {
  console.log(`🔄 Auto-refresh de ${currentArea}...`);
  loadTickets();
}, 15000); // ← Aumentar este valor
```

---

### **Opción 3: Implementar rate limiting más permisivo**

Si tienes control del backend, editar `backend/src/app.js`:

```javascript
// Buscar configuración de rate limiting (si existe)
// Aumentar límites:

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // Aumentar de 30 a 100 peticiones por minuto
  message: 'Demasiadas peticiones, intenta de nuevo más tarde'
});
```

---

## 📝 **LOGS NORMALES (sin errores):**

```javascript
✅ Auto-refresh configurado para Cocina cada 10 segundos
🔄 Cargando tickets del área: Cocina
📦 Respuesta del servidor: {...}
✅ 5 tickets cargados
🎨 displayTickets() llamado
📍 tablaBody encontrado: true
🧹 Tabla limpiada
📋 Renderizando 5 tickets...
📊 5 items mostrados en la tabla

// ... 10 segundos después ...

🔄 Auto-refresh de Cocina...
🔄 Cargando tickets del área: Cocina
📦 Respuesta del servidor: {...}
✅ 5 tickets cargados
```

---

## 🚫 **LOGS ANORMALES (con problemas):**

```javascript
// ❌ Múltiples intervalos:
✅ Auto-refresh configurado para Cocina cada 10 segundos
✅ Auto-refresh configurado para Cocina cada 10 segundos
✅ Auto-refresh configurado para Cocina cada 10 segundos
[PROBLEMA: Se crearon 3 intervalos = 18 peticiones/minuto]

// ❌ Peticiones simultáneas:
🔄 Cargando tickets del área: Cocina
🔄 Cargando tickets del área: Cocina
🔄 Cargando tickets del área: Cocina
[PROBLEMA: 3 peticiones al mismo tiempo]

// ❌ Error 429:
❌ Error al cargar tickets: Error: Error 429: Too Many Requests
[PROBLEMA: Demasiadas peticiones en poco tiempo]
```

**Solución:** Ctrl + Shift + R para cargar el código actualizado que previene esto

---

## 💡 **MEJORES PRÁCTICAS:**

### ✅ **HACER:**
- Abrir UNA pestaña por área de KDS
- Dejar que el auto-refresh haga su trabajo
- Hacer Ctrl+Shift+R después de actualizaciones de código
- Cerrar pestañas de KDS que no estés usando

### ❌ **NO HACER:**
- Abrir múltiples pestañas de la misma área
- Recargar manualmente cada 2 segundos (F5 repetidamente)
- Tener 5 pestañas de cocina.html abiertas
- Reducir el intervalo a menos de 5 segundos

---

## 🔍 **VERIFICACIÓN FINAL:**

### **Checklist pre-producción:**
```
□ Cerrar todas las pestañas de KDS
□ Abrir UNA pestaña de Cocina
□ Ctrl + Shift + R
□ F12 → Console
□ Esperar 30 segundos
□ Verificar logs cada 10 segundos
□ NO ver errores 429
□ Ver tickets cargándose correctamente
```

✅ **Si cumples todo el checklist, el sistema está funcionando correctamente**

---

## 📞 **MONITOREO RECOMENDADO:**

### **En consola del navegador (F12):**
```javascript
// Verificar si hay intervalos múltiples
console.log('Intervalos activos:', 
  window.setInterval.toString().match(/\d+/g)?.length || 0
);

// Limpiar TODOS los intervalos (emergencia)
for (let i = 0; i < 10000; i++) {
  clearInterval(i);
}
location.reload();
```

---

## ✅ **RESUMEN RÁPIDO:**

```
1. Cierra TODAS las pestañas de KDS
2. Abre UNA pestaña por área
3. Ctrl + Shift + R
4. ✅ Listo - Auto-refresh cada 10 segundos
```

**⚡ El error 429 debe desaparecer inmediatamente**

