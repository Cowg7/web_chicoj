# 🚀 GUÍA RÁPIDA: GESTIÓN DE PLATILLOS

## ✅ **LO QUE SE IMPLEMENTÓ:**

1. **Platillos agrupados por área** (COCINA, BEBIDAS, COFFEE, BAR)
2. **Botón para desactivar/activar platillos**
3. **Indicador "(NO DISPONIBLE)" para meseros**

---

## 🧪 **CÓMO PROBAR:**

### **PASO 1: Reiniciar el Backend**

```bash
cd backend
npm run dev
```

Espera a que diga: `✅ Database connected successfully`

---

### **PASO 2: Ver Control de Platillos**

```
Abre: http://localhost:8080/templates/administracion/control-platillos.html
```

**Deberías ver:**
- Platillos agrupados por área (COCINA, COFFEE, etc.)
- Cada platillo con:
  - ✅ Badge "DISPONIBLE" (verde)
  - 🚫 Botón "Desactivar" (naranja)
  - ✏️ Botón "Editar"

---

### **PASO 3: Desactivar un Platillo**

1. **Busca** cualquier platillo (ej: "pollo asado")
2. **Haz clic** en el botón **"🚫 Desactivar"**
3. **Confirma** en el diálogo
4. **Observa** el cambio:
   - Badge cambia a ❌ "NO DISPONIBLE" (rojo)
   - Botón cambia a ✅ "Activar" (verde)
   - Fila se ve con opacidad reducida

---

### **PASO 4: Ver en Vista de Mesero**

```
Abre: http://localhost:8080/templates/mesero/mesero_comanda.html
```

1. **Crea** una nueva orden
2. **Selecciona** el área donde está el platillo desactivado
3. **Abre** el dropdown de platillos
4. **Verifica** que diga:
   ```
   pollo asado (NO DISPONIBLE)
   ```
   En texto gris y cursiva

---

### **PASO 5: Reactivar el Platillo**

1. **Vuelve** a `control-platillos.html`
2. **Busca** el platillo desactivado
3. **Haz clic** en **"✅ Activar"**
4. **Confirma**
5. **Verifica** que vuelva a:
   - ✅ "DISPONIBLE" (verde)
   - 🚫 "Desactivar" (naranja)

---

## 📊 **RESULTADO VISUAL:**

### **En Control de Platillos:**

```
┌──────────────────────────────────────────────┐
│ 🏷️ COCINA                       6 platillos  │
├──────────────────────────────────────────────┤
│ ID │ Nombre       │ Precio │ Estado  │ ...   │
│ 2  │ Hilachas     │ Q55.00 │ ✅ DISPON│ 🚫 ✏️│
│ 6  │ pollo asado  │ Q13.00 │ ❌ NO DIS│ ✅ ✏️│
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ 🏷️ COFFEE                       3 platillos  │
├──────────────────────────────────────────────┤
│ 7  │ Café America │ Q18.00 │ ✅ DISPON│ 🚫 ✏️│
│ 8  │ Capuccino    │ Q25.00 │ ✅ DISPON│ 🚫 ✏️│
└──────────────────────────────────────────────┘
```

### **En Vista de Mesero:**

```
Área: COCINA ▼

Platillo: Seleccionar... ▼
  - Hilachas
  - Kak ik
  - pollo asado (NO DISPONIBLE)  ← gris, cursiva
  - Pepián de Pollo
```

---

## 🎯 **CASOS DE USO:**

### **Caso 1: No hay ingredientes**
```
1. Ir a control-platillos.html
2. Buscar el platillo sin ingredientes
3. Clic en "🚫 Desactivar"
4. Los meseros verán "(NO DISPONIBLE)"
```

### **Caso 2: Platillo de temporada**
```
Ejemplo: Tamales solo en diciembre
1. En enero, desactivar "Tamales"
2. En diciembre, activar "Tamales"
```

### **Caso 3: Equipo descompuesto**
```
Ejemplo: Máquina de café descompuesta
1. Desactivar todos los platillos de COFFEE
2. Cuando se repare, reactivarlos
```

---

## ⚠️ **NOTAS IMPORTANTES:**

1. **Los platillos desactivados NO se eliminan**
   - Solo se marcan como NO DISPONIBLES
   - Siguen en la base de datos

2. **Los meseros todavía los ven**
   - Pueden ver que existen
   - Pero claramente marcados como NO DISPONIBLES

3. **Órdenes existentes no se afectan**
   - Si ya hay una orden con ese platillo, sigue válida
   - Solo afecta NUEVAS órdenes

---

## 🔧 **SI HAY PROBLEMAS:**

### **Problema 1: No se ven los platillos agrupados**
```
Solución: Recargar con Ctrl + Shift + R
```

### **Problema 2: No cambia el estado**
```
Solución: 
1. Verificar que el backend esté corriendo
2. Ver la consola (F12) para errores
3. Verificar que estés autenticado
```

### **Problema 3: En mesero no dice "(NO DISPONIBLE)"**
```
Solución:
1. Recargar la página del mesero (Ctrl + Shift + R)
2. Verificar que el platillo esté realmente desactivado
3. Seleccionar el área correcta
```

---

## 📝 **RESUMEN:**

✅ **Platillos organizados por área:** COCINA, BEBIDAS, COFFEE, BAR  
✅ **Botón desactivar/activar:** Cambio con un clic  
✅ **Indicador visual:** "(NO DISPONIBLE)" para meseros  
✅ **No destructivo:** Los platillos no se eliminan  
✅ **Instantáneo:** Los cambios se ven de inmediato  

---

## 🆘 **¿NECESITAS AYUDA?**

**Archivos importantes:**
- Backend: `backend/src/modules/menu/menu.controller.js`
- Frontend Admin: `fronted/scripts/control-platillos.js`
- Frontend Mesero: `fronted/scripts/comanda.js`
- Base de datos: Campo `disponible` en tabla `platillos`

**Documentación completa:**
- `SISTEMA_PLATILLOS_DISPONIBILIDAD.md`

---

**¡LISTO PARA USAR!** 🎉

**PRUEBA AHORA:**
```
1. http://localhost:8080/templates/administracion/control-platillos.html
2. Desactivar un platillo
3. Ir a mesero_comanda.html
4. Verificar que diga "(NO DISPONIBLE)"
```


