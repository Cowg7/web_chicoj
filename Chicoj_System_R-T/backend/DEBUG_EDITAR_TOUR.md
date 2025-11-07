# 🔍 DEBUG: EDITAR TOUR - GUÍA DE PRUEBA

## 🎯 **OBJETIVO:**
Diagnosticar y resolver por qué no se cargan los datos del tour al editar.

---

## 🔧 **CAMBIOS REALIZADOS:**

### **1. Logs Mejorados en `tour.js`**

Agregué logs super detallados para rastrear exactamente qué está pasando:

✅ Verificación de inputs del DOM  
✅ Respuesta completa del servidor  
✅ Extracción de datos  
✅ Mapeo campo por campo  
✅ Warnings si falta algún elemento  

---

## 🧪 **PASOS PARA PROBAR:**

### **PASO 1: Limpiar Caché Completamente**

**Opción A: Hard Refresh**
```
Ctrl + Shift + R
```

**Opción B: Limpiar Caché (RECOMENDADO)**
```
1. Presiona Ctrl + Shift + Delete
2. Selecciona "Última hora"
3. Marca SOLO:
   ✅ Imágenes y archivos en caché
   ✅ Archivos y datos alojados en caché
4. Clic en "Borrar datos"
```

**Opción C: Modo Incógnito (MEJOR)**
```
Ctrl + Shift + N
```

---

### **PASO 2: Abrir Consola del Navegador**

```
1. Presiona F12
2. Clic en la pestaña "Console"
3. Limpia la consola (ícono 🚫 o Ctrl + L)
```

---

### **PASO 3: Navegar al Tour**

#### **3.1 Ir a la lista de tours:**
```
http://localhost:8080/templates/tour/tour-control.html
```

#### **3.2 Hacer clic en "Editar" de cualquier tour**

---

### **PASO 4: Revisar los Logs**

Deberías ver en la consola algo como esto:

```
📥 Cargando tour para editar, ID: 1
🔍 Verificando inputs del DOM: {
  id: 'OK',
  fecha: 'OK',
  servicio: 'OK',
  precioServicio: 'OK',
  tipo: 'OK',
  cantidadVisitante: 'OK',
  idioma: 'OK',
  observaciones: 'OK',
  precioTotal: 'OK'
}
📦 Respuesta completa del servidor: {
  "success": true,
  "data": {
    "tour": {
      "id_tour": 1,
      "fecha": "2025-10-24T00:00:00.000Z",
      "nombre_servicio": "Recorrido",
      "precio_servicio": "50.00",
      "tipo_visitante": "Nacional",
      "cantidad_visitante": 5,
      "idioma": "Español",
      "observaciones": "Grupo escolar"
    }
  }
}
📊 Data extraída: { ... }
🎫 Tour objeto final: { ... }
🔑 Campos del tour: { ... }
✅ Tour encontrado, cargando campos...
  ✓ ID cargado: 1
  ✓ Fecha cargada: 2025-10-24
  ✓ Servicio cargado: Recorrido
  ✓ Precio servicio cargado: 50.00
  ✓ Tipo cargado: Nacional
  ✓ Cantidad cargada: 5
  ✓ Idioma cargado: Español
  ✓ Observaciones cargadas: Grupo escolar
  ✓ Precio total calculado: 250.00
✅ Todos los campos cargados correctamente
```

---

## 📊 **QUÉ BUSCAR EN LOS LOGS:**

### **✅ SI TODO FUNCIONA:**
- Todos los inputs dicen "OK"
- La respuesta del servidor tiene los datos
- Cada campo dice "✓ [Campo] cargado"
- Verás los valores en los campos del formulario

### **❌ SI HAY PROBLEMAS:**

#### **Problema 1: Algún input dice "FALTA"**
```
Significa que el ID del campo HTML no coincide con el JavaScript
```

#### **Problema 2: La respuesta del servidor está vacía**
```
Problema en el backend o la API
```

#### **Problema 3: Los campos del tour son undefined**
```
El backend está devolviendo datos con nombres diferentes
```

#### **Problema 4: Se ven warnings ⚠️**
```
⚠️ Campo [nombre] no encontrado en DOM
```

---

## 🔄 **POSIBLES SOLUCIONES:**

### **Solución 1: El caché no se limpió**
```bash
# Verifica la versión en la URL del script:
# Debe decir: tour.js?v=20251025a
# Si dice una versión anterior, el caché sigue activo
```

### **Solución 2: Los IDs no coinciden**
```javascript
// Verificar que los IDs en tour.html sean:
id="id-tour"
id="fecha"
id="servicio"
id="precio-servicio"
id="tipo"
id="cantidad-visitante"
id="idioma"
id="observaciones"
id="precio-total"
```

### **Solución 3: Problema en la API**
```javascript
// Revisar el endpoint en la consola:
GET http://localhost:3000/api/tour/[ID]

// Debería devolver:
{
  "success": true,
  "data": {
    "tour": { ... }
  }
}
```

---

## 📸 **CAPTURA DE PANTALLA:**

**Si el problema persiste, envíame:**

1. **Captura de la consola completa** (F12 → Console)
2. **La URL completa** del navegador
3. **Los valores actuales** de los campos del formulario

---

## 🚀 **COMANDO RÁPIDO:**

**Para limpiar TODO de una vez:**

```
1. Cierra TODOS los navegadores
2. Abre uno NUEVO
3. Presiona Ctrl + Shift + N (Incógnito)
4. Ve a: http://localhost:8080/templates/tour/tour-control.html
5. Presiona F12 para abrir consola
6. Edita un tour
7. Lee los logs
```

---

## 💡 **NOTAS IMPORTANTES:**

1. **Cache Busting actualizado:**  
   `tour.js?v=20251025a` (nueva versión)

2. **Logs completos:**  
   Ahora verás EXACTAMENTE qué está pasando en cada paso

3. **Warnings útiles:**  
   Si falta algo, te dirá QUÉ falta

4. **Respuesta del servidor:**  
   Podrás ver los datos exactos que devuelve el backend

---

## 🎯 **RESULTADO ESPERADO:**

Al hacer clic en "Editar" desde `tour-control.html`:

```
✅ Se abre tour.html con ?id=X en la URL
✅ Los campos se llenan automáticamente
✅ Puedes modificar los valores
✅ Al guardar, actualiza el tour
✅ Redirige a tour-control.html
```

---

## 🆘 **SI SIGUE SIN FUNCIONAR:**

**Ejecuta esto en la consola del navegador:**

```javascript
// Verificar que API.tour.getById exista
console.log('API.tour:', API.tour);

// Verificar inputs
console.log('Input ID:', document.getElementById('id-tour'));
console.log('Input Fecha:', document.getElementById('fecha'));
console.log('Input Servicio:', document.getElementById('servicio'));

// Intentar cargar manualmente
const url = new URLSearchParams(window.location.search);
const id = url.get('id');
console.log('ID de la URL:', id);
```

---

**¡PRUEBA AHORA Y CUÉNTAME QUÉ LOGS VES EN LA CONSOLA!** 🔍✨

**Recuerda:**
1. Ctrl + Shift + N (Incógnito)
2. F12 (Consola)
3. Editar un tour
4. Copiar y pegar TODOS los logs


