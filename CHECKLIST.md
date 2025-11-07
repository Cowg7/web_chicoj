# ✅ Checklist de Deployment

Usa este checklist para asegurarte de que todo está configurado correctamente.

## Pre-Deployment

### Servidor
- [ ] VPS contratado (Ubuntu 22.04)
- [ ] Acceso SSH configurado
- [ ] IP del servidor obtenida
- [ ] Dominio comprado (opcional)
- [ ] DNS configurado (si tienes dominio)

### Código
- [ ] Repositorio Git actualizado
- [ ] Backend funciona localmente
- [ ] Frontend funciona localmente
- [ ] Variables de entorno definidas

## Configuración Inicial del Servidor

### Setup Script
- [ ] Conectado al servidor vía SSH
- [ ] Script `setup-server.sh` ejecutado
- [ ] Docker instalado y funcionando
- [ ] Docker Compose instalado
- [ ] Firewall (UFW) configurado
- [ ] Puertos 80 y 443 abiertos
- [ ] Usuario 'chicoj' creado
- [ ] Fail2ban configurado

### Verificación
```bash
docker --version              # Debe mostrar versión
docker compose version        # Debe mostrar versión
sudo ufw status              # Debe mostrar puertos abiertos
```

## Configuración de la Aplicación

### Archivos
- [ ] Código clonado en `/opt/chicoj`
- [ ] Archivo `.env` creado desde `env.example`
- [ ] Scripts ejecutables (`chmod +x *.sh`)

### Variables de Entorno (.env)
- [ ] `POSTGRES_PASSWORD` cambiado (no usar valor por defecto)
- [ ] `JWT_SECRET` generado (mínimo 32 caracteres)
- [ ] `ALLOWED_ORIGINS` configurado con tu dominio/IP
- [ ] `PGADMIN_PASSWORD` cambiado (si usas PgAdmin)

### Generación de Secretos
```bash
# Generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment

### Docker
- [ ] `deploy.sh` ejecutado exitosamente
- [ ] Base de datos migrada
- [ ] Seed ejecutado (datos iniciales)
- [ ] Todos los contenedores corriendo

### Verificación de Contenedores
```bash
docker compose ps

# Deben estar "Up (healthy)":
# - chicoj-postgres
# - chicoj-backend
# - chicoj-frontend
# - chicoj-nginx
```

### Pruebas Básicas
- [ ] Frontend accesible: `http://TU_IP`
- [ ] Login funciona con credenciales por defecto
- [ ] API responde: `http://TU_IP/api/health`
- [ ] Backend conecta a base de datos
- [ ] WebSocket funciona (notificaciones)

## Post-Deployment

### Seguridad
- [ ] Contraseñas por defecto cambiadas en la aplicación
- [ ] Archivo `.env` no subido a Git
- [ ] Backup inicial realizado
- [ ] SSH keys configuradas (opcional pero recomendado)
- [ ] Password authentication deshabilitado en SSH (opcional)

### Cambiar Contraseñas
```
Login como admin -> Perfil -> Cambiar contraseña
Crear nuevos usuarios con contraseñas seguras
```

## SSL/HTTPS (Opcional pero Recomendado)

### Pre-requisitos
- [ ] Dominio configurado y apuntando al servidor
- [ ] DNS propagado (puede tomar hasta 48 horas)
- [ ] Variables `DOMAIN` y `SSL_EMAIL` en `.env`

### Configuración SSL
- [ ] Script `ssl-setup.sh` ejecutado
- [ ] Certificados obtenidos de Let's Encrypt
- [ ] Nginx configurado para HTTPS
- [ ] HTTP redirige a HTTPS
- [ ] Sitio accesible vía `https://tu-dominio.com`

### Verificación SSL
```bash
# Verificar certificado
curl -I https://tu-dominio.com

# Debe mostrar: HTTP/2 200
```

- [ ] Candado verde en navegador
- [ ] Certificado válido en navegador
- [ ] Sin warnings de seguridad

## Monitoreo

### Logs
- [ ] Logs accesibles: `docker compose logs -f`
- [ ] No hay errores críticos en logs
- [ ] Backend inicia correctamente
- [ ] PostgreSQL acepta conexiones

### Estado
```bash
# Ver estado
./scripts/status.sh

# Ver recursos
docker stats
```

### Backups
- [ ] Backup manual realizado: `./scripts/backup.sh`
- [ ] Backup guardado localmente
- [ ] Cron job para backups automáticos (opcional)

### Configurar Backup Automático
```bash
# Editar crontab
crontab -e

# Agregar (backup diario a las 2 AM)
0 2 * * * cd /opt/chicoj && ./scripts/backup.sh
```

## Testing en Producción

### Funcionalidad Básica
- [ ] Login con diferentes roles
- [ ] Crear orden desde módulo mesero
- [ ] Orden aparece en KDS
- [ ] Marcar platillo como listo en KDS
- [ ] Notificación llega al mesero
- [ ] Cobrar orden en caja
- [ ] PDF se genera correctamente
- [ ] Reportes funcionan
- [ ] Tour se puede registrar

### Performance
- [ ] Tiempos de respuesta < 2 segundos
- [ ] WebSocket conecta inmediatamente
- [ ] Sin errores en consola del navegador
- [ ] Imágenes cargan rápido

### Usuarios Múltiples
- [ ] 2+ usuarios pueden usar el sistema simultáneamente
- [ ] Notificaciones llegan al usuario correcto
- [ ] No hay conflictos en la base de datos

## Documentación

### Para el Cliente
- [ ] Credenciales de acceso entregadas
- [ ] Manual de usuario entregado (si aplica)
- [ ] Contacto de soporte definido

### Para el Equipo
- [ ] IP del servidor documentada
- [ ] Credenciales de SSH documentadas
- [ ] Credenciales de base de datos documentadas
- [ ] Procedimientos de backup documentados
- [ ] Procedimientos de actualización documentados

## Mantenimiento

### Configurado
- [ ] Backups automáticos (cron)
- [ ] Renovación SSL automática (certbot)
- [ ] Monitoreo de logs
- [ ] Plan de actualización definido

### Contactos
- [ ] Email de soporte técnico
- [ ] Procedimiento para reportar bugs
- [ ] Horarios de soporte definidos

## Troubleshooting Rápido

### Si algo falla:

**Backend no inicia:**
```bash
docker compose logs backend
docker compose restart backend
```

**Frontend no carga:**
```bash
docker compose logs frontend
docker compose logs nginx
docker compose restart nginx
```

**Base de datos no conecta:**
```bash
docker compose logs postgres
docker compose restart postgres
```

**Reinicio completo:**
```bash
docker compose down
docker compose up -d
```

## Checklist Final

### Antes de declarar "listo":
- [ ] ✅ Todos los contenedores corriendo
- [ ] ✅ Aplicación accesible desde internet
- [ ] ✅ Login funciona
- [ ] ✅ Todas las funcionalidades principales probadas
- [ ] ✅ Contraseñas por defecto cambiadas
- [ ] ✅ Backup inicial realizado
- [ ] ✅ SSL configurado (si aplica)
- [ ] ✅ Documentación entregada
- [ ] ✅ Cliente puede usar el sistema

---

## Notas

Fecha de deployment: ________________

IP del servidor: ________________

Dominio (si aplica): ________________

Versión desplegada: ________________

Responsable: ________________

---

**¡Felicitaciones! 🎉 Tu sistema está en producción.**

