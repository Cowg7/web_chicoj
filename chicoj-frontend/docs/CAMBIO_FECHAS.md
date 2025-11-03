# 📅 Restricción de Fechas en Calendarios

## ✅ Cambio Implementado

Se agregó restricción para que los calendarios **NO permitan seleccionar fechas futuras**.

---

## 📋 Archivos Modificados

### 1. **Reportes y Estadísticas**
- **Archivo:** `templates/reportes/reportes.html`
- **Script:** `scripts/reportes.js`

**Cambio en HTML:**
```html
<!-- ANTES -->
<input type="date" id="fecha-desde" class="filter-input">
<input type="date" id="fecha-hasta" class="filter-input">

<!-- AHORA -->
<input type="date" id="fecha-desde" class="filter-input" max="">
<input type="date" id="fecha-hasta" class="filter-input" max="">
```

**Cambio en JavaScript:**
```javascript
// Se establece la fecha máxima dinámicamente
const todayStr = today.toISOString().split('T')[0];
fechaDesde.max = todayStr;
fechaHasta.max = todayStr;
```

### 2. **Registro de Tours**
- **Archivo:** `templates/tour/tour.html`
- **Script:** `scripts/tour.js`

**Cambio en HTML:**
```html
<!-- ANTES -->
<input type="date" id="fecha" required>

<!-- AHORA -->
<input type="date" id="fecha" required max="">
```

**Cambio en JavaScript:**
```javascript
// Al inicializar, se establece la fecha máxima
const fechaInput = document.getElementById('fecha');
if (fechaInput) {
  const today = new Date().toISOString().split('T')[0];
  fechaInput.max = today;
}
```

---

## 🎯 Comportamiento

### Antes:
- ❌ Podías seleccionar cualquier fecha futura
- ❌ Podías generar reportes del 2026, 2027, etc.
- ❌ Podías registrar tours del futuro

### Ahora:
- ✅ Solo puedes seleccionar hasta HOY (1/11/2025)
- ✅ Los reportes son solo de datos históricos
- ✅ Los tours se registran solo hasta hoy
- ✅ El calendario bloquea fechas futuras visualmente

---

## 🧪 Cómo Probar

### Reportes:
1. Ve a la vista de Reportes
2. Intenta seleccionar una fecha futura en "Desde" o "Hasta"
3. ✅ El calendario no te dejará seleccionar fechas futuras
4. ✅ Solo verás hasta la fecha actual

### Tours:
1. Ve a crear un nuevo tour
2. Intenta seleccionar una fecha futura en "Fecha del Tour"
3. ✅ El calendario no te dejará seleccionar fechas futuras
4. ✅ Solo verás hasta hoy

---

## 📝 Explicación Técnica

### Atributo `max` en HTML5
```html
<input type="date" max="2025-11-01">
```

Este atributo:
- Establece la fecha máxima seleccionable
- Es nativo de HTML5
- El navegador lo respeta automáticamente
- No permite escribir manualmente fechas mayores
- Deshabilita visualmente fechas futuras en el calendario

### Actualización Dinámica
```javascript
const today = new Date().toISOString().split('T')[0];
// Resultado: "2025-11-01"

fechaInput.max = today;
```

Esto asegura que:
- La fecha máxima siempre sea "hoy"
- Se actualiza automáticamente cada día
- No hay que hardcodear fechas

---

## ✅ Resultado

**Ahora es imposible:**
- ❌ Generar reportes del futuro
- ❌ Registrar tours de fechas futuras
- ❌ Seleccionar fechas inexistentes

**Esto mejora:**
- ✅ Validación de datos
- ✅ Lógica del negocio (no se pueden reportar ventas futuras)
- ✅ Experiencia de usuario (calendarios más claros)

---

**Fecha de implementación:** 1 de Noviembre 2025

