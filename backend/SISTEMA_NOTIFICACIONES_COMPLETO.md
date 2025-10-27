# 🔔 SISTEMA DE NOTIFICACIONES - RESTAURANTE CHICOJ

## ✅ IMPLEMENTACIÓN COMPLETA

Sistema de notificaciones en tiempo real para alertar al mesero cuando un platillo está listo en Cocina, Bebidas o Coffee.

---

## 📋 **LO QUE SE IMPLEMENTÓ**

### **1️⃣ Base de Datos** ✅

**Archivo:** `backend/prisma/schema.prisma`

```prisma
model notificacion {
  id_notificacion Int      @id @default(autoincrement())
  id_usuario      Int      // Mesero que recibirá la notificación
  id_orden        Int      // Orden relacionada
  tipo            String   @default("platillo_listo") @db.VarChar(50)
  titulo          String   @db.VarChar(200)
  mensaje         String   @db.VarChar(500)
  leida           Boolean  @default(false)
  fecha_creacion  DateTime @default(now()) @db.Timestamptz(6)
  fecha_leida     DateTime? @db.Timestamptz(6)
  
  // Datos adicionales
  id_platillo     Int?
  nombre_platillo String?  @db.VarChar(120)
  area_nombre     String?  @db.VarChar(80)
  no_mesa         String?  @db.VarChar(20)
}
```

**Migración:** ✅ Aplicada - `20251024154631_add_notificaciones`

---

### **2️⃣ Backend - API de Notificaciones** ✅

#### **Endpoints Creados:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notifications` | Obtener todas las notificaciones |
| GET | `/api/notifications/unread` | Obtener solo no leídas |
| GET | `/api/notifications/count` | Conteo de notificaciones |
| PATCH | `/api/notifications/:id/read` | Marcar como leída |
| POST | `/api/notifications/read-all` | Marcar todas como leídas |
| DELETE | `/api/notifications/:id` | Eliminar notificación |

#### **Archivos Creados:**

- ✅ `backend/src/modules/notifications/notifications.controller.js` - Controlador de notificaciones
- ✅ `backend/src/modules/notifications/notifications.routes.js` - Rutas de la API
- ✅ `backend/src/routes/index.js` - Registro de rutas

---

### **3️⃣ KDS - Creación Automática de Notificaciones** ✅

**Archivo:** `backend/src/modules/kds/kds.controller.js`

Cuando un cocinero marca un platillo como **"Terminado"** en el KDS:

1. ✅ Se crea una notificación del tipo `platillo_listo`
2. ✅ Se envía al mesero que creó la orden
3. ✅ Si todos los platillos están listos, se crea notificación `orden_lista`

**Ejemplo de notificación creada:**

```javascript
{
  id_usuario: 1,              // Mesero
  id_orden: 25,               // Orden #00025
  tipo: 'platillo_listo',
  titulo: '✅ Platillo Listo - Mesa 5',
  mensaje: 'Pepián de Pollo está listo para servir',
  nombre_platillo: 'Pepián de Pollo',
  area_nombre: 'Cocina',
  no_mesa: 'Mesa 5'
}
```

---

### **4️⃣ Frontend - Sistema Visual con Sonido** ✅

#### **Componentes Agregados:**

**1. Botón de Notificaciones** (Header)
```html
<button class="btn-notification" id="btn-notifications">
  🔔
  <span class="notification-badge">3</span>
</button>
```

**2. Panel Desplegable** (Sidebar)
- Lista de notificaciones no leídas
- Botón "Marcar todas como leídas"
- Eliminar notificaciones individuales
- Tiempo transcurrido ("Hace 5 minutos")

**3. Sonido de Alerta**
- Se reproduce automáticamente cuando llega una notificación nueva
- Volumen: 50%

#### **Archivos Modificados/Creados:**

- ✅ `fronted/templates/mesero/comanda-control.html` - UI de notificaciones
- ✅ `fronted/scripts/notifications.js` - Lógica de notificaciones
- ✅ `fronted/scripts/api.js` - API de notificaciones agregada

---

## 🎯 **FLUJO COMPLETO**

### **Escenario: Un platillo está listo**

```
1. 🍳 COCINERO (KDS - Cocina)
   │
   ├─ Marca "Pepián de Pollo" como terminado
   │
   └─ ✅ Clic en "Terminar"

2. 🔧 BACKEND
   │
   ├─ Cambia estado del ticket a "Preparado"
   ├─ Crea notificación en base de datos
   │   └─ Para el mesero de la orden
   │
   └─ Si todos los platillos están listos:
       └─ Cambia orden a "Preparada"
       └─ Crea notificación "orden_lista"

3. 📱 MESERO (comanda-control)
   │
   ├─ Sistema consulta cada 10 segundos
   ├─ Detecta nueva notificación
   │
   ├─ 🔴 Badge rojo aparece: "1"
   ├─ 🔊 Sonido de alerta se reproduce
   │
   ├─ Mesero hace clic en 🔔
   │
   └─ Panel se abre mostrando:
       "✅ Platillo Listo - Mesa 5
        Pepián de Pollo está listo para servir
        📍 Mesa 5
        ⏰ Hace 2 minutos"

4. 👨‍🍳 MESERO ACTÚA
   │
   ├─ Lee la notificación
   ├─ Hace clic para marcar como leída
   │
   └─ Va a recoger el platillo a cocina
```

---

## 🚀 **CÓMO USAR**

### **Como Mesero:**

1. **Ver notificaciones**
   - El badge rojo 🔴 muestra el número de notificaciones nuevas
   - Haz clic en 🔔 para abrir el panel

2. **Leer notificaciones**
   - Haz clic en cualquier notificación para marcarla como leída
   - El color cambia de azul a gris

3. **Marcar todas como leídas**
   - Clic en "✓ Marcar todas como leídas"

4. **Eliminar notificación**
   - Clic en 🗑️ en la notificación que quieras eliminar

### **Como Cocinero:**

1. Abre el KDS de tu área (Cocina/Bebidas/Coffee)
2. Cuando termines un platillo, haz clic en "Terminar"
3. ✅ **Automáticamente se notifica al mesero**

---

## 🎨 **CARACTERÍSTICAS VISUALES**

### **Badge de Notificaciones**
- 🔴 Rojo con animación de pulso
- Muestra el número de notificaciones (máx: 99+)
- Desaparece cuando no hay notificaciones

### **Panel de Notificaciones**
- Slide-in animation desde la derecha
- Ancho: 400px (100% en móviles)
- Scroll cuando hay muchas notificaciones

### **Estados de Notificaciones**

| Estado | Color | Descripción |
|--------|-------|-------------|
| **No leída** | Azul claro | Notificación nueva |
| **Leída** | Gris | Ya fue vista |
| **Platillo listo** | Naranja | Platillo individual |
| **Orden completa** | Verde | Todos los platillos listos |

---

## ⚙️ **CONFIGURACIÓN**

### **Intervalo de Actualización**

```javascript
// fronted/scripts/notifications.js (línea 55)
notificationsRefreshInterval = setInterval(async () => {
  await loadNotifications();
}, 10000); // 10 segundos
```

**Cambiar frecuencia:**
- `5000` = 5 segundos (más rápido, más peticiones)
- `15000` = 15 segundos (menos peticiones)
- `30000` = 30 segundos (muy lento)

### **Volumen del Sonido**

```javascript
// fronted/scripts/notifications.js (línea 101)
notificationSound.volume = 0.5; // 0.0 a 1.0
```

---

## 🧪 **PRUEBAS**

### **Probar el Sistema:**

1. **Crear Orden (Mesero)**
   ```
   - Login como "admin" o "mesero"
   - Crear nueva orden
   - Agregar platillos (ej: Pepián, Café)
   - Enviar a cocina
   ```

2. **Terminar Platillo (Cocina)**
   ```
   - Abrir KDS: http://localhost:8080/templates/cocina/cocina.html?area=Cocina
   - Ver tickets pendientes
   - Clic en "Terminar" en un platillo
   ```

3. **Ver Notificación (Mesero)**
   ```
   - Volver a comanda-control
   - Esperar 10 segundos o refrescar
   - ✅ Debe aparecer:
     - Badge rojo con "1"
     - Sonido de alerta
     - Notificación en el panel
   ```

### **Verificar Base de Datos:**

```sql
-- Ver notificaciones creadas
SELECT * FROM notificacion ORDER BY fecha_creacion DESC;

-- Ver notificaciones no leídas
SELECT * FROM notificacion WHERE leida = false;

-- Ver notificaciones por usuario
SELECT * FROM notificacion WHERE id_usuario = 1;
```

---

## 📊 **MÉTRICAS**

### **Peticiones al Servidor**

| Vista | Intervalo | Peticiones/Minuto |
|-------|-----------|-------------------|
| Mesero (Notificaciones) | 10 seg | 6 |
| Mesero (Órdenes) | 10 seg | 6 |
| KDS | 15 seg | 4 |
| Caja | 20 seg | 3 |

**Total:** ~19 peticiones/minuto por usuario activo

### **Rate Limits Aplicados**

```javascript
// backend/src/config/index.js
rateLimit: {
  global: { max: 1000, windowMs: 60000 },      // 1000 req/min
  query: { max: 2000, windowMs: 60000 }        // 2000 req/min (KDS)
}
```

✅ **Sistema soporta múltiples usuarios sin saturación**

---

## 🐛 **TROUBLESHOOTING**

### **Problema: No aparecen notificaciones**

**Solución:**
1. Verificar que el servidor esté corriendo
2. Abrir consola del navegador (F12)
3. Buscar errores en red
4. Verificar que la orden tenga el mismo `id_usuario` del mesero

```sql
-- Verificar si hay notificaciones en BD
SELECT * FROM notificacion WHERE id_usuario = 1 AND leida = false;
```

### **Problema: No se reproduce el sonido**

**Solución:**
- El navegador bloquea autoplay de audio por defecto
- Hacer clic en cualquier parte de la página primero
- Verificar volumen del navegador

### **Problema: Badge no se actualiza**

**Solución:**
- Esperar 10 segundos (intervalo de actualización)
- Refrescar la página (F5)
- Verificar en Consola: "🔔 X notificaciones no leídas"

---

## 📝 **PRÓXIMAS MEJORAS (Opcional)**

- [ ] WebSockets para notificaciones en tiempo real (sin polling)
- [ ] Notificaciones del navegador (Push API)
- [ ] Filtros por tipo de notificación
- [ ] Historial de notificaciones leídas
- [ ] Configuración de sonido personalizado
- [ ] Notificaciones de prioridad (urgente)

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

- [x] Tabla `notificacion` en base de datos
- [x] Migración aplicada
- [x] Controller de notificaciones
- [x] Rutas de API registradas
- [x] KDS crea notificaciones al terminar platillo
- [x] API de notificaciones en frontend
- [x] UI de notificaciones en mesero
- [x] Badge con contador
- [x] Panel desplegable
- [x] Sonido de alerta
- [x] Auto-refresh cada 10 segundos
- [x] Marcar como leída
- [x] Eliminar notificaciones
- [x] Estilos y animaciones
- [x] Responsive design

---

## 🎉 **RESULTADO FINAL**

✅ **Sistema de notificaciones completamente funcional**

El mesero ahora recibe alertas automáticas cuando:
- 🍽️ Un platillo individual está listo
- 📦 Una orden completa está preparada

Con:
- 🔴 Indicador visual (badge rojo)
- 🔊 Sonido de alerta
- 📋 Panel de notificaciones detallado
- ⏰ Tiempo transcurrido
- ✅ Marcar como leída
- 🗑️ Eliminar notificaciones

**¡El sistema está listo para usar en producción!** 🚀


