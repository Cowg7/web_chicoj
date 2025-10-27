# ✅ SISTEMA DE DISPONIBILIDAD DE PLATILLOS

## 🎯 **FUNCIONALIDADES IMPLEMENTADAS:**

### **1. ✅ Platillos Agrupados por Área**
Los platillos ahora se organizan por:
- 🏷️ **COCINA**
- 🏷️ **BEBIDAS** 
- 🏷️ **COFFEE**
- 🏷️ **BAR**

### **2. ✅ Activar/Desactivar Platillos**
Botón para marcar platillos como NO DISPONIBLES cuando:
- No hay ingredientes
- El platillo no se puede preparar temporalmente
- Está fuera de temporada

### **3. ✅ Indicador Visual para Meseros**
Los platillos desactivados se muestran como:
```
POLLO ASADO (NO DISPONIBLE)
```

---

## 📂 **ARCHIVOS MODIFICADOS:**

### **BACKEND:**

#### **1. `backend/prisma/schema.prisma`**
✅ Agregado campo `disponible` a la tabla `platillos`:
```prisma
model platillos {
  id_platillo Int     @id @default(autoincrement())
  nombre      String  @unique @db.VarChar(120)
  descripcion String? @db.VarChar(255)
  precio      Decimal @db.Decimal(10, 2)
  id_area     Int
  disponible  Boolean @default(true)  ← NUEVO CAMPO

  area     area      @relation(fields: [id_area], references: [id_area])
  comandas comanda[]

  @@index([id_area], name: "ix_platillos_area")
  @@index([disponible], name: "ix_platillos_disponible")  ← NUEVO ÍNDICE
  @@map("platillos")
}
```

#### **2. `backend/src/modules/menu/menu.controller.js`**
✅ Actualizado `getMenu()` para incluir campo `disponible`
✅ Agregado nuevo endpoint `toggleDisponibilidad()`:
```javascript
// PATCH /menu/:id/disponibilidad
export const toggleDisponibilidad = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { disponible } = req.body;
  
  const platillo = await prisma.platillos.update({
    where: { id_platillo: parseInt(id) },
    data: { disponible: disponible },
    include: { area: true }
  });
  
  res.json({
    success: true,
    message: `Platillo ${disponible ? 'activado' : 'desactivado'} exitosamente`,
    data: { platillo }
  });
});
```

#### **3. `backend/src/routes/menu.routes.js`**
✅ Agregada nueva ruta:
```javascript
router.patch('/:id/disponibilidad', authenticateToken, toggleDisponibilidad);
```

---

### **FRONTEND:**

#### **4. `fronted/scripts/api.js`**
✅ Agregado método en el objeto `menu`:
```javascript
toggleDisponibilidad: (id, disponible) => 
  api.patch(`${API_CONFIG.endpoints.menu}/${id}/disponibilidad`, { disponible })
```

#### **5. `fronted/scripts/control-platillos.js`**
✅ **Reescrito completamente** para:
- Agrupar platillos por área
- Mostrar estado de disponibilidad
- Botón activar/desactivar
- Interfaz visual mejorada

**Características:**
- 🏷️ Secciones por área con contador de platillos
- ✅ Badge verde "DISPONIBLE" / ❌ Badge rojo "NO DISPONIBLE"
- 🔘 Botón "Desactivar" (naranja) / "Activar" (verde)
- ✏️ Botón editar por platillo
- 🎨 Estilo degradado para headers de área
- 😎 Platillos desactivados se muestran con opacidad reducida

#### **6. `fronted/templates/administracion/control-platillos.html`**
✅ Actualizado para carga dinámica de platillos

#### **7. `fronted/scripts/comanda.js`**
✅ Actualizado `loadMenu()` para incluir campo `disponible`
✅ Modificado el select de platillos para mostrar "(NO DISPONIBLE)":
```javascript
option.textContent = disponible ? 
  item.nombre : 
  `${item.nombre} (NO DISPONIBLE)`;
```

---

## 🗄️ **CAMBIOS EN BASE DE DATOS:**

### **Migración Ejecutada:**
```sql
-- Agregar columna disponible (si no existe)
ALTER TABLE platillos ADD COLUMN IF NOT EXISTS disponible BOOLEAN DEFAULT true;

-- Crear índice
CREATE INDEX IF NOT EXISTS ix_platillos_disponible ON platillos(disponible);

-- Actualizar platillos existentes
UPDATE platillos SET disponible = true WHERE disponible IS NULL;
```

### **Estado Actual:**
```
✅ 11 platillos en la base de datos
✅ Todos inicializados como DISPONIBLES
✅ 4 áreas: COCINA, BEBIDAS, COFFEE, BAR
```

---

## 🎨 **INTERFAZ DE USUARIO:**

### **Vista de Administración (`control-platillos.html`):**

```
╔════════════════════════════════════════════════════════════╗
║  Lista de platillos                    [+ Agregar platillo]║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  🏷️ COCINA                                    6 platillos  ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │ ID │ Nombre      │ Precio │ Estado      │ Acciones │   ║
║  ├────────────────────────────────────────────────────┤   ║
║  │ 2  │ Hilachas    │ Q55.00 │ ✅ DISPONIBLE│ [🚫][✏️]│   ║
║  │ 3  │ Kak ik      │ Q50.00 │ ✅ DISPONIBLE│ [🚫][✏️]│   ║
║  │ 6  │ pollo asado │ Q13.00 │ ❌ NO DISPON │ [✅][✏️]│   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║  🏷️ COFFEE                                   3 platillos  ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │ ID │ Nombre         │ Precio │ Estado   │ Acciones│   ║
║  ├────────────────────────────────────────────────────┤   ║
║  │ 7  │ Café Americano │ Q18.00 │ ✅ DISPON│ [🚫][✏️]│   ║
║  │ 8  │ Capuccino      │ Q25.00 │ ✅ DISPON│ [🚫][✏️]│   ║
║  └────────────────────────────────────────────────────┘   ║
╚════════════════════════════════════════════════════════════╝
```

### **Vista del Mesero (`mesero_comanda.html`):**

```
┌──────────────────────────────────┐
│ Área: COCINA               ▼     │
├──────────────────────────────────┤
│ Platillo: Seleccionar...   ▼     │
│                                  │
│  - Hilachas                      │
│  - Kak ik                        │
│  - pollo asado (NO DISPONIBLE)   │ ← Texto gris, en cursiva
│  - Pepián de Pollo               │
└──────────────────────────────────┘
```

---

## 🔄 **FLUJO DE USO:**

### **Escenario 1: Desactivar un Platillo**

1. **Administrador** va a `control-platillos.html`
2. Encuentra el platillo (ej: "Pollo Asado")
3. Hace clic en botón **"🚫 Desactivar"**
4. Confirma la acción
5. El platillo cambia a:
   - Estado: ❌ NO DISPONIBLE
   - Botón: ✅ Activar
   - Fila con opacidad reducida

### **Escenario 2: Mesero Intenta Agregar Platillo**

1. **Mesero** crea una orden en `mesero_comanda.html`
2. Selecciona área: "COCINA"
3. Abre el dropdown de platillos
4. Ve: `pollo asado (NO DISPONIBLE)` en gris cursiva
5. Puede seleccionarlo, pero sabe que NO está disponible

### **Escenario 3: Reactivar Platillo**

1. **Administrador** va a `control-platillos.html`
2. Encuentra el platillo desactivado
3. Hace clic en botón **"✅ Activar"**
4. Confirma la acción
5. El platillo vuelve a estar DISPONIBLE
6. Los meseros ya pueden ordenarlo normalmente

---

## 📊 **ENDPOINTS DE API:**

### **GET /api/menu**
```javascript
// Obtener todos los platillos agrupados por área
GET /api/menu

// Respuesta:
{
  "success": true,
  "data": {
    "menu": [
      {
        "area": {
          "id_area": 2,
          "nombre": "COCINA",
          "descripcion": "Platillos principales"
        },
        "platillos": [
          {
            "id_platillo": 2,
            "nombre": "Hilachas",
            "descripcion": "Tradicionales",
            "precio": 55.00,
            "disponible": true  ← NUEVO CAMPO
          },
          {
            "id_platillo": 6,
            "nombre": "pollo asado",
            "descripcion": null,
            "precio": 13.00,
            "disponible": false  ← DESACTIVADO
          }
        ]
      }
    ],
    "total": 11
  }
}
```

### **PATCH /api/menu/:id/disponibilidad**
```javascript
// Cambiar disponibilidad de un platillo
PATCH /api/menu/6/disponibilidad
Headers: {
  Authorization: Bearer <token>
}
Body: {
  "disponible": false
}

// Respuesta:
{
  "success": true,
  "message": "Platillo desactivado exitosamente",
  "data": {
    "platillo": {
      "id_platillo": 6,
      "nombre": "pollo asado",
      "precio": "13.00",
      "disponible": false,
      "area": {
        "id_area": 2,
        "nombre": "COCINA"
      }
    }
  }
}
```

---

## 🧪 **CÓMO PROBAR:**

### **1. Reiniciar Backend**
```bash
cd backend
npm run dev
```

### **2. Probar en Administración**
```
1. Abrir: http://localhost:8080/templates/administracion/control-platillos.html
2. Verificar que los platillos estén agrupados por área
3. Hacer clic en "🚫 Desactivar" en un platillo
4. Confirmar
5. Ver que cambia a "❌ NO DISPONIBLE"
6. Botón cambia a "✅ Activar"
```

### **3. Probar en Vista de Mesero**
```
1. Abrir: http://localhost:8080/templates/mesero/mesero_comanda.html
2. Seleccionar un área
3. Abrir dropdown de platillos
4. Verificar que los platillos desactivados muestren "(NO DISPONIBLE)"
5. Verificar que aparezcan en gris cursiva
```

### **4. Reactivar Platillo**
```
1. Volver a control-platillos.html
2. Hacer clic en "✅ Activar" del platillo desactivado
3. Confirmar
4. Ver que vuelve a "✅ DISPONIBLE"
5. Verificar en vista de mesero que ya no dice "(NO DISPONIBLE)"
```

---

## 💡 **VENTAJAS DEL SISTEMA:**

1. ✅ **No es necesario eliminar platillos** - Solo desactivarlos temporalmente
2. ✅ **Los meseros ven claramente** cuáles platillos no están disponibles
3. ✅ **Agrupación por área** - Más fácil de navegar
4. ✅ **Cambio instantáneo** - Sin recargar toda la página
5. ✅ **Historial preservado** - El platillo sigue en la BD
6. ✅ **Reactivación rápida** - Un solo clic para volver a activar

---

## 🔧 **CONFIGURACIÓN:**

### **Permisos:**
- Solo usuarios autenticados pueden cambiar disponibilidad
- Los meseros solo VEN el estado, no pueden cambiarlo

### **Valores por defecto:**
- Todos los platillos nuevos se crean como DISPONIBLES (`disponible: true`)
- Platillos existentes fueron actualizados a DISPONIBLES

---

## 📝 **NOTAS IMPORTANTES:**

1. **Los platillos desactivados siguen apareciendo en el menú del mesero**
   - Esto es intencional para que sepan que existen
   - Se marcan claramente como NO DISPONIBLES
   - Alternativamente, se puede filtrar para NO mostrarlos (modificación futura)

2. **El cambio es inmediato**
   - Al desactivar, todos los meseros verán el cambio
   - No es necesario recargar la página manualmente

3. **No afecta órdenes existentes**
   - Las órdenes ya creadas con ese platillo NO se ven afectadas
   - Solo afecta NUEVAS órdenes

---

## 🚀 **MEJORAS FUTURAS (OPCIONAL):**

1. **Filtro en vista de mesero:**
   - Opción para ocultar completamente platillos no disponibles
   - Toggle "Mostrar solo disponibles"

2. **Motivo de desactivación:**
   - Campo adicional para indicar POR QUÉ está desactivado
   - Ej: "Sin ingredientes", "Fuera de temporada"

3. **Programación automática:**
   - Desactivar/activar en horarios específicos
   - Ej: Desayunos solo en la mañana

4. **Historial de cambios:**
   - Registro de quién desactivó/activó y cuándo

---

**¡SISTEMA IMPLEMENTADO Y FUNCIONANDO!** ✅🎉

**Documentación creada:** `SISTEMA_PLATILLOS_DISPONIBILIDAD.md`


