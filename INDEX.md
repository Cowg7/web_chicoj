# 📖 Índice de Documentación - Sistema Chicoj

Bienvenido al Sistema Chicoj. Esta es tu guía para navegar toda la documentación.

---

## 🚀 Empezar Rápido

¿Primera vez aquí? Empieza por estos documentos en orden:

1. **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** ⭐
   - Resumen ejecutivo de todo
   - Vista general del proyecto dockerizado
   - Checklist rápido
   - **Lee esto primero**

2. **[QUICK_START.md](QUICK_START.md)** ⚡
   - Deployment en 5 minutos
   - Para usuarios avanzados
   - Comandos mínimos necesarios

3. **[DEPLOYMENT.md](DEPLOYMENT.md)** 📚
   - Guía completa paso a paso
   - Configuración detallada
   - Troubleshooting
   - **La guía definitiva**

---

## 📚 Documentación Principal

### Para Deployment

| Documento | Descripción | Cuándo usar |
|-----------|-------------|-------------|
| [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) | Resumen ejecutivo | Primera lectura |
| [QUICK_START.md](QUICK_START.md) | Inicio rápido (5 min) | Si tienes experiencia con Docker |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Guía completa | Deployment paso a paso |
| [CHECKLIST.md](CHECKLIST.md) | Lista de verificación | Durante el deployment |

### Para Desarrollo

| Documento | Descripción | Cuándo usar |
|-----------|-------------|-------------|
| [README.md](README.md) | Documentación general | Referencia del proyecto |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura técnica | Entender cómo funciona |
| [FILES_CREATED.md](FILES_CREATED.md) | Descripción de archivos | Saber qué hace cada archivo |

---

## 🛠️ Archivos Importantes

### Configuración

```
env.example              ← Copiar a .env y configurar
docker-compose.yml       ← Orquestación de servicios
.gitignore              ← Protección de archivos sensibles
Makefile                ← Comandos simplificados
```

### Scripts de Deployment

```
setup-server.sh         ← Configuración inicial del servidor
deploy.sh               ← Deployment de la aplicación
setup-permissions.sh    ← Dar permisos a scripts
```

### Scripts de Utilidad

```
scripts/
  ├── backup.sh         ← Backup de base de datos
  ├── restore.sh        ← Restaurar backup
  ├── logs.sh           ← Ver logs
  ├── status.sh         ← Ver estado del sistema
  ├── update.sh         ← Actualizar código
  └── ssl-setup.sh      ← Configurar SSL/HTTPS
```

---

## 🎯 Guías por Caso de Uso

### "Quiero hacer deployment por primera vez"

1. Lee [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
2. Sigue [QUICK_START.md](QUICK_START.md) o [DEPLOYMENT.md](DEPLOYMENT.md)
3. Usa [CHECKLIST.md](CHECKLIST.md) para verificar

### "Quiero entender cómo funciona el sistema"

1. Lee [README.md](README.md)
2. Lee [ARCHITECTURE.md](ARCHITECTURE.md)
3. Revisa [FILES_CREATED.md](FILES_CREATED.md)

### "Tengo un problema durante el deployment"

1. Revisa [DEPLOYMENT.md - Solución de Problemas](DEPLOYMENT.md#solución-de-problemas)
2. Ejecuta `./scripts/status.sh` y `./scripts/logs.sh`
3. Consulta [CHECKLIST.md](CHECKLIST.md)

### "Quiero actualizar el código en producción"

1. Ejecuta `./scripts/update.sh`
2. O sigue [DEPLOYMENT.md - Mantenimiento](DEPLOYMENT.md#mantenimiento)

### "Quiero configurar SSL/HTTPS"

1. Lee [DEPLOYMENT.md - Paso 6](DEPLOYMENT.md#paso-6-configurar-ssl-con-lets-encrypt)
2. Ejecuta `./scripts/ssl-setup.sh`

### "Necesito hacer un backup"

1. Ejecuta `./scripts/backup.sh`
2. O consulta [DEPLOYMENT.md - Mantenimiento](DEPLOYMENT.md#backup-de-base-de-datos)

---

## 📁 Estructura del Proyecto

```
chicoj/
├── 📄 Documentación
│   ├── INDEX.md                    ← Estás aquí
│   ├── README.md                   ← Documentación general
│   ├── DEPLOYMENT.md               ← Guía de deployment
│   ├── DEPLOYMENT_SUMMARY.md       ← Resumen ejecutivo
│   ├── QUICK_START.md              ← Inicio rápido
│   ├── ARCHITECTURE.md             ← Arquitectura
│   ├── CHECKLIST.md                ← Lista de verificación
│   └── FILES_CREATED.md            ← Descripción de archivos
│
├── 🐳 Docker
│   ├── docker-compose.yml          ← Orquestación principal
│   ├── .dockerignore               ← Optimización
│   └── Chicoj_System_R-T/backend/
│       └── Dockerfile              ← Imagen backend
│   └── chicoj-frontend/
│       └── Dockerfile              ← Imagen frontend
│
├── 🌐 Nginx
│   ├── nginx/
│   │   ├── nginx.conf              ← Configuración principal
│   │   └── conf.d/
│   │       └── default.conf        ← Routing y proxy
│   └── chicoj-frontend/
│       └── nginx.conf              ← Frontend server
│
├── ⚙️ Configuración
│   ├── env.example                 ← Template de variables
│   ├── .gitignore                  ← Git ignore
│   └── Makefile                    ← Comandos simplificados
│
├── 🚀 Scripts de Deployment
│   ├── setup-server.sh             ← Setup inicial
│   ├── deploy.sh                   ← Deployment
│   └── setup-permissions.sh        ← Permisos
│
├── 🛠️ Scripts de Utilidad
│   └── scripts/
│       ├── backup.sh               ← Backup
│       ├── restore.sh              ← Restaurar
│       ├── logs.sh                 ← Ver logs
│       ├── status.sh               ← Estado
│       ├── update.sh               ← Actualizar
│       └── ssl-setup.sh            ← Configurar SSL
│
└── 💻 Código Fuente
    ├── Chicoj_System_R-T/          ← Backend + BD
    │   └── backend/
    │       ├── src/                ← Código Node.js
    │       └── prisma/             ← Schema y migraciones
    └── chicoj-frontend/            ← Frontend
        ├── templates/              ← HTML
        ├── scripts/                ← JavaScript
        └── css/                    ← Estilos
```

---

## 🎓 Flujo de Trabajo Recomendado

### Primera Vez

```
1. Lee DEPLOYMENT_SUMMARY.md
2. Prepara VPS en DigitalOcean
3. Clona el proyecto en /opt/chicoj
4. Ejecuta setup-permissions.sh
5. Ejecuta setup-server.sh
6. Configura .env
7. Ejecuta deploy.sh
8. Verifica con CHECKLIST.md
```

### Actualizaciones

```
1. git pull origin main
2. ./scripts/update.sh
3. Verificar logs
```

### Mantenimiento

```
Diario:
  - Revisar logs: ./scripts/logs.sh

Semanal:
  - Verificar estado: ./scripts/status.sh
  - Backup manual: ./scripts/backup.sh

Mensual:
  - Actualizar sistema: apt update && apt upgrade
  - Revisar uso de disco: df -h
  - Limpiar Docker: docker system prune
```

---

## 💡 Tips y Mejores Prácticas

### Durante el Deployment

- ✅ Usa el [CHECKLIST.md](CHECKLIST.md) para no olvidar nada
- ✅ Guarda una copia del archivo `.env`
- ✅ Haz un backup antes de actualizar
- ✅ Prueba en desarrollo antes de producción

### Seguridad

- ⚠️ NUNCA subas `.env` a Git
- ⚠️ Cambia las contraseñas por defecto
- ⚠️ Usa JWT_SECRET aleatorio y largo
- ⚠️ Configura SSL/HTTPS en producción
- ⚠️ Mantén backups regulares

### Performance

- 📊 Monitorea recursos: `docker stats`
- 📊 Revisa logs regularmente
- 📊 Ajusta rate limiting según necesidad
- 📊 Considera escalar si >20 usuarios

---

## 🆘 Ayuda Rápida

### Comandos Más Usados

```bash
# Estado del sistema
./scripts/status.sh

# Ver logs
./scripts/logs.sh [servicio]

# Reiniciar
docker compose restart

# Backup
./scripts/backup.sh

# Actualizar
./scripts/update.sh
```

### Troubleshooting Rápido

```bash
# Si algo falla:
docker compose logs -f           # Ver logs
docker compose restart           # Reiniciar todo
docker compose down && up -d     # Reinicio completo

# Verificar servicios:
docker compose ps                # Estado
curl http://localhost/api/health # Backend
```

---

## 📞 Recursos

### Documentación Externa

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)

### Herramientas Útiles

- [JWT.io](https://jwt.io/) - Debugger de JWT
- [SSL Labs](https://www.ssllabs.com/ssltest/) - Test SSL
- [GRC Password Generator](https://www.grc.com/passwords.htm) - Generar passwords

---

## ✅ Checklist Rápido

Antes de empezar:
- [ ] He leído [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
- [ ] Tengo acceso a un VPS Ubuntu 22.04
- [ ] Tengo acceso SSH al servidor
- [ ] Entiendo los conceptos básicos de Docker

Durante el deployment:
- [ ] Seguir [QUICK_START.md](QUICK_START.md) o [DEPLOYMENT.md](DEPLOYMENT.md)
- [ ] Usar [CHECKLIST.md](CHECKLIST.md) para verificar

Después del deployment:
- [ ] Sistema accesible en http://TU_IP
- [ ] Login funciona
- [ ] Contraseñas cambiadas
- [ ] Backup realizado

---

## 🎉 ¡Listo para Empezar!

Ahora que conoces toda la documentación, empieza con:

👉 **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)**

O si ya sabes lo que haces:

👉 **[QUICK_START.md](QUICK_START.md)**

---

**¡Éxito con tu deployment! 🚀**

---

*Sistema Chicoj - Restaurant Management System*
*Documentación v1.0 - 2024*

