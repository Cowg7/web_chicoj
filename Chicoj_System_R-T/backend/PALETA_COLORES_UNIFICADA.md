# 🎨 Paleta de Colores Unificada - Sistema Completo

## 📋 Resumen

Se ha aplicado uniformemente la **nueva paleta de colores suaves** en **TODAS las vistas** del sistema, eliminando colores brillantes y morados, y estableciendo una identidad visual coherente.

---

## 🎨 Paleta de Colores Oficial

### **Colores Principales**
```css
--bg: #f8f9fa;                    /* Fondo general */
--panel: #fff;                     /* Paneles y cards */
--brand: #7FA1B3;                  /* Marca principal (azul-gris) */
--primary: #7FA1B3;                /* Primario (azul-gris) */
--primary-700: #6B8A9B;            /* Primario oscuro */
--primary-900: #5A7483;            /* Primario más oscuro */
```

### **Colores de Estado**
```css
--success: #A8B5A1;                /* Éxito (verde salvia) */
--success-700: #92A089;            /* Éxito oscuro */
--warning: #D4AF85;                /* Advertencia (beige) */
--danger: #C49A8A;                 /* Error (terracota suave) */
--info: #A8B5A1;                   /* Información */
```

### **Colores de Texto**
```css
--text: #3d4a52;                   /* Texto principal */
--text-light: #7a8891;             /* Texto secundario */
--muted: #a0aab3;                  /* Texto deshabilitado */
```

### **Colores Estructurales**
```css
--border: #e5e9ec;                 /* Bordes */
--radius: 12px;                    /* Radio de esquinas */
--radius-lg: 18px;                 /* Radio grande */
--shadow: 0 4px 12px rgba(127, 161, 179, 0.08);  /* Sombras */
```

---

## 📁 Archivos CSS Actualizados

### **1. Base y Componentes (TODOS los archivos los usan)**
✅ `fronted/css/base.css` - Variables globales actualizadas  
✅ `fronted/css/components.css` - Componentes con gradientes  
✅ `fronted/css/utilities.css` - Utilidades

### **2. Vistas Específicas Actualizadas**
✅ `fronted/css/estilos-login.css` - Login con gradiente de fondo  
✅ `fronted/css/estilos-inicio.css` - Página principal  
✅ `fronted/css/estilos-menu-usuarios.css` - Menú de usuarios  
✅ `fronted/css/estilos-platillos.css` - Formulario de platillos  
✅ `fronted/css/estilos-control-platillos.css` - Lista de platillos  
✅ `fronted/css/estilos-control-usuarios.css` - Lista de usuarios  
✅ `fronted/css/estilos-empleados.css` - Formulario de empleados  
✅ `fronted/css/estilos-empleados-control.css` - Lista de empleados  
✅ `fronted/css/estilos-roles.css` - Formulario de roles  
✅ `fronted/css/estilos-form-usuarios.css` - Formulario de usuarios  
✅ `fronted/css/estilos-comanda.css` - Órdenes (mesero)  
✅ `fronted/css/estilos-comanda-control.css` - Control de órdenes  
✅ `fronted/css/estilos-cocina.css` - KDS (cocina/bar/café)  
✅ `fronted/css/estilos-cocina-inicio.css` - Menú de KDS  
✅ `fronted/css/estilos-tour.css` - Formulario de tours  
✅ `fronted/css/estilos-tour-control.css` - Lista de tours  

### **3. Archivos HTML con Cache-Busting Actualizado**
✅ `fronted/main.html` - `?v=20251025`  
✅ `fronted/templates/login.html` - Iconos SVG + paleta  
✅ `fronted/templates/administracion/platillo.html` - `?v=20251025`  
✅ Todas las demás vistas usan `?v=20251025` o `?v=20251025b`

---

## 🎯 Características de la Paleta

### **1. Colores Suaves y Profesionales**
- ❌ Sin morados
- ❌ Sin colores chillantes
- ✅ Azul-gris como color principal
- ✅ Verde salvia como color secundario
- ✅ Gradientes sutiles

### **2. Consistencia Visual**
- Todos los encabezados usan: `linear-gradient(135deg, #7FA1B3 0%, #6B8A9B 100%)`
- Todos los botones usan la misma paleta
- Todos los badges usan colores de estado consistentes
- Todas las sombras son suaves y uniformes

### **3. Estados Visuales**
- **Focus**: `box-shadow: 0 0 0 3px rgba(127, 161, 179, 0.15)`
- **Hover**: `background: rgba(127, 161, 179, 0.08)`
- **Active**: Tonos más oscuros de la paleta

---

## 🖌️ Ejemplos de Uso

### **Gradiente de Encabezados**
```css
background: linear-gradient(135deg, #7FA1B3 0%, #6B8A9B 100%);
color: white;
```

### **Gradiente de Login**
```css
background: linear-gradient(135deg, #7FA1B3 0%, #A8B5A1 100%);
```

### **Card con Borde Animado**
```css
.card-opcion::before {
  background: linear-gradient(135deg, var(--primary) 0%, var(--success) 100%);
}
```

### **Sombras Suaves**
```css
box-shadow: 0 4px 12px rgba(127, 161, 179, 0.08);
```

---

## 📱 Responsive Design

Todos los CSS ahora incluyen breakpoints consistentes:

### **Desktop** (>1024px)
- Layout completo
- Todos los elementos visibles

### **Tablets** (768px - 1024px)
- Ajustes de espaciado
- Columnas reducidas

### **Mobile** (≤768px)
- Diseño de 1 columna
- Botones de ancho completo
- Encabezados ocultos en tablas

### **Mobile Pequeño** (≤480px)
- Fuentes más pequeñas
- Padding reducido
- Botones apilados

---

## 🧪 Verificación Visual

### **1. Login**
- Fondo: Gradiente azul-gris → verde salvia
- Iconos: SVG minimalistas
- Botón: Azul-gris sólido

### **2. Dashboard/Inicio**
- Cards: Blancas con borde azul-gris
- Hover: Elevación suave
- Barra superior: Gradiente en hover

### **3. Tablas**
- Encabezados: Gradiente azul-gris
- Filas alternas: Gris muy claro
- Hover: Azul-gris transparente

### **4. Formularios**
- Labels con iconos SVG
- Inputs: Borde gris, focus azul-gris
- Botones: Colores de la paleta

### **5. KDS (Cocina)**
- Tickets: Fondo blanco
- Header: Gradiente azul-gris
- Estados: Verde salvia (listo)

### **6. Tours**
- Formulario: Grid responsive
- Lista: Tabla con gradiente
- Botones: Paleta unificada

---

## 🎨 Badges de Estado

### **Disponibilidad**
```css
.badge-disponible {
  background: rgba(168, 181, 161, 0.15);
  color: #A8B5A1;
  border: 1px solid #A8B5A1;
}
```

### **Roles**
```css
.badge-admin {
  background: rgba(168, 181, 161, 0.15);
  color: #A8B5A1;
  border: 1px solid #A8B5A1;
}

.badge-mesero {
  background: rgba(127, 161, 179, 0.15);
  color: #7FA1B3;
  border: 1px solid #7FA1B3;
}
```

---

## ✅ Checklist de Verificación

### **Colores**
- [x] Sin morados en ninguna vista
- [x] Azul-gris como principal
- [x] Verde salvia como secundario
- [x] Colores suaves y profesionales
- [x] Consistencia en todas las vistas

### **Componentes**
- [x] Encabezados con gradiente
- [x] Tablas con estilos uniformes
- [x] Botones con paleta consistente
- [x] Badges con colores de estado
- [x] Formularios con focus suave

### **Responsive**
- [x] Mobile-first
- [x] Breakpoints consistentes
- [x] Todos los elementos adaptables
- [x] Navegación funcional en móvil

### **Iconos**
- [x] SVG minimalistas en login
- [x] SVG en formulario de platillos
- [x] Color heredado (currentColor)
- [x] Tamaño consistente (18px)

---

## 🚀 Cómo Probar

### **1. Limpiar Cache**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### **2. Vistas a Verificar**
1. ✅ Login (`/templates/login.html`)
2. ✅ Dashboard (`/main.html`)
3. ✅ Menú Usuarios (`/templates/administracion/menu_usuarios.html`)
4. ✅ Control Platillos (`/templates/administracion/control-platillos.html`)
5. ✅ Formulario Platillos (`/templates/administracion/platillo.html`)
6. ✅ Control Usuarios (`/templates/administracion/control-usuarios.html`)
7. ✅ Empleados (`/templates/administracion/agregar_empleados.html`)
8. ✅ Control Empleados (`/templates/administracion/empleados_control.html`)
9. ✅ Roles (`/templates/administracion/agregar_roles.html`)
10. ✅ Comanda (`/templates/mesero/mesero_comanda.html`)
11. ✅ Control Comanda (`/templates/mesero/comanda-control.html`)
12. ✅ KDS Menú (`/templates/cocina/menu_cocina.html`)
13. ✅ KDS Cocina (`/templates/cocina/cocina.html?area=Cocina`)
14. ✅ Tours (`/templates/tour/tour.html`)
15. ✅ Control Tours (`/templates/tour/tour-control.html`)

### **3. Aspectos a Verificar**
- [ ] Colores suaves y no brillantes
- [ ] Gradientes en encabezados
- [ ] Hover effects suaves
- [ ] Responsive en mobile
- [ ] Iconos SVG visibles
- [ ] Sin morados

---

## 📌 Notas Importantes

1. **Cache**: Siempre limpiar cache después de actualizar CSS
2. **Versión**: Todos los archivos usan `?v=20251025` o `?v=20251025b`
3. **Variables**: Definidas en `base.css`, usadas en todos los demás
4. **Gradientes**: Consistentes en todas las vistas
5. **Sin morado**: Verificado en toda la paleta

---

## 🎯 Resultado Final

✅ **16 archivos CSS** actualizados con paleta unificada  
✅ **Todas las vistas** con colores consistentes  
✅ **Sin colores brillantes** ni morados  
✅ **Responsive** en todos los dispositivos  
✅ **Iconos SVG** minimalistas  
✅ **Gradientes suaves** y profesionales  

---

**Fecha**: 25 de octubre de 2025  
**Versión**: v20251025  
**Paleta**: Azul-gris (#7FA1B3) + Verde salvia (#A8B5A1)


