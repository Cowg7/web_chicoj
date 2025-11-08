# 📖 MANUAL DE USUARIO
## Sistema de Gestión - Restaurante Chicoj

**Versión 1.0 - 2025**

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Roles y Permisos](#roles-y-permisos)
4. [Módulo de Meseros](#módulo-de-meseros)
5. [Módulo de Cocina (KDS)](#módulo-de-cocina-kds)
6. [Módulo de Caja](#módulo-de-caja)
7. [Módulo de Tours](#módulo-de-tours)
8. [Módulo de Reportes](#módulo-de-reportes)
9. [Módulo de Administración](#módulo-de-administración)
10. [Solución de Problemas](#solución-de-problemas)

---

## 1. Introducción

### ¿Qué es el Sistema Chicoj?

El Sistema de Gestión Restaurante Chicoj es una plataforma digital integral diseñada para optimizar y automatizar los procesos operativos del restaurante, coffee shop y Coffee Tour de la Cooperativa Agrícola Integral Chicoj, R.L.

### Características Principales

- ✅ **Gestión de Órdenes en Tiempo Real**: Control completo del flujo de pedidos desde la toma hasta el cobro
- ✅ **Sistema KDS (Kitchen Display System)**: Pantallas de cocina por área (Cocina, Bebidas, Coffee)
- ✅ **Control de Caja**: Procesamiento de pagos y generación de comprobantes
- ✅ **Gestión de Tours**: Registro y control de reservas de Coffee Tours
- ✅ **Reportes y Estadísticas**: Análisis de ventas, platillos más vendidos, horas pico
- ✅ **Administración de Usuarios**: Control de acceso basado en roles (RBAC)
- ✅ **Responsive Design**: Funciona en computadoras, tablets y smartphones

### Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express, Prisma ORM
- **Base de Datos**: PostgreSQL
- **Contenedores**: Docker, Docker Compose

---

## 2. Acceso al Sistema

### 2.1 URL de Acceso

Para acceder al sistema, abra su navegador web (Chrome, Firefox, Edge) y navegue a:

```
http://localhost
```

O la URL proporcionada por el administrador del sistema.

### 2.2 Pantalla de Login

![Pantalla de Login](./imgs/login-screen.png)

La pantalla de login consta de:
1. **Campo Usuario**: Ingrese su nombre de usuario
2. **Campo Contraseña**: Ingrese su contraseña
3. **Botón Ingresar**: Click para acceder al sistema
4. **Link "¿Olvidaste tu contraseña?"**: Para recuperación de contraseña

### 2.3 Credenciales Predeterminadas

El sistema viene con usuarios de prueba preconfigurados:

| Usuario | Contraseña | Rol | Vista Inicial |
|---------|------------|-----|---------------|
| `admin` | `admin123` | Administrador | Dashboard Principal |
| `gerente1` | `gerente123` | Gerente | Reportes |
| `cajero1` | `cajero123` | Cajero | Caja |
| `mesero1` | `mesero123` | Mesero | Comandas |
| `cocina1` | `cocina123` | Cocina | KDS Cocina |
| `bebidas1` | `bebidas123` | Bebidas | KDS Bebidas |
| `coffee1` | `coffee123` | Coffee | KDS Coffee |
| `tour1` | `tour123` | Tour | Gestión de Tours |

> ⚠️ **Importante**: Cambie estas contraseñas después del primer acceso por seguridad.

### 2.4 Cerrar Sesión

Para cerrar sesión de forma segura:
1. Haga click en el botón **"Cerrar sesión"** ubicado en la esquina superior derecha
2. Será redirigido automáticamente a la pantalla de login
3. Su sesión quedará completamente cerrada

---

## 3. Roles y Permisos

El sistema implementa un Control de Acceso Basado en Roles (RBAC). Cada usuario tiene acceso solo a las funcionalidades correspondientes a su rol.

### 3.1 Administrador

**Acceso**: ✅ Completo a todo el sistema

**Funcionalidades**:
- 📊 Dashboard principal con estadísticas generales
- 👥 Gestión de empleados (crear, editar, eliminar)
- 🔐 Gestión de usuarios y asignación de roles
- 🍽️ Gestión de platillos (CRUD completo)
- 📋 Visualización de todas las comandas
- 💰 Acceso a caja
- 📈 Reportes y estadísticas
- 🏞️ Gestión de tours
- 👨‍🍳 Acceso a todas las áreas del KDS

**Vista Inicial**: `/main.html`

### 3.2 Gerente

**Acceso**: ✅ Reportes y estadísticas únicamente

**Funcionalidades**:
- 📈 Reportes de ventas por período
- 📊 Estadísticas de platillos más vendidos
- ⏰ Análisis de horas pico
- 💵 Ingresos por área (Cocina, Bebidas, Coffee)
- 📉 Gráficas y análisis de tendencias

**Restricciones**: ❌ No puede acceder a caja, órdenes, KDS ni administración

**Vista Inicial**: `/templates/reportes/reportes.html`

### 3.3 Cajero

**Acceso**: ✅ Caja y reportes básicos

**Funcionalidades**:
- 💳 Procesar pagos (Efectivo, Tarjeta, Transferencia)
- 🧾 Generar comprobantes de pago
- 📋 Ver órdenes pendientes de pago (Estado: "En Caja")
- 📊 Ver historial del día
- 💰 Estadísticas de ventas del día
- 📈 Acceso a reportes básicos

**Restricciones**: ❌ No puede crear órdenes, acceder a KDS ni administración

**Vista Inicial**: `/templates/caja/caja.html`

### 3.4 Mesero

**Acceso**: ✅ Gestión de órdenes únicamente

**Funcionalidades**:
- ➕ Crear nuevas órdenes
- ✏️ Editar órdenes (antes de enviar o en preparación)
- ➕ Agregar/editar/eliminar platillos de la orden
- 📝 Agregar observaciones y extras a platillos
- 📤 Enviar órdenes a cocina
- 💰 Cerrar cuentas (cuando el cliente las solicita)
- 👀 Visualizar todas las órdenes activas
- 🔄 Ver el estado de las órdenes en tiempo real

**Restricciones**: ❌ No puede acceder a caja, reportes, KDS ni administración

**Vista Inicial**: `/templates/mesero/mesero_comanda.html`

### 3.5 Cocina (KDS)

**Acceso**: ✅ Solo KDS del área Cocina

**Funcionalidades**:
- 📺 Visualización de tickets de cocina en tiempo real
- ✅ Marcar platillos como "Preparado"
- 👀 Ver detalles: No. Orden, Mesa, Cantidad, Platillo, Observaciones, Extras
- 🔄 Auto-refresh cada 5 segundos
- 🔔 Notificaciones de nuevas órdenes

**Restricciones**: 
- ❌ Solo ve órdenes del área "Cocina"
- ❌ No puede acceder a Bebidas ni Coffee
- ❌ No puede acceder a caja, reportes ni administración

**Vista Inicial**: `/templates/cocina/cocina.html?area=Cocina`

### 3.6 Bebidas (KDS)

**Acceso**: ✅ Solo KDS del área Bebidas

**Funcionalidades**: (Iguales que Cocina, pero solo para área Bebidas)
- 📺 Visualización de tickets de bebidas
- ✅ Marcar bebidas como "Preparadas"
- 🔄 Auto-refresh cada 5 segundos

**Restricciones**: 
- ❌ Solo ve órdenes del área "Bebidas"
- ❌ No puede acceder a otras áreas

**Vista Inicial**: `/templates/cocina/cocina.html?area=Bebidas`

### 3.7 Coffee (KDS)

**Acceso**: ✅ Solo KDS del área Coffee

**Funcionalidades**: (Iguales que Cocina, pero solo para área Coffee)
- 📺 Visualización de tickets del coffee shop
- ✅ Marcar productos de coffee como "Preparados"
- 🔄 Auto-refresh cada 5 segundos

**Restricciones**: 
- ❌ Solo ve órdenes del área "Coffee"
- ❌ No puede acceder a otras áreas

**Vista Inicial**: `/templates/cocina/cocina.html?area=Coffee`

### 3.8 Tour

**Acceso**: ✅ Gestión de tours únicamente

**Funcionalidades**:
- ➕ Registrar nuevas reservas de tour
- ✏️ Editar información de tours
- 👥 Gestionar tipos de visitantes (Adultos, Niños, Tercera Edad)
- 🗣️ Especificar idioma del tour
- 📅 Control de fechas y horarios
- 👀 Visualizar tours programados

**Restricciones**: ❌ No puede acceder a órdenes, caja, reportes ni administración

**Vista Inicial**: `/templates/tour/tour.html`

---

## 4. Módulo de Meseros

### 4.1 Crear una Nueva Orden

#### Paso 1: Acceder al Módulo de Comandas

1. Inicie sesión con credenciales de mesero (`mesero1` / `mesero123`)
2. Será redirigido automáticamente a la vista de **Toma de Orden**

#### Paso 2: Ingresar Datos de la Orden

![Formulario de Nueva Orden](./imgs/mesero-nueva-orden.png)

1. **Seleccionar Mesa**:
   - Click en el campo "Mesa"
   - Seleccione el número de mesa (1-30)
   - ✅ Solo puede seleccionar mesas disponibles

2. **Agregar Platillos**:
   
   a. **Seleccionar Área**:
      - Click en el desplegable "Área"
      - Opciones: Cocina, Bebidas, Coffee
   
   b. **Seleccionar Platillo**:
      - El desplegable se actualizará con los platillos del área seleccionada
      - Seleccione el platillo deseado
      - El precio se mostrará automáticamente
   
   c. **Especificar Cantidad**:
      - Ingrese la cantidad deseada
      - Mínimo: 1
   
   d. **Agregar Observaciones** (Opcional):
      - Ej: "Sin cebolla", "Término medio", "Extra picante"
   
   e. **Agregar Extras** (Opcional):
      - Descripción del extra: "Queso extra", "Aguacate"
      - Precio del extra: Ingrese el monto adicional

3. **Agregar el Platillo**:
   - Click en el botón **"+ Agregar Platillo"**
   - El platillo aparecerá en la lista de "Platillos Agregados"

#### Paso 3: Revisar y Editar Platillos

![Lista de Platillos Agregados](./imgs/mesero-platillos-agregados.png)

En la sección "Platillos Agregados" puede:

- 👀 **Ver todos los platillos**: Nombre, Cantidad, Precio, Observaciones, Extras
- ✏️ **Editar un platillo**: Click en el botón "✏️ Editar"
- ❌ **Eliminar un platillo**: Click en el botón "🗑️ Eliminar"
- 💰 **Ver el Total**: Se calcula automáticamente (platillos + extras)

#### Paso 4: Enviar la Orden a Cocina

1. Revise que todos los datos sean correctos
2. Click en el botón **"Enviar a Cocina"** (botón verde grande)
3. La orden cambiará a estado **"En Preparación"**
4. La orden aparecerá en las pantallas KDS correspondientes

> ✅ **Confirmación**: Verá un mensaje de éxito "Orden creada exitosamente"

### 4.2 Visualizar Órdenes Activas

#### Acceso al Control de Comandas

1. Desde el menú principal, click en **"Control de Comandas"**
2. O navegue directamente a: `/templates/mesero/comanda-control.html`

![Control de Comandas](./imgs/mesero-control.png)

#### Filtros Disponibles

La vista de control ofrece múltiples filtros:

1. **Por Estado**:
   - Todas
   - Pendiente
   - En Preparación
   - Preparada
   - En Caja
   - Finalizada

2. **Por Fecha**:
   - Filtrar desde una fecha específica
   - Filtrar hasta una fecha específica

3. **Por Mesa**:
   - Seleccionar mesa específica (1-30)

4. **Por Área**:
   - Todas las áreas
   - Cocina
   - Bebidas
   - Coffee

#### Información Mostrada

Para cada orden verá:
- 🔢 **Número de Orden**
- 🪑 **Mesa**
- 📅 **Fecha y Hora**
- 📊 **Estado** (con badge de color)
- 💰 **Total**
- 🔘 **Acciones disponibles**

#### Acciones por Estado

Dependiendo del estado de la orden, puede:

**Estado "Pendiente"**:
- ✏️ Editar la orden
- 📤 Enviar a cocina
- ❌ Eliminar la orden

**Estado "En Preparación"**:
- 👀 Ver detalles
- ⏳ Esperar a que cocina termine

**Estado "Preparada"**:
- 💰 **Cerrar Cuenta** (Enviar a caja)
- 👀 Ver detalles

**Estado "En Caja"**:
- ⏳ Esperar a que caja procese el pago
- 👀 Ver detalles

**Estado "Finalizada"**:
- 👀 Ver detalles
- 📊 Consultar comprobante

### 4.3 Editar una Orden

#### Paso 1: Localizar la Orden

1. En "Control de Comandas", busque la orden que desea editar
2. La orden debe estar en estado **"Pendiente"** o **"En Preparación"**

#### Paso 2: Click en Editar

1. Click en el botón **"✏️ Editar"**
2. Será redirigido al formulario de edición

#### Paso 3: Modificar la Orden

Puede modificar:
- ➕ Agregar nuevos platillos
- ❌ Eliminar platillos existentes
- ✏️ Editar cantidades
- 📝 Modificar observaciones
- 💵 Agregar o quitar extras

#### Paso 4: Guardar Cambios

1. Click en **"💾 Actualizar Orden"**
2. Los cambios se reflejarán automáticamente en KDS
3. El total se recalculará

> ⚠️ **Nota**: No puede editar una orden que ya está en estado "En Caja" o "Finalizada"

### 4.4 Cerrar una Cuenta

#### ¿Cuándo cerrar una cuenta?

Cierre una cuenta cuando:
- ✅ El cliente solicita la cuenta
- ✅ Todos los platillos están preparados (Estado "Preparada")
- ✅ El cliente está listo para pagar

#### Paso 1: Verificar Estado

1. En "Control de Comandas", localice la orden
2. Verifique que el estado sea **"Preparada"** (badge verde)

#### Paso 2: Cerrar Cuenta

1. Click en el botón **"💰 Cerrar Cuenta"**
2. Confirme la acción
3. La orden cambiará a estado **"En Caja"**

> ✅ La orden ahora aparecerá en la vista del **Cajero** para procesar el pago

### 4.5 Consejos y Mejores Prácticas

#### ✅ Hacer

- ✅ Verificar la mesa antes de crear la orden
- ✅ Revisar los platillos agregados antes de enviar a cocina
- ✅ Usar observaciones para especificaciones del cliente
- ✅ Agregar extras cuando el cliente lo solicite
- ✅ Cerrar la cuenta solo cuando el cliente la solicite

#### ❌ No Hacer

- ❌ No enviar órdenes vacías (sin platillos)
- ❌ No cerrar cuentas sin verificar que todo esté preparado
- ❌ No eliminar órdenes sin verificar con el supervisor
- ❌ No modificar órdenes que ya están en caja

---

## 5. Módulo de Cocina (KDS)

### 5.1 ¿Qué es el KDS?

**KDS (Kitchen Display System)** es el sistema de pantallas de cocina que muestra las órdenes en tiempo real. Cada área (Cocina, Bebidas, Coffee) tiene su propia pantalla y solo ve sus propios tickets.

### 5.2 Acceso al KDS

#### Para Personal de Cocina

1. Inicie sesión con:
   - Usuario: `cocina1` / Contraseña: `cocina123`
2. Será redirigido automáticamente al KDS del área **Cocina**

#### Para Personal de Bebidas

1. Inicie sesión con:
   - Usuario: `bebidas1` / Contraseña: `bebidas123`
2. Será redirigido al KDS del área **Bebidas**

#### Para Personal de Coffee Shop

1. Inicie sesión con:
   - Usuario: `coffee1` / Contraseña: `coffee123`
2. Será redirigido al KDS del área **Coffee**

### 5.3 Interfaz del KDS

![KDS Interface](./imgs/kds-pantalla.png)

La pantalla del KDS muestra:

1. **Header**:
   - Nombre del área (ej: "🍳 KDS - Cocina")
   - Botón "Inicio"
   - Botón "Cerrar sesión"

2. **Contador de Tickets**:
   - Número total de tickets pendientes
   - Se actualiza en tiempo real

3. **Grid de Tickets**:
   - Cada ticket en una card individual
   - Colores según prioridad/tiempo
   - Auto-refresh cada 5 segundos

### 5.4 Anatomía de un Ticket

Cada ticket muestra:

```
┌─────────────────────────────────┐
│  ORDEN #123        Mesa: 5      │
│  ⏰ Hace 5 minutos              │
├─────────────────────────────────┤
│  🍽️ Pollo Asado    x 2         │
│  📝 Término medio               │
│  🌟 Extra: Papas fritas (Q10)   │
│                                 │
│  [✅ Terminar]                  │
└─────────────────────────────────┘
```

**Información del Ticket**:
- 🔢 **Número de Orden**: Identificador único
- 🪑 **Mesa**: Número de mesa del cliente
- ⏰ **Tiempo**: Hace cuánto se creó la orden
- 🍽️ **Platillo**: Nombre y cantidad
- 📝 **Observaciones**: Especificaciones del cliente
- 🌟 **Extras**: Ingredientes adicionales con precio
- 🔘 **Botón "Terminar"**: Para marcar como preparado

### 5.5 Preparar un Platillo

#### Paso 1: Identificar el Ticket

1. Los tickets se ordenan por **tiempo** (más antiguos primero)
2. Puede haber **colores diferentes**:
   - 🟢 Verde: Ticket reciente (< 10 min)
   - 🟡 Amarillo: Ticket en proceso (10-20 min)
   - 🔴 Rojo: Ticket urgente (> 20 min)

#### Paso 2: Leer la Información

1. Verifique el **número de orden** y **mesa**
2. Lea el **platillo** y **cantidad**
3. Preste atención a las **observaciones**
4. No olvide los **extras** si los hay

#### Paso 3: Preparar el Platillo

1. Prepare el platillo según las especificaciones
2. Incluya todos los extras solicitados
3. Asegúrese de que cumpla con los estándares de calidad

#### Paso 4: Marcar como Preparado

1. Una vez listo el platillo, click en el botón **"✅ Terminar"**
2. El ticket desaparecerá de su pantalla
3. El contador de tickets pendientes se actualizará

> 🔄 **Auto-actualización**: La pantalla se actualiza automáticamente cada 5 segundos

### 5.6 Órdenes con Múltiples Platillos

Cuando una orden tiene platillos de diferentes áreas:

**Ejemplo**:
- Mesa 5 ordena:
  - 2x Pollo Asado (Cocina)
  - 1x Cerveza (Bebidas)
  - 1x Cappuccino (Coffee)

**¿Qué verá cada área?**

- **Cocina**: Solo verá "2x Pollo Asado"
- **Bebidas**: Solo verá "1x Cerveza"
- **Coffee**: Solo verá "1x Cappuccino"

**¿Cuándo se marca como "Preparada"?**

La orden completa se marca como **"Preparada"** automáticamente cuando **todas las áreas** terminan sus respectivos platillos.

### 5.7 Notificaciones

El KDS incluye notificaciones:

- 🔔 **Sonido**: Cuando llega una nueva orden
- 💬 **Toast notification**: Mensaje temporal en pantalla
- 🔴 **Badge**: Contador de tickets pendientes

### 5.8 Consejos para Personal de Cocina

#### ✅ Hacer

- ✅ Mantener la pantalla visible en todo momento
- ✅ Priorizar tickets más antiguos (arriba)
- ✅ Leer completamente las observaciones
- ✅ Marcar como "Terminado" solo cuando esté listo
- ✅ Comunicarse con otras áreas si hay demora

#### ❌ No Hacer

- ❌ No marcar como terminado antes de tiempo
- ❌ No ignorar las observaciones del cliente
- ❌ No olvidar los extras
- ❌ No cerrar sesión durante el servicio

---

## 6. Módulo de Caja

### 6.1 Acceso al Módulo de Caja

1. Inicie sesión con credenciales de cajero:
   - Usuario: `cajero1`
   - Contraseña: `cajero123`
2. Será redirigido automáticamente a la vista de **Caja**

### 6.2 Interfaz de Caja

![Vista de Caja](./imgs/caja-principal.png)

La interfaz consta de:

1. **Header**:
   - Logo y nombre "Restaurante Chicoj"
   - Botones de navegación

2. **Estadísticas del Día**:
   - 💰 Total Ventas
   - 📋 Órdenes Procesadas
   - ⏱️ Promedio por Orden

3. **Pestañas**:
   - **Órdenes Pendientes**: Órdenes listas para cobrar
   - **Historial del Día**: Órdenes ya cobradas

### 6.3 Procesar un Pago

#### Paso 1: Verificar Órdenes Pendientes

1. En la pestaña **"Órdenes Pendientes"**, verá todas las órdenes en estado "En Caja"
2. La tabla muestra:
   - 🔢 Orden No.
   - 🪑 Mesa
   - ⏰ Hora
   - 📋 Platillos
   - 💰 Total
   - 🔘 Acción

![Órdenes Pendientes](./imgs/caja-pendientes.png)

#### Paso 2: Iniciar el Cobro

1. Localice la orden que desea cobrar
2. Click en el botón **"💳 Cobrar"**
3. Se abrirá el **Modal de Pago**

#### Paso 3: Modal de Pago

![Modal de Pago](./imgs/caja-modal-pago.png)

El modal muestra:

**Información de la Orden**:
- Orden No.
- Mesa
- Total a pagar

**Formulario de Pago**:

1. **Método de Pago** (requerido):
   - 💵 Efectivo
   - 💳 Tarjeta
   - 🏦 Transferencia

2. **Monto Recibido** (requerido):
   - Ingrese el monto que el cliente entrega
   - Para Tarjeta/Transferencia: Ingrese el total exacto

3. **Cambio** (automático):
   - Se calcula automáticamente
   - Solo para pagos en Efectivo
   - Ejemplo: Total Q100, Recibido Q150 → Cambio Q50

4. **NIT** (opcional):
   - Ingrese el NIT si el cliente lo solicita
   - Formato: 12345678-9
   - Puede dejarse en blanco (C/F)

#### Paso 4: Finalizar el Pago

1. Verifique que todos los datos sean correctos
2. Click en el botón **"✅ Finalizar Pago"** (verde)
3. La orden cambiará a estado **"Finalizada"**
4. Se generará automáticamente el comprobante

> ✅ **Confirmación**: Verá un mensaje "Pago procesado exitosamente"

#### Paso 5: Entregar el Comprobante

1. El sistema generará un comprobante digital
2. Puede imprimirlo o enviarlo por correo
3. Entregue el cambio (si aplica)

### 6.4 Consultar Historial del Día

#### Pestaña "Historial del Día"

1. Click en la pestaña **"Historial del Día"**
2. Verá todas las órdenes finalizadas del día actual

![Historial del Día](./imgs/caja-historial.png)

**Información mostrada**:
- Orden No.
- Mesa
- Hora de Pago
- Método de Pago
- Total
- Cajero que procesó

**Acciones disponibles**:
- 👀 **Ver Detalles**: Muestra información completa de la orden
- 🖨️ **Reimprimir**: Genera nuevamente el comprobante

### 6.5 Estadísticas de Ventas

En la parte superior de la vista, verá estadísticas en tiempo real:

**Total Ventas del Día**:
- Suma de todas las órdenes finalizadas
- Ejemplo: Q 5,450.00

**Órdenes Procesadas**:
- Número total de órdenes cobradas
- Ejemplo: 42 órdenes

**Promedio por Orden**:
- Ticket promedio
- Ejemplo: Q 129.76

### 6.6 Métodos de Pago

#### Efectivo 💵

**Flujo**:
1. Cliente entrega efectivo
2. Usted ingresa el monto recibido
3. Sistema calcula el cambio
4. Usted entrega el cambio al cliente

**Ejemplo**:
- Total: Q 85.50
- Recibido: Q 100.00
- **Cambio: Q 14.50** ✅

#### Tarjeta 💳

**Flujo**:
1. Cliente paga con tarjeta (Visa, MasterCard, etc.)
2. Procese el pago en la terminal bancaria
3. Ingrese el monto exacto en el sistema
4. No hay cambio

**Ejemplo**:
- Total: Q 245.00
- Recibido: Q 245.00
- **Cambio: Q 0.00** ✅

#### Transferencia 🏦

**Flujo**:
1. Cliente realiza transferencia bancaria
2. Verifique la transferencia en su app bancaria
3. Ingrese el monto exacto en el sistema
4. No hay cambio

**Ejemplo**:
- Total: Q 189.75
- Recibido: Q 189.75
- **Cambio: Q 0.00** ✅

### 6.7 Manejo de NIT

#### ¿Cuándo solicitar NIT?

- ✅ Si el cliente lo solicita para factura
- ✅ Si el monto es mayor a Q 2,500 (según política)
- ✅ Si es un cliente corporativo

#### ¿Cómo registrarlo?

1. En el campo "NIT", ingrese el número
2. Formato: `12345678-9` o `CF` (Consumidor Final)
3. Valide que el formato sea correcto

### 6.8 Solución de Problemas Comunes

#### Problema: "El cambio no se calcula"

**Solución**:
1. Verifique que el "Método de Pago" sea "Efectivo"
2. Asegúrese de que el monto recibido sea mayor al total
3. El campo "Cambio" se actualiza automáticamente

#### Problema: "No puedo finalizar el pago"

**Solución**:
1. Verifique que el método de pago esté seleccionado
2. Verifique que el monto recibido sea válido
3. Para Tarjeta/Transferencia: Monto = Total

#### Problema: "Necesito cancelar un pago"

**Solución**:
1. Click en el botón "❌ Cancelar" en el modal
2. La orden volverá al estado "En Caja"
3. Puede procesarla nuevamente

### 6.9 Consejos y Mejores Prácticas

#### ✅ Hacer

- ✅ Verificar el total antes de cobrar
- ✅ Contar el efectivo recibido frente al cliente
- ✅ Contar el cambio frente al cliente
- ✅ Verificar transferencias antes de finalizar
- ✅ Ofrecer comprobante al cliente
- ✅ Mantener la caja organizada

#### ❌ No Hacer

- ❌ No finalizar pagos sin verificar el dinero
- ❌ No olvidar entregar el cambio
- ❌ No procesar pagos sin autorización
- ❌ No dejar la sesión abierta sin supervisión

---

## 7. Módulo de Tours

### 7.1 Acceso al Módulo de Tours

1. Inicie sesión con credenciales de tour:
   - Usuario: `tour1`
   - Contraseña: `tour123`
2. Será redirigido automáticamente a la vista de **Gestión de Tours**

### 7.2 Registrar un Nuevo Tour

#### Paso 1: Acceder al Formulario

1. En la vista principal, click en **"+ Nuevo Tour"**
2. Se mostrará el formulario de registro

![Formulario de Tour](./imgs/tour-formulario.png)

#### Paso 2: Datos del Tour

Complete los siguientes campos:

**1. Información Básica**:

- **Nombre del Visitante** (requerido):
  - Nombre completo del cliente o representante del grupo
  - Ejemplo: "Juan Pérez"

- **Fecha del Tour** (requerido):
  - Seleccione la fecha del tour
  - 📅 No puede seleccionar fechas pasadas
  - ⚠️ Limitado hasta la fecha actual

- **Hora** (requerido):
  - Seleccione la hora de inicio del tour
  - Horarios disponibles: 8:00 AM - 4:00 PM
  - Ejemplo: "10:00 AM"

**2. Idioma del Tour** (requerido):

Seleccione el idioma en el que se realizará el tour:
- 🇪🇸 Español
- 🇬🇧 Inglés
- 🇫🇷 Francés
- 🇩🇪 Alemán

**3. Tipos de Visitantes**:

Especifique la cantidad de visitantes por categoría:

- 👨 **Adultos**:
  - Precio: Q 100.00 por persona
  - Cantidad: Ingrese el número de adultos
  
- 👶 **Niños**:
  - Precio: Q 50.00 por niño
  - Cantidad: Ingrese el número de niños
  
- 👴 **Tercera Edad**:
  - Precio: Q 75.00 por persona
  - Cantidad: Ingrese el número de personas de tercera edad

**4. Servicios Adicionales** (opcional):

- **Almuerzo Incluido**:
  - ☑️ Marque la casilla si incluye almuerzo
  - Precio adicional: Q 60.00 por persona

- **Transporte**:
  - ☑️ Marque la casilla si requiere transporte
  - Precio adicional: Q 150.00 (grupal)

**5. Total del Tour** (automático):

El sistema calcula automáticamente el total sumando:
- Adultos × Q100
- Niños × Q50
- Tercera Edad × Q75
- Almuerzo (si aplica) × Número de personas
- Transporte (si aplica)

**Ejemplo de Cálculo**:
```
2 Adultos:     2 × Q100 = Q200
1 Niño:        1 × Q50  = Q50
Almuerzo:      3 × Q60  = Q180
Transporte:    1 × Q150 = Q150
─────────────────────────────
TOTAL:                   Q580
```

#### Paso 3: Registrar el Tour

1. Revise que todos los datos sean correctos
2. Click en el botón **"💾 Registrar Tour"**
3. El tour quedará registrado en el sistema

> ✅ **Confirmación**: "Tour registrado exitosamente"

### 7.3 Visualizar Tours Programados

#### Vista de Control de Tours

![Control de Tours](./imgs/tour-control.png)

1. Click en **"Control de Tours"** en el menú
2. Verá una lista de todos los tours programados

**Información mostrada**:
- 📅 Fecha
- ⏰ Hora
- 👤 Nombre del visitante
- 🗣️ Idioma
- 👥 Cantidad de personas (Adultos/Niños/Tercera Edad)
- 💰 Total
- 📊 Estado (Programado, Completado, Cancelado)

#### Filtros Disponibles

Puede filtrar los tours por:
- 📅 **Rango de fechas**: Desde - Hasta
- 🗣️ **Idioma**: Español, Inglés, Francés, Alemán
- 📊 **Estado**: Todos, Programados, Completados, Cancelados

### 7.4 Editar un Tour

#### Paso 1: Localizar el Tour

1. En "Control de Tours", busque el tour que desea editar
2. Solo puede editar tours con estado "Programado"

#### Paso 2: Modificar Datos

1. Click en el botón **"✏️ Editar"**
2. Modifique los campos necesarios
3. El total se recalculará automáticamente

#### Paso 3: Guardar Cambios

1. Click en **"💾 Actualizar"**
2. Los cambios se guardarán

> ⚠️ **Nota**: No puede editar tours que ya están "Completados"

### 7.5 Cancelar un Tour

Si un tour necesita ser cancelado:

1. Localice el tour en "Control de Tours"
2. Click en **"❌ Cancelar Tour"**
3. Confirme la acción
4. El estado cambiará a "Cancelado"

### 7.6 Marcar Tour como Completado

Cuando un tour finaliza:

1. Localice el tour en "Control de Tours"
2. Click en **"✅ Completar"**
3. El estado cambiará a "Completado"
4. El tour se archivará en el historial

### 7.7 Mejores Prácticas

#### ✅ Hacer

- ✅ Registrar tours con anticipación
- ✅ Verificar disponibilidad antes de confirmar
- ✅ Confirmar idioma con el cliente
- ✅ Preguntar por restricciones alimentarias (si incluye almuerzo)
- ✅ Actualizar el estado del tour puntualmente

#### ❌ No Hacer

- ❌ No registrar tours para fechas pasadas
- ❌ No olvidar confirmar con el cliente
- ❌ No mezclar idiomas en un mismo grupo
- ❌ No exceder la capacidad máxima del tour

---

## 8. Módulo de Reportes

### 8.1 Acceso al Módulo de Reportes

**Usuarios con acceso**:
- ✅ Administrador (`admin`)
- ✅ Gerente (`gerente1`)
- ✅ Cajero (`cajero1` - acceso limitado)

1. Inicie sesión con credenciales correspondientes
2. Navegue a **"Reportes"** en el menú

### 8.2 Interfaz de Reportes

![Vista de Reportes](./imgs/reportes-principal.png)

La vista consta de:

1. **Filtros de Período**
2. **Estadísticas Generales**
3. **Gráficas**
4. **Tablas de Datos**

### 8.3 Filtros de Período

#### Seleccionar Rango de Fechas

1. **Fecha Desde**: Fecha inicial del período
2. **Fecha Hasta**: Fecha final del período
3. Click en **"📊 Generar Reporte"**

**Opciones rápidas**:
- 📅 Hoy
- 📅 Esta Semana
- 📅 Este Mes
- 📅 Mes Anterior
- 📅 Personalizado

> 📌 **Importante**: No puede seleccionar fechas futuras

### 8.4 Estadísticas Generales

Una vez generado el reporte, verá:

#### Tarjetas de Estadísticas

**1. Total Ventas del Período**:
- 💰 Monto total en Quetzales
- 📈 Comparación con período anterior
- Ejemplo: "Q 45,890.50 (+12.5%)"

**2. Número de Órdenes**:
- 📋 Total de órdenes procesadas
- 📊 Promedio por día
- Ejemplo: "342 órdenes (12/día)"

**3. Ticket Promedio**:
- 💵 Promedio por orden
- 📉 Comparación con el mes anterior
- Ejemplo: "Q 134.18 (-2.3%)"

**4. Platillos Vendidos**:
- 🍽️ Número total de platillos
- 🏆 Top 3 más vendidos
- Ejemplo: "1,245 platillos"

### 8.5 Platillos Más Vendidos

#### Tabla de Top Platillos

![Top Platillos](./imgs/reportes-platillos.png)

Muestra:
1. **Posición** (1, 2, 3, ...)
2. **Nombre del Platillo**
3. **Área** (Cocina, Bebidas, Coffee)
4. **Cantidad Vendida**
5. **Total en Ventas** (Q)

**Ejemplo**:
| # | Platillo | Área | Cant. | Total |
|---|----------|------|-------|-------|
| 1 | Pollo Asado | Cocina | 156 | Q 12,480 |
| 2 | Cerveza Nacional | Bebidas | 203 | Q 5,075 |
| 3 | Cappuccino | Coffee | 187 | Q 4,675 |

### 8.6 Ventas por Área

#### Gráfica de Distribución

![Ventas por Área](./imgs/reportes-areas.png)

**Muestra**:
- 🔵 Cocina: Porcentaje y monto
- 🟢 Bebidas: Porcentaje y monto
- 🟡 Coffee: Porcentaje y monto

**Ejemplo**:
- Cocina: 60% (Q 27,534)
- Bebidas: 25% (Q 11,472)
- Coffee: 15% (Q 6,883)

### 8.7 Horas Pico

#### Gráfica de Ventas por Hora

![Horas Pico](./imgs/reportes-horas.png)

Muestra la distribución de ventas por hora del día:

**Ejemplo**:
```
8:00  ████░░░░░░  Q 1,250
9:00  ██████░░░░  Q 2,890
10:00 ████████░░  Q 4,120
11:00 ████████░░  Q 3,780
12:00 ██████████  Q 8,450  ← Hora pico
13:00 ██████████  Q 8,120
14:00 ████████░░  Q 3,560
15:00 ██████░░░░  Q 2,340
```

**Información útil**:
- 🏆 Hora con más ventas
- 📉 Hora con menos ventas
- ⏰ Mejores horarios para staffing

### 8.8 Métodos de Pago

#### Distribución de Métodos de Pago

![Métodos de Pago](./imgs/reportes-pagos.png)

Muestra cómo los clientes prefieren pagar:

**Ejemplo**:
- 💵 Efectivo: 65% (Q 29,828)
- 💳 Tarjeta: 28% (Q 12,849)
- 🏦 Transferencia: 7% (Q 3,213)

### 8.9 Exportar Reportes

#### Opciones de Exportación

En la parte superior de la vista, encontrará botones para exportar:

1. **📄 Exportar a PDF**:
   - Genera un documento PDF con todo el reporte
   - Incluye gráficas y tablas
   - Ideal para imprimir o compartir

2. **📊 Exportar a Excel**:
   - Genera un archivo .xlsx
   - Permite análisis adicional
   - Incluye todos los datos tabulados

3. **🖨️ Imprimir**:
   - Imprime directamente el reporte
   - Formato optimizado para papel

### 8.10 Reportes Personalizados

#### Crear Reporte Personalizado

1. En la sección "Reportes Personalizados", click en **"+ Nuevo"**
2. Seleccione los datos que desea incluir:
   - ☑️ Ventas totales
   - ☑️ Platillos más vendidos
   - ☑️ Horas pico
   - ☑️ Métodos de pago
   - ☑️ Ventas por mesero
   - ☑️ Ventas por área

3. Defina el período
4. Click en **"📊 Generar"**

### 8.11 Análisis y Toma de Decisiones

#### ¿Cómo usar los reportes?

**Para Gerentes**:
- 📊 Identificar platillos de bajo rendimiento
- 💰 Evaluar rentabilidad por área
- 👥 Planificar staffing según horas pico
- 📈 Analizar tendencias de ventas

**Para Administradores**:
- 💼 Tomar decisiones de menú
- 💵 Proyectar ingresos
- 🎯 Definir estrategias de marketing
- 📉 Detectar problemas operativos

**Para Cajeros**:
- 💰 Verificar cuadre de caja
- 📊 Consultar ventas del día
- 💳 Analizar métodos de pago más usados

---

## 9. Módulo de Administración

### 9.1 Acceso al Módulo de Administración

**Solo para**: Administrador (`admin` / `admin123`)

1. Inicie sesión con credenciales de administrador
2. Será redirigido al **Dashboard Principal**
3. Desde ahí puede acceder a todos los módulos de administración

### 9.2 Dashboard Principal

![Dashboard Admin](./imgs/admin-dashboard.png)

El dashboard muestra:

**Widgets de Acceso Rápido**:
- 👥 **Usuarios**: Gestión de usuarios del sistema
- 🧑‍🍳 **Empleados**: Gestión de empleados
- 🍽️ **Platillos**: Gestión del menú
- 📋 **Comandas**: Visualización de órdenes
- 💰 **Caja**: Acceso al módulo de caja
- 📊 **Reportes**: Estadísticas y análisis
- 🏞️ **Tours**: Gestión de tours

**Estadísticas del Dashboard**:
- Total de órdenes del día
- Ventas del día
- Usuarios activos
- Empleados registrados

### 9.3 Gestión de Empleados

#### 9.3.1 Ver Lista de Empleados

1. En el dashboard, click en **"👥 Empleados"**
2. O navegue a: `/templates/administracion/empleados_control.html`

![Lista de Empleados](./imgs/admin-empleados-lista.png)

**Información mostrada**:
- ID
- Nombre completo
- Edad
- Correo electrónico
- Acciones (Editar, Eliminar)

#### 9.3.2 Agregar Nuevo Empleado

**Paso 1**: Click en el botón **"+ Agregar Empleado"**

**Paso 2**: Complete el formulario:

![Formulario Empleado](./imgs/admin-empleado-form.png)

- **Nombre** (requerido): Nombre(s) del empleado
- **Apellidos** (requerido): Apellido(s) del empleado
- **Edad** (opcional): Edad en años
- **Correo Electrónico** (requerido): Email válido y único

**Validaciones**:
- ✅ Correo debe ser válido (formato email)
- ✅ Correo debe ser único (no repetido)
- ✅ Nombre y apellidos son obligatorios

**Paso 3**: Click en **"💾 Guardar"**

> ✅ El empleado quedará registrado en el sistema

#### 9.3.3 Editar un Empleado

1. En la lista de empleados, click en **"✏️ Editar"**
2. Modifique los datos necesarios
3. Click en **"💾 Actualizar"**

> ⚠️ **Nota**: El correo debe seguir siendo único

#### 9.3.4 Eliminar un Empleado

1. En la lista de empleados, click en **"🗑️ Eliminar"**
2. Confirme la eliminación

> ⚠️ **Restricción**: No puede eliminar un empleado que tiene un **usuario asignado**. Primero debe eliminar el usuario.

### 9.4 Gestión de Usuarios

#### 9.4.1 Ver Lista de Usuarios

1. En el dashboard, click en **"🔐 Usuarios"**
2. O navegue a: `/templates/administracion/control-usuarios.html`

![Lista de Usuarios](./imgs/admin-usuarios-lista.png)

**Información mostrada**:
- ID
- Empleado asociado
- Nombre de usuario (con @)
- Rol (con badge de color)
- Acciones (Editar, Eliminar)

**Colores de Roles**:
- 🔴 Rojo: Administrador
- 🔵 Azul: Gerente
- 🟢 Verde: Mesero
- 🟡 Amarillo: Cajero
- 🟠 Naranja: Cocina/Bebidas/Coffee
- 🟣 Morado: Tour

#### 9.4.2 Agregar Nuevo Usuario

**Paso 1**: Click en **"+ Agregar Usuario"**

**Paso 2**: Complete el formulario:

![Formulario Usuario](./imgs/admin-usuario-form.png)

- **Empleado** (requerido):
  - Seleccione de la lista de empleados **SIN usuario asignado**
  - Si no hay empleados disponibles, primero cree un empleado

- **Nombre de Usuario** (requerido):
  - Nombre único para login
  - Formato: Letras minúsculas y números
  - Ejemplo: `mesero2`, `cajero2`

- **Contraseña** (requerido):
  - Mínimo 6 caracteres
  - Debe incluir letras y números

- **Confirmar Contraseña** (requerido):
  - Debe coincidir con la contraseña

- **Rol** (requerido):
  - Seleccione el rol del usuario:
    - Administrador
    - Gerente
    - Cajero
    - Mesero
    - Cocina
    - Bebidas
    - Coffee
    - Tour

**Validaciones**:
- ✅ Nombre de usuario único
- ✅ Contraseña mínimo 6 caracteres
- ✅ Contraseñas deben coincidir
- ✅ Un empleado solo puede tener UN usuario

**Paso 3**: Click en **"💾 Crear Usuario"**

> ✅ El usuario podrá iniciar sesión inmediatamente

#### 9.4.3 Editar un Usuario

1. En la lista de usuarios, click en **"✏️ Editar"**
2. Puede modificar:
   - Nombre de usuario (si es único)
   - Rol
   - Contraseña (opcional)
3. Click en **"💾 Actualizar"**

#### 9.4.4 Eliminar un Usuario

1. En la lista de usuarios, click en **"🗑️ Eliminar"**
2. Confirme la eliminación

> 📌 **Nota**: Al eliminar un usuario, el **empleado NO se elimina**. El empleado queda disponible para asignarle un nuevo usuario.

### 9.5 Gestión de Platillos

#### 9.5.1 Ver Lista de Platillos

1. En el dashboard, click en **"🍽️ Platillos"**
2. O navegue a: `/templates/administracion/control-platillos.html`

![Lista de Platillos](./imgs/admin-platillos-lista.png)

**Información mostrada**:
- ID
- Nombre del platillo
- Área (Cocina, Bebidas, Coffee)
- Categoría
- Precio
- Disponibilidad (Disponible/No disponible)
- Acciones (Editar, Eliminar)

#### Filtros de Platillos

Puede filtrar por:
- 📂 **Área**: Todos, Cocina, Bebidas, Coffee
- 📋 **Categoría**: Entrada, Plato Fuerte, Postre, Bebida, etc.
- ✅ **Disponibilidad**: Todos, Disponibles, No disponibles

#### 9.5.2 Agregar Nuevo Platillo

**Paso 1**: Click en **"+ Agregar Platillo"**

**Paso 2**: Complete el formulario:

![Formulario Platillo](./imgs/admin-platillo-form.png)

- **Nombre** (requerido):
  - Nombre descriptivo del platillo
  - Ejemplo: "Pollo en Pepián"

- **Área** (requerido):
  - Cocina: Comidas calientes
  - Bebidas: Bebidas alcohólicas y no alcohólicas
  - Coffee: Productos del coffee shop

- **Categoría** (requerido):
  - Entrada
  - Plato Fuerte
  - Postre
  - Bebida Caliente
  - Bebida Fría
  - Bebida Alcohólica
  - Especialidad

- **Descripción** (opcional):
  - Breve descripción del platillo
  - Ingredientes principales
  - Ejemplo: "Pollo tierno en salsa de pepián con arroz"

- **Precio** (requerido):
  - Precio en Quetzales
  - Formato: 00.00
  - Ejemplo: 85.50

- **Disponible** (checkbox):
  - ☑️ Marcado: El platillo está disponible para ordenar
  - ☐ Desmarcado: El platillo no está disponible

**Paso 3**: Click en **"💾 Guardar Platillo"**

> ✅ El platillo aparecerá inmediatamente en el sistema de comandas

#### 9.5.3 Editar un Platillo

1. En la lista de platillos, click en **"✏️ Editar"**
2. Modifique los campos necesarios
3. Click en **"💾 Actualizar"**

**Casos de uso**:
- 💰 Cambiar el precio
- 📝 Actualizar la descripción
- ❌ Marcar como no disponible (temporalmente agotado)
- 📂 Cambiar de categoría

#### 9.5.4 Marcar Platillo como No Disponible

Cuando un platillo se agota temporalmente:

1. Localice el platillo en la lista
2. Click en **"✏️ Editar"**
3. Desmarque la casilla **"Disponible"**
4. Click en **"💾 Actualizar"**

> ⚠️ El platillo **NO aparecerá** en el formulario de comandas hasta que lo vuelva a marcar como disponible

#### 9.5.5 Eliminar un Platillo

1. En la lista de platillos, click en **"🗑️ Eliminar"**
2. Confirme la eliminación

> ⚠️ **Advertencia**: La eliminación es permanente. Si el platillo ya tiene órdenes asociadas, NO podrá eliminarse.

### 9.6 Gestión de Roles

#### 9.6.1 Ver Roles del Sistema

1. En el menú, click en **"🎭 Roles"**
2. Verá la lista de roles configurados

![Roles del Sistema](./imgs/admin-roles.png)

**Roles predeterminados**:
- 👑 Administrador
- 📊 Gerente
- 💰 Cajero
- 🧑‍🍳 Mesero
- 🍳 Cocina
- 🍹 Bebidas
- ☕ Coffee
- 🏞️ Tour

#### 9.6.2 Crear Nuevo Rol (Opcional)

Si necesita un rol personalizado:

1. Click en **"+ Agregar Rol"**
2. Complete el formulario:
   - Nombre del rol
   - Descripción
   - Permisos (seleccione módulos accesibles)
3. Click en **"💾 Guardar"**

### 9.7 Visualización de Comandas (Admin)

Como administrador, puede ver **todas las órdenes** del sistema:

1. En el dashboard, click en **"📋 Comandas"**
2. Verá una vista similar a la de meseros, pero con acceso completo

**Funcionalidades**:
- 👀 Ver todas las órdenes de todos los meseros
- ✏️ Editar cualquier orden
- ❌ Cancelar órdenes (con justificación)
- 📊 Ver estadísticas en tiempo real

### 9.8 Respaldo y Seguridad

#### 9.8.1 Respaldo de Datos

**Recomendaciones**:
- 🔄 Realizar respaldos diarios automáticos
- 💾 Guardar respaldos en ubicación segura
- ☁️ Usar almacenamiento en la nube

#### 9.8.2 Seguridad de Usuarios

**Mejores prácticas**:
- 🔐 Cambiar contraseñas cada 3 meses
- ❌ No compartir credenciales
- 👀 Revisar logs de acceso regularmente
- 🚫 Eliminar usuarios inactivos

#### 9.8.3 Auditoría

El sistema registra:
- 📝 Todas las acciones de usuarios
- 💰 Todas las transacciones
- ✏️ Modificaciones a platillos
- 🗑️ Eliminaciones de registros

**Acceder a logs**:
1. En el dashboard admin, click en **"📊 Logs"**
2. Filtre por usuario, fecha o acción
3. Exporte para auditoría externa

---

## 10. Solución de Problemas

### 10.1 Problemas de Inicio de Sesión

#### Problema: "Usuario o contraseña incorrectos"

**Soluciones**:
1. ✅ Verifique que está escribiendo correctamente
2. ✅ Verifique que Caps Lock esté desactivado
3. ✅ Pruebe con las credenciales predeterminadas
4. ✅ Contacte al administrador para resetear su contraseña

#### Problema: "Sesión expirada"

**Solución**:
1. Inicie sesión nuevamente
2. Su sesión se mantiene por 8 horas de inactividad
3. Use "Recordar sesión" para sesiones más largas (no recomendado en dispositivos compartidos)

#### Problema: "No puedo cerrar sesión"

**Solución**:
1. Click en el botón "Cerrar sesión" en la esquina superior derecha
2. Si no responde, cierre el navegador
3. Limpie la caché del navegador (Ctrl + Shift + Delete)

### 10.2 Problemas con Órdenes

#### Problema: "No puedo enviar la orden a cocina"

**Soluciones**:
1. ✅ Verifique que haya agregado al menos un platillo
2. ✅ Verifique que haya seleccionado una mesa
3. ✅ Verifique su conexión a internet
4. ✅ Recargue la página (F5)

#### Problema: "Los platillos no aparecen en el formulario"

**Soluciones**:
1. ✅ Verifique que el área esté seleccionada
2. ✅ Puede que no haya platillos disponibles en esa área
3. ✅ Contacte al administrador para verificar disponibilidad de platillos

#### Problema: "No puedo editar una orden"

**Soluciones**:
1. ✅ Solo puede editar órdenes en estado "Pendiente" o "En Preparación"
2. ✅ No puede editar órdenes en "En Caja" o "Finalizada"
3. ✅ Verifique que tenga los permisos necesarios

### 10.3 Problemas en el KDS (Cocina)

#### Problema: "No aparecen los tickets"

**Soluciones**:
1. ✅ Verifique que haya órdenes para su área
2. ✅ Verifique su conexión a internet
3. ✅ Recargue la página (F5)
4. ✅ El auto-refresh está configurado a 5 segundos, espere

#### Problema: "El ticket no desaparece al marcar como terminado"

**Soluciones**:
1. ✅ Recargue la página (F5)
2. ✅ Verifique su conexión a internet
3. ✅ El ticket puede tener múltiples platillos de diferentes áreas

### 10.4 Problemas en Caja

#### Problema: "El cambio no se calcula"

**Soluciones**:
1. ✅ Verifique que el método de pago sea "Efectivo"
2. ✅ Verifique que el monto recibido sea mayor al total
3. ✅ Para Tarjeta/Transferencia no hay cambio

#### Problema: "No puedo finalizar el pago"

**Soluciones**:
1. ✅ Verifique que el método de pago esté seleccionado
2. ✅ Verifique que el monto recibido esté ingresado
3. ✅ Verifique su conexión a internet

### 10.5 Problemas Generales

#### Problema: "La página no carga"

**Soluciones**:
1. ✅ Verifique su conexión a internet
2. ✅ Recargue la página (F5) o Ctrl + Shift + R (limpiar caché)
3. ✅ Intente con otro navegador
4. ✅ Limpie la caché del navegador
5. ✅ Contacte al administrador del sistema

#### Problema: "Los datos no se guardan"

**Soluciones**:
1. ✅ Verifique su conexión a internet
2. ✅ Verifique que todos los campos requeridos estén completos
3. ✅ Verifique que no haya errores en el formulario
4. ✅ Intente nuevamente en unos minutos

#### Problema: "Error 404 - Página no encontrada"

**Soluciones**:
1. ✅ Verifique la URL
2. ✅ Vuelva al inicio y navegue desde ahí
3. ✅ Puede que no tenga permisos para esa página

### 10.6 Contacto de Soporte

Si los problemas persisten, contacte al equipo de soporte:

**Equipo de Desarrollo**:
- 📧 Email: soporte@chicoj.com
- 📞 Teléfono: [Número de teléfono]
- ⏰ Horario: Lunes a Viernes, 8:00 AM - 5:00 PM

**Información a proporcionar**:
- 👤 Su nombre de usuario
- 🎭 Su rol
- 📝 Descripción detallada del problema
- 📸 Capturas de pantalla (si es posible)
- 🕒 Hora y fecha cuando ocurrió el problema

---

## Glosario de Términos

**Área**: Sección del restaurante (Cocina, Bebidas, Coffee)

**Badge**: Etiqueta de color que indica un estado o rol

**Comanda**: Orden de platillos tomada por un mesero

**Comprobante**: Documento de pago generado por el sistema

**KDS**: Kitchen Display System - Sistema de pantallas de cocina

**Modal**: Ventana emergente en la pantalla

**NIT**: Número de Identificación Tributaria

**Orden**: Conjunto de platillos solicitados por una mesa

**Platillo**: Cada ítem del menú

**RBAC**: Role-Based Access Control - Control de acceso basado en roles

**Ticket**: Representación visual de una orden en el KDS

**Tour**: Visita guiada al Coffee Tour Chicoj

---

## Apéndices

### Apéndice A: Atajos de Teclado

| Acción | Atajo |
|--------|-------|
| Actualizar página | F5 |
| Limpiar caché y recargar | Ctrl + Shift + R |
| Cerrar modal | Esc |
| Buscar en página | Ctrl + F |

### Apéndice B: Estados de Órdenes

| Estado | Descripción | Color |
|--------|-------------|-------|
| Pendiente | Orden creada, puede editarse | 🟡 Amarillo |
| En Preparación | Enviada a cocina | 🔵 Azul |
| Preparada | Lista para entregar | 🟢 Verde |
| En Caja | Esperando pago | 🟠 Naranja |
| Finalizada | Pagada y archivada | ⚪ Gris |

### Apéndice C: Permisos por Rol

| Módulo | Admin | Gerente | Cajero | Mesero | Cocina | Tour |
|--------|-------|---------|--------|--------|--------|------|
| Dashboard | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Comandas | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| KDS | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Caja | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Reportes | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Usuarios | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Empleados | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Platillos | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tours | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Información del Documento

**Título**: Manual de Usuario - Sistema de Gestión Restaurante Chicoj  
**Versión**: 1.0  
**Fecha**: Noviembre 2025  
**Autores**:  
- Pedro José Quiñonez López
- Christian Aníbal Elí Cabnal Pereira  
- Kristian Josué González Barrientos

**Universidad**: Universidad Mariano Gálvez de Guatemala  
**Facultad**: Ingeniería en Sistemas de Información y Ciencias de la Computación  
**Campus**: Cobán, Alta Verapaz

---

**© 2025 Cooperativa Agrícola Integral Chicoj, R.L. - Todos los derechos reservados**

