# 🧪 PRUEBA: BLOQUEO DE PLATILLOS NO DISPONIBLES

## 🎯 **LO QUE SE AGREGÓ:**

Ahora los meseros **NO pueden agregar** platillos desactivados a las órdenes.

---

## 🚀 **PRUEBA RÁPIDA (5 minutos):**

### **1️⃣ Desactivar un Platillo (Administrador)**

```
Abre: http://localhost:8080/templates/administracion/control-platillos.html

1. Busca "pollo asado" en la sección COCINA
2. Haz clic en "🚫 Desactivar"
3. Confirma
4. Verifica que cambie a "❌ NO DISPONIBLE"
```

---

### **2️⃣ Intentar Agregarlo (Mesero)**

```
Abre: http://localhost:8080/templates/mesero/mesero_comanda.html

1. Presiona Ctrl + Shift + R (para limpiar caché)
2. Presiona F12 (para ver la consola)
3. Crea una nueva orden
4. Selecciona Área: COCINA
5. Abre el dropdown de "Platillo"
```

---

### **3️⃣ Verificar Bloqueo**

**Deberías ver:**

✅ **En el dropdown:**
```
- Hilachas
- Kak ik
- pollo asado (NO DISPONIBLE)  ← En gris y cursiva
- Pepián de Pollo
```

✅ **Al seleccionar "pollo asado (NO DISPONIBLE)":**
```
- El botón "Agregar" se DESHABILITA (se pone gris)
- El cursor cambia a 🚫 (not-allowed)
- Tooltip: "Este platillo no está disponible"
```

✅ **En la consola (F12):**
```
🚫 Botón Agregar deshabilitado - platillo no disponible
```

✅ **Si intentas hacer clic en "Agregar" de todas formas:**
```
Mensaje rojo aparece arriba:
❌ Este platillo NO está disponible. No se puede agregar a la orden.
```

✅ **En la consola:**
```
⚠️ Intento de agregar platillo NO DISPONIBLE
```

---

### **4️⃣ Comparar con Platillo Disponible**

**Selecciona ahora "Hilachas" (disponible):**

✅ **Deberías ver:**
```
- Texto normal (no dice "NO DISPONIBLE")
- Botón "Agregar" HABILITADO (verde)
- Cursor normal (pointer)
- SÍ se puede agregar a la orden
```

✅ **En la consola:**
```
✅ Botón Agregar habilitado
```

---

## 📊 **COMPARACIÓN VISUAL:**

```
╔════════════════════════════════════════════════════╗
║  PLATILLO DISPONIBLE                               ║
╠════════════════════════════════════════════════════╣
║  Dropdown: Hilachas (texto negro, normal)          ║
║  Botón: [  Agregar  ] ✅ Verde, habilitado         ║
║  Cursor: →  (pointer)                              ║
║  Resultado: ✅ Se agrega a la orden                ║
╚════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════╗
║  PLATILLO NO DISPONIBLE                            ║
╠════════════════════════════════════════════════════╣
║  Dropdown: pollo asado (NO DISPONIBLE)             ║
║            (texto gris, cursiva)                   ║
║  Botón: [  Agregar  ] 🚫 Gris, deshabilitado      ║
║  Cursor: 🚫 (not-allowed)                          ║
║  Tooltip: "Este platillo no está disponible"      ║
║  Si hace clic: ❌ Mensaje de error                 ║
║  Resultado: ❌ NO se agrega a la orden             ║
╚════════════════════════════════════════════════════╝
```

---

## 🔄 **REACTIVAR Y PROBAR:**

### **5️⃣ Reactivar el Platillo**

```
Vuelve a: control-platillos.html

1. Busca "pollo asado"
2. Haz clic en "✅ Activar"
3. Confirma
4. Verifica que cambie a "✅ DISPONIBLE"
```

### **6️⃣ Verificar que Ahora SÍ se Puede Agregar**

```
Vuelve a: mesero_comanda.html

1. Ctrl + Shift + R (limpiar caché)
2. Selecciona Área: COCINA
3. Selecciona "pollo asado"
4. Ahora NO debe decir "(NO DISPONIBLE)"
5. El botón "Agregar" debe estar HABILITADO
6. ✅ Ahora SÍ se puede agregar a la orden
```

---

## ✅ **CHECKLIST DE PRUEBA:**

Marca cada punto que verifiques:

- [ ] Platillo desactivado aparece con "(NO DISPONIBLE)" en gris
- [ ] Al seleccionarlo, el botón "Agregar" se deshabilita
- [ ] El cursor cambia a "not-allowed" (🚫)
- [ ] Si intenta hacer clic, muestra mensaje de error
- [ ] En la consola dice: "🚫 Botón Agregar deshabilitado"
- [ ] Si intenta agregar, en consola: "⚠️ Intento de agregar platillo NO DISPONIBLE"
- [ ] El platillo NO se agrega a la tabla de la orden
- [ ] Al reactivar el platillo, ya NO dice "(NO DISPONIBLE)"
- [ ] Al reactivar, el botón "Agregar" se habilita
- [ ] Al reactivar, SÍ se puede agregar a la orden

---

## 🆘 **SI ALGO NO FUNCIONA:**

### **El platillo no dice "(NO DISPONIBLE)"**
```
Solución:
1. Verificar en control-platillos.html que esté desactivado
2. Recargar mesero_comanda.html con Ctrl + Shift + R
3. Esperar 2 segundos y volver a intentar
```

### **El botón no se deshabilita**
```
Solución:
1. Ctrl + Shift + R (hard refresh)
2. Abrir F12 → Console
3. Verificar que diga comanda.js?v=20251025a
4. Si dice una versión anterior, limpiar cache completo:
   - Ctrl + Shift + Delete
   - Marcar "Imágenes y archivos en caché"
   - Borrar
```

### **Sigue permitiendo agregar**
```
Solución:
1. Ver la consola (F12)
2. Buscar errores en rojo
3. Verificar que no haya errores de JavaScript
4. Recargar la página en modo incógnito (Ctrl + Shift + N)
```

---

## 🎉 **RESULTADO ESPERADO:**

```
✅ Platillos desactivados muestran "(NO DISPONIBLE)"
✅ Botón "Agregar" se deshabilita automáticamente
✅ Si intenta agregar, muestra mensaje de error
✅ El platillo NO se agrega a la orden
✅ Los logs muestran el bloqueo
✅ Al reactivar, todo vuelve a funcionar normal
```

---

## 📝 **NOTAS:**

1. **El cambio es instantáneo** - No es necesario reiniciar el backend
2. **Funciona sin JavaScript deshabilitado** - Validación en el código
3. **Triple protección** - Visual + Botón + Validación en código
4. **No afecta órdenes existentes** - Solo órdenes nuevas

---

## 🚀 **SIGUIENTE PASO:**

Después de verificar que funciona:

1. Prueba con diferentes platillos de diferentes áreas
2. Verifica que solo los desactivados estén bloqueados
3. Confirma que los disponibles sí se pueden agregar
4. Asegúrate de que la reactivación funciona correctamente

---

**¡TODO LISTO PARA USAR!** 🎉✅

**Archivos modificados:**
- ✅ `fronted/scripts/comanda.js` - Validación agregada
- ✅ `fronted/templates/mesero/mesero_comanda.html` - Cache-busting actualizado

**Documentación:**
- ✅ `BLOQUEO_PLATILLOS_NO_DISPONIBLES.md` - Documentación técnica completa
- ✅ `PRUEBA_BLOQUEO_PLATILLOS.md` - Esta guía de prueba


