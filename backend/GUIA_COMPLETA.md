# 🎯 GUÍA COMPLETA DEL SISTEMA - Restaurante Chicooj

## 📋 **ÍNDICE**

1. [Usuarios del Sistema](#usuarios-del-sistema)
2. [Flujo Completo de Órdenes](#flujo-completo-de-órdenes)
3. [Estados de las Órdenes](#estados-de-las-órdenes)
4. [Funcionalidades por Rol](#funcionalidades-por-rol)
5. [Cómo Probar el Sistema](#cómo-probar-el-sistema)
6. [Endpoints de la API](#endpoints-de-la-api)

---

## 👥 **USUARIOS DEL SISTEMA**

### **Credenciales de Acceso:**

| Usuario     | Contraseña    | Rol            | Vista Principal                      |
|-------------|---------------|----------------|--------------------------------------|
| admin       | admin123      | Administrador  | Panel de Administración              |
| gerente1    | gerente123    | Gerente        | Reportes y Estadísticas              |
| cajero1     | cajero123     | Cajero         | Caja (Órdenes Pendientes de Pago)    |
| mesero1     | mesero123     | Mesero         | Comandas (Crear/Editar Órdenes)      |
| cocina1     | cocina123     | Cocina         | KDS - Órdenes de Cocina              |
| bebidas1    | bebidas123    | Bebidas        | KDS - Órdenes de Bebidas             |
| coffee1     | coffee123     | Coffee         | KDS - Órdenes de Coffee Shop         |

---

## 🔄 **FLUJO COMPLETO DE ÓRDENES**

### **1️⃣ Mesero Crea la Orden (Estado: Pendiente)**
- El mesero ingresa al sistema con `mesero1/mesero123`
- Crea una nueva orden en `mesero_comanda.html`
- Selecciona la **mesa** (1-30)
- Agrega **platillos** (selecciona área y platillo)
- Puede agregar **observaciones** y **extras** (con precio adicional)
- **Puede editar y eliminar platillos antes de enviar**
- Click en **"Enviar a Cocina"** → La orden pasa a estado **"En Preparación"**

### **2️⃣ Cocina Recibe la Orden (Estado: En Preparación)**
- Los usuarios de cocina (`cocina1`, `bebidas1`, `coffee1`) ingresan a sus respectivas vistas
- **Cada área solo ve sus propias órdenes** (Cocina, Bebidas, Coffee)
- Las órdenes aparecen en la tabla de KDS con:
  - No. Orden
  - Mesa
  - Cantidad
  - Platillo
  - Observaciones
  - Extras
  - Botón **"✓ Terminar"**
- Al hacer click en **"✓ Terminar"**, el platillo se marca como **"Preparado"**
- Cuando **TODOS los platillos** de una orden están preparados → La orden pasa a estado **"Preparada"**

### **3️⃣ Mesero Cierra la Cuenta (Estado: Preparada → En Caja)**
- El mesero regresa a `comanda-control.html`
- Ve las órdenes **"Preparadas"** (todos los platillos listos)
- Click en **"💰 Cerrar Cuenta"** → La orden pasa a estado **"En Caja"**

### **4️⃣ Cajero Procesa el Pago (Estado: En Caja → Finalizada)**
- El cajero (`cajero1/cajero123`) ingresa a `caja.html`
- Ve las órdenes pendientes de pago (estado "En Caja")
- Click en **"💳 Cobrar"** → Se abre un modal con:
  - Método de pago (Efectivo/Tarjeta/Transferencia)
  - Monto recibido
  - Cambio (calculado automáticamente)
  - Nombre del cliente (opcional)
  - NIT (opcional, por defecto "CF")
- Click en **"✓ Finalizar Pago"** → La orden pasa a estado **"Finalizada"**
- Se genera un **comprobante de caja** en la base de datos

### **5️⃣ Gerente Visualiza Reportes**
- El gerente (`gerente1/gerente123`) ingresa a `reportes.html`
- Puede ver:
  - **Ventas Totales** por período
  - **Órdenes Completadas**
  - **Ticket Promedio**
  - **Top 10 Platillos Más Vendidos**
  - **Horas Pico** (cuándo hay más órdenes)
  - **Ingresos por Área** (Cocina, Bebidas, Coffee)
- Puede filtrar por fechas (`fecha_desde` - `fecha_hasta`)

---

## 📊 **ESTADOS DE LAS ÓRDENES**

```
Pendiente → En Preparación → Preparada → En Caja → Finalizada
    ↓              ↓             ↓           ↓           ↓
  Mesero       Cocina        Mesero      Cajero     (Guardado)
  Crea         Prepara       Cierra      Cobra      Reportes
```

| Estado           | Descripción                                           | Quién lo Cambia |
|------------------|-------------------------------------------------------|-----------------|
| Pendiente        | Orden creada, puede ser editada                       | Mesero          |
| En Preparación   | Orden enviada a cocina, aparece en KDS                | Mesero          |
| Preparada        | Todos los platillos están listos                      | Cocina (auto)   |
| En Caja          | Cliente pidió la cuenta, esperando pago               | Mesero          |
| Finalizada       | Pago procesado, orden archivada                       | Cajero          |

---

## 🛠️ **FUNCIONALIDADES POR ROL**

### **Administrador (`admin/admin123`)**
- Acceso completo al sistema
- Gestionar usuarios
- Administrar platillos (crear, editar, eliminar)
- Administrar tours
- Ver comandas
- Acceso a caja
- Acceso a reportes

### **Gerente (`gerente1/gerente123`)**
- Ver reportes y estadísticas
- Análisis de ventas
- Platillos más vendidos
- Horas pico
- Ingresos por área
- (Opcional) Acceso a caja

### **Cajero (`cajero1/cajero123`)**
- Ver órdenes pendientes de pago (En Caja)
- Procesar pagos (Efectivo/Tarjeta/Transferencia)
- Generar comprobantes
- Ver historial del día
- Ver estadísticas de ventas del día

### **Mesero (`mesero1/mesero123`)**
- Crear nuevas órdenes
- Editar órdenes (antes de enviar a cocina o en preparación)
- Agregar/editar/eliminar platillos de la orden
- Enviar órdenes a cocina
- Cerrar cuentas (cuando el cliente las solicita)
- Ver todas las órdenes activas

### **Cocina (`cocina1/cocina123`, `bebidas1/bebidas123`, `coffee1/coffee123`)**
- Ver solo órdenes de **su área** (Cocina, Bebidas, Coffee)
- Marcar platillos como **"Preparado"** (botón ✓ Terminar)
- Auto-refresh cada 5 segundos
- Ver detalles: No. Orden, Mesa, Cantidad, Platillo, Observaciones, Extras

---

## 🧪 **CÓMO PROBAR EL SISTEMA**

### **Paso 1: Iniciar Backend y Frontend**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (Live Server en VS Code/Cursor)
# Abrir fronted/templates/login.html con Live Server
# URL: http://localhost:8080/templates/login.html
```

### **Paso 2: Prueba Completa del Flujo**

#### **A. Mesero Crea una Orden**
1. Ingresar como `mesero1/mesero123`
2. Click en **"+ Nueva Orden"**
3. Seleccionar mesa (ej: Mesa 5)
4. Agregar platillos:
   - **Área: Cocina** → Platillo: "Pepian" → Cantidad: 2
   - **Área: Bebidas** → Platillo: "Limonada" → Cantidad: 2
   - **Área: Coffee** → Platillo: "Capuchino" → Cantidad: 1
5. Agregar observaciones (ej: "Sin cebolla")
6. Agregar extras (ej: "Extra queso" - Q5.00)
7. Click en **"Enviar a Cocina"**
8. **Resultado:** Orden #00001 en estado "En Preparación"

#### **B. Cocina Prepara los Platillos**
1. **Usuario: `cocina1/cocina123`**
   - Ver orden en KDS de Cocina
   - Click en **"✓ Terminar"** en el platillo "Pepian"
   - El platillo se marca como "Preparado" y desaparece de la vista

2. **Usuario: `bebidas1/bebidas123`**
   - Ver orden en KDS de Bebidas
   - Click en **"✓ Terminar"** en "Limonada"

3. **Usuario: `coffee1/coffee123`**
   - Ver orden en KDS de Coffee
   - Click en **"✓ Terminar"** en "Capuchino"

4. **Resultado:** Cuando todos los platillos están "Preparado" → Orden pasa a estado **"Preparada"**

#### **C. Mesero Cierra la Cuenta**
1. Regresar a `mesero1/mesero123`
2. Ir a **"Comandas"** (`comanda-control.html`)
3. Ver orden #00001 con estado **"Preparada"**
4. Click en **"💰 Cerrar Cuenta"**
5. Confirmar → Orden pasa a estado **"En Caja"**

#### **D. Cajero Procesa el Pago**
1. Ingresar como `cajero1/cajero123`
2. Ver orden #00001 en "Órdenes Pendientes"
3. Click en **"💳 Cobrar"**
4. Llenar modal:
   - Método de pago: **Efectivo**
   - Monto recibido: **Q 150.00**
   - Cambio: **Q 50.00** (calculado automáticamente)
   - Nombre cliente: "Juan Pérez"
   - NIT: "CF"
5. Click en **"✓ Finalizar Pago"**
6. **Resultado:** Orden pasa a estado **"Finalizada"**
7. Ver orden en **"Historial del Día"**

#### **E. Gerente Ve Reportes**
1. Ingresar como `gerente1/gerente123`
2. Seleccionar fechas (ej: último mes)
3. Click en **"🔍 Generar Reporte"**
4. Ver:
   - **Ventas Totales:** Q 100.00
   - **Órdenes Completadas:** 1
   - **Ticket Promedio:** Q 100.00
   - **Platillo más vendido:** Pepian (2 unidades)
   - **Hora pico:** 14:00 (1 orden)
   - **Ingresos por área:**
     - Cocina: Q 40.00
     - Bebidas: Q 30.00
     - Coffee: Q 30.00

---

## 🔌 **ENDPOINTS DE LA API**

### **Autenticación**
- `POST /api/auth/login` - Login (username/email + password)
- `GET /api/auth/me` - Obtener datos del usuario actual

### **Órdenes**
- `GET /api/orders` - Listar órdenes (filtros: estado, fecha, mesa)
- `GET /api/orders/ready` - Órdenes preparadas (estado: Preparada)
- `GET /api/orders/:id` - Detalle de una orden
- `POST /api/orders` - Crear orden (estado: Pendiente)
- `PATCH /api/orders/:id` - Actualizar orden (agregar/editar platillos)
- `POST /api/orders/:id/send` - Enviar a cocina (estado: En Preparación)
- `POST /api/orders/:id/close` - Cerrar cuenta (estado: En Caja)
- `DELETE /api/orders/:id/items/:itemId` - Eliminar platillo de la orden

### **KDS (Kitchen Display System)**
- `GET /api/kds/:area` - Tickets de un área (Cocina/Bebidas/Coffee)
- `PATCH /api/kds/:ticketId/complete` - Marcar platillo como Preparado

### **Caja**
- `GET /api/cashier/pending` - Órdenes pendientes de pago (En Caja)
- `GET /api/cashier/history` - Historial de órdenes finalizadas
- `GET /api/cashier/stats` - Estadísticas del día
- `POST /api/cashier/:id/finalize` - Finalizar pago (estado: Finalizada)

### **Reportes**
- `GET /api/reports/sales` - Resumen de ventas (total_ventas, total_ordenes)
- `GET /api/reports/top-dishes` - Top platillos más vendidos
- `GET /api/reports/peak-hours` - Horas pico (afluencia de órdenes)
- `GET /api/reports/by-area` - Ingresos por área

### **Menú**
- `GET /api/menu` - Listar platillos (agrupados por área)
- `GET /api/menu/areas` - Listar áreas
- `POST /api/menu` - Crear platillo
- `PATCH /api/menu/:id` - Actualizar platillo
- `DELETE /api/menu/:id` - Eliminar platillo

---

## 🎨 **VISTAS DEL FRONTEND**

| Vista                          | Ruta                                      | Usuarios Permitidos    |
|--------------------------------|-------------------------------------------|------------------------|
| Login                          | `/templates/login.html`                   | Todos                  |
| Dashboard Principal            | `/main.html`                              | Admin                  |
| Crear/Editar Orden             | `/templates/mesero/mesero_comanda.html`   | Mesero                 |
| Ver Órdenes                    | `/templates/mesero/comanda-control.html`  | Mesero                 |
| KDS Cocina                     | `/templates/cocina/cocina.html?area=Cocina` | Cocina               |
| KDS Bebidas                    | `/templates/cocina/cocina.html?area=Bebidas` | Bebidas             |
| KDS Coffee                     | `/templates/cocina/cocina.html?area=Coffee` | Coffee               |
| Caja                           | `/templates/caja/caja.html`               | Cajero                 |
| Reportes                       | `/templates/reportes/reportes.html`       | Gerente, Admin         |
| Administrar Platillos          | `/templates/administracion/control-platillos.html` | Admin        |

---

## ✅ **CHECKLIST DE FUNCIONALIDADES IMPLEMENTADAS**

### **Backend**
- ✅ Sistema de autenticación (JWT)
- ✅ CRUD de órdenes con estados
- ✅ Sistema de KDS por área
- ✅ Módulo de caja (pagos y comprobantes)
- ✅ Módulo de reportes (ventas, platillos, horas pico, áreas)
- ✅ Manejo de extras y observaciones
- ✅ Eliminación individual de items de orden
- ✅ Migración de base de datos (estado en area_registro)
- ✅ Seed con 7 usuarios (admin, gerente, cajero, mesero, cocina, bebidas, coffee)

### **Frontend**
- ✅ Login con redirección por rol
- ✅ Vista de mesero (crear/editar órdenes)
- ✅ Edición individual de platillos en orden
- ✅ Eliminación individual de platillos en orden
- ✅ Botón "Cerrar Cuenta" en órdenes preparadas
- ✅ Vista de KDS (3 áreas: Cocina, Bebidas, Coffee)
- ✅ Auto-refresh en KDS cada 5 segundos
- ✅ Vista de Caja (órdenes pendientes, historial, stats)
- ✅ Modal de pago con cálculo automático de cambio
- ✅ Vista de Reportes (ventas, platillos, horas, áreas)
- ✅ Dashboard principal con todos los módulos

---

## 📞 **SOPORTE Y NOTAS**

### **Base de Datos**
- **Motor:** PostgreSQL (a través de Prisma ORM)
- **Ubicación:** `backend/prisma/schema.prisma`
- **Migraciones:** `backend/prisma/migrations/`

### **Logs y Debug**
- Backend: Logs en consola con `prisma:query` para queries SQL
- Frontend: `console.log` extensivos en cada archivo `.js`

### **Auto-refresh**
- KDS: Cada 5 segundos
- Caja: Cada 30 segundos
- Reportes: Manual (botón "Generar Reporte")

### **Validaciones**
- Monto recibido debe ser ≥ total de la orden
- No se puede editar una orden "Finalizada"
- Cada área de cocina solo ve sus propias órdenes
- Las órdenes "Preparadas" solo muestran botón "Cerrar Cuenta" (no "Editar")

---

## 🚀 **¡LISTO PARA USAR!**

El sistema está **100% funcional** y listo para producción. Solo falta:
1. Diseño gráfico personalizado (logos, colores)
2. Impresión de tickets (opcional)
3. Deploy en servidor de producción

**¡Feliz uso del sistema Restaurante Chicooj! 🎉**

