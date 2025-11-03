# 📧 Guía de Configuración de Email para Producción

Esta guía te ayudará a configurar el envío de emails para la recuperación de contraseñas en tu sistema Chicoj.

## 📋 Índice

1. [Opción 1: Gmail (Más Simple)](#opción-1-gmail-recomendado-para-empezar)
2. [Opción 2: SendGrid (Profesional)](#opción-2-sendgrid-profesional)
3. [Opción 3: SMTP Personalizado](#opción-3-smtp-personalizado)
4. [Probar la Configuración](#probar-la-configuración)
5. [Troubleshooting](#troubleshooting)

---

## Opción 1: Gmail (Recomendado para empezar)

### ✅ Ventajas
- Gratis
- Fácil de configurar
- No requiere verificación de dominio
- Ideal para desarrollo y pequeñas implementaciones

### ⚠️ Limitaciones
- Máximo 500 emails por día
- Puede ser bloqueado si envías muchos emails seguidos

### 📝 Pasos de Configuración

#### 1. Habilitar Autenticación de 2 Factores en Gmail

1. Ve a tu cuenta de Google: https://myaccount.google.com
2. Click en "Seguridad" (en el menú lateral)
3. En "Cómo inicias sesión en Google", click en "Verificación en dos pasos"
4. Sigue los pasos para habilitar 2FA

#### 2. Generar Contraseña de Aplicación

1. Regresa a https://myaccount.google.com/security
2. Busca "Contraseñas de aplicaciones" (al final de la sección "Cómo inicias sesión en Google")
3. Click en "Contraseñas de aplicaciones"
4. Selecciona:
   - **App:** Correo
   - **Dispositivo:** Otro (nombre personalizado)
   - Ponle un nombre como "Chicoj Restaurant System"
5. Click en "Generar"
6. **⚠️ IMPORTANTE:** Copia la contraseña de 16 caracteres que aparece (la necesitarás en el siguiente paso)

#### 3. Configurar Variables de Entorno

Edita tu archivo `.env` en el backend:

```bash
# ============ EMAIL ============
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx    # La contraseña de aplicación de 16 caracteres
EMAIL_FROM=tu-email@gmail.com
EMAIL_FROM_NAME=Restaurante Chicooj
FRONTEND_URL=https://tudominio.com    # O http://localhost para desarrollo
```

#### 4. Reiniciar el Backend

```bash
docker compose restart backend
```

### ✅ ¡Listo! Gmail está configurado

---

## Opción 2: SendGrid (Profesional)

### ✅ Ventajas
- 100 emails gratis por día (plan Free)
- Excelente deliverability
- Dashboard con estadísticas
- Profesional y confiable

### 📝 Pasos de Configuración

#### 1. Crear Cuenta en SendGrid

1. Ve a https://sendgrid.com
2. Click en "Start for Free"
3. Completa el registro (es gratis hasta 100 emails/día)
4. Verifica tu email

#### 2. Verificar tu Dominio (Recomendado)

1. En el dashboard de SendGrid, ve a **Settings > Sender Authentication**
2. Click en "Verify a Single Sender" (opción rápida) o "Authenticate Your Domain" (recomendado)
3. Sigue los pasos para verificar tu dominio o email

#### 3. Crear API Key

1. Ve a **Settings > API Keys**
2. Click en "Create API Key"
3. Nombre: `Chicoj Restaurant`
4. Permisos: "Full Access" o "Mail Send" solamente
5. Click en "Create & View"
6. **⚠️ IMPORTANTE:** Copia la API Key (solo se muestra una vez)

#### 4. Configurar Variables de Entorno

```bash
# ============ EMAIL ============
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=tu-email-verificado@tudominio.com
EMAIL_FROM_NAME=Restaurante Chicooj
FRONTEND_URL=https://tudominio.com
```

#### 5. Reiniciar el Backend

```bash
docker compose restart backend
```

### ✅ ¡SendGrid está configurado!

---

## Opción 3: SMTP Personalizado

Puedes usar cualquier servicio SMTP como:
- **Mailgun** (100 emails gratis/día)
- **Amazon SES** (muy económico)
- **Brevo (ex Sendinblue)** (300 emails gratis/día)
- **Tu propio servidor SMTP**

### 📝 Configuración General

```bash
# ============ EMAIL ============
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.tuservicio.com
EMAIL_PORT=587
EMAIL_SECURE=false          # true para puerto 465, false para 587
EMAIL_USER=tu-usuario
EMAIL_PASSWORD=tu-password
EMAIL_FROM=noreply@tudominio.com
EMAIL_FROM_NAME=Restaurante Chicooj
FRONTEND_URL=https://tudominio.com
```

### Ejemplos Específicos

#### Mailgun
```bash
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@tu-dominio.mailgun.org
EMAIL_PASSWORD=tu-password-de-mailgun
```

#### Amazon SES
```bash
EMAIL_SERVICE=smtp
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=tu-smtp-username
EMAIL_PASSWORD=tu-smtp-password
```

---

## 🧪 Probar la Configuración

### 1. Verificar Logs del Backend

Después de reiniciar, revisa los logs:

```bash
docker compose logs backend | grep -i email
```

Deberías ver:
```
✅ Servicio de email inicializado: gmail
```

### 2. Probar Recuperación de Contraseña

1. Ve a: `http://tudominio.com/templates/login.html`
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresa un usuario válido (ej: `admin`)
4. Verifica tu email (**revisa spam/promociones**)

### 3. Verificar en los Logs

```bash
docker compose logs backend --tail 50
```

Deberías ver algo como:
```
🔐 Código de recuperación generado para admin: 123456
📧 Código enviado por email a: admin@example.com
```

---

## 🔧 Troubleshooting

### ❌ Error: "Service email not available"

**Causa:** Variables de entorno no configuradas o incorrectas

**Solución:**
1. Verifica que el archivo `.env` exista en `Chicoj_System_R-T/backend/.env`
2. Asegúrate de que las variables EMAIL_USER, EMAIL_PASSWORD, etc. estén correctamente configuradas
3. Reinicia el backend: `docker compose restart backend`

---

### ❌ Error: "Invalid login" (Gmail)

**Causa:** No estás usando una contraseña de aplicación

**Solución:**
1. **NO uses tu contraseña normal de Gmail**
2. Debes usar una "Contraseña de Aplicación" de 16 caracteres
3. Sigue los pasos en [Configuración Gmail](#2-generar-contraseña-de-aplicación)

---

### ❌ Email no llega

**Posibles causas:**

1. **Está en Spam/Promociones**
   - Revisa todas las carpetas de tu email
   - Marca el remitente como seguro

2. **Email incorrecto en la base de datos**
   - Verifica que los empleados tengan emails válidos
   - Puedes actualizar el email en el módulo de empleados

3. **Servicio no inicializado**
   - Revisa los logs: `docker compose logs backend`
   - Busca mensajes de error relacionados con email

4. **Rate limiting (Gmail)**
   - Gmail tiene límites de envío
   - Espera unos minutos y vuelve a intentar

---

### ❌ Error: "Connection timeout" (SMTP)

**Causa:** Firewall bloqueando puerto 587 o 465

**Solución:**
1. Verifica que tu servidor pueda conectarse al puerto:
   ```bash
   telnet smtp.gmail.com 587
   ```
2. Si no funciona, tu servidor o firewall está bloqueando el puerto
3. Contacta a tu proveedor de hosting

---

## 📊 Monitoreo de Emails

### Gmail
- Ve a "Enviados" en tu cuenta de Gmail
- Verás todos los emails enviados

### SendGrid
- Dashboard > Activity
- Verás estadísticas completas de tus emails

### Logs del Sistema
```bash
# Ver todos los emails enviados
docker compose logs backend | grep "📧 Email enviado"

# Ver errores de email
docker compose logs backend | grep "❌.*email"
```

---

## 🔐 Seguridad

### ✅ Mejores Prácticas

1. **Nunca compartas tu contraseña de aplicación**
2. **No subas el archivo .env a Git**
3. **Usa variables de entorno en producción**
4. **Revoca contraseñas de aplicación no usadas**
5. **Monitorea el uso de tu servicio de email**

### 🚨 Si tu contraseña se filtra

**Gmail:**
1. Ve a https://myaccount.google.com/apppasswords
2. Revoca la contraseña comprometida
3. Genera una nueva
4. Actualiza tu `.env`

**SendGrid:**
1. Ve a Settings > API Keys
2. Elimina la API Key comprometida
3. Genera una nueva
4. Actualiza tu `.env`

---

## 📝 Variables de Entorno Completas

Aquí está la lista completa de todas las variables relacionadas con email:

```bash
# ============ EMAIL CONFIGURATION ============

# Servicio a usar: 'gmail', 'smtp', 'sendgrid'
EMAIL_SERVICE=gmail

# Para Gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# Para SMTP Personalizado
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Para SendGrid
EMAIL_API_KEY=SG.xxxxxxxxxxxxxxxxxx

# General (todos los servicios)
EMAIL_FROM=noreply@tudominio.com
EMAIL_FROM_NAME=Restaurante Chicooj

# Frontend URL (para links en emails)
FRONTEND_URL=https://tudominio.com
```

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa los logs:**
   ```bash
   docker compose logs backend --tail 100
   ```

2. **Verifica la configuración:**
   ```bash
   cat Chicoj_System_R-T/backend/.env | grep EMAIL
   ```

3. **Prueba la conexión SMTP:**
   ```bash
   docker compose exec backend node -e "
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: 'tu-email@gmail.com',
       pass: 'tu-password-de-aplicacion'
     }
   });
   transporter.verify().then(console.log).catch(console.error);
   "
   ```

---

## 🎉 Conclusión

Una vez configurado correctamente, el sistema enviará automáticamente:

1. **Código de recuperación** cuando un usuario olvide su contraseña
2. **Confirmación de cambio** cuando la contraseña sea actualizada

Los emails tienen un diseño profesional y son completamente responsivos (se ven bien en móvil).

**¡Tu sistema de recuperación de contraseñas está listo para producción! 🚀**

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0  
**Proyecto:** Chicoj Restaurant Management System

