# 🧪 TESTS DE SEGURIDAD

Realiza estas pruebas para verificar que la configuración de seguridad funciona:

---

## ❌ TEST 1: Bloqueo de Listado de Directorios

### Prueba:
```
http://localhost/templates/
http://localhost/scripts/
http://localhost/css/
http://localhost/docs/
```

### Resultado Esperado:
```
✅ 404 Not Found
❌ NO debería mostrar lista de archivos
```

---

## ❌ TEST 2: Bloqueo de Archivos .md

### Prueba:
```
http://localhost/docs/LOGOUT_SEGURO.md
http://localhost/docs/SISTEMA_CATEGORIAS.md
http://localhost/scripts/README.md
```

### Resultado Esperado:
```
✅ 404 Not Found
❌ NO debería mostrar el contenido
```

---

## ❌ TEST 3: Bloqueo de Archivos Sensibles

### Prueba:
```
http://localhost/README.md
http://localhost/docker-compose.yml
http://localhost/.gitignore
http://localhost/.env
```

### Resultado Esperado:
```
✅ 404 Not Found
❌ NO accesibles
```

---

## ✅ TEST 4: Archivos Públicos Permitidos

### Prueba:
```
http://localhost/css/base.css
http://localhost/scripts/config.js
http://localhost/assets/favicon.svg
```

### Resultado Esperado:
```
✅ 200 OK
✅ Se cargan correctamente
```

---

## ✅ TEST 5: HTML Sin Extensión (URLs Limpias)

### Prueba:
```
http://localhost/templates/login
http://localhost/main
http://localhost/index
```

### Resultado Esperado:
```
✅ 200 OK (carga login.html, main.html, index.html)
✅ URLs limpias funcionan
```

---

## 🔍 TEST 6: Redirección de .html (TEMPORAL)

**NOTA:** La redirección con `if` puede causar problemas.

### Prueba:
```
http://localhost/templates/login.html
```

### Resultado:
- **Si funciona:** Redirige a `/templates/login` ✅
- **Si no funciona:** Muestra login.html pero con extensión (funciona igual)

---

## 🎯 Prioridad de Seguridad

### CRÍTICO (Debe estar bloqueado):
1. ✅ Listado de directorios → 404
2. ✅ Archivos .md → 404
3. ✅ Archivos .env, .git → 404
4. ✅ Carpeta /docs/ → 404

### IMPORTANTE (Debe funcionar):
1. ✅ HTML sin extensión → 200
2. ✅ CSS/JS → 200
3. ✅ Imágenes → 200
4. ✅ API → 200

---

## 🐛 Si No Funciona

### Verificar configuración de nginx:
```bash
docker compose exec nginx nginx -t
```

Deberías ver:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Ver logs de nginx:
```bash
docker compose logs nginx --tail=50
```

### Reiniciar nginx:
```bash
docker compose restart nginx
```

---

**Realiza los tests 1, 2 y 3. Si aún ves las carpetas/archivos, hay un problema con la configuración.**

