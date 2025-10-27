# 🚀 INICIO RÁPIDO - Sistema Restaurante Chicooj

## ✅ **¡SISTEMA 100% COMPLETADO!**

Todas las funcionalidades han sido implementadas y probadas:
- ✅ Backend completo con todos los módulos
- ✅ Frontend con todas las vistas
- ✅ 7 usuarios creados (admin, gerente, cajero, mesero, cocina, bebidas, coffee)
- ✅ Sistema de órdenes con estados (Pendiente → En Preparación → Preparada → En Caja → Finalizada)
- ✅ KDS (Kitchen Display System) por áreas
- ✅ Módulo de caja con procesamiento de pagos
- ✅ Módulo de reportes completo

---

## 📦 **INSTALACIÓN (Solo primera vez)**

### **1. Instalar dependencias del backend:**
```bash
cd backend
npm install
```

### **2. Configurar base de datos:**
```bash
# Crear archivo .env en backend/ con:
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/chicoj_db"
JWT_SECRET="tu_secreto_super_seguro_aqui"
PORT=3000
NODE_ENV=development
```

### **3. Ejecutar migraciones:**
```bash
npx prisma migrate dev
```

### **4. Poblar base de datos:**
```bash
npm run db:seed
```

✅ **Usuarios creados:**
- `admin/admin123` (Administrador)
- `gerente1/gerente123` (Gerente - Reportes)
- `cajero1/cajero123` (Cajero)
- `mesero1/mesero123` (Mesero)
- `cocina1/cocina123` (Cocina)
- `bebidas1/bebidas123` (Bebidas)
- `coffee1/coffee123` (Coffee)

---

## 🏃 **INICIAR EL SISTEMA**

### **Opción 1: Dos Terminales**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend corriendo en: `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd fronted
# Abrir fronted/templates/login.html con Live Server (VS Code/Cursor)
# O usar cualquier servidor HTTP estático
```
✅ Frontend corriendo en: `http://localhost:8080` (o el puerto de tu Live Server)

---

## 🧪 **PRUEBA RÁPIDA DEL FLUJO COMPLETO**

### **1. Login como Mesero**
- Usuario: `mesero1`
- Contraseña: `mesero123`
- 📍 Redirige a: `/templates/mesero/mesero_comanda.html`

### **2. Crear una Orden**
- Click en **"+ Nueva Orden"**
- Seleccionar **Mesa 5**
- Agregar platillos:
  - **Área: Cocina** → "Pepian" (Cantidad: 2)
  - **Área: Bebidas** → "Limonada" (Cantidad: 2)
  - **Área: Coffee** → "Capuchino" (Cantidad: 1)
- Agregar **observaciones**: "Sin cebolla"
- Agregar **extras**: "Extra queso" - Q5.00
- Click en **"Enviar a Cocina"**
- ✅ **Orden #00001** creada con estado **"En Preparación"**

### **3. Cocina Prepara los Platillos**

**A. Usuario: `cocina1/cocina123`**
- 📍 Redirige a: `/templates/cocina/cocina.html?area=Cocina`
- Ver orden #00001 con "Pepian (x2)"
- Click en **"✓ Terminar"**
- ✅ Platillo marcado como **"Preparado"**

**B. Usuario: `bebidas1/bebidas123`**
- 📍 Redirige a: `/templates/cocina/cocina.html?area=Bebidas`
- Ver orden #00001 con "Limonada (x2)"
- Click en **"✓ Terminar"**

**C. Usuario: `coffee1/coffee123`**
- 📍 Redirige a: `/templates/cocina/cocina.html?area=Coffee`
- Ver orden #00001 con "Capuchino (x1)"
- Click en **"✓ Terminar"**

✅ **Cuando todos los platillos están preparados** → Orden pasa a estado **"Preparada"**

### **4. Mesero Cierra la Cuenta**
- Regresar a `mesero1/mesero123`
- Ir a **"Comandas"** (comanda-control.html)
- Ver orden #00001 con estado **"Preparada"** (badge verde)
- Click en **"💰 Cerrar Cuenta"**
- Confirmar
- ✅ Orden pasa a estado **"En Caja"**

### **5. Cajero Procesa el Pago**
- Usuario: `cajero1/cajero123`
- 📍 Redirige a: `/templates/caja/caja.html`
- Ver orden #00001 en **"Órdenes Pendientes"**
- Click en **"💳 Cobrar"**
- Modal de pago:
  - **Método de pago:** Efectivo
  - **Monto recibido:** Q 150.00
  - **Cambio:** Q 50.00 (calculado automáticamente)
  - **Nombre cliente:** Juan Pérez
  - **NIT:** CF
- Click en **"✓ Finalizar Pago"**
- ✅ Orden pasa a estado **"Finalizada"**
- ✅ Ver orden en **"Historial del Día"**

### **6. Gerente Ve Reportes**
- Usuario: `gerente1/gerente123`
- 📍 Redirige a: `/templates/reportes/reportes.html`
- Seleccionar fechas (último mes)
- Click en **"🔍 Generar Reporte"**
- ✅ Ver:
  - **Ventas Totales:** Q 100.00
  - **Órdenes Completadas:** 1
  - **Top Platillos:** Pepian (2 unidades)
  - **Horas Pico:** 14:00
  - **Ingresos por Área:**
    - Cocina: Q 40.00
    - Bebidas: Q 30.00
    - Coffee: Q 30.00

---

## 📋 **RESUMEN DE VISTAS POR ROL**

| Usuario  | Vista Principal                                 | Funcionalidades                          |
|----------|-------------------------------------------------|------------------------------------------|
| admin    | `/main.html`                                    | Administración completa                  |
| gerente1 | `/templates/reportes/reportes.html`             | Reportes y estadísticas                  |
| cajero1  | `/templates/caja/caja.html`                     | Procesar pagos, ver historial            |
| mesero1  | `/templates/mesero/mesero_comanda.html`         | Crear/editar órdenes, cerrar cuentas     |
| cocina1  | `/templates/cocina/cocina.html?area=Cocina`     | Ver y terminar órdenes de Cocina         |
| bebidas1 | `/templates/cocina/cocina.html?area=Bebidas`    | Ver y terminar órdenes de Bebidas        |
| coffee1  | `/templates/cocina/cocina.html?area=Coffee`     | Ver y terminar órdenes de Coffee         |

---

## 🔌 **ENDPOINTS CLAVE DE LA API**

### **Autenticación:**
- `POST /api/auth/login` - Login

### **Órdenes:**
- `GET /api/orders` - Listar órdenes
- `GET /api/orders/ready` - Órdenes preparadas
- `POST /api/orders` - Crear orden
- `POST /api/orders/:id/send` - Enviar a cocina
- `POST /api/orders/:id/close` - Cerrar cuenta
- `DELETE /api/orders/:id/items/:itemId` - Eliminar platillo

### **KDS:**
- `GET /api/kds/:area` - Tickets de área (Cocina/Bebidas/Coffee)
- `PATCH /api/kds/:ticketId/complete` - Marcar como preparado

### **Caja:**
- `GET /api/cashier/pending` - Órdenes pendientes de pago
- `POST /api/cashier/:id/finalize` - Finalizar pago

### **Reportes:**
- `GET /api/reports/sales` - Ventas totales
- `GET /api/reports/top-dishes` - Top platillos
- `GET /api/reports/peak-hours` - Horas pico
- `GET /api/reports/by-area` - Ingresos por área

---

## 📊 **ESTADOS DE LAS ÓRDENES**

```
🟡 Pendiente → 🔵 En Preparación → 🟢 Preparada → 💰 En Caja → ✅ Finalizada
     ↓               ↓                  ↓             ↓            ↓
   Mesero          Cocina            Mesero        Cajero      (BD)
   Crea           Prepara           Cierra        Cobra      Reportes
```

---

## 🛠️ **COMANDOS ÚTILES**

### **Backend:**
```bash
npm run dev              # Iniciar servidor en modo desarrollo
npm run db:seed          # Poblar base de datos
npx prisma studio        # Ver base de datos en navegador
npx prisma migrate dev   # Crear nueva migración
```

### **Base de Datos:**
```bash
# Reiniciar base de datos (CUIDADO: Borra todos los datos)
npx prisma migrate reset
npm run db:seed
```

---

## 📁 **ARCHIVOS IMPORTANTES**

- `GUIA_COMPLETA.md` - Documentación completa del sistema
- `backend/prisma/schema.prisma` - Esquema de base de datos
- `backend/src/routes/` - Rutas de la API
- `fronted/scripts/` - JavaScript del frontend
- `fronted/templates/` - Vistas HTML

---

## 🎯 **FUNCIONALIDADES DESTACADAS**

✅ **Edición de Órdenes:**
- Agregar, editar y eliminar platillos antes de enviar
- Cada item tiene botones "Editar" y "Eliminar"
- Los cambios se persisten en la base de datos

✅ **KDS Inteligente:**
- Auto-refresh cada 5 segundos
- Cada área solo ve sus propias órdenes
- Marcar platillos como preparados (no se eliminan, se archivan)

✅ **Caja Completa:**
- Cálculo automático de cambio
- Múltiples métodos de pago
- Generación de comprobantes
- Historial del día

✅ **Reportes Avanzados:**
- Filtros por fecha
- Top 10 platillos más vendidos
- Horas pico de afluencia
- Ingresos por área (Cocina, Bebidas, Coffee)

---

## 🚀 **¡LISTO PARA USAR!**

El sistema está **100% funcional**. Solo sigue estos pasos:

1. ✅ Iniciar backend: `cd backend && npm run dev`
2. ✅ Abrir frontend: Live Server en `fronted/templates/login.html`
3. ✅ Login con cualquier usuario (ver tabla arriba)
4. ✅ Probar el flujo completo

**¡Disfruta del sistema! 🎉**

---

## 💡 **TIPS**

- **Auto-refresh:** KDS se actualiza cada 5 segundos, no necesitas recargar manualmente
- **Edición de órdenes:** Solo puedes editar órdenes en estado "Pendiente" o "En Preparación"
- **Cerrar cuenta:** El botón "Cerrar Cuenta" solo aparece cuando **todos** los platillos están preparados
- **Cambio automático:** En la caja, el cambio se calcula automáticamente al ingresar el monto recibido

---

**¿Necesitas ayuda?** Revisa `GUIA_COMPLETA.md` para documentación detallada.

