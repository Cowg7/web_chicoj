# 🍽️ Sistema Chicoj - Restaurant Management System

Sistema integral de gestión para restaurantes con módulos de punto de venta (POS), cocina (KDS), tours y reportes.

## 📋 Características

- 🔐 **Sistema de autenticación** con roles (Admin, Mesero, Cocina, Cajero)
- 📱 **Responsive Design** - Funciona en desktop, tablet y móvil
- 🍽️ **Gestión de comandas** - Toma de órdenes eficiente
- 👨‍🍳 **Kitchen Display System (KDS)** - Pantalla para cocina en tiempo real
- 💰 **Módulo de caja** - Cobros y reportes
- 📊 **Dashboard de reportes** - Estadísticas y exportación PDF
- 🚌 **Gestión de tours** - Módulo para tours gastronómicos
- 🔔 **Notificaciones en tiempo real** - WebSocket para actualizaciones instantáneas
- 👥 **Gestión de usuarios y empleados** - Control de acceso

## 🏗️ Arquitectura

```
chicoj/
├── Chicoj_System_R-T/          # Backend + Base de datos
│   └── backend/
│       ├── src/                # Código fuente
│       ├── prisma/             # Schema y migraciones
│       └── Dockerfile          # Docker para backend
├── chicoj-frontend/            # Frontend
│   ├── templates/              # Páginas HTML
│   ├── scripts/                # JavaScript
│   ├── css/                    # Estilos
│   └── Dockerfile              # Docker para frontend
├── nginx/                      # Configuración Nginx
├── scripts/                    # Scripts de utilidad
├── docker-compose.yml          # Orquestación de contenedores
└── DEPLOYMENT.md               # Guía de deployment
```

### Stack Tecnológico

**Backend:**
- Node.js + Express
- PostgreSQL + Prisma ORM
- Socket.io (WebSocket)
- JWT Authentication
- bcrypt

**Frontend:**
- HTML5 / CSS3 / JavaScript (Vanilla)
- SweetAlert2
- Chart.js (reportes)

**Infrastructure:**
- Docker + Docker Compose
- Nginx (Reverse Proxy)
- Let's Encrypt (SSL)

## 🚀 Inicio Rápido

### Desarrollo Local

#### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 15+
- npm o yarn

#### Backend

```bash
cd Chicoj_System_R-T/backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
nano .env

# Iniciar PostgreSQL (con Docker)
docker compose up -d postgres

# Ejecutar migraciones
npm run db:migrate

# Ejecutar seed
npm run db:seed

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará en: `http://localhost:3000`

#### Frontend

```bash
cd chicoj-frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará en: `http://localhost:8080`

### Producción con Docker

#### Prerrequisitos

- Docker 20+
- Docker Compose 2+
- Ubuntu 22.04 (recomendado)

#### Deployment

```bash
# 1. Clonar repositorio
git clone [TU_REPO_URL]
cd chicoj

# 2. Configurar variables de entorno
cp env.example .env
nano .env  # Editar con tus valores

# 3. Dar permisos a scripts
chmod +x setup-server.sh
chmod +x deploy.sh
chmod +x scripts/*.sh

# 4. Configurar servidor (primera vez)
sudo ./setup-server.sh

# 5. Hacer deployment
./deploy.sh
```

**Ver la [Guía Completa de Deployment](DEPLOYMENT.md) para instrucciones detalladas.**

## 🔧 Comandos Útiles

### Scripts de Utilidad

```bash
# Ver estado del sistema
./scripts/status.sh

# Ver logs
./scripts/logs.sh [backend|frontend|postgres|nginx]

# Hacer backup de base de datos
./scripts/backup.sh

# Restaurar backup
./scripts/restore.sh backups/chicoj_backup_FECHA.sql.gz

# Actualizar sistema
./scripts/update.sh
```

### Docker Compose

```bash
# Iniciar servicios
docker compose up -d

# Detener servicios
docker compose down

# Ver logs
docker compose logs -f

# Reiniciar un servicio
docker compose restart backend

# Ver estado
docker compose ps

# Reconstruir imágenes
docker compose build --no-cache
```

### Base de Datos

```bash
# Entrar a PostgreSQL
docker compose exec postgres psql -U postgres restaurante_db

# Ejecutar migraciones
docker compose exec backend npx prisma migrate deploy

# Ejecutar seed
docker compose exec backend npm run db:seed

# Ver datos con Prisma Studio (desarrollo)
cd Chicoj_System_R-T/backend
npm run db:studio
```

## 📁 Estructura del Proyecto

### Backend

```
backend/
├── src/
│   ├── config/           # Configuración
│   ├── middleware/       # Middlewares (auth, cors, etc.)
│   ├── modules/          # Módulos de negocio
│   │   ├── auth/         # Autenticación
│   │   ├── menu/         # Menú y platillos
│   │   ├── orders/       # Órdenes y comandas
│   │   ├── kds/          # Kitchen Display
│   │   ├── cashier/      # Caja
│   │   ├── tour/         # Tours
│   │   ├── reports/      # Reportes
│   │   └── users/        # Usuarios
│   ├── routes/           # Rutas API
│   ├── app.js            # Configuración Express
│   └── server.js         # Servidor principal
└── prisma/
    ├── schema.prisma     # Schema de BD
    ├── seed.js           # Datos iniciales
    └── migrations/       # Migraciones
```

### Frontend

```
chicoj-frontend/
├── templates/            # Páginas HTML
│   ├── login.html        # Login
│   ├── administracion/   # Módulo admin
│   ├── mesero/           # Módulo mesero
│   ├── cocina/           # Módulo cocina
│   ├── caja/             # Módulo caja
│   ├── tour/             # Módulo tours
│   └── reportes/         # Módulo reportes
├── scripts/              # JavaScript
│   ├── api.js            # Cliente API
│   ├── config.js         # Configuración
│   ├── login.js          # Lógica login
│   └── ...
├── css/                  # Estilos
└── index.html            # Página principal
```

## 🔐 Seguridad

### Variables de Entorno Sensibles

Nunca subas tu archivo `.env` a Git. Usa `env.example` como plantilla.

### Credenciales por Defecto (Seed)

Después del seed, estos usuarios están disponibles:

- **Admin:** `admin` / `admin123`
- **Mesero:** `mesero1` / `mesero123`
- **Cocina:** `cocina` / `cocina123`
- **Cajero:** `cajero` / `cajero123`

**⚠️ IMPORTANTE:** Cambia estas contraseñas en producción.

### Recomendaciones

1. Usa contraseñas fuertes (mínimo 12 caracteres)
2. Genera un JWT_SECRET aleatorio:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Configura firewall (UFW)
4. Habilita SSL/HTTPS con Let's Encrypt
5. Mantén el sistema actualizado

## 📊 API Documentation

### Autenticación

```http
POST /api/auth/login
Content-Type: application/json

{
  "usuario": "admin",
  "password": "admin123"
}
```

### Órdenes

```http
GET /api/orders
Authorization: Bearer {token}
```

```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "no_mesa": "5",
  "items": [
    {
      "id_platillo": 1,
      "cantidad": 2,
      "observaciones": "Sin cebolla"
    }
  ]
}
```

### WebSocket Events

```javascript
// Conectar
const socket = io('http://localhost:3000');

// Eventos
socket.on('new-order', (data) => {
  console.log('Nueva orden:', data);
});

socket.on('order-ready', (data) => {
  console.log('Orden lista:', data);
});

// Unirse a sala de KDS
socket.emit('join-area', 'Cocina');
```

Ver más en la documentación de cada módulo.

## 🐛 Solución de Problemas

### Error de conexión a base de datos

```bash
# Verificar que PostgreSQL esté corriendo
docker compose ps postgres

# Ver logs
docker compose logs postgres

# Reiniciar
docker compose restart postgres
```

### Error de CORS

Agrega tu dominio a `ALLOWED_ORIGINS` en `.env`:

```bash
ALLOWED_ORIGINS=http://tu-dominio.com,https://tu-dominio.com
```

### WebSocket no conecta

Verifica la configuración de nginx y que el puerto 3000 esté accesible.

Ver más en [DEPLOYMENT.md](DEPLOYMENT.md#solución-de-problemas)

## 📝 Licencia

Este proyecto fue desarrollado como parte de un seminario universitario.

## 👥 Contribuidores

- **Backend + BD:** Kristennssen
- **Frontend:** [Tu compañero]
- **DevOps + Deployment:** [Tu nombre]

## 📞 Soporte

Para reportar problemas o solicitar features:

1. Crea un Issue en GitHub
2. Contacta al equipo de desarrollo

## 🙏 Agradecimientos

- Universidad [Nombre]
- Seminario [Nombre]
- Restaurant Chicoj

---

**Made with ❤️ for Restaurant Chicoj**

