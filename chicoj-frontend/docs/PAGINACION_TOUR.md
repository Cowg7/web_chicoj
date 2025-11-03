# 📄 Sistema de Paginación para Tour Control

## ✅ Implementado

Se ha agregado un sistema de paginación completo para el listado de tours, mostrando **20 registros por página**.

## 🎯 Características

### 1. **Paginación de 20 Registros**
- Muestra 20 tours por página
- Navegación fluida entre páginas
- Scroll automático al cambiar de página

### 2. **Controles de Navegación**

```
⏮️  ◀️  [1] [2] [3] ... [10]  ▶️  ⏭️
```

- **⏮️ Primera página** - Ir a página 1
- **◀️ Anterior** - Página anterior
- **Números** - Click directo en cualquier página
- **▶️ Siguiente** - Siguiente página
- **⏭️ Última página** - Ir a última página

### 3. **Información de Registros**
```
Mostrando 1-20 de 100 registros
Mostrando 21-40 de 100 registros
Mostrando 81-100 de 100 registros
```

### 4. **Números de Página Inteligentes**

Si tienes muchas páginas, muestra:
```
[1] [2] [3] ... [8] [9] [10]      ← Estás en página 1
[1] ... [4] [5] [6] ... [10]      ← Estás en página 5
[1] ... [8] [9] [10]              ← Estás en página 10
```

**Lógica:**
- Siempre muestra la página 1 y la última
- Muestra la página actual ± 2 páginas
- Puntos suspensivos (...) cuando hay saltos

### 5. **Botones Deshabilitados**

- **◀️ y ⏮️** deshabilitados en la primera página
- **▶️ y ⏭️** deshabilitados en la última página
- Visualmente opaco (40% opacidad)

## 🎨 Diseño Visual

### Estado de Botones:

**Página activa (azul):**
```css
background: #2196F3
color: white
font-weight: bold
```

**Hover (no activos):**
```css
border-color: #2196F3
background: rgba(33, 150, 243, 0.05)
```

**Deshabilitados:**
```css
opacity: 0.4
cursor: not-allowed
```

## 🔄 Comportamiento con Filtros

### Al Aplicar Filtros:
1. Se resetea automáticamente a la **página 1**
2. Se recalcula el total de páginas según resultados
3. Si hay ≤20 resultados, los controles se ocultan

**Ejemplo:**
```
100 registros → 5 páginas (20 por página)
15 registros → Sin paginación (todos en una vista)
```

### Al Limpiar Filtros:
1. Vuelve a **página 1**
2. Muestra todos los registros paginados
3. Controles aparecen si hay >20 registros

## 📥 Descarga de Archivos

**⚠️ Importante:** Las descargas (Excel/PDF) incluyen **TODOS** los registros filtrados, no solo la página actual.

**Ejemplo:**
- Estás viendo página 2 (tours 21-40)
- Click en "📊 Descargar Excel"
- El archivo incluye TODOS los tours filtrados (1-100)

## 💻 Código Técnico

### Variables de Estado:
```javascript
let currentPage = 1;           // Página actual
let itemsPerPage = 20;         // Registros por página
let totalPages = 0;            // Total de páginas calculado
```

### Función Principal:
```javascript
function displayTours() {
  // Calcular qué registros mostrar
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTours.length);
  const toursToShow = filteredTours.slice(startIndex, endIndex);
  
  // Renderizar solo esos registros
  toursToShow.forEach(tour => {
    // Crear fila...
  });
  
  // Actualizar controles
  updatePaginationControls();
}
```

### Navegación:
```javascript
function goToPage(page) {
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  displayTours();
  
  // Scroll suave hacia arriba
  tabla.scrollIntoView({ behavior: 'smooth' });
}
```

## 📊 Ejemplos de Uso

### Escenario 1: 100 Tours
```
Página 1: Tours 1-20
Página 2: Tours 21-40
Página 3: Tours 41-60
Página 4: Tours 61-80
Página 5: Tours 81-100

Controles: ⏮️ ◀️ [1] [2] [3] [4] [5] ▶️ ⏭️
```

### Escenario 2: 15 Tours (Sin Paginación)
```
Todos los tours en una sola vista
Controles: Ocultos (no necesarios)
```

### Escenario 3: Filtros Aplicados
```
Total: 100 tours
Filtrados: 35 tours

Resultado:
  Página 1: Tours 1-20 (de los filtrados)
  Página 2: Tours 21-35 (de los filtrados)

Controles: ⏮️ ◀️ [1] [2] ▶️ ⏭️
```

## 🎯 Flujo de Usuario

1. **Carga inicial**
   - Se cargan todos los tours
   - Se muestran los primeros 20
   - Aparecen controles de paginación

2. **Navegar**
   - Click en "▶️" → Siguiente página
   - Click en "3" → Página 3 directamente
   - Click en "⏭️" → Última página

3. **Aplicar filtros**
   - Vuelve a página 1
   - Muestra primeros 20 del filtrado
   - Recalcula número de páginas

4. **Descargar**
   - Excel/PDF incluyen TODOS los filtrados
   - No importa en qué página estés

## 🚀 Próximas Mejoras (Opcional)

1. **Selector de cantidad por página**
   ```
   Mostrar: [10] [20] [50] [100] por página
   ```

2. **Input directo de página**
   ```
   Ir a página: [___] [Ir]
   ```

3. **Paginación del lado del servidor**
   - Para bases de datos muy grandes (>10,000 registros)
   - Cargar solo 20 del backend

4. **Guardar página en localStorage**
   - Recordar última página visitada
   - Útil al volver de editar un registro

## 🧪 Testing

### Checklist:
- [x] Muestra solo 20 registros por página
- [x] Botones de navegación funcionan
- [x] Números de página son clickeables
- [x] Botones se deshabilitan correctamente
- [x] Info "Mostrando X-Y de Z" es correcta
- [x] Scroll automático al cambiar página
- [x] Filtros resetean a página 1
- [x] Excel/PDF descargan todos los filtrados
- [x] Oculta controles si hay ≤20 registros

## 📞 Notas

- La paginación es **del lado del cliente** (todos los registros se cargan una vez)
- Ideal para datasets de hasta ~1000 registros
- Para más de 1000 registros, considerar paginación del servidor
- Los controles solo aparecen si hay más de 20 registros

---

**Versión:** 1.0  
**Fecha:** Noviembre 1, 2025  
**Archivo:** `tour-control.html` y `tour-control.js`


