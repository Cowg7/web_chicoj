# 💰 Flujo de "Cerrar Cuenta" - YA IMPLEMENTADO

## ✅ **ESTADO ACTUAL:**

El botón **"Cerrar Cuenta"** ya está implementado y funciona correctamente. Aquí está el flujo completo:

---

## 🔄 **FLUJO COMPLETO DE ESTADOS:**

```
1️⃣  Pendiente         (Mesero crea la orden)
         ↓
2️⃣  En Preparación   (Mesero envía a cocina con "Enviar a Cocina")
         ↓
3️⃣  Preparada        (Cocina termina TODOS los platillos)  ← 💡 AQUÍ APARECE EL BOTÓN
         ↓
4️⃣  En Caja          (Mesero cierra cuenta con "💰 Cerrar Cuenta")
         ↓
5️⃣  Finalizada       (Cajero cobra con "💳 Cobrar")
```

---

## 📋 **CÓMO FUNCIONA:**

### **Paso 1: Cocina Termina los Platillos**
- Usuario: `cocina1/cocina123`, `bebidas1/bebidas123`, `coffee1/coffee123`
- Cada área ve sus propias órdenes
- Click en **"✓ Terminar"** en cada platillo
- El platillo se marca como **"Preparado"** (no se elimina)

### **Paso 2: Orden Pasa a "Preparada"**
- Cuando **TODOS** los platillos de la orden están "Preparado"
- El sistema cambia **automáticamente** el estado de la orden a **"Preparada"**
- La orden desaparece de KDS (porque ya no hay items pendientes)

### **Paso 3: Mesero Ve Orden Preparada**
- Usuario: `mesero1/mesero123`
- Ir a: **"Comandas"** (`comanda-control.html`)
- Ver órdenes con estado **"Preparada"** (badge verde 🟢)
- El botón **"Agregar platillos a esta orden"** se OCULTA
- Aparece el botón **"💰 Cerrar Cuenta"**

### **Paso 4: Mesero Cierra la Cuenta**
- Click en **"💰 Cerrar Cuenta"**
- Aparece confirmación: "¿El cliente pidió la cuenta? Esto enviará la orden a caja para su cobro."
- Click en **"OK"**
- ✅ La orden pasa a estado **"En Caja"**
- ✅ Notificación: "Cuenta cerrada. La orden se envió a caja."

### **Paso 5: Cajero Cobra**
- Usuario: `cajero1/cajero123`
- La orden aparece en **"Órdenes Pendientes"**
- Click en **"💳 Cobrar"**
- Llenar modal de pago
- Click en **"✓ Finalizar Pago"**
- ✅ La orden pasa a estado **"Finalizada"**

---

## 🧪 **PRUEBA COMPLETA PASO A PASO:**

### **1. Mesero Crea Orden:**
```
Usuario: mesero1/mesero123
→ Click "+ Nueva Orden"
→ Mesa: 5
→ Agregar: Pepian (Cocina) x2
→ Agregar: Limonada (Bebidas) x2
→ Agregar: Capuchino (Coffee) x1
→ Click "Enviar a Cocina"
✅ Orden #00001 en estado "En Preparación"
```

### **2. Cocina Prepara (3 usuarios diferentes):**

**A. Usuario: `cocina1/cocina123`**
```
→ Ver orden #00001 con "Pepian (x2)"
→ Click "✓ Terminar"
✅ Platillo marcado como "Preparado"
✅ Desaparece de la vista de Cocina
```

**B. Usuario: `bebidas1/bebidas123`**
```
→ Ver orden #00001 con "Limonada (x2)"
→ Click "✓ Terminar"
✅ Platillo marcado como "Preparado"
✅ Desaparece de la vista de Bebidas
```

**C. Usuario: `coffee1/coffee123`**
```
→ Ver orden #00001 con "Capuchino (x1)"
→ Click "✓ Terminar"
✅ Platillo marcado como "Preparado"
✅ Desaparece de la vista de Coffee
✅✅ Orden pasa automáticamente a "Preparada" (TODOS listos)
```

### **3. Mesero Cierra Cuenta:**
```
Usuario: mesero1/mesero123
→ Ir a "Comandas" (comanda-control.html)
→ Ver orden #00001 con badge verde "Preparada"
→ 🔍 BUSCAR el botón "💰 Cerrar Cuenta" (debe estar visible)
→ Click "💰 Cerrar Cuenta"
→ Confirmar "OK"
✅ Orden pasa a "En Caja"
✅ Notificación: "Cuenta cerrada. La orden se envió a caja."
```

### **4. Cajero Cobra:**
```
Usuario: cajero1/cajero123
→ Ver orden #00001 en "Órdenes Pendientes"
→ Click "💳 Cobrar"
→ Método de pago: Efectivo
→ Monto recibido: Q 150.00
→ Cambio: Q 50.00 (calculado automáticamente)
→ Click "✓ Finalizar Pago"
✅ Orden pasa a "Finalizada"
✅ Ver en "Historial del Día"
```

---

## 🖥️ **VISTA DEL BOTÓN EN `comanda-control.html`:**

### **Cuando la orden está "Pendiente" o "En Preparación":**
```html
[+ Nueva Orden]  [Agregar platillos a esta orden]  [💰 Cerrar Cuenta] ← OCULTO
```

### **Cuando la orden está "Preparada":**
```html
[+ Nueva Orden]  [Agregar platillos a esta orden] ← OCULTO  [💰 Cerrar Cuenta]
```

### **Cuando la orden está "En Caja" o "Finalizada":**
```html
[+ Nueva Orden]  [Agregar platillos a esta orden] ← OCULTO  [💰 Cerrar Cuenta] ← OCULTO
```

---

## 💻 **CÓDIGO IMPLEMENTADO:**

### **`comanda-control.html` (línea 52):**
```html
<button type="button" class="btn btn-primary" id="btn-cerrar-cuenta" style="display: none;">
  💰 Cerrar Cuenta
</button>
```

### **`comanda-control.js` (líneas 201-218):**
```javascript
// Configurar botones según el estado
if (btnEditarOrden && btnCerrarCuenta) {
  if (estado === 'Preparada') {
    // Orden preparada: ocultar editar, mostrar cerrar cuenta
    btnEditarOrden.style.display = 'none';
    btnCerrarCuenta.style.display = 'inline-block';
    btnCerrarCuenta.onclick = () => handleCerrarCuenta(orderId);
  } else if (estado === 'Pendiente' || estado === 'En Preparación') {
    // Orden editable: mostrar editar, ocultar cerrar cuenta
    btnEditarOrden.style.display = 'inline-block';
    btnEditarOrden.href = `/templates/mesero/mesero_comanda.html?edit=${orderId}`;
    btnCerrarCuenta.style.display = 'none';
  } else {
    // Otros estados: ocultar ambos
    btnEditarOrden.style.display = 'none';
    btnCerrarCuenta.style.display = 'none';
  }
}
```

### **`comanda-control.js` (líneas 221-246):**
```javascript
// Cerrar cuenta (enviar orden a caja)
async function handleCerrarCuenta(orderId) {
  const confirmed = confirm('¿El cliente pidió la cuenta? Esto enviará la orden a caja para su cobro.');
  
  if (!confirmed) return;

  try {
    console.log(`💰 Cerrando cuenta de orden ${orderId}`);
    await API.orders.close(orderId);  // 👈 Llama al endpoint /api/orders/:id/close
    
    showNotification('Cuenta cerrada. La orden se envió a caja.', 'success');
    
    // Recargar órdenes
    await loadOrders();
    
    // Mostrar la siguiente orden o la primera
    if (currentIndex >= orders.length) {
      currentIndex = Math.max(0, orders.length - 1);
    }
    if (orders.length > 0) {
      displayOrder(currentIndex);
    }
  } catch (error) {
    handleError(error, 'Error al cerrar la cuenta');
  }
}
```

### **Backend: `orders.controller.js` (endpoint `/api/orders/:id/close`):**
```javascript
export const closeOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar que la orden existe y está en estado "Preparada"
  const orden = await prisma.cuenta.findUnique({
    where: { id_orden: parseInt(id) },
    include: { comandas: { include: { platillo: true } } }
  });

  if (!orden) {
    throw new AppError('Orden no encontrada', 404);
  }

  if (orden.estado !== 'Preparada') {
    throw new AppError('Solo se pueden cerrar órdenes en estado "Preparada"', 400);
  }

  // Calcular total de la orden
  const total = orden.comandas.reduce((sum, comanda) => {
    const subtotal = parseFloat(comanda.precio_unitario) * comanda.cantidad;
    const extra = parseFloat(comanda.extra_precio || 0);
    return sum + subtotal + extra;
  }, 0);

  // Actualizar estado a "En Caja" y guardar total
  const ordenActualizada = await prisma.cuenta.update({
    where: { id_orden: parseInt(id) },
    data: { 
      estado: 'En Caja',
      total: total
    }
  });

  res.json({
    success: true,
    message: 'Orden cerrada y enviada a caja',
    data: { orden: ordenActualizada }
  });
});
```

---

## ✅ **VERIFICACIÓN:**

Si el botón **NO aparece**, verifica:

1. **La orden está realmente en estado "Preparada":**
   - Abre la consola del navegador (F12)
   - Busca: `📍 Estado: Preparada`
   - Si no dice "Preparada", es porque aún faltan platillos por terminar en KDS

2. **Los platillos están marcados como "Preparado" en la base de datos:**
   ```sql
   SELECT * FROM area_registro WHERE id_orden = 1;
   -- Todos deben tener estado = 'Preparado'
   ```

3. **El JavaScript se cargó correctamente:**
   - Abre consola del navegador
   - Busca errores en rojo
   - Verifica que `comanda-control.js` esté cargado

---

## 🎯 **RESUMEN:**

✅ **El botón "💰 Cerrar Cuenta" YA ESTÁ IMPLEMENTADO**  
✅ Aparece automáticamente cuando la orden está "Preparada"  
✅ Llama a `API.orders.close(orderId)` → `/api/orders/:id/close`  
✅ Cambia el estado de "Preparada" → "En Caja"  
✅ La orden aparece en la vista del cajero  

**¡Solo necesitas probar el flujo completo! 🚀**

