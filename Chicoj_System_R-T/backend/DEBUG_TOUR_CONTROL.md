# 🔍 DEBUG - TOURS NO SE MUESTRAN

## 🎯 **PROBLEMA:**

Los tours se guardan correctamente, pero no aparecen en `tour-control.html`.

**Causa probable:** Caché del navegador en `tour-control.js`

---

## ✅ **SOLUCIÓN:**

### **PASO 1: Limpiar Caché**

Ve a `tour-control.html`:
```
http://localhost:8080/templates/tour/tour-control.html
```

Presiona:
```
Ctrl + Shift + R
```

---

### **PASO 2: Abrir Consola (CRÍTICO)**

Presiona `F12` para abrir DevTools

Ve a la pestaña **"Console"**

---

### **PASO 3: Verificar Logs**

**Debes ver estos mensajes:**

```
✅ NUEVA VERSIÓN DE TOUR-CONTROL.JS CARGADA (v20251024g)
🔄 Cargando tours...
📦 Respuesta completa del servidor: {...}
📊 Data extraída: {...}
✅ X tours cargados: [...]
📋 Primer tour como ejemplo: {...}
🎨 displayTours() llamado
📍 tablaBody existe: true
📊 Tours a mostrar: X
📋 Renderizando tours...
  Tour 1: {...}
  Tour 2: {...}
✅ X de X tours mostrados en la tabla
```

---

### **PASO 4: Diagnosticar**

#### **Caso A: NO ves `✅ NUEVA VERSIÓN DE TOUR-CONTROL.JS CARGADA`**

**Problema:** Caché no limpiado

**Solución:** Modo incógnito:
```
Ctrl + Shift + N  (abrir ventana incógnita)
Ve a: http://localhost:8080/templates/tour/tour-control.html
```

---

#### **Caso B: Ves `✅ 0 tours cargados`**

**Problema:** No hay tours en la base de datos o el filtro los está ocultando

**Solución 1:** Limpia los filtros (botón "Limpiar")

**Solución 2:** Registra un tour primero en `tour.html`

---

#### **Caso C: Ves `✅ 2 tours cargados` pero la tabla está vacía**

**Problema:** Error al renderizar la tabla

**En la consola, busca:**
- `📍 tablaBody existe: false` → El HTML no cargó bien
- Errores en rojo → Algo falló al renderizar

**Solución:** Copia TODOS los errores y envíamelos

---

#### **Caso D: Error `❌ Error al cargar tours`**

**Problema:** Backend no responde o error de conexión

**Verifica:**
1. ¿El backend está corriendo? (`npm run dev` en `backend/`)
2. ¿El frontend está corriendo? (`npx http-server -p 8080` en `fronted/`)
3. ¿Puedes acceder a: `http://localhost:3000/api/tour`?

---

## 🧪 **TEST MANUAL DE LA API:**

Abre el navegador y ve a:
```
http://localhost:3000/api/tour
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "tours": [
      {
        "id_tour": 1,
        "fecha": "2025-10-24T00:00:00.000Z",
        "nombre_servicio": "Recorrido",
        "precio_servicio": "150.00",
        "tipo_visitante": "Nacional",
        "cantidad_visitante": 4,
        "idioma": "Español",
        "observaciones": ""
      }
    ],
    "total": 1
  }
}
```

**Si esto funciona pero tour-control.html no muestra nada:**
- Es problema de caché
- Es problema de JavaScript

---

## 📊 **INFORMACIÓN QUE NECESITO:**

Si sigue sin funcionar, envíame:

### **1. Logs de la Consola**

Abre `tour-control.html`, presiona F12, copia **TODO** lo que aparezca en la pestaña Console y envíamelo.

### **2. Respuesta del API**

Ve a: `http://localhost:3000/api/tour` y cópiame lo que aparece.

### **3. Network Tab**

En DevTools (F12):
1. Ve a pestaña **"Network"** (Red)
2. Recarga la página (`F5`)
3. Busca la petición: `GET tour`
4. Clic en ella → Pestaña **"Response"**
5. Cópiame el contenido

---

## ⚡ **SOLUCIÓN RÁPIDA:**

```bash
# Paso 1: Modo incógnito
Ctrl + Shift + N

# Paso 2: Ve a tour-control
http://localhost:8080/templates/tour/tour-control.html

# Paso 3: Abre consola
F12 → Console

# Paso 4: Busca el mensaje
✅ NUEVA VERSIÓN DE TOUR-CONTROL.JS CARGADA (v20251024g)

# Paso 5: Lee TODOS los logs
Debe decir cuántos tours cargó
```

---

## 🎯 **CHECKLIST:**

- [ ] Hice `Ctrl + Shift + R` en tour-control.html
- [ ] Abrí la consola (F12)
- [ ] Vi: `✅ NUEVA VERSIÓN DE TOUR-CONTROL.JS CARGADA (v20251024g)`
- [ ] Vi: `✅ X tours cargados`
- [ ] ¿Cuántos tours dice que cargó? ________
- [ ] ¿Los veo en la tabla? SÍ / NO

---

## 💡 **TIP:**

Si en la consola dice `✅ 2 tours cargados` pero no los ves:

1. Revisa los **filtros** (arriba de la tabla)
2. Clic en **"Limpiar"**
3. Los tours deberían aparecer

---

**¡Haz Ctrl + Shift + R en tour-control.html y revisa la consola (F12)!**

**Envíame los logs que aparecen en la consola** 📋


