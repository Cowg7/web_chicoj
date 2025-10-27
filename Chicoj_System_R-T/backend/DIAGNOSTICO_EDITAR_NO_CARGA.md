# 🔍 DIAGNÓSTICO - EDITAR NO CARGA DATOS

## 🎯 **DIAGNÓSTICO PASO A PASO:**

### **TEST 1: ¿Hay tours en la base de datos?**

Abre en el navegador:
```
http://localhost:3000/api/tour
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "tours": [
      {
        "id_tour": 1,
        "fecha": "2025-10-24T00:00:00.000Z",
        "nombre_servicio": "Recorrido",
        ...
      }
    ],
    "total": 1
  }
}
```

**¿Qué obtuviste?**
- [ ] Lista de tours con datos ✅
- [ ] `"tours": []` (vacío) ❌
- [ ] Error o no carga ❌

---

### **TEST 2: ¿El endpoint de obtener por ID funciona?**

Si en el TEST 1 viste que hay tours (ejemplo: `id_tour: 1`), prueba:

```
http://localhost:3000/api/tour/1
```

*(Reemplaza `1` con el ID que viste en el TEST 1)*

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "tour": {
      "id_tour": 1,
      "fecha": "2025-10-24T00:00:00.000Z",
      "nombre_servicio": "Recorrido",
      "precio_servicio": "150.00",
      "tipo_visitante": "Nacional",
      "cantidad_visitante": 4,
      "idioma": "Español",
      "observaciones": ""
    }
  }
}
```

**¿Qué obtuviste?**
- [ ] Datos del tour completos ✅
- [ ] `"tour": null` ❌
- [ ] Error 404 ❌
- [ ] Error 500 ❌

---

### **TEST 3: ¿El frontend hace la petición?**

1. Ve a: `http://localhost:8080/templates/tour/tour-control.html`
2. Clic en una fila (seleccionar tour)
3. Clic en "Editar seleccionado"
4. **Abre la consola (F12) INMEDIATAMENTE**

**En la consola debes ver:**

```
📥 Cargando tour para editar, ID: 1
📦 Respuesta del servidor: {...}
📊 Data extraída: {...}
🎫 Tour a cargar: {...}
✅ Tour encontrado, cargando campos...
  ID: 1
  Fecha: 2025-10-24
  ...
✅ Todos los campos cargados correctamente
```

**¿Qué ves?**
- [ ] Todos esos logs ✅
- [ ] Solo algunos logs ⚠️
- [ ] No veo ningún log ❌
- [ ] Veo un error en rojo ❌

---

### **TEST 4: ¿El JavaScript se carga?**

En `tour.html`, abre consola (F12) al cargar la página.

**Debe aparecer:**
```
✅ VERSIÓN LIMPIA DE TOUR.JS (v20251024h)
```

**¿Aparece ese mensaje?**
- [ ] SÍ ✅
- [ ] NO ❌

---

## 📋 **DIAGNÓSTICO POR RESULTADOS:**

### **CASO A: No hay tours en la BD (TEST 1 vacío)**

**Problema:** No hay nada que editar

**Solución:**
1. Ve a: `http://localhost:8080/templates/tour/tour.html`
2. Registra un tour de prueba
3. Luego intenta editarlo

---

### **CASO B: Backend funciona, pero frontend no hace petición**

**Síntomas:**
- ✅ TEST 1 y 2 muestran datos
- ❌ TEST 3 no muestra logs

**Problema:** JavaScript no se está ejecutando o hay error de caché

**Solución:**
```
1. Ctrl + Shift + Delete (limpiar caché)
2. Seleccionar: "Última hora"
3. Marcar: "Archivos en caché"
4. Borrar
5. O usar modo incógnito: Ctrl + Shift + N
```

---

### **CASO C: Frontend hace petición pero no procesa respuesta**

**Síntomas:**
- ✅ Ves: `📥 Cargando tour para editar, ID: 1`
- ✅ Ves: `📦 Respuesta del servidor: {...}`
- ❌ No ves: `✅ Tour encontrado, cargando campos...`

**Problema:** El formato de la respuesta no es el esperado

**Solución:** Envíame una captura de la consola

---

### **CASO D: Los campos no existen en el HTML**

**Síntomas:**
- ✅ Ves todos los logs
- ✅ Dice: `✅ Todos los campos cargados correctamente`
- ❌ Los campos siguen vacíos

**Problema:** IDs del HTML no coinciden con JavaScript

**Verificación:** Envíame una captura de la página

---

## 🧪 **PRUEBA RÁPIDA:**

### **Opción 1: Página de TEST**

```
http://localhost:8080/TEST_TOUR_FORM.html
```

1. Llena los datos
2. Clic en "🚀 Enviar al Backend"
3. Si se guarda, luego:
4. Abre: `http://localhost:3000/api/tour`
5. Copia el ID del tour creado
6. Ve a: `http://localhost:8080/templates/tour/tour.html?id=1`
   *(Reemplaza 1 con el ID que copiaste)*
7. Abre consola (F12)
8. ¿Qué ves?

---

### **Opción 2: Test directo de URL**

Si tienes tours en la BD (verificado en TEST 1):

```
http://localhost:8080/templates/tour/tour.html?id=1
```

Abre consola (F12) y **copia TODOS los mensajes**

---

## 📤 **LO QUE NECESITO:**

Por favor, haz lo siguiente y envíame los resultados:

### **1. TEST de Backend:**

Abre en el navegador y envíame lo que aparece:
```
http://localhost:3000/api/tour
```

### **2. TEST de Frontend:**

1. Ve a: `http://localhost:8080/templates/tour/tour.html?id=1`
   *(Si el TEST 1 te mostró otro ID, usa ese)*
2. Abre consola (F12)
3. **Copia TODO lo que aparece en la consola**
4. Envíamelo

---

## 🎯 **ESCENARIOS POSIBLES:**

### **Escenario 1: Backend devuelve datos pero frontend no los carga**

**Verificación:**
- `http://localhost:3000/api/tour/1` → ✅ Funciona
- Frontend → ❌ No carga

**Causa probable:** Caché o formato de respuesta

---

### **Escenario 2: No hay tours para editar**

**Verificación:**
- `http://localhost:3000/api/tour` → `"tours": []`

**Causa:** No has registrado ningún tour

**Solución:** Registra uno primero

---

### **Escenario 3: Error al obtener por ID**

**Verificación:**
- `http://localhost:3000/api/tour/1` → Error 404

**Causa:** Ese ID no existe

**Solución:** Usa un ID válido del TEST 1

---

## ⚡ **ACCIÓN INMEDIATA:**

**Haz esto AHORA:**

1. Abre: `http://localhost:3000/api/tour`
2. Copia el resultado completo
3. Envíamelo

4. Si viste tours, anota el primer `id_tour`
5. Abre: `http://localhost:8080/templates/tour/tour.html?id=X`
   *(X = el id_tour que anotaste)*
6. F12 (consola)
7. Copia TODOS los mensajes
8. Envíamelos

Con eso sabré exactamente qué está fallando.

---

**¿Qué resultado obtuviste en los TEST 1 y 2?** 📋🔍

