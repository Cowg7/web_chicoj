# 🧪 PRUEBA COMPLETA - PLATILLOS BLOQUEADOS

## ✅ **BACKEND ACTUALIZADO**

Los cambios ya están en el backend:
- ✅ Incluye `area_registro` en cada comanda
- ✅ Calcula estados: `en_kds`, `estado_kds`, `bloqueado`, `puede_editar`
- ✅ Frontend procesa estos estados

---

## 🔄 **RECARGA TODO:**

```
Ctrl + Shift + F5
```

---

## 🧪 **PRUEBA PASO A PASO:**

### **PASO 1: Crear Orden Nueva**

1. Ve a: `/templates/mesero/mesero_comanda`
2. Crea una orden:
   ```
   Mesa: 10
   Platillos:
   - Coffee → Postres → Capuccino (cantidad: 1)
   - Cocina → Desayunos → Desayuno Chapin (cantidad: 2)
   ```
3. Click en "Guardar Orden"
4. Anota el número de orden (ej: #00030)

---

### **PASO 2: Enviar a Cocina**

1. Ve a: `/templates/mesero/comanda-control`
2. Busca la orden de Mesa 10
3. Click en "📤 Enviar a Cocina"
4. Confirma

**Estado cambia a:** "En Preparación"

---

### **PASO 3: Marcar como Terminado en KDS**

**Para Coffee (Capuccino):**
1. Ve a: `/templates/cocina/cocina?area=Coffee`
2. Deberías ver el ticket de Mesa 10 con Capuccino
3. Click en "✓ Terminar"
4. El ticket desaparece

**Para Cocina (Desayuno):**
1. Ve a: `/templates/cocina/cocina?area=Cocina`
2. Deberías ver el ticket de Mesa 10 con Desayuno Chapin
3. Click en "✓ Terminar"
4. El ticket desaparece

**Estado de la orden cambia a:** "Preparada"

---

### **PASO 4: Volver a Editar la Orden**

1. Ve a: `/templates/mesero/comanda-control`
2. Busca la orden de Mesa 10
3. Deberías ver el botón: **"+ Agregar Platillos"**
4. Click en ese botón
5. **ABRE LA CONSOLA (F12)** ANTES de hacer click

---

### **PASO 5: VERIFICAR LOS LOGS:**

Busca en la consola:

```
[KDS] Item "Capuccino": {
  en_kds: true,           ← Debe ser true
  estado_kds: "Preparado", ← Debe ser "Preparado"
  bloqueado: true,         ← Debe ser true
  puede_editar: false      ← Debe ser false
}

[KDS] Item "DESAYUNO CHAPIN": {
  en_kds: true,
  estado_kds: "Preparado",
  bloqueado: true,
  puede_editar: false
}
```

---

### **PASO 6: VERIFICAR LA TABLA:**

Deberías ver:

```
┌────────────────────────────────────────────────────────────┐
│ Cant │ Platillo                │ ... │ Acciones            │
├────────────────────────────────────────────────────────────┤
│  1   │ Capuccino ✓ Confirmado  │ ... │ [🔒 Confirmado]     │ ← Verde
│  2   │ Desayuno ✓ Confirmado   │ ... │ [🔒 Confirmado]     │ ← Verde
└────────────────────────────────────────────────────────────┘
```

**Características:**
- ✅ Fondo verde claro en las filas
- ✅ Badge "✓ Confirmado" (verde) junto al nombre
- ✅ Botón "🔒 Confirmado" (gris, deshabilitado)
- ✅ NO hay botones "Editar" ni "Eliminar"

---

### **PASO 7: INTENTAR EDITAR (Debug)**

Si por alguna razón los botones "Editar" y "Eliminar" aparecen:

1. Click en "Editar"

**Resultado esperado:**
```
🔔 Toast amarillo:
"No se puede editar Capuccino porque ya fue confirmado en cocina"
```

---

### **PASO 8: AGREGAR NUEVO PLATILLO**

1. En la misma vista de edición
2. Selecciona: Bebidas → Licuados → Licuado de Fresa
3. Cantidad: 1
4. Click "Agregar"

**Resultado esperado:**
```
TABLA ACTUALIZADA:
┌────────────────────────────────────────────────────────────┐
│  1   │ Capuccino ✓ Confirmado  │ ... │ [🔒 Confirmado]     │ ← Bloqueado
│  2   │ Desayuno ✓ Confirmado   │ ... │ [🔒 Confirmado]     │ ← Bloqueado
│  1   │ Licuado Fresa           │ ... │ [Editar][Eliminar]  │ ← Editable
└────────────────────────────────────────────────────────────┘
```

---

### **PASO 9: EDITAR EL NUEVO**

1. Click en "Editar" del Licuado Fresa
2. Cambia cantidad a 2
3. Click "Agregar"

**Resultado esperado:**
```
✅ Se actualiza correctamente
✅ Los confirmados siguen bloqueados
```

---

## 🐛 **SI LOS ESTADOS SIGUEN EN FALSE:**

Si ves en los logs:
```
[KDS] Item "Capuccino": {
  en_kds: false,      ← Sigue en false
  estado_kds: null,   ← Sigue en null
  bloqueado: false
}
```

**Significa que:** El backend NO está encontrando el `area_registro`.

**Para verificar en la base de datos:**

```sql
-- Ejecuta esto en PostgreSQL:
SELECT 
  c.id_comanda,
  c.platillo_nombre,
  ar.estado,
  ar.fecha_terminado
FROM comanda c
LEFT JOIN area_registro ar ON ar.id_comanda = c.id_comanda
WHERE c.id_orden = 15;  -- Cambia 15 por tu ID de orden
```

**Resultado esperado:**
```
id_comanda | platillo_nombre | estado    | fecha_terminado
-----------+-----------------+-----------+-----------------
    45     | Capuccino       | Preparado | 2025-11-07...
    46     | Desayuno...     | Preparado | 2025-11-07...
```

Si el `estado` es `null`, significa que el platillo NO fue marcado como terminado en KDS.

---

## 📊 **CHECKLIST DE VERIFICACIÓN:**

```
☐ Backend reconstruido (docker-compose build backend)
☐ Backend reiniciado (docker-compose restart backend)
☐ Frontend recargado (Ctrl + Shift + F5)
☐ Orden enviada a cocina
☐ Platillos marcados como terminados en KDS
☐ Volver a editar la orden
☐ Verificar logs [KDS]
☐ Verificar badges en tabla
☐ Verificar botones bloqueados
```

---

## 🎯 **ENVÍAME:**

Por favor ejecuta las pruebas y envíame:

1. **Los logs de [KDS]** que aparecen en consola
2. **Una captura** de cómo se ven los platillos en la tabla
3. **Si los botones** "Editar" y "Eliminar" aparecen o no

Con eso sabré exactamente qué está pasando. 🔍



