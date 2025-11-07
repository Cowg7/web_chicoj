# 🐛 DEBUG - PLATILLOS BLOQUEADOS

## 🔍 **VERIFICACIÓN PASO A PASO:**

### **PASO 1: Editar una orden con platillos confirmados**

1. Ve a: `/templates/mesero/comanda-control`
2. Selecciona una orden que tenga platillos marcados como terminados en KDS
3. Click en "+ Agregar Platillos" o "Editar Orden"
4. Abre la consola (F12)

---

### **PASO 2: Buscar estos logs en consola:**

Busca:
```
[KDS] Item "Nombre del platillo": {
  en_kds: true/false,
  estado_kds: "Preparado" o null,
  bloqueado: true/false,
  puede_editar: true/false
}
```

**Y también:**
```
[KDS] Resumen de estados:
  1. Nombre1: bloqueado=true, estado=Preparado
  2. Nombre2: bloqueado=false, estado=null
```

---

### **CASO A: Si los logs muestran `bloqueado=false` cuando DEBERÍAN ser `true`**

**Problema:** El backend NO está enviando los estados correctamente

**Solución:** Verificar que el backend se reinició y el código está correcto

---

### **CASO B: Si los logs muestran `bloqueado=true` correctamente**

**Problema:** El frontend recibe los estados pero los botones no se bloquean

**Solución:** Hay un error en la renderización de los botones

---

### **CASO C: Si NO aparecen los logs [KDS]**

**Problema:** La función no se está ejecutando

**Solución:** Verificar que `loadOrderForEdit` se llamó correctamente

---

## 📋 **POR FAVOR ENVÍAME ESTOS LOGS:**

Copia y pega los logs que dicen:

1. `[KDS] Item "...":`
2. `[KDS] Resumen de estados:`
3. `[NOTE] Items procesados:`

Esto me dirá si el backend está enviando los estados correctamente.

---

## 🧪 **PRUEBA RÁPIDA EN CONSOLA:**

Abre F12 y ejecuta:

```javascript
// Ver los items actuales
console.log('Items actuales:', currentOrder?.items);

// Ver si tienen estados de KDS
currentOrder?.items.forEach((item, i) => {
  console.log(`${i+1}. ${item.nombre}:`, {
    bloqueado: item.bloqueado,
    estado_kds: item.estado_kds,
    en_kds: item.en_kds
  });
});
```

---

## ✅ **VALORES ESPERADOS:**

Para un platillo YA confirmado en KDS:
```javascript
{
  bloqueado: true,           // ← DEBE ser true
  estado_kds: "Preparado",   // ← DEBE ser "Preparado"
  en_kds: true,              // ← DEBE ser true
  puede_editar: false        // ← DEBE ser false
}
```

Para un platillo NUEVO (no en KDS):
```javascript
{
  bloqueado: false,          // ← DEBE ser false
  estado_kds: null,          // ← DEBE ser null
  en_kds: false,             // ← DEBE ser false
  puede_editar: true         // ← DEBE ser true
}
```




