# 🔑 CREDENCIALES DEL SISTEMA CHICOJ

## ✅ Base de Datos Poblada

La base de datos ha sido inicializada con los siguientes datos:
- ✅ 5 Roles
- ✅ 7 Usuarios
- ✅ 3 Áreas (Cocina, Bebidas, Coffee)
- ✅ 9 Platillos de ejemplo

---

## 👥 USUARIOS Y CONTRASEÑAS

### 1️⃣ Administrador (Acceso Total)
```
Usuario: admin
Contraseña: admin123
Rol: Administrador
```
**Permisos:**
- Acceso a TODO el sistema
- Gestión de usuarios y empleados
- Control de platillos
- Reportes y estadísticas
- Configuración del sistema

---

### 2️⃣ Gerente (Reportes y Supervisión)
```
Usuario: gerente1
Contraseña: gerente123
Rol: Gerente
```
**Permisos:**
- Reportes y estadísticas
- Visualización de órdenes
- Supervisión general
- Sin acceso a configuración de usuarios

---

### 3️⃣ Cajero (Procesamiento de Pagos)
```
Usuario: cajero1
Contraseña: cajero123
Rol: Cajero
```
**Permisos:**
- Módulo de caja
- Procesamiento de pagos
- Impresión de facturas
- Cierre de órdenes

---

### 4️⃣ Mesero (Toma de Órdenes)
```
Usuario: mesero1
Contraseña: mesero123
Rol: Mesero
```
**Permisos:**
- Crear órdenes
- Gestionar comandas
- Ver estado de platillos
- Notificaciones de platillos listos

---

### 5️⃣ Cocina (KDS Cocina)
```
Usuario: cocina1
Contraseña: cocina123
Rol: Cocina
```
**Permisos:**
- KDS de cocina (comida caliente)
- Marcar platillos como preparados
- Ver tickets pendientes del área Cocina

---

### 6️⃣ Bebidas (KDS Bebidas)
```
Usuario: bebidas1
Contraseña: bebidas123
Rol: Bebidas
```
**Permisos:**
- KDS de bebidas (bar)
- Marcar bebidas como preparadas
- Ver tickets pendientes del área Bebidas

---

### 7️⃣ Coffee (KDS Coffee)
```
Usuario: coffee1
Contraseña: coffee123
Rol: Coffee
```
**Permisos:**
- KDS de coffee shop (café y postres)
- Marcar productos como preparados
- Ver tickets pendientes del área Coffee

---

## 🗄️ Credenciales de Base de Datos

**PostgreSQL:**
```
Host: localhost
Puerto: 5432
Base de datos: restaurante_db
Usuario: postgres
Contraseña: [Ver archivo .env → POSTGRES_PASSWORD]
```

**PgAdmin (Interfaz Web):**
```
URL: http://localhost:5050
Usuario: admin@coopechicoj.com
Contraseña: [Ver archivo .env → PGADMIN_PASSWORD]
```

---

## 🔐 Credenciales de Seguridad

**JWT Secret:**
```
Variable: JWT_SECRET
Ubicación: .env (raíz del proyecto)
Longitud: 64 caracteres aleatorios
```

---

## 🍽️ Platillos de Ejemplo

La base de datos incluye 9 platillos de ejemplo distribuidos en 3 áreas:

### Área: Cocina
1. Desayuno Chapín - Q35.00
2. Hilachas - Q45.00
3. Pepián de Pollo - Q50.00

### Área: Bebidas
1. Café Americano - Q15.00
2. Jugo Natural - Q20.00
3. Licuado de Fresa - Q25.00

### Área: Coffee
1. Cappuccino - Q20.00
2. Pay de Queso - Q30.00
3. Brownie con Helado - Q35.00

---

## 🚀 Cómo Iniciar Sesión

### Paso 1: Abrir el Sistema
```
http://localhost
```

### Paso 2: Ingresar Credenciales
1. Selecciona uno de los usuarios arriba
2. Ingresa usuario y contraseña
3. Click en "Iniciar Sesión"

### Paso 3: Verificar Acceso
- Deberías ser redirigido al dashboard correspondiente según tu rol
- El sistema mostrará las opciones disponibles para tu rol

---

## 🔄 Reiniciar Base de Datos (Si es Necesario)

Si necesitas reiniciar la base de datos y volver a cargar los datos:

```powershell
# 1. Detener contenedores y eliminar volúmenes
docker compose down -v

# 2. Iniciar contenedores
docker compose up -d --build

# 3. Ejecutar seed
docker exec chicoj-backend npm run db:seed

# 4. Desplegar código ofuscado
powershell -ExecutionPolicy Bypass -File deploy-ofuscado.ps1
```

---

## ⚠️ SEGURIDAD - IMPORTANTE

### Para Desarrollo (localhost)
✅ Las contraseñas actuales son seguras para desarrollo local

### Para Producción
⚠️ **DEBES cambiar TODAS las contraseñas antes de ir a producción:**

1. **Usuarios del sistema:**
   - Cambiar contraseñas en el panel de administración
   - O ejecutar: `UPDATE usuarios SET contrasena_hash = ... WHERE usuario_nombre = 'admin';`

2. **Base de datos:**
   - Generar nueva contraseña segura en `.env`
   - Recrear contenedores

3. **JWT Secret:**
   - Generar nuevo secret de 64+ caracteres
   - Actualizar en `.env`

---

## 📊 Estructura de Roles y Permisos

| Rol | Órdenes | Caja | Cocina | Reportes | Usuarios | Platillos |
|-----|---------|------|--------|----------|----------|-----------|
| **Administrador** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gerente** | 👁️ | 👁️ | 👁️ | ✅ | ❌ | 👁️ |
| **Cajero** | 👁️ | ✅ | ❌ | 👁️ | ❌ | ❌ |
| **Mesero** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Cocina** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Bebidas** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Coffee** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

**Leyenda:**
- ✅ = Acceso completo
- 👁️ = Solo lectura
- ❌ = Sin acceso

---

## 🧪 Probar el Sistema Completo

### Flujo de Prueba Completo:

1. **Mesero (mesero1/mesero123):**
   - Crear nueva orden
   - Agregar platillos
   - Enviar orden

2. **Cocina (cocina1/cocina123):**
   - Ver ticket en KDS
   - Marcar como "En Preparación"
   - Marcar como "Preparado"

3. **Mesero (mesero1/mesero123):**
   - Recibir notificación de platillo listo
   - Marcar orden como "Lista para Pagar"

4. **Cajero (cajero1/cajero123):**
   - Ver orden en Caja
   - Procesar pago
   - Imprimir comprobante

5. **Gerente (gerente1/gerente123):**
   - Ver reportes del día
   - Generar PDF/Excel
   - Analizar estadísticas

---

## 📞 Soporte

Si no puedes iniciar sesión:

1. **Verificar que el backend está corriendo:**
   ```powershell
   docker compose ps
   ```

2. **Ver logs del backend:**
   ```powershell
   docker compose logs backend
   ```

3. **Verificar que los usuarios existen:**
   ```powershell
   docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT usuario_nombre, id_rol FROM usuarios;"
   ```

4. **Reejecutar seed:**
   ```powershell
   docker exec chicoj-backend npm run db:seed
   ```

---

## ✅ Checklist de Login

- [ ] Contenedores corriendo (`docker compose ps`)
- [ ] Backend respondiendo (`http://localhost:3000/api/health`)
- [ ] Frontend cargando (`http://localhost`)
- [ ] Usuarios creados (`docker exec chicoj-backend npm run db:seed`)
- [ ] Credenciales correctas (ver arriba)
- [ ] Navegador con cache limpio (Ctrl+Shift+R)

---

**Fecha de creación:** 2 de Noviembre 2025  
**Sistema:** Chicoj Restaurant Management  
**Versión:** 1.0

**¡Bienvenido al sistema! 🎉**

