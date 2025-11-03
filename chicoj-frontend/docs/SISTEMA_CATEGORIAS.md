# Sistema de Categorías Jerárquicas para Platillos

## 📋 Resumen

Se ha implementado un sistema de categorización jerárquica de tres niveles para los platillos del restaurante:

**Nivel 1: Áreas** → **Nivel 2: Categorías** → **Nivel 3: Platillos**

## 🗂️ Estructura de Categorías

### Cocina
- Desayunos
- Almuerzo
- Refacciones
- Refacciones Típicas
- Menú Infantil

### Bebidas
- Bebidas Frías
- Licuados
- Cervezas
- Bebidas Desechables

### Coffee
- Café
- Postres

## 🎯 Funcionalidades Implementadas

### 1. Vista de Comandas (Mesero)
**Archivo:** `chicoj-frontend/templates/mesero/mesero_comanda.html`

#### Características:
- **Paso 1:** Selección de área con botones exclusivos
  - Solo un área puede estar activa a la vez
  - Al seleccionar un área, las demás se deshabilitan visualmente
  - Botones con efectos visuales modernos (hover, active state)

- **Paso 2:** Selección de categoría
  - Se carga dinámicamente según el área seleccionada
  - Select dropdown con las categorías disponibles

- **Paso 3:** Selección de platillo
  - Filtra platillos por área Y categoría
  - Muestra precio junto al nombre
  - Incluye platillos "Sin Categoría" si existen

#### Flujo de Uso:
```
Usuario selecciona "Cocina" 
  → Se muestran categorías: Desayunos, Almuerzo, etc.
    → Usuario selecciona "Desayunos"
      → Se muestran solo los platillos de desayunos
```

### 2. Vista de Gestión de Platillos (Administrador)
**Archivo:** `chicoj-frontend/templates/administracion/platillo.html`

#### Características:
- Campo de categoría agregado al formulario
- Se carga dinámicamente al seleccionar un área
- Permite asignar categoría al crear/editar platillos
- Opción "Sin categoría" disponible

## 💾 Cambios en la Base de Datos

### Schema Actualizado
```sql
ALTER TABLE platillos 
ADD COLUMN categoria VARCHAR(100);

CREATE INDEX ix_platillos_categoria 
ON platillos(categoria);
```

### Script de Categorización
**Archivo:** `Chicoj_System_R-T/backend/prisma/update-categorias.js`

- Asigna categorías automáticamente a platillos existentes
- Busca por palabras clave en el nombre del platillo
- Genera estadísticas de platillos por categoría

**Ejecutar:**
```bash
docker compose exec backend node prisma/update-categorias.js
```

## 🔧 Cambios Técnicos

### Frontend

#### 1. `chicoj-frontend/scripts/comanda.js`
**Funciones nuevas:**
- `selectArea(areaNombre, areaId)` - Maneja selección de área
- `loadCategorias(areaNombre, areaId)` - Carga categorías por área
- `loadPlatillosPorCategoria(categoria)` - Filtra platillos
- `handleCategoriaChange(e)` - Event handler para cambio de categoría

**Variables de estado:**
```javascript
let selectedArea = null;
let selectedCategoria = null;
let categoriasPorArea = {};
```

#### 2. `chicoj-frontend/scripts/platillos.js`
**Funciones nuevas:**
- `handleAreaChange(e)` - Carga categorías al seleccionar área
- Categorías predefinidas por área

**Cambios en datos:**
```javascript
const platilloData = {
  nombre,
  precio,
  descripcion,
  id_area,
  categoria  // ⭐ NUEVO
};
```

### Backend

#### 1. `Chicoj_System_R-T/backend/src/modules/menu/menu.controller.js`

**`createPlatillo`:**
```javascript
const { nombre, descripcion, precio, id_area, area, categoria } = req.body;

await prisma.platillos.create({
  data: {
    nombre,
    descripcion,
    precio,
    id_area,
    categoria  // ⭐ NUEVO
  }
});
```

**`updatePlatillo`:**
```javascript
const { nombre, descripcion, precio, id_area, categoria } = req.body;

await prisma.platillos.update({
  data: {
    ...(nombre && { nombre }),
    ...(descripcion !== undefined && { descripcion }),
    ...(precio && { precio }),
    ...(id_area && { id_area: parseInt(id_area) }),
    ...(categoria !== undefined && { categoria })  // ⭐ NUEVO
  }
});
```

#### 2. Schema de Prisma
**Archivo:** `Chicoj_System_R-T/backend/prisma/schema.prisma`
```prisma
model platillos {
  id_platillo Int     @id @default(autoincrement())
  nombre      String  @unique @db.VarChar(120)
  descripcion String? @db.VarChar(255)
  precio      Decimal @db.Decimal(10, 2)
  id_area     Int
  categoria   String? @db.VarChar(100)  // ⭐ NUEVO
  disponible  Boolean @default(true)

  area     area      @relation(fields: [id_area], references: [id_area])
  comandas comanda[]

  @@index([id_area], name: "ix_platillos_area")
  @@index([categoria], name: "ix_platillos_categoria")  // ⭐ NUEVO
  @@index([disponible], name: "ix_platillos_disponible")
  @@map("platillos")
}
```

## 🎨 Estilos CSS

### Botones de Área
```css
.area-button {
  flex: 1;
  min-width: 150px;
  padding: 1rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: var(--r-md);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.area-button.active {
  background: linear-gradient(135deg, var(--primary) 0%, #1976D2 100%);
  color: white !important;
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.area-button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

## 📝 Ejemplo de Uso

### Crear Platillo con Categoría
```javascript
// Frontend
const platilloData = {
  nombre: "Huevos Rancheros",
  precio: 25.00,
  descripcion: "Con frijoles y tortillas",
  id_area: 1,  // Cocina
  categoria: "Desayunos"
};

// Se envía al backend
await API.menu.create(platilloData);
```

### Filtrar Platillos en Comanda
```javascript
// 1. Usuario selecciona "Cocina"
selectArea('Cocina', 1);

// 2. Se cargan categorías automáticamente
// → Desayunos, Almuerzo, Refacciones...

// 3. Usuario selecciona "Desayunos"
handleCategoriaChange({ target: { value: 'Desayunos' }});

// 4. Se filtran y muestran solo platillos de desayunos
loadPlatillosPorCategoria('Desayunos');
```

## 🔍 Consultas SQL Útiles

### Ver platillos por categoría
```sql
SELECT 
  a.nombre as area,
  p.categoria,
  COUNT(*) as total_platillos
FROM platillos p
JOIN area a ON p.id_area = a.id_area
GROUP BY a.nombre, p.categoria
ORDER BY a.nombre, p.categoria;
```

### Actualizar categoría masivamente
```sql
UPDATE platillos 
SET categoria = 'Desayunos' 
WHERE nombre ILIKE '%huevos%' 
  AND id_area = (SELECT id_area FROM area WHERE nombre = 'Cocina');
```

## 🚀 Próximas Mejoras

1. **Gestión de Categorías desde Admin**
   - Crear/Editar/Eliminar categorías dinámicamente
   - No depender de categorías hardcodeadas

2. **Reportes por Categoría**
   - Ventas por categoría
   - Platillos más vendidos por categoría

3. **Ordenamiento Personalizado**
   - Permitir ordenar categorías y platillos
   - Configurar cuáles categorías mostrar primero

4. **Multi-idioma**
   - Categorías en español e inglés
   - Útil para turistas

## ✅ Testing

### Checklist de Pruebas

- [x] Crear platillo con categoría
- [x] Editar platillo y cambiar categoría
- [x] Crear platillo sin categoría
- [x] Filtrar platillos por área y categoría en comanda
- [x] Botones de área se comportan exclusivamente
- [x] Categorías se cargan dinámicamente al seleccionar área
- [x] Platillos se filtran correctamente
- [x] Backend guarda y retorna categoría correctamente

## 📞 Soporte

Para preguntas o problemas con el sistema de categorías:
- Revisar logs del backend: `docker compose logs backend`
- Revisar consola del navegador
- Verificar que el backend esté actualizado: `docker compose restart backend`
- Limpiar caché del navegador: Ctrl + Shift + R

---

**Versión:** 1.0  
**Fecha:** Noviembre 1, 2025  
**Autor:** Sistema Chicoj Dev Team


