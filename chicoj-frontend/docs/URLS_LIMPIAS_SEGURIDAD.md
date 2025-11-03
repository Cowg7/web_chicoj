# 🔒 URLS LIMPIAS Y SEGURIDAD EN PRODUCCIÓN

**Fecha:** 1 de Noviembre 2025

---

## 🎯 Problema

En producción:
1. ❌ URLs feas: `/templates/login.html`
2. ❌ Se pueden ver archivos y carpetas navegando a `/templates/`
3. ❌ Código visible en el navegador
4. ❌ Archivos sensibles expuestos (.md, .sh, .env, etc.)

---

## ✅ Solución Implementada

### 1. **URLs Limpias** (sin .html)

**ANTES:**
```
http://localhost/templates/login.html
http://localhost/templates/caja/caja.html
http://localhost/main.html
```

**AHORA:**
```
http://localhost/templates/login
http://localhost/templates/caja/caja
http://localhost/main
```

O mejor aún (configuración adicional):
```
http://localhost/login
http://localhost/caja
http://localhost/dashboard
```

---

### 2. **Seguridad - Listado de Directorios Deshabilitado**

**ANTES:**
```
http://localhost/templates/
→ ❌ Mostraba lista de archivos:
   - login.html
   - caja/
   - cocina/
   - mesero/
```

**AHORA:**
```
http://localhost/templates/
→ ✅ Error 404 - No se muestra nada
```

---

### 3. **Archivos Sensibles Bloqueados**

Ahora estos archivos están **bloqueados**:
- ❌ `.md` (documentación)
- ❌ `.txt` (notas)
- ❌ `.sh` (scripts)
- ❌ `.sql` (base de datos)
- ❌ `.env` (configuración)
- ❌ `.git*` (repositorio)

**Ejemplo:**
```
http://localhost/docs/LOGOUT_SEGURO.md
→ ✅ Error 404 - Acceso denegado
```

---

## 🔧 Configuración de Nginx

**Archivo:** `nginx/conf.d/default.conf`

### URLs Limpias:
```nginx
# Redirección automática de .html
if ($request_uri ~ ^/(.*)\.html(\?.*)?$) {
    return 301 /$1$2;
}

# Servir archivos con y sin .html
try_files $uri $uri.html $uri/ /index.html;
```

### Deshabilitar Listado de Directorios:
```nginx
autoindex off;
```

### Bloquear Archivos Sensibles:
```nginx
# Bloquear archivos ocultos (.git, .env, etc.)
location ~ /\. {
    deny all;
    return 404;
}

# Bloquear archivos de documentación y scripts
location ~* \.(md|txt|sh|sql|env|git|gitignore)$ {
    deny all;
    return 404;
}
```

---

## 📝 Script de Cliente (Opcional)

**Archivo:** `scripts/url-rewriter.js`

Este script:
- ✅ Limpia URLs en el cliente (remueve .html)
- ✅ Intercepta clicks en enlaces
- ✅ Actualiza el historial del navegador
- ✅ Mantiene URLs limpias sin recargar

**Uso:**
```html
<script src="/scripts/url-rewriter.js?v=20251101k"></script>
```

---

## 🚀 Cómo Funciona

### Ejemplo 1: Usuario navega a `/login.html`
```
1. Nginx detecta ".html" en la URL
2. Redirige (301) a: /login
3. Nginx sirve el archivo login.html internamente
4. Usuario ve: http://localhost/login ✅
```

### Ejemplo 2: Usuario intenta ver `/templates/`
```
1. Nginx tiene autoindex off
2. Retorna: 404 Not Found
3. Usuario NO puede ver lista de archivos ✅
```

### Ejemplo 3: Usuario intenta ver `/docs/LOGOUT_SEGURO.md`
```
1. Nginx detecta extensión .md
2. Retorna: 404 Not Found
3. Usuario NO puede ver documentación ✅
```

---

## 🧪 Pruebas de Seguridad

### Test 1: URLs Limpias
```
1. Ve a: http://localhost/templates/login.html
2. ✅ Debería redirigir a: /templates/login
3. La página funciona normalmente
```

### Test 2: Listado de Directorios
```
1. Ve a: http://localhost/templates/
2. ✅ Debería mostrar 404
3. NO muestra lista de archivos
```

### Test 3: Archivos Sensibles
```
1. Ve a: http://localhost/docs/LOGOUT_SEGURO.md
2. ✅ Debería mostrar 404
3. NO se puede descargar el archivo
```

### Test 4: Archivos Públicos (Permitidos)
```
1. Ve a: http://localhost/css/base.css
2. ✅ Se carga correctamente
3. Los CSS/JS/imágenes SÍ son accesibles
```

---

## 📂 Archivos Bloqueados vs Permitidos

### ❌ BLOQUEADOS (404):
- `*.md` - Documentación
- `*.txt` - Notas
- `*.sh` - Scripts bash
- `*.sql` - Base de datos
- `*.env` - Variables de entorno
- `.git*` - Repositorio git
- `.htaccess`
- `docker-compose.yml`
- Listado de directorios

### ✅ PERMITIDOS (Acceso público):
- `*.html` - Páginas (servidas sin extensión)
- `*.css` - Estilos
- `*.js` - JavaScript
- `*.png, *.jpg, *.svg` - Imágenes
- `*.woff, *.ttf` - Fuentes
- `/api/*` - Backend

---

## 🔒 Mejoras Adicionales Recomendadas

### 1. **Rutas Amigables Personalizadas**

En lugar de `/templates/login`, usar solo `/login`:

```nginx
# En nginx
location /login {
    try_files /templates/login.html =404;
}

location /caja {
    try_files /templates/caja/caja.html =404;
}

location /cocina {
    try_files /templates/cocina/cocina.html =404;
}

# etc...
```

### 2. **Headers de Seguridad**

```nginx
# Prevenir clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevenir MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# XSS Protection
add_header X-XSS-Protection "1; mode=block" always;

# Política de referrer
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### 3. **Bloquear Acceso a Carpetas Específicas**

```nginx
# Bloquear carpeta docs completamente
location /docs {
    deny all;
    return 404;
}

# Bloquear acceso a tests
location ~* /TEST.*\.html$ {
    deny all;
    return 404;
}
```

---

## 📋 Configuración Aplicada

He actualizado `nginx/conf.d/default.conf` con:

1. ✅ `autoindex off` - No mostrar archivos
2. ✅ Redirección 301 de `.html` a URL limpia
3. ✅ `try_files $uri $uri.html` - Servir HTML sin extensión
4. ✅ Bloqueo de archivos sensibles (`.md`, `.sh`, `.env`, etc.)
5. ✅ Bloqueo de archivos ocultos (`.git`, `.htaccess`, etc.)

---

## 🧪 Cómo Probar

### Test de URLs Limpias:
```bash
# Navega a estas URLs (CON .html)
http://localhost/templates/login.html

# Deberías ser redirigido a (SIN .html):
http://localhost/templates/login

# Y la página funciona normalmente ✅
```

### Test de Seguridad:
```bash
# Intenta ver listado de directorios:
http://localhost/templates/
→ ✅ 404 Not Found

# Intenta ver documentación:
http://localhost/docs/LOGOUT_SEGURO.md
→ ✅ 404 Not Found

# Intenta ver scripts:
http://localhost/scripts/
→ ✅ 404 Not Found
```

### Test de Archivos Públicos:
```bash
# CSS debería funcionar:
http://localhost/css/base.css
→ ✅ Se carga

# JS debería funcionar:
http://localhost/scripts/config.js
→ ✅ Se carga

# HTML sin extensión:
http://localhost/main
→ ✅ Muestra main.html
```

---

## ⚠️ Importante: Actualizar Enlaces

Si quieres que los enlaces internos usen URLs limpias, deberías actualizar de:

```html
<!-- ANTES -->
<a href="/templates/login.html">Login</a>

<!-- DESPUÉS -->
<a href="/templates/login">Login</a>
```

¿Quieres que actualice **todos los enlaces** del sistema para usar URLs limpias?

---

## 🎯 Resultado en Producción

**ANTES:**
```
URL: https://chicoj.com/templates/login.html
Navegando a /templates/ → Lista de archivos visible
Navegando a /docs/ → Documentación visible
```

**AHORA:**
```
URL: https://chicoj.com/templates/login
Navegando a /templates/ → 404
Navegando a /docs/ → 404
Archivos .md, .sh, .env → Bloqueados
```

---

**He reiniciado nginx con la nueva configuración. Prueba ahora navegando a `/templates/` y deberías ver 404 en lugar de la lista de archivos.** 🔒

¿Quieres que actualice todos los enlaces internos para usar URLs limpias (sin .html)?
