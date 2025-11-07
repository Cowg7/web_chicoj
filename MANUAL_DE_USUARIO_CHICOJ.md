# 📖 Manual de Usuario - Sistema Chicoj

**Versión:** 2.0  
**Última actualización:** 7 de Noviembre, 2025  
**Sistema de Gestión para Restaurante Chicoj**

---

## 📑 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Inicio de Sesión](#inicio-de-sesión)
3. [Roles y Permisos](#roles-y-permisos)
4. [Módulo de Mesero](#módulo-de-mesero)
5. [Módulo de Cocina (KDS)](#módulo-de-cocina-kds)
6. [Módulo de Caja](#módulo-de-caja)
7. [Módulo de Tour](#módulo-de-tour)
8. [Módulo de Administración](#módulo-de-administración)
9. [Preguntas Frecuentes](#preguntas-frecuentes)
10. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Introducción

### ¿Qué es el Sistema Chicoj?

El Sistema Chicoj es una plataforma integral de gestión diseñada específicamente para el Restaurante Chicoj. Permite administrar:

- 🍽️ **Comandas y pedidos** de los meseros
- 👨‍🍳 **Cocina en tiempo real** (KDS - Kitchen Display System)
- 💰 **Caja y pagos** con generación de tickets
- 🎫 **Tours turísticos** con control de reservas
- 👥 **Administración** de usuarios, platillos, categorías y reportes

### Características Principales

✅ **Sistema en tiempo real** - Los cambios se reflejan instantáneamente  
✅ **Multi-área** - Cocina, Bebidas, Coffee separados  
✅ **Seguridad robusta** - Autenticación y control de acceso por roles  
✅ **Diseño moderno** - Interfaz intuitiva y responsive  
✅ **Notificaciones** - Sistema Toast para feedback inmediato  
✅ **Exportación** - Reportes en PDF y Excel  

---

## 🔐 Inicio de Sesión

### Acceder al Sistema

1. **Abrir el navegador** (Chrome, Firefox, Edge recomendados)
2. **Ir a la URL:**
   ```
   http://coopechicoj.com
   o
   http://localhost (en desarrollo)
   ```
3. **Ingresar credenciales:**
   - Usuario: Tu nombre de usuario asignado
   - Contraseña: Tu contraseña personal

### Seguridad del Login

🔒 **Protección anti-brute force:**
- Máximo **5 intentos fallidos**
- Bloqueo de **15 minutos** después de 5 intentos
- Contador de intentos restantes visible

⚠️ **Requisitos de contraseña:**
- Mínimo **8 caracteres**
- No se permite copiar/pegar (por seguridad)

### Recuperar Contraseña

1. Click en **"¿Olvidaste tu contraseña?"**
2. Ingresa tu **correo electrónico** o **usuario**
3. Recibirás instrucciones por email
4. Sigue el enlace para restablecer tu contraseña

### Cerrar Sesión

- Click en el botón **"Cerrar Sesión"** (esquina superior derecha)
- Confirma en el modal que aparece
- Siempre cierra sesión al terminar tu turno

---

## 👥 Roles y Permisos

### Tipos de Roles

| Rol | Acceso | Permisos |
|-----|--------|----------|
| **Administrador** | Completo | Todas las funciones del sistema |
| **Gerente** | Amplio | Reportes, gestión de personal, supervisión |
| **Mesero** | Limitado | Crear/editar comandas, ver menú |
| **Cocina** | KDS Cocina | Vista de platillos de cocina |
| **Bebidas** | KDS Bebidas | Vista de bebidas |
| **Coffee** | KDS Coffee | Vista de café y postres |
| **Cajero** | Caja | Cobros, tickets, cierre de cuentas |
| **Tour** | Tours | Gestión de tours y reservas |
| **Supervisor** | Supervisión | Monitoreo general sin edición |

### Permisos por Módulo

#### 🍽️ **Módulo Mesero:**
- ✅ Administrador, Gerente, Mesero
- ❌ Cocina, Bebidas, Coffee, Cajero, Tour

#### 👨‍🍳 **Módulo Cocina/KDS:**
- ✅ Administrador, Gerente, Cocina, Bebidas, Coffee
- ❌ Mesero, Cajero, Tour

#### 💰 **Módulo Caja:**
- ✅ Administrador, Gerente, Cajero
- ❌ Mesero, Cocina, Bebidas, Coffee, Tour

#### 🎫 **Módulo Tour:**
- ✅ Administrador, Gerente, Tour
- ❌ Mesero, Cocina, Bebidas, Coffee, Cajero

#### ⚙️ **Módulo Administración:**
- ✅ Administrador, Gerente (limitado)
- ❌ Todos los demás roles

---

## 🍽️ Módulo de Mesero

### Vista Principal: Crear Comanda

#### 1. Acceder al Módulo

```
Menú → Mesero → Crear Comanda
```

#### 2. Crear una Nueva Comanda

**Paso 1: Información de la Mesa**

1. **Número de Mesa:**
   - Ingresa el número de mesa (1-50)
   - Validación automática de números

2. **Nombre del Cliente:**
   - Ingresa el nombre del cliente (opcional pero recomendado)

**Paso 2: Seleccionar Platillos**

1. **Filtrar por categoría:**
   - Click en las pestañas: Todas, Desayuno, Almuerzo, Cena, Bebidas, Postres, etc.

2. **Agregar platillos:**
   - Click en el botón **"+"** del platillo deseado
   - Aparecerá en la lista de "Platillos Seleccionados"
   - Puedes agregar el mismo platillo múltiples veces

3. **Ajustar cantidades:**
   - Usa los botones **"-"** y **"+"** para modificar cantidad
   - Click en **"🗑️"** para eliminar un platillo

4. **Ver precio total:**
   - Se calcula automáticamente en la parte inferior

**Paso 3: Agregar Notas (Opcional)**

1. Scroll hasta **"Notas para la cocina"**
2. Ingresa indicaciones especiales:
   ```
   Ejemplos:
   - Sin cebolla
   - Término medio
   - Extra picante
   - Sin gluten
   ```

**Paso 4: Enviar la Comanda**

1. Click en **"Enviar Comanda"**
2. Confirma en el modal que aparece
3. Recibirás notificación de éxito
4. La comanda se envía automáticamente a Cocina/KDS

#### 3. Ver Comandas Activas

```
Menú → Mesero → Control de Comandas
```

**Funciones disponibles:**

📋 **Listar comandas:**
- Ver todas las comandas activas
- Filtrar por mesa
- Ver estado de cada platillo

🔍 **Detalles de comanda:**
- Click en una comanda para ver detalles completos
- Ver estado de preparación en KDS
- Ver tiempo transcurrido

✏️ **Editar comanda:**
- Click en **"Editar"**
- **IMPORTANTE:** Los platillos ya preparados NO se pueden editar
- Puedes agregar nuevos platillos a una comanda existente
- Los platillos preparados aparecen con candado 🔒

⚠️ **Validación de cierre:**
- No puedes cerrar una cuenta si hay platillos pendientes en cocina
- El sistema te mostrará qué platillos faltan

---

## 👨‍🍳 Módulo de Cocina (KDS)

### ¿Qué es KDS?

**Kitchen Display System** - Sistema de Visualización para Cocina

Muestra en tiempo real los platillos que deben prepararse, organizados por área:
- 🍳 **Cocina** - Platillos principales
- 🍹 **Bebidas** - Bebidas y jugos
- ☕ **Coffee** - Café, postres, repostería

### Acceder a KDS

**Para Cocina:**
```
http://localhost/templates/cocina/cocina?area=cocina
```

**Para Bebidas:**
```
http://localhost/templates/cocina/cocina?area=bebidas
```

**Para Coffee:**
```
http://localhost/templates/cocina/cocina?area=coffee
```

### Usar el KDS

#### Pantalla Principal

La pantalla muestra:

```
┌─────────────────────────────────┐
│  Mesa 5  |  Comanda #123        │
│  ⏱️ 00:05:23  (tiempo transcurr.)│
├─────────────────────────────────┤
│  🍕 Pizza Margarita    x2       │
│  🍔 Hamburguesa        x1       │
│  📝 Nota: Sin cebolla           │
├─────────────────────────────────┤
│  [✅ Marcar como Terminado]     │
└─────────────────────────────────┘
```

#### Estados de las Comandas

🔴 **Pendiente** - Fondo rojo, acaba de llegar  
🟡 **En Preparación** - Fondo amarillo, en proceso  
🟢 **Preparado** - Fondo verde, listo para servir  

#### Marcar Platillo como Terminado

1. **Prepara el platillo** según la receta
2. Click en **"✅ Marcar como Terminado"**
3. Confirma en el modal
4. El platillo desaparece de tu pantalla
5. **Auto-actualización:** Las otras pantallas se actualizan en 5 segundos

#### Tiempos de Alerta

⏱️ **Indicadores de tiempo:**
- **< 5 min:** Normal (verde)
- **5-10 min:** Atención (amarillo)
- **> 10 min:** Urgente (rojo)

#### Actualización Automática

🔄 **El KDS se actualiza solo cada 5 segundos**
- No necesitas recargar la página
- Las nuevas comandas aparecen automáticamente
- Los platillos terminados se quitan solos

### Buenas Prácticas en KDS

✅ **DO (Hacer):**
- Marcar terminado SOLO cuando el platillo esté listo
- Leer las notas especiales ANTES de cocinar
- Mantener el área limpia para ver la pantalla
- Avisar al mesero si hay retrasos

❌ **DON'T (No hacer):**
- NO marcar como terminado si no está listo
- NO ignorar las notas del cliente
- NO dejar comandas antiguas sin atender

---

## 💰 Módulo de Caja

### Vista Principal: Caja

```
Menú → Caja → Gestión de Caja
```

### 1. Cobrar una Cuenta

**Paso 1: Buscar la Comanda**

1. En la sección **"Comandas Activas"**
2. Filtra por número de mesa o comanda
3. Verifica que todos los platillos estén preparados

**Paso 2: Revisar el Total**

```
┌─────────────────────────────┐
│  Mesa 5                     │
│  Cliente: Juan Pérez        │
├─────────────────────────────┤
│  Pizza Margarita   x2  Q80  │
│  Hamburguesa       x1  Q45  │
│  Coca-Cola         x2  Q10  │
├─────────────────────────────┤
│  Subtotal:           Q135   │
│  Propina (10%):      Q13.5  │
│  TOTAL:             Q148.5  │
└─────────────────────────────┘
```

**Paso 3: Seleccionar Método de Pago**

- 💵 **Efectivo**
- 💳 **Tarjeta**
- 📱 **Transferencia**

**Paso 4: Cobrar**

1. Click en **"Cobrar"**
2. Si es efectivo, ingresa el monto recibido
3. El sistema calcula el cambio automáticamente
4. Confirma la transacción

**Paso 5: Imprimir Ticket**

1. Click en **"Imprimir Ticket"**
2. Se genera un PDF con:
   - Logo del restaurante
   - Fecha y hora
   - Detalle de consumo
   - Total y método de pago
   - Información de contacto:
     - Tel: 5524 1831
     - Email: correotourchicoj@gmail.com

### 2. Cerrar Caja

```
Menú → Caja → Cierre de Caja
```

**Al final del turno:**

1. Click en **"Cierre de Caja"**
2. El sistema muestra:
   - Total de ventas del día
   - Desglose por método de pago
   - Cantidad de comandas atendidas
3. Verifica que los montos coincidan
4. Confirma el cierre
5. Genera reporte en PDF

### 3. Reabrir Cuenta

Si un cliente necesita agregar algo después de pagar:

1. Busca la comanda cerrada
2. Click en **"Reabrir"**
3. El mesero puede agregar nuevos platillos
4. Cobra nuevamente cuando esté listo

---

## 🎫 Módulo de Tour

### Gestión de Tours

```
Menú → Tour → Gestión de Tours
```

### 1. Crear un Nuevo Tour

**Paso 1: Información Básica**

1. **Nombre del Tour:**
   - Ejemplo: "Tour Chicoj Natural"

2. **Fecha del Tour:**
   - Selecciona en el calendario
   - Solo fechas futuras permitidas

3. **Hora de Inicio:**
   - Formato 24 horas (ej: 09:00)

**Paso 2: Detalles del Servicio**

1. **Precio por Persona:**
   - Ingresa el precio en Quetzales
   - Solo números positivos
   - Valida automáticamente

2. **Cantidad de Personas:**
   - Mínimo: 1 persona
   - Solo números enteros
   - No permite números negativos

**Paso 3: Información de Contacto**

1. **Nombre del Cliente:**
   - Nombre completo del responsable

2. **Teléfono:**
   - Formato: 0000-0000

3. **Email (opcional):**
   - Para enviar confirmación

**Paso 4: Observaciones**

- Notas especiales
- Requerimientos del grupo
- Alergias o restricciones

**Paso 5: Guardar**

1. Click en **"Guardar Tour"**
2. Se calcula automáticamente: **Total = Precio × Cantidad**
3. Recibe confirmación de éxito

### 2. Ver Tours Programados

```
Menú → Tour → Control de Tours
```

**Tabla de tours:**

| Fecha | Tour | Personas | Precio Total | Estado | Acciones |
|-------|------|----------|--------------|--------|----------|
| 10/11/25 | Tour Natural | 15 | Q750 | Confirmado | ✏️ 🗑️ |

**Filtros disponibles:**
- Por fecha
- Por estado (Pendiente, Confirmado, Completado, Cancelado)
- Por nombre de tour

### 3. Editar Tour

1. Click en el ícono **✏️** (editar)
2. Modifica los campos necesarios
3. Click en **"Actualizar"**

### 4. Cancelar Tour

1. Click en el ícono **🗑️** (eliminar)
2. Confirma la cancelación
3. Se marca como "Cancelado" (no se elimina)

### 5. Exportar Reportes

**Exportar a Excel:**
1. Click en **"Exportar Excel"**
2. Se descarga archivo `.xlsx` con todos los tours

**Exportar a PDF:**
1. Click en **"Exportar PDF"**
2. Se genera reporte formateado con tabla completa

---

## ⚙️ Módulo de Administración

**⚠️ Acceso exclusivo para Administradores y Gerentes**

### 1. Gestión de Usuarios

```
Menú → Administración → Control de Usuarios
```

#### Agregar Nuevo Usuario

1. Click en **"Agregar Usuario"**
2. **Selecciona Empleado:**
   - Dropdown con empleados sin usuario
3. **Asignar Rol:**
   - Selecciona el rol apropiado
4. **Crear Usuario:**
   - Formato: primera letra del nombre + apellido (ej: jperez)
   - No números consecutivos
   - No solo números
5. **Contraseña:**
   - Mínimo 8 caracteres
   - Debe incluir: mayúscula, minúscula, número, símbolo
   - Indicador de fortaleza en tiempo real
   - **No se permite copiar/pegar**
6. **Repetir Contraseña:**
   - Debe coincidir con la primera
   - **No se permite pegar**

#### Ver Usuarios Activos

Tabla con:
- Usuario
- Rol
- Fecha de creación
- Último acceso
- Estado (Activo/Inactivo)

#### Eliminar Usuario

1. Click en **"🗑️ Eliminar"**
2. Confirma en el modal personalizado
3. El usuario se desactiva (no se elimina)

### 2. Gestión de Empleados

```
Menú → Administración → Control de Empleados
```

#### Agregar Empleado

1. Click en **"Agregar Empleado"**
2. **Información Personal:**
   - Nombre completo
   - DPI (validación de formato)
   - Teléfono
   - Email (único en el sistema)
3. **Información Laboral:**
   - Puesto
   - Fecha de contratación
   - Salario
4. Click en **"Guardar"**

#### Editar Empleado

1. Click en **"✏️ Editar"**
2. Modifica los campos
3. Click en **"Actualizar"**

#### Ver Lista de Empleados

**Tabla con:**
- Nombre
- DPI
- Puesto
- Teléfono
- Email
- Acciones

**Validaciones automáticas:**
- ✅ Email único (no duplicados)
- ✅ DPI válido
- ✅ Teléfono en formato correcto

### 3. Gestión de Platillos

```
Menú → Administración → Control de Platillos
```

#### Agregar Platillo

1. Click en **"Agregar Platillo"**
2. **Información del Platillo:**
   - Nombre
   - Descripción
   - Precio (solo números positivos)
3. **Categoría:**
   - Selecciona una categoría existente
4. **Área de Preparación:**
   - Cocina
   - Bebidas
   - Coffee
5. **Estado:**
   - Disponible
   - No disponible
6. **Imagen (opcional):**
   - Sube una foto del platillo
7. Click en **"Guardar"**

#### Ver Platillos

**Tabla con:**
- Imagen
- Nombre
- Categoría
- Área
- Precio
- Estado
- Acciones

**Filtros:**
- Por categoría
- Por área
- Por disponibilidad

#### Editar Platillo

1. Click en **"✏️ Editar"**
2. Modifica campos necesarios
3. Click en **"Actualizar"**

#### Deshabilitar Platillo

1. Click en **"❌ Deshabilitar"**
2. El platillo no aparece en el menú de meseros
3. Puedes reactivarlo después

### 4. Gestión de Categorías

```
Menú → Administración → Gestión de Categorías
```

#### Agregar Categoría

1. Click en **"Nueva Categoría"**
2. Ingresa el nombre (ej: Desayuno, Almuerzo, Cena, Bebidas)
3. Descripción (opcional)
4. Click en **"Guardar"**

#### Ver Categorías

**Lista con:**
- Nombre
- Cantidad de platillos
- Fecha de creación
- Acciones

#### Editar Categoría

1. Click en **"✏️ Editar"**
2. Modifica el nombre/descripción
3. Click en **"Actualizar"**

#### Eliminar Categoría

⚠️ **IMPORTANTE:**
- No puedes eliminar una categoría con platillos asignados
- Primero reasigna los platillos a otra categoría
- Luego elimina la categoría vacía

### 5. Gestión de Roles

```
Menú → Administración → Gestión de Roles
```

#### Agregar Rol

1. Click en **"Nuevo Rol"**
2. Nombre del rol
3. Descripción
4. **Permisos:**
   - ☑️ Ver comandas
   - ☑️ Crear comandas
   - ☑️ Editar comandas
   - ☑️ Acceso a KDS
   - ☑️ Acceso a caja
   - ☑️ Acceso a reportes
   - ☑️ Acceso a administración
5. Click en **"Guardar"**

#### Ver Roles

**Lista con:**
- Nombre
- Descripción
- Cantidad de usuarios con ese rol
- Acciones

#### Editar Rol

1. Click en **"✏️ Editar"**
2. Modifica permisos
3. Click en **"Actualizar"**

⚠️ **No puedes eliminar roles predeterminados:** Administrador, Gerente, Mesero, Cocina, Cajero

### 6. Reportes

```
Menú → Administración → Reportes
```

#### Tipos de Reportes

**1. Ventas por Período:**
- Selecciona fecha inicio y fin
- Ver gráficas de ventas
- Exportar a PDF/Excel

**2. Platillos Más Vendidos:**
- Top 10 platillos
- Gráfico de barras
- Cantidad y monto total

**3. Rendimiento por Mesero:**
- Cantidad de comandas por mesero
- Promedio de venta
- Tiempo promedio de atención

**4. Tours Realizados:**
- Tours completados
- Ingresos por tours
- Personas atendidas

**5. Cierre de Caja:**
- Por fecha
- Por cajero
- Desglose de métodos de pago

#### Exportar Reportes

**PDF:**
1. Configura filtros
2. Click en **"Exportar PDF"**
3. Se genera con gráficas y tablas

**Excel:**
1. Configura filtros
2. Click en **"Exportar Excel"**
3. Datos en formato `.xlsx` para análisis

---

## ❓ Preguntas Frecuentes

### General

**P: ¿Qué navegador debo usar?**  
R: Recomendamos Google Chrome, Firefox o Microsoft Edge actualizados.

**P: ¿Puedo usar el sistema en tablet o celular?**  
R: Sí, el sistema es responsive y funciona en dispositivos móviles.

**P: ¿Necesito internet?**  
R: Sí, el sistema requiere conexión a internet para funcionar.

### Login y Seguridad

**P: Olvidé mi contraseña, ¿qué hago?**  
R: Usa la opción "¿Olvidaste tu contraseña?" en el login o contacta al administrador.

**P: ¿Por qué me bloquea después de varios intentos?**  
R: Por seguridad, después de 5 intentos fallidos el sistema bloquea por 15 minutos.

**P: ¿Puedo cambiar mi contraseña?**  
R: Sí, en tu perfil de usuario o solicita al administrador.

### Mesero

**P: ¿Puedo editar una comanda después de enviarla?**  
R: Sí, pero solo los platillos que NO hayan sido preparados en cocina.

**P: ¿Qué hago si me equivoqué de mesa?**  
R: Edita la comanda y cambia el número de mesa antes de que cocina la prepare.

**P: ¿Puedo agregar platillos a una comanda existente?**  
R: Sí, edita la comanda y agrega los nuevos platillos.

**P: ¿Por qué no puedo cerrar una cuenta?**  
R: Porque hay platillos pendientes en cocina. Espera a que todos estén preparados.

### KDS/Cocina

**P: ¿Con qué frecuencia se actualiza el KDS?**  
R: Automáticamente cada 5 segundos.

**P: ¿Qué hago si una comanda lleva mucho tiempo?**  
R: Avisa al mesero o gerente. El sistema marca en rojo las comandas de más de 10 minutos.

**P: ¿Puedo desmarcar un platillo que marqué por error?**  
R: No desde el KDS. Contacta al administrador para revertir.

**P: ¿Las otras áreas ven mis comandas?**  
R: No, cada área (Cocina, Bebidas, Coffee) solo ve sus propios platillos.

### Caja

**P: ¿Puedo modificar el total de una cuenta?**  
R: No, el total se calcula automáticamente. Si hay error, edita la comanda.

**P: ¿Cómo anulo una venta?**  
R: Contacta al administrador con permiso especial.

**P: ¿Dónde veo el historial de ventas del día?**  
R: En la sección "Cierre de Caja" o en Reportes.

### Tour

**P: ¿Puedo editar un tour después de crearlo?**  
R: Sí, desde el Control de Tours.

**P: ¿Qué pasa si cancelo un tour?**  
R: Se marca como cancelado pero queda en el historial.

**P: ¿Cómo envío confirmación al cliente?**  
R: Exporta el PDF del tour y envíalo por email.

### Administración

**P: ¿Puedo eliminar un usuario?**  
R: Los usuarios se desactivan, no se eliminan, para mantener historial.

**P: ¿Cómo restablezco la contraseña de un usuario?**  
R: Edita el usuario y asigna una contraseña temporal.

**P: ¿Puedo tener dos platillos con el mismo nombre?**  
R: No es recomendado, pero el sistema lo permite si son de áreas diferentes.

---

## 🔧 Solución de Problemas

### No puedo iniciar sesión

**Problema:** Usuario o contraseña incorrectos  
**Solución:**
1. Verifica que Caps Lock esté desactivado
2. Confirma tu usuario con el administrador
3. Si olvidaste la contraseña, usa "Recuperar contraseña"

**Problema:** Cuenta bloqueada  
**Solución:**
1. Espera 15 minutos
2. O contacta al administrador para desbloquear

### La página no carga o se ve mal

**Problema:** Diseño antiguo o elementos no se ven  
**Solución:**
1. Presiona `Ctrl + Shift + R` (recarga forzada)
2. Borra el caché del navegador
3. Cierra y abre el navegador
4. Verifica tu conexión a internet

**Problema:** Botones no funcionan  
**Solución:**
1. Recarga la página (F5)
2. Revisa la consola del navegador (F12)
3. Contacta soporte técnico

### KDS no se actualiza

**Problema:** No aparecen nuevas comandas  
**Solución:**
1. Verifica tu conexión a internet
2. Recarga la página (F5)
3. Confirma que estás en el área correcta (cocina/bebidas/coffee)

**Problema:** Comandas duplicadas  
**Solución:**
1. Recarga la página
2. No marques platillos duplicados
3. Reporta al administrador

### No puedo agregar platillos a una comanda

**Problema:** Botón "+" no responde  
**Solución:**
1. Verifica que el platillo esté disponible
2. Recarga la página
3. Intenta desde otro navegador

**Problema:** Platillos bloqueados (🔒)  
**Solución:**
- Los platillos con candado ya están preparados en cocina
- No se pueden modificar por seguridad
- Si necesitas cambiar, contacta a cocina y al administrador

### Error al cerrar cuenta en caja

**Problema:** "No puedes cerrar esta cuenta"  
**Solución:**
1. El sistema te muestra qué platillos faltan
2. Espera a que cocina los termine
3. Luego intenta cerrar de nuevo

**Problema:** Total incorrecto  
**Solución:**
1. Verifica los precios en Gestión de Platillos
2. Edita la comanda si hay platillos incorrectos
3. Contacta al administrador si el error persiste

### Exportación falla

**Problema:** PDF o Excel no se descarga  
**Solución:**
1. Desactiva bloqueador de pop-ups
2. Permite descargas en tu navegador
3. Verifica espacio en disco
4. Intenta con otro navegador

### Notificaciones no aparecen

**Problema:** No veo mensajes de confirmación  
**Solución:**
1. Verifica que no estén bloqueadas las notificaciones
2. Recarga la página
3. Revisa la esquina superior derecha

---

## 📞 Contacto y Soporte

### Información de Contacto

📍 **Dirección:**  
Restaurante Chicoj  
[Tu dirección aquí]

📞 **Teléfono:**  
5524 1831

📧 **Email:**  
correotourchicoj@gmail.com

### Soporte Técnico

**Para problemas técnicos:**
- Contacta al administrador del sistema
- Email de soporte: [email de soporte]
- Horario: Lunes a Domingo, 8:00 AM - 10:00 PM

### Reportar Bugs

Si encuentras un error:
1. Describe el problema detalladamente
2. Incluye capturas de pantalla si es posible
3. Indica qué estabas haciendo cuando ocurrió
4. Envía a: [email de soporte]

---

## 📚 Glosario

**Comanda:** Orden de pedido de una mesa  
**KDS:** Kitchen Display System - Pantalla de cocina  
**Área:** Zona de preparación (Cocina, Bebidas, Coffee)  
**Modal:** Ventana emergente de confirmación  
**Toast:** Notificación temporal en pantalla  
**Cache:** Archivos temporales del navegador  
**Rol:** Tipo de usuario con permisos específicos  
**CRUD:** Crear, Leer, Actualizar, Eliminar  
**API:** Interfaz de programación (backend)  
**Frontend:** Parte visual del sistema  
**Backend:** Servidor y lógica del sistema  

---

## 📖 Historial de Versiones

### Versión 2.0 (Noviembre 2025)

✅ **Nuevas Funcionalidades:**
- Sistema de modales personalizados
- Validaciones robustas en formularios
- Seguridad mejorada (anti-brute force)
- KDS con auto-refresh de 5 segundos
- Sistema de platillos bloqueados
- Paleta de colores moderna
- Tablas con diseño profesional
- Tickets actualizados con información de contacto

🔧 **Mejoras:**
- Mejor rendimiento general
- Interfaz más intuitiva
- Notificaciones Toast mejoradas
- Exportación mejorada (PDF/Excel)
- Sistema responsive optimizado

🐛 **Correcciones:**
- Problemas de cache resueltos
- Sincronización KDS mejorada
- Validación de emails corregida
- Sistema de logout unificado

### Versión 1.0 (Octubre 2025)

✅ Primera versión estable del sistema

---

## ⚡ Atajos de Teclado

| Atajo | Función |
|-------|---------|
| `F5` | Recargar página |
| `Ctrl + Shift + R` | Recarga forzada (sin cache) |
| `F12` | Abrir herramientas de desarrollador |
| `Ctrl + S` | Guardar formulario (si está disponible) |
| `Esc` | Cerrar modal |
| `Tab` | Navegar entre campos |

---

## 🎓 Capacitación

### Para Nuevos Usuarios

**Meseros:**
1. Práctica con mesa de prueba
2. Crear 3 comandas de ejemplo
3. Editar una comanda
4. Revisar comandas activas

**Cocina:**
1. Familiarizarse con el KDS
2. Marcar platillos de prueba
3. Entender tiempos de alerta
4. Practicar lectura de notas

**Cajeros:**
1. Cobrar cuenta de prueba
2. Generar ticket
3. Practicar cambio de efectivo
4. Cierre de caja simulado

**Administradores:**
1. Crear usuario de prueba
2. Agregar platillo
3. Generar reportes
4. Gestionar categorías

---

## 📋 Lista de Verificación Diaria

### Inicio del Día

- [ ] Todos los usuarios pueden acceder al sistema
- [ ] KDS muestra correctamente en todas las áreas
- [ ] Impresora de tickets funcionando
- [ ] Platillos del menú disponibles actualizados
- [ ] Internet estable

### Durante el Servicio

- [ ] Monitorear KDS constantemente
- [ ] Revisar comandas pendientes
- [ ] Atender alertas de tiempo
- [ ] Verificar totales en caja

### Fin del Día

- [ ] Cerrar todas las comandas
- [ ] Realizar cierre de caja
- [ ] Generar reporte del día
- [ ] Verificar pendientes
- [ ] Cerrar sesión en todos los dispositivos

---

## 🌟 Mejores Prácticas

### Para Meseros

✅ Verifica número de mesa antes de enviar  
✅ Lee las notas del cliente a cocina  
✅ Revisa el estado en KDS antes de servir  
✅ Comunica cambios o problemas al supervisor  

### Para Cocina

✅ Marca terminado solo cuando esté listo  
✅ Lee TODAS las notas especiales  
✅ Mantén el área limpia para ver el KDS  
✅ Avisa si hay problemas de ingredientes  

### Para Cajeros

✅ Verifica el total antes de cobrar  
✅ Confirma método de pago con el cliente  
✅ Entrega ticket siempre  
✅ Cuenta el efectivo dos veces  

### Para Administradores

✅ Revisa reportes diariamente  
✅ Mantén actualizado el menú  
✅ Capacita a nuevos usuarios  
✅ Realiza respaldos semanales  

---

**🎉 ¡Gracias por usar el Sistema Chicoj!**

Para más información o soporte, contacta a:  
📧 correotourchicoj@gmail.com  
📞 5524 1831

---

*Manual creado: Noviembre 2025*  
*Versión: 2.0*  
*Sistema Chicoj - Todos los derechos reservados*

