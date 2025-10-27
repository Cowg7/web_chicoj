# ✅ BOTÓN "AGREGAR PLATILLOS" CONDICIONAL

## 📋 Lógica Implementada

El botón **"Agregar platillos a esta orden"** ahora aparece **SOLO** cuando la orden ya tiene platillos agregados.

### Reglas:

1. **Orden SIN platillos** (Nueva orden) → ❌ NO mostrar botón
2. **Orden CON platillos** → ✅ SÍ mostrar botón
3. **Estado debe ser "Pendiente"** → ✅ Solo en órdenes pendientes

---

## 🔧 Implementación

### 1. HTML
**Archivo**: `fronted/templates/mesero/comanda-control.html`

El botón se agregó con `display: none` por defecto:

```html
<div class="visor-acciones">
  <a href="/templates/mesero/mesero_comanda.html" class="btn btn-success" id="btn-nueva-orden">+ Nueva Orden</a>
  <a href="/templates/mesero/mesero_comanda.html" class="btn btn-outline" id="btn-agregar-platillos" style="display: none;">Agregar platillos a esta orden</a>
  <button type="button" class="btn btn-warning" id="btn-enviar-cocina" style="display: none;">🍳 Enviar a Cocina</button>
  <button type="button" class="btn btn-danger" id="btn-eliminar-orden" style="display: none;">🗑️ Eliminar Orden</button>
  <button type="button" class="btn btn-primary" id="btn-cerrar-cuenta" style="display: none;">💰 Cerrar Cuenta</button>
</div>
```

### 2. JavaScript
**Archivo**: `fronted/scripts/comanda-control.js`

**Variable agregada (línea 16):**
```javascript
const btnAgregarPlatillos = $('btn-agregar-platillos');
```

**Lógica condicional (líneas 370-382):**
```javascript
// Actualizar tabla
displayOrderItems(orderDetails);

// Obtener comandas para verificar si hay platillos
const comandas = orderDetails.comandas || orderDetails.items || [];
const tienePlatillos = comandas.length > 0;

// Mostrar/ocultar botón "Agregar platillos" según si ya tiene platillos
if (btnAgregarPlatillos) {
  if (tienePlatillos && estado === 'Pendiente') {
    btnAgregarPlatillos.style.display = 'inline-block';
    btnAgregarPlatillos.href = `/templates/mesero/mesero_comanda.html?edit=${orderId}`;
  } else {
    btnAgregarPlatillos.style.display = 'none';
  }
}
```

---

## 🎯 Comportamiento Visual

### Escenario 1: Orden SIN platillos (Nueva orden)
```
┌────────────────────────────────────────┐
│     Comandas por orden                 │
├────────────────────────────────────────┤
│  [+ Nueva Orden]  ← Solo este botón    │
│                                        │
│  Tabla:                                │
│  ┌──────────────────────────────────┐  │
│  │      Nueva orden                 │  │
│  │      (texto en gris)             │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### Escenario 2: Orden CON platillos (Estado Pendiente)
```
┌────────────────────────────────────────┐
│     Comandas por orden                 │
├────────────────────────────────────────┤
│  [+ Nueva Orden]                       │
│  [Agregar platillos a esta orden] ←✓   │
│  [🍳 Enviar a Cocina]                  │
│  [🗑️ Eliminar Orden]                   │
│                                        │
│  Tabla:                                │
│  ┌──────────────────────────────────┐  │
│  │ Cant │ Platillo │ Precio │ Total │  │
│  ├──────┼──────────┼────────┼───────┤  │
│  │  2   │ Pollo    │ Q25.00 │Q50.00│  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### Escenario 3: Orden CON platillos (Estado "En Preparación")
```
┌────────────────────────────────────────┐
│     Comandas por orden                 │
├────────────────────────────────────────┤
│  [+ Nueva Orden]                       │
│  [🗑️ Eliminar Orden]                   │
│                                        │
│  ❌ NO aparece "Agregar platillos"     │
│  (porque ya está en cocina)           │
└────────────────────────────────────────┘
```

---

## 📊 Matriz de Visibilidad del Botón

| Estado de Orden | Tiene Platillos | Botón Visible |
|----------------|----------------|---------------|
| Pendiente      | ❌ No          | ❌ NO         |
| Pendiente      | ✅ Sí          | ✅ SÍ         |
| En Preparación | ✅ Sí          | ❌ NO         |
| Preparada      | ✅ Sí          | ❌ NO         |
| Finalizada     | ✅ Sí          | ❌ NO         |

---

## 🧪 Pruebas

### 1. Recarga la vista
```
http://localhost:8080/templates/mesero/comanda-control.html
```
**Ctrl + Shift + R**

### 2. Prueba: Orden vacía
1. Si aparece "Nueva orden" (sin platillos)
2. ✅ NO debe aparecer "Agregar platillos a esta orden"
3. ✅ Solo debe aparecer "+ Nueva Orden"

### 3. Prueba: Orden con platillos
1. Navega a una orden que tenga platillos
2. ✅ DEBE aparecer "Agregar platillos a esta orden"
3. ✅ También aparecen "Enviar a Cocina" y "Eliminar Orden"

### 4. Prueba: Orden en cocina
1. Navega a una orden con estado "En Preparación"
2. ✅ NO debe aparecer "Agregar platillos a esta orden"
3. ✅ Solo aparece "Eliminar Orden"

---

## 📦 Archivos Modificados

1. **fronted/templates/mesero/comanda-control.html**
   - Botón agregado con `display: none`
   - Cache-busting: `?v=20251025d`

2. **fronted/scripts/comanda-control.js**
   - Variable `btnAgregarPlatillos` agregada
   - Lógica condicional implementada
   - Verifica: `tienePlatillos && estado === 'Pendiente'`

---

## ✅ Ventajas

- ✅ Interfaz intuitiva y limpia
- ✅ Solo muestra opciones relevantes
- ✅ Previene confusión en órdenes vacías
- ✅ Facilita agregar más platillos a órdenes existentes
- ✅ Respeta el flujo de estados

---

¿Ahora sí funciona como esperabas? 🎯


