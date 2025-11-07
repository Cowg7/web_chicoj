# 🚀 Inicio Rápido - 5 Minutos

Esta guía te llevará desde cero hasta tener tu aplicación corriendo en producción en aproximadamente 5 minutos.

## ⚡ Requisitos

- VPS con Ubuntu 22.04
- Acceso SSH como root
- 5 minutos de tu tiempo

## 📝 Pasos

### 1️⃣ Conectarse al servidor (30 segundos)

```bash
ssh root@TU_IP_DEL_SERVIDOR
```

### 2️⃣ Descargar e instalar (3 minutos)

```bash
# Ir al directorio de instalación
cd /opt

# Clonar el proyecto
git clone https://github.com/TU_USUARIO/chicoj.git
cd chicoj

# O subir archivos desde tu máquina local:
# scp -r /ruta/local/chicoj root@TU_IP:/opt/chicoj

# Dar permisos de ejecución
chmod +x *.sh
chmod +x scripts/*.sh

# Ejecutar configuración inicial (esto toma ~3 minutos)
sudo ./setup-server.sh
```

### 3️⃣ Configurar variables (1 minuto)

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar configuración
nano .env
```

**Cambia estos valores mínimos:**

```bash
POSTGRES_PASSWORD=TuPasswordSeguro123!
JWT_SECRET=un_secreto_muy_largo_y_aleatorio_minimo_32_caracteres
ALLOWED_ORIGINS=http://TU_IP,http://tu-dominio.com
```

Guarda con `Ctrl+X`, luego `Y`, luego `Enter`.

**Genera un JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4️⃣ Hacer deployment (1 minuto)

```bash
./deploy.sh
```

Cuando pregunte si quieres ejecutar el seed, presiona `s` y `Enter`.

### 5️⃣ ¡Listo! (10 segundos)

Abre tu navegador en:

```
http://TU_IP_DEL_SERVIDOR
```

**Credenciales por defecto:**
- Usuario: `admin`
- Password: `admin123`

---

## 🎉 ¡Eso es todo!

Tu sistema está corriendo. Ahora puedes:

1. **Cambiar las contraseñas por defecto**
2. **Configurar un dominio** (opcional): Ver [DEPLOYMENT.md](DEPLOYMENT.md#paso-5-configurar-dominio-opcional)
3. **Configurar SSL/HTTPS**: Ver [DEPLOYMENT.md](DEPLOYMENT.md#paso-6-configurar-ssl-con-lets-encrypt)

---

## 📋 Comandos Útiles

```bash
# Ver estado
docker compose ps

# Ver logs
docker compose logs -f

# Reiniciar
docker compose restart

# Detener
docker compose down

# Backup
./scripts/backup.sh
```

---

## 🐛 ¿Problemas?

### No puedo acceder al servidor

```bash
# Verificar que los servicios estén corriendo
docker compose ps

# Ver logs para errores
docker compose logs
```

### Error de conexión

```bash
# Verificar firewall
sudo ufw status

# Debería mostrar:
# 80/tcp    ALLOW    Anywhere
```

### Backend no inicia

```bash
# Ver logs del backend
docker compose logs backend

# Reiniciar backend
docker compose restart backend
```

---

## 📚 Documentación Completa

Para más detalles, ver:
- [README.md](README.md) - Documentación general
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guía completa de deployment

---

## 🆘 Ayuda

Si tienes problemas:

1. Revisa los logs: `docker compose logs -f`
2. Verifica que el archivo `.env` esté correctamente configurado
3. Asegúrate de tener los puertos 80 y 443 abiertos
4. Consulta la [sección de troubleshooting](DEPLOYMENT.md#solución-de-problemas)

---

**¡Disfruta tu Sistema Chicoj! 🍽️**

