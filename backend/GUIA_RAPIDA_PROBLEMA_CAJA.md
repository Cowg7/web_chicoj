# 🚨 GUÍA RÁPIDA: PROBLEMA CON CAJA

## ❌ **PROBLEMA:**
Al intentar entrar a caja, se muestra otra página (coffee, comanda, etc.)

---

## 🔧 **SOLUCIÓN RÁPIDA (5 minutos):**

### **PASO 1: Diagnóstico**

```
Abre esta página:
http://localhost:8080/diagnostico-acceso.html
```

**Verifica:**
- ¿Qué ROL muestra?
- ¿Dice "cajero"?

---

### **PASO 2A: Si tu rol NO es "cajero"**

**Tu problema:** Tienes el rol equivocado

**Solución:**
1. Pide al ADMINISTRADOR que cambie tu rol
2. Debe ir a: control-usuarios.html
3. Editar tu usuario
4. Cambiar rol a "Cajero"
5. Guardar

**Después TÚ:**
1. Ir a: diagnostico-acceso.html
2. Clic en "Limpiar Storage" (botón rojo)
3. Confirmar
4. Iniciar sesión de nuevo
5. ✅ Ahora SÍ deberías llegar a caja

---

### **PASO 2B: Si tu rol SÍ es "cajero"**

**Tu problema:** Caché o sesión corrupta

**Solución:**
```
1. Ir a: http://localhost:8080/diagnostico-acceso.html
2. Clic en "Limpiar Storage" (botón rojo)
3. Confirmar
4. Te redirige a login
5. Cerrar TODO el navegador
6. Ctrl + Shift + Delete
7. Borrar "Imágenes y archivos en caché"
8. Borrar TODO
9. Abrir navegador nuevo
10. Ir a login.html
11. Iniciar sesión
12. ✅ Deberías llegar a caja
```

---

## 🧪 **PROBAR ACCESO:**

En `diagnostico-acceso.html`:

```
Clic en botón: "Probar Acceso a Caja"

✅ Si dice: "Tu rol permite acceso" → Te redirige a caja
❌ Si dice: "Tu rol NO tiene acceso" → Necesitas cambiar tu rol
```

---

## 📍 **URLs CORRECTAS:**

```
Caja:     /templates/caja/caja.html
Reportes: /templates/reportes/reportes.html
Comanda:  /templates/mesero/mesero_comanda.html
```

---

## 🔄 **RESET COMPLETO (Si nada funciona):**

```
1. Cerrar TODOS los navegadores
2. Abrir uno nuevo
3. Ctrl + Shift + N (Incógnito)
4. Ir a: http://localhost:8080/diagnostico-acceso.html
5. Clic en "Limpiar Storage"
6. Iniciar sesión
7. Verificar a dónde llega
```

---

## 💡 **MAPA DE ROLES:**

| Rol | Página de Inicio |
|-----|------------------|
| cajero | caja.html ✅ |
| mesero | mesero_comanda.html |
| coffee | cocina.html?area=Coffee |
| cocina | cocina.html?area=Cocina |
| tour | tour.html |

---

## 📸 **SI SIGUE EL PROBLEMA:**

**Toma captura de:**
```
http://localhost:8080/diagnostico-acceso.html
```

**Secciones a capturar:**
1. Información del Usuario (tu rol)
2. Rutas Permitidas
3. Ruta Actual

**Envíame las capturas** 📷

---

## ✅ **CHECKLIST:**

- [ ] Abrí diagnostico-acceso.html
- [ ] Verifiqué mi rol
- [ ] Si rol está mal → Pedí al admin que lo cambie
- [ ] Si rol está bien → Limpié Storage
- [ ] Cerré el navegador
- [ ] Limpié caché (Ctrl + Shift + Delete)
- [ ] Inicié sesión de nuevo

---

**¡EMPIEZA AQUÍ!** 🚀

```
http://localhost:8080/diagnostico-acceso.html
```

**Botones importantes:**
- 🔵 "Probar Acceso a Caja" → Prueba si puedes acceder
- 🔴 "Limpiar Storage" → Limpia sesión corrupta
- 🔄 "Recargar" → Recarga el diagnóstico

---

**¡USA LA HERRAMIENTA Y CUÉNTAME QUÉ MUESTRA!** 🔍


