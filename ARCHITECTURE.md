# 🏗️ Arquitectura del Sistema Chicoj

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                              │
│                     (Navegador Web)                          │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ HTTP/HTTPS
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                     │
│                      Puerto 80/443                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SSL/TLS Termination                                   │ │
│  │  Load Balancing                                        │ │
│  │  Static File Serving                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└───────┬──────────────────────┬───────────────────────────────┘
        │                      │
        │ /api/*               │ /socket.io/*
        │ /                    │
        │                      │
┌───────▼──────────┐   ┌───────▼──────────────────────────────┐
│    FRONTEND      │   │          BACKEND                     │
│   (Container)    │   │        (Container)                   │
│                  │   │                                      │
│  ┌────────────┐ │   │  ┌──────────────────────────────┐  │
│  │   Nginx    │ │   │  │      Node.js + Express       │  │
│  │  (Static   │ │   │  │                              │  │
│  │   Files)   │ │   │  │  ┌────────────────────────┐ │  │
│  └────────────┘ │   │  │  │    API REST            │ │  │
│                  │   │  │  │  - /auth               │ │  │
│  - HTML/CSS/JS   │   │  │  │  - /orders             │ │  │
│  - Templates     │   │  │  │  - /menu               │ │  │
│  - Assets        │   │  │  │  - /kds                │ │  │
│                  │   │  │  │  - /cashier            │ │  │
│                  │   │  │  │  - /tour               │ │  │
│                  │   │  │  │  - /reports            │ │  │
│                  │   │  │  └────────────────────────┘ │  │
│                  │   │  │                              │  │
│                  │   │  │  ┌────────────────────────┐ │  │
│                  │   │  │  │  WebSocket (Socket.io) │ │  │
│                  │   │  │  │  - Notificaciones RT   │ │  │
│                  │   │  │  │  - KDS Updates         │ │  │
│                  │   │  │  │  - Order Status        │ │  │
│                  │   │  │  └────────────────────────┘ │  │
│                  │   │  │                              │  │
│                  │   │  │  ┌────────────────────────┐ │  │
│                  │   │  │  │    Prisma ORM          │ │  │
│                  │   │  │  └────────┬───────────────┘ │  │
│                  │   │  └───────────┼─────────────────┘  │
└──────────────────┘   └──────────────┼────────────────────┘
                                      │
                                      │ SQL
                                      │
                       ┌──────────────▼─────────────────┐
                       │      POSTGRESQL                │
                       │      (Container)               │
                       │                                │
                       │  ┌──────────────────────────┐ │
                       │  │  Base de Datos           │ │
                       │  │  - usuarios              │ │
                       │  │  - empleados             │ │
                       │  │  - roles                 │ │
                       │  │  - platillos             │ │
                       │  │  - cuenta (órdenes)      │ │
                       │  │  - comanda               │ │
                       │  │  - area_registro (KDS)   │ │
                       │  │  - caja_comprobante      │ │
                       │  │  - tour                  │ │
                       │  │  - notificacion          │ │
                       │  └──────────────────────────┘ │
                       │                                │
                       │  Volume: postgres_data         │
                       └────────────────────────────────┘
```

## Flujo de Datos

### 1. Autenticación

```
Usuario → Login Form → POST /api/auth/login
                              ↓
                       Verificar credenciales (bcrypt)
                              ↓
                       Generar JWT Token
                              ↓
                       Guardar en localStorage
                              ↓
                       Redirigir a main.html
```

### 2. Crear Orden (Mesero)

```
Mesero → Comanda Form → POST /api/orders
                              ↓
                       Validar datos
                              ↓
                       Crear cuenta (orden)
                              ↓
                       Crear comandas (items)
                              ↓
                       Crear area_registro (KDS)
                              ↓
                       Emitir WebSocket 'new-order'
                              ↓
                       KDS recibe y muestra
```

### 3. Preparar Platillo (Cocina)

```
Cocina → KDS → Click "Listo" → PATCH /api/kds/:id/ready
                                      ↓
                               Actualizar area_registro
                                      ↓
                               Verificar si orden completa
                                      ↓
                               Emitir WebSocket 'order-ready'
                                      ↓
                               Cajero/Mesero recibe notificación
```

### 4. Cobrar (Caja)

```
Cajero → Caja → Click "Cobrar" → POST /api/cashier/:id/close
                                        ↓
                                 Crear caja_comprobante
                                        ↓
                                 Actualizar estado cuenta
                                        ↓
                                 Generar PDF (ticket)
                                        ↓
                                 Retornar PDF al cliente
```

## Componentes del Sistema

### Frontend (Nginx)

- **Tecnología:** HTML5, CSS3, JavaScript Vanilla
- **Puerto interno:** 80
- **Responsabilidades:**
  - Servir archivos estáticos
  - Interfaz de usuario
  - Comunicación con API
  - WebSocket client

**Módulos:**
- Login
- Comandas (Mesero)
- KDS (Cocina)
- Caja
- Tour
- Reportes
- Administración

### Backend (Node.js + Express)

- **Tecnología:** Node.js 20, Express 5
- **Puerto interno:** 3000
- **Responsabilidades:**
  - API REST
  - Autenticación JWT
  - Lógica de negocio
  - WebSocket server
  - Generación de PDFs

**Middleware:**
- CORS
- Helmet (seguridad)
- Rate Limiting
- JWT Authentication
- Error Handling

**Módulos:**
- `/auth` - Autenticación
- `/orders` - Órdenes y comandas
- `/menu` - Platillos y áreas
- `/kds` - Kitchen Display System
- `/cashier` - Caja y cobros
- `/tour` - Gestión de tours
- `/reports` - Reportes y estadísticas
- `/users` - Usuarios y empleados

### Base de Datos (PostgreSQL)

- **Tecnología:** PostgreSQL 15
- **Puerto interno:** 5432
- **ORM:** Prisma

**Tablas principales:**
- `usuarios` - Usuarios del sistema
- `empleados` - Empleados del restaurante
- `roles` - Roles de usuario
- `area` - Áreas de la cocina
- `platillos` - Menú
- `cuenta` - Órdenes
- `comanda` - Items de órdenes
- `area_registro` - Items en KDS
- `caja_comprobante` - Comprobantes de pago
- `tour` - Registro de tours
- `notificacion` - Notificaciones

### Nginx (Reverse Proxy)

- **Tecnología:** Nginx Alpine
- **Puertos:** 80 (HTTP), 443 (HTTPS)
- **Responsabilidades:**
  - Reverse proxy
  - SSL/TLS termination
  - Load balancing
  - Compresión gzip
  - Cache de estáticos

## Seguridad

### Autenticación

```
1. Usuario envía credenciales
2. Backend verifica con bcrypt
3. Backend genera JWT (expira en 7 días)
4. Cliente guarda JWT en localStorage
5. Todas las peticiones incluyen: Authorization: Bearer <token>
```

### Autorización

```
Middleware verifica:
1. Token es válido
2. Token no ha expirado
3. Usuario tiene rol necesario
4. Recurso pertenece al usuario (si aplica)
```

### Protecciones

- **CORS:** Solo dominios permitidos
- **Helmet:** Headers de seguridad
- **Rate Limiting:** Prevenir ataques
- **bcrypt:** Hash de contraseñas (10 rounds)
- **JWT:** Tokens firmados
- **HTTPS:** Encriptación en tránsito
- **Firewall:** Solo puertos necesarios

## WebSocket (Socket.io)

### Eventos del Servidor

```javascript
// Nueva orden a cocina
socket.emit('new-order', {
  orderId: number,
  mesa: string,
  items: array
});

// Orden lista para cobrar
socket.emit('order-ready', {
  orderId: number,
  mesa: string
});

// Actualización de orden
socket.emit('order-updated', {
  orderId: number,
  status: string
});
```

### Salas (Rooms)

- `kds-{area}` - Cada área de cocina tiene su sala
- `cashier` - Sala para cajeros
- `waiter-{userId}` - Sala para cada mesero

### Conexión

```javascript
// Cliente se conecta
const socket = io('http://localhost:3000');

// Cliente se une a sala
socket.emit('join-area', 'Cocina');

// Cliente escucha eventos
socket.on('new-order', (data) => {
  // Actualizar UI
});
```

## Escalabilidad

### Vertical (Aumentar recursos)

- Más CPU/RAM en el VPS
- PostgreSQL puede escalar hasta ~100 usuarios simultáneos con 4GB RAM
- Node.js puede manejar miles de conexiones con clúster

### Horizontal (Más servidores)

Para escalar horizontalmente:

1. **Load Balancer:** Nginx o DigitalOcean LB
2. **Múltiples instancias de backend:** docker compose scale backend=3
3. **Redis para sesiones:** Compartir sesiones entre instancias
4. **Redis para Socket.io:** Sincronizar WebSocket entre instancias
5. **PostgreSQL replicación:** Master-Slave para lectura

```yaml
# docker-compose.yml para escalar
services:
  backend:
    deploy:
      replicas: 3
    
  redis:
    image: redis:alpine
    
  postgres-slave:
    image: postgres:15-alpine
```

## Monitoreo

### Logs

```bash
# Ver logs en tiempo real
docker compose logs -f

# Logs específicos
docker compose logs backend | grep ERROR
```

### Métricas

```bash
# CPU, RAM, Network
docker stats

# Espacio en disco
df -h

# Conexiones activas
docker compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

### Health Checks

Cada contenedor tiene health check:

```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Backup y Recuperación

### Backup Automático

```bash
# Diario vía cron
0 2 * * * /opt/chicoj/scripts/backup.sh
```

### Estrategia 3-2-1

- **3** copias de los datos
- **2** tipos de almacenamiento diferentes
- **1** copia off-site

### Recuperación

```bash
# Restaurar desde backup
./scripts/restore.sh backups/chicoj_backup_20240101.sql.gz

# Tiempo de recuperación: ~5 minutos
```

## Performance

### Optimizaciones Actuales

- **Gzip:** Compresión de respuestas
- **Cache:** Headers de cache para estáticos
- **Índices:** En BD para queries frecuentes
- **Connection Pooling:** Prisma maneja el pool
- **Rate Limiting:** Evita sobrecarga

### Benchmarks

Con VPS de 2GB RAM:
- **Usuarios simultáneos:** 10-20
- **Tiempo de respuesta API:** <100ms
- **WebSocket latencia:** <50ms
- **Throughput:** ~100 req/s

## Costos de Operación

### DigitalOcean (mensual)

- **Droplet 2GB:** $12/mes
- **Droplet 4GB:** $24/mes
- **Backups:** $1.20-$2.40/mes (10% del droplet)
- **Volumen extra 50GB:** $5/mes (opcional)

### Total estimado

- **Básico:** ~$15/mes (droplet + backups)
- **Recomendado:** ~$30/mes (droplet + backups + dominio)
- **Empresarial:** ~$50/mes (droplet + backups + LB)

---

**Documentación actualizada:** 2024

