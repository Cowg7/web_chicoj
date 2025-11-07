# ⚡ COMANDOS RÁPIDOS - SEGURIDAD

## 🔐 Ofuscación y Deployment

### Generar código ofuscado
```powershell
node chicoj-frontend\build-production.js
```

### Desplegar todo (ofuscar + copiar + reiniciar)
```powershell
powershell -ExecutionPolicy Bypass -File deploy-ofuscado.ps1
```

---

## 🧪 Verificación

### Verificar CSP headers
```powershell
curl -I http://localhost | findstr "Content-Security-Policy"
```

### Verificar archivos en contenedor
```powershell
docker exec chicoj-nginx ls -la /usr/share/nginx/html/dist/scripts/
```

### Verificar que Nginx está corriendo
```powershell
docker ps | findstr "chicoj-nginx"
```

---

## 🔄 Actualización de Código

### Flujo completo
```powershell
# 1. Editar código
notepad chicoj-frontend\scripts\login.js

# 2. Regenerar ofuscado y desplegar
powershell -ExecutionPolicy Bypass -File deploy-ofuscado.ps1

# 3. Limpiar cache navegador: Ctrl+Shift+R
```

---

## 🐛 Debugging

### Ver logs de Nginx
```powershell
docker compose logs nginx
```

### Ver logs de Backend
```powershell
docker compose logs backend
```

### Ver logs en tiempo real
```powershell
docker compose logs -f nginx
```

---

## 🔧 Mantenimiento Docker

### Reiniciar Nginx
```powershell
docker compose restart nginx
```

### Reiniciar todo el sistema
```powershell
docker compose restart
```

### Detener todo
```powershell
docker compose down
```

### Iniciar todo
```powershell
docker compose up -d
```

### Reconstruir contenedores
```powershell
docker compose down
docker compose up -d --build
```

---

## 📋 Verificar Estado

### Ver contenedores corriendo
```powershell
docker ps
```

### Ver espacio usado
```powershell
docker system df
```

### Ver logs de un archivo específico
```powershell
docker exec chicoj-nginx cat /var/log/nginx/error.log
```

---

## 🗑️ Limpieza

### Limpiar archivos dist/
```powershell
Remove-Item -Recurse -Force chicoj-frontend\dist\
```

### Limpiar Docker
```powershell
docker system prune -a
```

---

## 🔐 Archivos Clave

| Archivo | Descripción |
|---------|-------------|
| `chicoj-frontend/build-production.js` | Script de ofuscación |
| `deploy-ofuscado.ps1` | Script de deployment |
| `nginx/conf.d/default.conf` | Configuración Nginx (CSP) |
| `chicoj-frontend/dist/` | Archivos ofuscados |

---

**Tip:** Guarda este archivo como referencia rápida 📌



