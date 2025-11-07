# 🔍 Diagnóstico Rápido del Sistema

## 📝 **Scripts para la Consola del Navegador (F12)**

### **1. Ver Estado de una Orden:**
```javascript
// Reemplaza "1" con el ID de la orden que quieres verificar
fetch('http://localhost:3000/api/orders/1', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('📦 Orden:', data.data.order);
  console.log('📊 Estado:', data.data.order.estado);
  console.log('🍽️ Items:', data.data.order.comandas);
});
```

### **2. Ver Órdenes Preparadas:**
```javascript
fetch('http://localhost:3000/api/orders/ready', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.table(data.data.orders.map(o => ({
    id: o.id_orden,
    mesa: o.no_mesa,
    estado: o.estado,
    total: o.total
  })));
});
```

### **3. Limpiar localStorage (para Coffee Shop):**
```javascript
// Limpiar localStorage y recargar
localStorage.removeItem('kds_area');
console.log('✅ localStorage limpiado');
location.reload();
```

### **4. Ver Estado de area_registro (KDS):**
```javascript
// Ver si los platillos están marcados como "Preparado"
fetch('http://localhost:3000/api/kds/Cocina', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('📦 Tickets de Cocina:', data.data.tickets);
  console.log('Total pendientes:', data.data.total);
});
```

### **5. Cerrar Cuenta Manualmente (si el botón no funciona):**
```javascript
// Reemplaza "1" con el ID de la orden
const orderId = 1;

fetch(`http://localhost:3000/api/orders/${orderId}/close`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Orden cerrada:', data);
  alert('Cuenta cerrada exitosamente');
  location.reload();
})
.catch(err => console.error('❌ Error:', err));
```

---

## 🧪 **Verificación del Botón "Cerrar Cuenta":**

### **Paso 1: Ver el Estado Actual**
```javascript
// En comanda-control.html, abre la consola y ejecuta:
const btnCerrarCuenta = document.getElementById('btn-cerrar-cuenta');
console.log('Botón encontrado:', !!btnCerrarCuenta);
console.log('Display:', btnCerrarCuenta?.style.display);
console.log('OnClick:', typeof btnCerrarCuenta?.onclick);
```

### **Paso 2: Forzar Mostrar el Botón (para pruebas)**
```javascript
const btnCerrarCuenta = document.getElementById('btn-cerrar-cuenta');
if (btnCerrarCuenta) {
  btnCerrarCuenta.style.display = 'inline-block';
  console.log('✅ Botón mostrado');
} else {
  console.error('❌ Botón no encontrado');
}
```

### **Paso 3: Ver los Estados de las Órdenes Cargadas**
```javascript
// En comanda-control.html, ver qué órdenes hay
console.log('Órdenes cargadas:', window.orders);
```

---

## 🔧 **Solución Rápida para Coffee Shop:**

Si ves el error `404 /api/kds/coffe_shop`:

```javascript
// Método 1: Limpiar y recargar
localStorage.clear();
location.href = '/templates/cocina/cocina.html?area=Coffee';

// Método 2: Solo limpiar kds_area
localStorage.removeItem('kds_area');
location.reload();

// Método 3: Establecer el área correcta
localStorage.setItem('kds_area', 'Coffee');
location.reload();
```

---

## 📊 **Ver Todas las Órdenes del Sistema:**

```javascript
fetch('http://localhost:3000/api/orders', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.table(data.data.orders.map(o => ({
    'ID': o.id_orden,
    'Mesa': o.no_mesa,
    'Estado': o.estado,
    'Fecha': new Date(o.fecha).toLocaleString(),
    'Total': 'Q ' + (o.total || 0)
  })));
});
```

---

## 🎯 **Verificación Completa del Flujo:**

### **1. Estado de Órdenes en BD:**
```javascript
// Ejecutar en Prisma Studio o consola de Node.js
// npx prisma studio
// O en backend/prisma/seed.js:

await prisma.cuenta.findMany({
  include: {
    comandas: true,
    area_registro: true
  }
});
```

### **2. Ver Comprobantes de Caja:**
```javascript
fetch('http://localhost:3000/api/cashier/history', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('💰 Historial de Caja:', data.data.orders);
});
```

### **3. Ver Reportes:**
```javascript
fetch('http://localhost:3000/api/reports/sales', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('📊 Ventas Totales:', data.data);
});
```

---

## ⚠️ **Errores Comunes y Soluciones:**

### **Error 1: "Botón no aparece"**
**Causa:** La orden no está en estado "Preparada"  
**Solución:**
```javascript
// Verificar estado
fetch('http://localhost:3000/api/orders/1', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(r => r.json())
.then(data => {
  console.log('Estado actual:', data.data.order.estado);
  // Debe decir "Preparada"
});
```

### **Error 2: "404 /api/kds/coffe_shop"**
**Causa:** localStorage tiene valor antiguo  
**Solución:**
```javascript
localStorage.removeItem('kds_area');
location.reload();
```

### **Error 3: "Token expired"**
**Causa:** La sesión expiró  
**Solución:**
```javascript
localStorage.clear();
location.href = '/templates/login.html';
```

---

## 🚀 **Prueba Rápida del Sistema:**

```javascript
// Script completo para probar el flujo (ejecutar en consola)
async function probarSistema() {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };
  
  console.log('🧪 Iniciando prueba del sistema...');
  
  // 1. Ver órdenes
  const orders = await fetch('http://localhost:3000/api/orders', { headers }).then(r => r.json());
  console.log('📦 Órdenes:', orders.data.orders.length);
  
  // 2. Ver órdenes preparadas
  const ready = await fetch('http://localhost:3000/api/orders/ready', { headers }).then(r => r.json());
  console.log('🟢 Preparadas:', ready.data.orders.length);
  
  // 3. Ver órdenes en caja
  const pending = await fetch('http://localhost:3000/api/cashier/pending', { headers }).then(r => r.json());
  console.log('💰 En Caja:', pending.data.orders.length);
  
  // 4. Ver estadísticas
  const stats = await fetch('http://localhost:3000/api/cashier/stats', { headers }).then(r => r.json());
  console.log('📊 Ventas del día:', stats.data.total_ventas_hoy);
  
  console.log('✅ Prueba completada');
}

probarSistema();
```

---

**✅ Con estos scripts puedes diagnosticar cualquier problema del sistema desde la consola del navegador.**

