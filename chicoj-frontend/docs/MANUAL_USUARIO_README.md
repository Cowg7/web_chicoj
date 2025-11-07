# 📖 Manual de Usuario - Sistema Chicoj

## 📄 Archivos Generados

El manual de usuario está disponible en múltiples formatos:

1. **📝 MANUAL_USUARIO_CHICOJ.md** - Formato Markdown (fuente original)
2. **🌐 MANUAL_USUARIO_CHICOJ.html** - Formato HTML (para visualizar en navegador)
3. **📄 MANUAL_USUARIO_CHICOJ.pdf** - Formato PDF (listo para imprimir/compartir)

---

## 📂 Ubicación de los Archivos

Todos los archivos se encuentran en:
```
chicoj-frontend/
├── MANUAL_USUARIO_CHICOJ.md      (1,749 líneas)
├── MANUAL_USUARIO_CHICOJ.html    (Generado)
└── MANUAL_USUARIO_CHICOJ.pdf     (~0.71 MB)
```

---

## 📋 Contenido del Manual

El manual incluye **10 secciones completas**:

### 1. **Introducción**
- ¿Qué es el Sistema Chicoj?
- Características principales
- Tecnologías utilizadas

### 2. **Acceso al Sistema**
- URL de acceso
- Pantalla de login
- Credenciales predeterminadas
- Cerrar sesión

### 3. **Roles y Permisos**
- Administrador
- Gerente
- Cajero
- Mesero
- Cocina (KDS)
- Bebidas (KDS)
- Coffee (KDS)
- Tour

### 4. **Módulo de Meseros**
- Crear nueva orden
- Visualizar órdenes activas
- Editar una orden
- Cerrar una cuenta
- Consejos y mejores prácticas

### 5. **Módulo de Cocina (KDS)**
- ¿Qué es el KDS?
- Acceso al KDS
- Interfaz del KDS
- Anatomía de un ticket
- Preparar un platillo
- Notificaciones
- Consejos para personal de cocina

### 6. **Módulo de Caja**
- Acceso al módulo
- Interfaz de caja
- Procesar un pago
- Consultar historial del día
- Estadísticas de ventas
- Métodos de pago (Efectivo, Tarjeta, Transferencia)
- Manejo de NIT
- Solución de problemas comunes

### 7. **Módulo de Tours**
- Acceso al módulo
- Registrar un nuevo tour
- Visualizar tours programados
- Editar un tour
- Cancelar un tour
- Mejores prácticas

### 8. **Módulo de Reportes**
- Acceso al módulo
- Filtros de período
- Estadísticas generales
- Platillos más vendidos
- Ventas por área
- Horas pico
- Métodos de pago
- Exportar reportes
- Análisis y toma de decisiones

### 9. **Módulo de Administración**
- Dashboard principal
- Gestión de empleados
- Gestión de usuarios
- Gestión de platillos
- Gestión de roles
- Respaldo y seguridad
- Auditoría

### 10. **Solución de Problemas**
- Problemas de inicio de sesión
- Problemas con órdenes
- Problemas en el KDS
- Problemas en caja
- Problemas generales
- Contacto de soporte

---

## 📊 Estadísticas del Manual

- **Total de páginas**: ~180 páginas (formato PDF)
- **Total de palabras**: ~25,000 palabras
- **Total de líneas**: 1,749 líneas (Markdown)
- **Tamaño PDF**: 0.71 MB
- **Imágenes**: Marcadores para 30+ capturas de pantalla
- **Tablas**: 15+ tablas informativas
- **Ejemplos**: 50+ ejemplos prácticos

---

## 🖨️ Cómo Imprimir el Manual

### Opción 1: Imprimir desde el PDF

1. Abra el archivo `MANUAL_USUARIO_CHICOJ.pdf`
2. Presione `Ctrl + P` o vaya a Archivo > Imprimir
3. Configure las opciones:
   - **Orientación**: Vertical (Portrait)
   - **Tamaño**: Carta (Letter) o A4
   - **Color**: Color o Blanco y Negro
   - **Doble cara**: Recomendado para ahorrar papel

### Opción 2: Imprimir desde el Navegador

1. Abra el archivo `MANUAL_USUARIO_CHICOJ.html` en un navegador
2. Presione `Ctrl + P`
3. Seleccione "Guardar como PDF" o impresora física

---

## 📤 Cómo Compartir el Manual

### Opción 1: Compartir el PDF

El archivo PDF es ideal para compartir porque:
- ✅ Se ve igual en todos los dispositivos
- ✅ No requiere software especial
- ✅ Puede imprimirse fácilmente
- ✅ Tamaño compacto (0.71 MB)

**Métodos para compartir**:
- 📧 Email
- 💬 WhatsApp
- ☁️ Google Drive / Dropbox
- 🔗 Link directo

### Opción 2: Compartir el HTML

El archivo HTML es útil para:
- 🔍 Búsquedas rápidas (Ctrl + F)
- 📱 Visualización en móviles
- 🔗 Links internos funcionales

---

## 🔄 Regenerar el Manual

Si necesita actualizar el manual:

### Paso 1: Editar el Markdown

```bash
# Edite el archivo fuente
nano MANUAL_USUARIO_CHICOJ.md
```

### Paso 2: Regenerar HTML

```bash
cd chicoj-frontend
node generate-pdf-manual.js
```

### Paso 3: Regenerar PDF

```bash
node convert-to-pdf.js
```

---

## 🎨 Personalizar el Manual

### Cambiar Estilos del PDF

Edite el archivo `generate-pdf-manual.js` en la sección de estilos CSS:

```javascript
// Cambiar colores
h1 { color: #2c3e50; }  // Color de títulos principales
h3 { color: #4CAF50; }  // Color de subtítulos

// Cambiar fuentes
body { font-family: 'Inter', sans-serif; }

// Cambiar tamaños
body { font-size: 11pt; }  // Tamaño de fuente base
```

### Agregar Imágenes

Para agregar capturas de pantalla reales:

1. Tome las capturas de pantalla del sistema
2. Guárdelas en `chicoj-frontend/imgs/`
3. Reemplace los marcadores en el Markdown:

```markdown
<!-- Antes -->
![Pantalla de Login](./imgs/login-screen.png)

<!-- Después (con imagen real) -->
![Pantalla de Login](./imgs/login-screenshot.png)
```

---

## 📋 Lista de Imágenes Sugeridas

Para completar el manual, se recomienda agregar estas capturas:

### Login y Dashboard
- [ ] `login-screen.png` - Pantalla de login
- [ ] `admin-dashboard.png` - Dashboard administrador

### Módulo Meseros
- [ ] `mesero-nueva-orden.png` - Formulario de nueva orden
- [ ] `mesero-platillos-agregados.png` - Lista de platillos
- [ ] `mesero-control.png` - Control de comandas

### Módulo Cocina (KDS)
- [ ] `kds-pantalla.png` - Interfaz del KDS

### Módulo Caja
- [ ] `caja-principal.png` - Vista principal de caja
- [ ] `caja-pendientes.png` - Órdenes pendientes
- [ ] `caja-modal-pago.png` - Modal de pago
- [ ] `caja-historial.png` - Historial del día

### Módulo Tours
- [ ] `tour-formulario.png` - Formulario de registro
- [ ] `tour-control.png` - Control de tours

### Módulo Reportes
- [ ] `reportes-principal.png` - Vista de reportes
- [ ] `reportes-platillos.png` - Top platillos
- [ ] `reportes-areas.png` - Ventas por área
- [ ] `reportes-horas.png` - Horas pico
- [ ] `reportes-pagos.png` - Métodos de pago

### Módulo Administración
- [ ] `admin-empleados-lista.png` - Lista de empleados
- [ ] `admin-empleado-form.png` - Formulario empleado
- [ ] `admin-usuarios-lista.png` - Lista de usuarios
- [ ] `admin-usuario-form.png` - Formulario usuario
- [ ] `admin-platillos-lista.png` - Lista de platillos
- [ ] `admin-platillo-form.png` - Formulario platillo
- [ ] `admin-roles.png` - Gestión de roles

---

## 🚀 Scripts Disponibles

### Generar HTML
```bash
cd chicoj-frontend
node generate-pdf-manual.js
```

### Generar PDF
```bash
node convert-to-pdf.js
```

### Generar todo
```bash
node generate-pdf-manual.js && node convert-to-pdf.js
```

---

## 📝 Notas para el Administrador

### Actualizar Credenciales

**Importante**: Antes de compartir el manual externamente:

1. Actualice las credenciales predeterminadas en el sistema
2. Modifique la sección "Credenciales Predeterminadas" del manual
3. Regenere el PDF

### Agregar Información de Contacto

En la sección "Contacto de Soporte" (página ~170), actualice:

```markdown
**Equipo de Desarrollo**:
- 📧 Email: [SU_EMAIL@chicoj.com]
- 📞 Teléfono: [SU_TELEFONO]
- ⏰ Horario: [SU_HORARIO]
```

### Personalizar para Cliente

Puede personalizar el manual para clientes específicos:
- Agregar logo del cliente
- Cambiar colores corporativos
- Agregar sección de políticas específicas
- Incluir información de contacto local

---

## 📄 Licencia

© 2025 Cooperativa Agrícola Integral Chicoj, R.L.

Este manual es propiedad de la Cooperativa y está destinado exclusivamente para uso interno y capacitación del personal.

---

## 👥 Créditos

**Desarrollado por**:
- Pedro José Quiñonez López (0902-21-4961)
- Christian Aníbal Elí Cabnal Pereira (0902-21-8380)
- Kristian Josué González Barrientos (0902-21-5567)

**Institución**:
Universidad Mariano Gálvez de Guatemala  
Facultad de Ingeniería en Sistemas de Información y Ciencias de la Computación  
Campus Cobán, Alta Verapaz

**Proyecto**: Seminario 2025

---

## 📞 Soporte

Para preguntas sobre el manual o el sistema:

- 📧 Email: soporte@chicoj.com
- 📱 WhatsApp: [Número por definir]
- 🌐 Sitio Web: [Por definir]

---

**Última actualización**: Noviembre 2025  
**Versión del Manual**: 1.0

