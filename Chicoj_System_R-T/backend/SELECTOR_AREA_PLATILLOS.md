# ✅ SELECTOR DE ÁREA PARA PLATILLOS

## 🎯 **FUNCIONALIDAD AGREGADA:**

Ahora al crear o editar un platillo, se puede **seleccionar el área** a la que pertenece:
- 🍳 **COCINA**
- ☕ **COFFEE**
- 🍹 **BEBIDAS**
- 🍺 **BAR**

---

## 🎨 **NUEVO FORMULARIO:**

```
╔══════════════════════════════════════════════════╗
║  Ingrese Datos de Platillo           [← Regresar]║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  ID:             [AUTO]                          ║
║                                                  ║
║  Nombre *:       [Pollo asado____________]       ║
║                                                  ║
║  Área *:         [Seleccionar área... ▼]         ║
║                   - COCINA                       ║
║                   - COFFEE                       ║
║                   - BEBIDAS                      ║
║                   - BAR                          ║
║                                                  ║
║  Precio *:       [25.00_________________]        ║
║                                                  ║
║  Descripción:    [____________________________]  ║
║                  [____________________________]  ║
║                  [____________________________]  ║
║                                                  ║
║              [      Agregar      ]               ║
╚══════════════════════════════════════════════════╝
```

---

## 📝 **CAMPOS DEL FORMULARIO:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| **ID** | Texto | No | Se genera automáticamente |
| **Nombre** | Texto | ✅ Sí | Nombre del platillo |
| **Área** | Dropdown | ✅ Sí | COCINA, COFFEE, BEBIDAS o BAR |
| **Precio** | Número | ✅ Sí | Precio en quetzales (Q) |
| **Descripción** | Textarea | No | Descripción opcional del platillo |

---

## 🧪 **CÓMO PROBAR:**

### **CREAR NUEVO PLATILLO:**

```
1. Ir a: http://localhost:8080/templates/administracion/control-platillos.html
2. Clic en "+ Agregar platillo"
3. Llenar formulario:
   - Nombre: "Enchiladas"
   - Área: Seleccionar "COCINA"
   - Precio: 45.00
   - Descripción: "Enchiladas guatemaltecas"
4. Clic en "Agregar"
5. Ver mensaje: "✅ Platillo creado exitosamente"
6. Redirige a control-platillos.html
7. Verificar que aparezca en la sección COCINA
```

---

### **EDITAR PLATILLO EXISTENTE:**

```
1. Ir a control-platillos.html
2. Buscar cualquier platillo
3. Clic en "✏️ Editar"
4. Ver que el área actual esté seleccionada
5. Cambiar el área si es necesario
6. Clic en "Actualizar"
7. Ver mensaje: "✅ Platillo actualizado exitosamente"
8. Verificar que aparezca en la nueva área
```

---

## 🔄 **FLUJO COMPLETO:**

### **Modo CREACIÓN:**

```
Administrador abre platillo.html
    ↓
Formulario vacío, ID = "AUTO"
    ↓
Sistema carga áreas disponibles
    ↓
Llena select con: COCINA, COFFEE, BEBIDAS, BAR
    ↓
Administrador llena campos:
  - Nombre
  - Área (selecciona del dropdown)
  - Precio
  - Descripción (opcional)
    ↓
Clic en "Agregar"
    ↓
✅ Platillo creado en el área seleccionada
    ↓
Redirige a control-platillos.html
```

### **Modo EDICIÓN:**

```
Administrador hace clic en "Editar"
    ↓
URL: platillo.html?id=6
    ↓
Sistema carga áreas disponibles
    ↓
Sistema carga datos del platillo
    ↓
Formulario se llena con datos existentes:
  - ID: 6
  - Nombre: "pollo asado"
  - Área: COCINA (preseleccionada)
  - Precio: 13.00
  - Descripción: ...
    ↓
Administrador modifica (ej: cambiar área a BEBIDAS)
    ↓
Clic en "Actualizar"
    ↓
✅ Platillo actualizado
    ↓
Aparece en la nueva área en control-platillos.html
```

---

## 📊 **VALIDACIONES:**

### **Campos Obligatorios:**

✅ **Nombre**: No puede estar vacío
```
Error: "Ingresa el nombre del platillo"
```

✅ **Área**: Debe seleccionar una opción
```
Error: "Selecciona el área del platillo"
```

✅ **Precio**: Debe ser mayor a 0
```
Error: "Ingresa un precio válido"
```

### **Campos Opcionales:**

- **Descripción**: Puede dejarse vacío

---

## 🎨 **MEJORAS VISUALES:**

### **1. Campos con IDs Únicos**
Antes:
```html
<input type="text" placeholder="Ejemplo: Pollo asado">
```

Ahora:
```html
<input id="platillo-nombre" type="text" placeholder="Ejemplo: Pollo asado" required>
```

### **2. Select de Área Dinámico**
Se carga desde el backend:
```javascript
// Llama a GET /api/menu/areas
const areas = await API.menu.getAreas();

// Llena el select:
- COCINA
- COFFEE
- BEBIDAS
- BAR
```

### **3. Textarea para Descripción**
Antes: Input de una línea
```html
<input type="text" placeholder="Breve descripción">
```

Ahora: Textarea multilínea
```html
<textarea id="platillo-descripcion" rows="3" placeholder="Breve descripción (opcional)"></textarea>
```

### **4. Indicadores de Campos Requeridos**
```html
<label for="platillo-nombre">Nombre <span style="color: red;">*</span></label>
```

### **5. Estilos Mejorados**
- Grid layout para alinear labels e inputs
- Focus con borde verde (#3a9b7a)
- Campos readonly con fondo gris
- Textarea redimensionable

---

## 🔧 **CAMBIOS TÉCNICOS:**

### **Archivos Modificados:**

#### **1. `fronted/templates/administracion/platillo.html`**

**Cambios:**
- ✅ Agregado `id="form-platillo"` al formulario
- ✅ Agregados IDs únicos a cada input:
  - `platillo-id`
  - `platillo-nombre`
  - `platillo-area` ← **NUEVO SELECT**
  - `platillo-precio`
  - `platillo-descripcion`
- ✅ Cambiado input de descripción a `<textarea>`
- ✅ Agregados atributos `required` en campos obligatorios
- ✅ Agregado `type="number"` con `step="0.01"` para precio
- ✅ Agregados estilos inline para mejor layout
- ✅ Cache-busting: `?v=20251025a`

#### **2. `fronted/scripts/platillos.js`**

**Cambios:**
- ✅ Función `loadAreas()` para cargar áreas del backend
- ✅ Llena el select dinámicamente
- ✅ Usa `id_area` en vez de hardcodear 'cocina'
- ✅ En modo edición, preselecciona el área actual
- ✅ Validación de área seleccionada
- ✅ Logs detallados para debugging
- ✅ Notificaciones visuales mejoradas

---

## 📦 **ESTRUCTURA DE DATOS:**

### **Al CREAR platillo:**

```javascript
POST /api/menu

Body:
{
  "nombre": "Enchiladas",
  "precio": 45.00,
  "descripcion": "Enchiladas guatemaltecas",
  "id_area": 2  // ← ID del área seleccionada
}

Response:
{
  "success": true,
  "message": "Platillo creado exitosamente",
  "data": {
    "platillo": {
      "id_platillo": 12,
      "nombre": "Enchiladas",
      "precio": "45.00",
      "descripcion": "Enchiladas guatemaltecas",
      "id_area": 2,
      "disponible": true,
      "area": {
        "id_area": 2,
        "nombre": "COCINA",
        "descripcion": "Platillos principales"
      }
    }
  }
}
```

### **Al EDITAR platillo:**

```javascript
PATCH /api/menu/6

Body:
{
  "nombre": "pollo asado especial",
  "precio": 15.00,
  "descripcion": "Con guarnición",
  "id_area": 2  // ← Puede cambiar de área
}

Response:
{
  "success": true,
  "message": "Platillo actualizado",
  "data": {
    "platillo": { ... }
  }
}
```

---

## 🆘 **SOLUCIÓN DE PROBLEMAS:**

### **Problema 1: Select de área está vacío**

```
Solución:
1. Abrir F12 → Console
2. Buscar: "Cargando áreas..."
3. Si hay error, verificar que el backend esté corriendo
4. Verificar endpoint: GET /api/menu/areas
```

### **Problema 2: No preselecciona el área al editar**

```
Solución:
1. Ver consola: "Seleccionando área ID: X"
2. Si el ID no coincide, verificar backend
3. Recargar con Ctrl + Shift + R
```

### **Problema 3: Error al guardar**

```
Error común: "Área 'cocina' no encontrada"
Causa: Backend esperaba id_area numérico
Solución: Ya está corregido, usa id_area en vez de nombre
```

---

## ✅ **CHECKLIST DE VERIFICACIÓN:**

- [ ] El select de área se llena automáticamente
- [ ] Muestra: COCINA, COFFEE, BEBIDAS, BAR
- [ ] Al crear platillo nuevo, permite seleccionar área
- [ ] Al editar platillo, preselecciona el área actual
- [ ] Validación: muestra error si no se selecciona área
- [ ] Al guardar, el platillo aparece en el área correcta
- [ ] Descripción permite texto multilínea
- [ ] Precio solo acepta números
- [ ] Notificaciones visuales funcionan

---

## 🎉 **RESULTADO FINAL:**

### **Antes:**
```
❌ Área hardcodeada a "cocina"
❌ Descripción en un input de una línea
❌ Sin validación de área
❌ No se podía cambiar el área
```

### **Ahora:**
```
✅ Área seleccionable desde dropdown
✅ Carga áreas dinámicamente del backend
✅ Descripción en textarea multilínea
✅ Validación de área obligatoria
✅ Permite cambiar área al editar
✅ Notificaciones visuales mejoradas
✅ IDs únicos en todos los campos
✅ Estilos mejorados con grid layout
```

---

## 🚀 **PRUEBA COMPLETA:**

```
1. CREAR PLATILLO:
   - Ir a control-platillos.html
   - Clic "+ Agregar platillo"
   - Nombre: "Tacos al Pastor"
   - Área: COCINA
   - Precio: 35.00
   - Descripción: "Tacos mexicanos tradicionales"
   - Clic "Agregar"
   - ✅ Ver mensaje de éxito
   - Verificar que aparezca en COCINA

2. EDITAR PLATILLO:
   - Buscar "Tacos al Pastor"
   - Clic "✏️ Editar"
   - Ver que área = COCINA
   - Cambiar área a BEBIDAS (para probar)
   - Clic "Actualizar"
   - ✅ Ver mensaje de éxito
   - Verificar que ahora aparezca en BEBIDAS

3. VALIDACIONES:
   - Intentar crear sin nombre → Error
   - Intentar crear sin área → Error
   - Intentar crear con precio 0 → Error
   - Descripción vacía → OK (opcional)
```

---

**¡FORMULARIO COMPLETO Y FUNCIONAL!** ✅🎉

**Archivos modificados:**
- ✅ `fronted/templates/administracion/platillo.html`
- ✅ `fronted/scripts/platillos.js`

**Documentación:**
- ✅ `SELECTOR_AREA_PLATILLOS.md` - Esta guía completa


