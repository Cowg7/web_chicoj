# 🔧 SOLUCIÓN: PROBLEMA CON RUTAS DE CAJA

## ❌ **PROBLEMA REPORTADO:**

1. Al entrar a caja, se visualiza la orden de coffee (pantalla KDS)
2. Al entrar a caja o visualizar órdenes, muestra la comanda para agregar platillos

---

## 🔍 **DIAGNÓSTICO RÁPIDO:**

### **PASO 1: Abrir Herramienta de Diagnóstico**

```
Abre: http://localhost:8080/diagnostico-acceso.html
```

Esta página te mostrará:
- ✅ Tu usuario actual
- ✅ Tu rol asignado
- ✅ Rutas permitidas para tu rol
- ✅ URL actual

---

### **PASO 2: Verificar Tu Rol**

**En la página de diagnóstico, busca:**

```
📋 Información del Usuario
───────────────────────────
✅ Usuario autenticado
Usuario: [tu-usuario]
Rol: [tu-rol]  ← ¡IMPORTANTE!
```

**Roles y sus accesos:**
- **cajero** → Puede acceder a caja.html y reportes.html
- **mesero** → Puede acceder a mesero_comanda.html
- **coffee** → Puede acceder a cocina.html?area=Coffee
- **administrador** → Puede acceder a TODAS

---

## 🎯 **CAUSAS POSIBLES:**

### **Causa 1: Rol Incorrecto**

**Síntoma:**
```
Tu rol dice "coffee" pero quieres acceder a caja
```

**Solución:**
1. Tu usuario tiene el rol equivocado
2. Necesitas que un administrador cambie tu rol a "cajero"
3. Ir a: `control-usuarios.html` (como admin)
4. Editar tu usuario
5. Cambiar rol a "Cajero"

---

### **Causa 2: Cache del Navegador**

**Síntoma:**
```
Te muestra una página antigua/incorrecta
```

**Solución:**
```
1. Ctrl + Shift + Delete
2. Seleccionar "Todo el tiempo"
3. Marcar:
   ✅ Cookies y otros datos de sitios
   ✅ Imágenes y archivos en caché
4. Borrar datos
5. Cerrar TODO el navegador
6. Abrir de nuevo
7. Ir a login.html
8. Iniciar sesión de nuevo
```

---

### **Causa 3: Sesión Corrupta**

**Síntoma:**
```
Los datos del usuario están mal guardados en localStorage
```

**Solución:**
```
1. Ir a: http://localhost:8080/diagnostico-acceso.html
2. Clic en botón "Limpiar Storage" (rojo)
3. Confirmar
4. Redirige a login
5. Iniciar sesión de nuevo
```

---

### **Causa 4: URL Incorrecta**

**Síntoma:**
```
Estás usando una URL incorrecta
```

**URLs CORRECTAS:**

```
✅ Caja:     http://localhost:8080/templates/caja/caja.html
✅ Reportes: http://localhost:8080/templates/reportes/reportes.html
✅ Comanda:  http://localhost:8080/templates/mesero/mesero_comanda.html
✅ Coffee:   http://localhost:8080/templates/cocina/cocina.html?area=Coffee
```

**URLs INCORRECTAS (NO USAR):**

```
❌ /caja.html
❌ /templates/caja.html
❌ /caja/
```

---

## 🧪 **PRUEBAS EN HERRAMIENTA:**

En `http://localhost:8080/diagnostico-acceso.html`:

### **Test 1: Probar Acceso a Caja**
```
1. Clic en "Probar Acceso a Caja"
2. Si tu rol es correcto → Redirige a caja
3. Si tu rol es incorrecto → Muestra error
```

### **Test 2: Probar Acceso a Reportes**
```
1. Clic en "Probar Acceso a Reportes"
2. Si tienes permiso → Redirige a reportes
3. Si no tienes permiso → Muestra error
```

### **Test 3: Probar Acceso a Comanda**
```
1. Clic en "Probar Acceso a Comanda"
2. Si eres mesero → Redirige a comanda
3. Si no eres mesero → Muestra error
```

---

## 🔄 **SOLUCIÓN PASO A PASO:**

### **Opción A: Si Eres Cajero**

```
1. Cerrar TODOS los navegadores
2. Abrir navegador nuevo
3. Ir a: http://localhost:8080/templates/login.html
4. Iniciar sesión con tu usuario de cajero
5. Deberías llegar automáticamente a: templates/caja/caja.html
6. Si NO llegas a caja, ir a diagnóstico-acceso.html
7. Verificar que tu rol dice "cajero"
8. Si dice otro rol → Contactar administrador
```

---

### **Opción B: Si el Rol Está Mal**

```
1. Pedir a un ADMINISTRADOR que:
   - Vaya a: control-usuarios.html
   - Busque tu usuario
   - Haga clic en "Editar"
   - Cambie el rol a "Cajero"
   - Guarde los cambios

2. Tú:
   - Cerrar sesión
   - Limpiar caché (Ctrl + Shift + Delete)
   - Iniciar sesión de nuevo
   - Ahora SÍ deberías acceder a caja
```

---

### **Opción C: Limpiar Todo y Empezar de Nuevo**

```
1. Ir a: http://localhost:8080/diagnostico-acceso.html
2. Clic en "Limpiar Storage" (botón rojo)
3. Confirmar
4. Te redirige a login
5. Cerrar TODO el navegador
6. Limpiar caché:
   - Ctrl + Shift + Delete
   - "Todo el tiempo"
   - Borrar TODO
7. Abrir navegador nuevo
8. Ir a: http://localhost:8080/templates/login.html
9. Iniciar sesión
10. Verificar que llegas a la página correcta
```

---

## 📊 **MAPEO DE ROLES Y RUTAS:**

| Rol | Primera Página (Landing) | Otras Páginas Permitidas |
|-----|--------------------------|--------------------------|
| **administrador** | main.html | TODAS |
| **cajero** | templates/caja/caja.html | templates/reportes/reportes.html |
| **mesero** | templates/mesero/mesero_comanda.html | templates/mesero/comanda-control.html |
| **cocina** | templates/cocina/cocina.html?area=Cocina | templates/cocina/menu_cocina.html |
| **coffee** | templates/cocina/cocina.html?area=Coffee | templates/cocina/menu_cocina.html |
| **bebidas** | templates/cocina/cocina.html?area=Bebidas | templates/cocina/menu_cocina.html |
| **tour** | templates/tour/tour.html | templates/tour/tour-control.html |

---

## 🆘 **SI NADA FUNCIONA:**

### **Reset Completo:**

```
1. Cerrar TODOS los navegadores
2. Abrir PowerShell como Administrador
3. Ir al directorio del proyecto:
   cd C:\Users\chris\OneDrive\Desktop\Chicoj_dev
4. Reiniciar backend:
   cd backend
   npm run dev
5. Esperar mensaje: "✅ Database connected successfully"
6. Abrir navegador en MODO INCÓGNITO:
   Ctrl + Shift + N
7. Ir a: http://localhost:8080/templates/login.html
8. Iniciar sesión
9. Verificar a dónde te redirige
10. Si sigue mal, ir a diagnostico-acceso.html
```

---

## 📝 **INFORMACIÓN PARA EL ADMINISTRADOR:**

Si necesitas cambiar el rol de un usuario:

```
1. Iniciar sesión como administrador
2. Ir a: http://localhost:8080/templates/administracion/control-usuarios.html
3. Buscar el usuario
4. Clic en "Editar"
5. Cambiar el rol en el dropdown:
   - Cajero (para acceso a caja)
   - Mesero (para acceso a comandas)
   - Coffee (para KDS de coffee)
   - etc.
6. Guardar cambios
7. El usuario debe:
   - Cerrar sesión
   - Limpiar caché
   - Iniciar sesión de nuevo
```

---

## 🔍 **LOGS PARA DEBUGGING:**

Cuando abras `diagnostico-acceso.html`, toma captura de:

1. **Sección "Información del Usuario"**
   - ¿Qué rol muestra?
   - ¿Está autenticado?

2. **Sección "Rutas Permitidas"**
   - ¿Qué rutas dice que puedes acceder?

3. **Sección "Ruta Actual"**
   - ¿A qué URL estás intentando acceder?

**Envía esas capturas si el problema persiste.**

---

## ✅ **CHECKLIST DE VERIFICACIÓN:**

- [ ] Abrí diagnostico-acceso.html
- [ ] Verifiqué mi rol
- [ ] Mi rol es el correcto (cajero para caja)
- [ ] Limpié el caché (Ctrl + Shift + Delete)
- [ ] Cerré TODO el navegador
- [ ] Inicié sesión de nuevo
- [ ] Intenté acceder a la URL correcta
- [ ] Si sigue mal, usé "Limpiar Storage"
- [ ] Si aún sigue mal, pedí ayuda al administrador

---

## 🎯 **RESUMEN:**

**El problema más común es:**
1. **Rol incorrecto** → Usuario tiene rol "coffee" pero quiere acceder a caja
2. **Caché del navegador** → Muestra página antigua
3. **Sesión corrupta** → localStorage tiene datos incorrectos

**La solución más rápida:**
1. Ir a `diagnostico-acceso.html`
2. Clic en "Limpiar Storage"
3. Iniciar sesión de nuevo
4. Si sigue mal → Verificar rol con administrador

---

**¡USA LA HERRAMIENTA DE DIAGNÓSTICO Y CUÉNTAME QUÉ MUESTRA!** 🔍

```
http://localhost:8080/diagnostico-acceso.html
```

**Toma captura de las 4 secciones principales y envíamela** 📸

