# 🧪 PRUEBAS DE SEGURIDAD - AHORA

He reiniciado completamente los contenedores. Ahora realiza estos tests:

---

## 📋 TESTS OBLIGATORIOS

### TEST 1: Listado de Directorios
```
Abre en el navegador:
http://localhost/templates/

¿Qué ves?
- ❌ MAL: Lista de archivos (Index of /templates/)
- ✅ BIEN: 404 Not Found o página en blanco
```

### TEST 2: Archivos .md
```
Abre en el navegador:
http://localhost/docs/LOGOUT_SEGURO.md

¿Qué ves?
- ❌ MAL: Contenido del archivo markdown
- ✅ BIEN: 404 Not Found
```

### TEST 3: URLs sin .html
```
Abre en el navegador:
http://localhost/templates/login

¿Qué ves?
- ✅ BIEN: Carga la página de login
- ❌ MAL: 404 Not Found
```

### TEST 4: URLs con .html (verificar)
```
Abre en el navegador:
http://localhost/templates/login.html

¿Qué ves?
- ✅ IDEAL: Redirige a /templates/login
- ✅ ACEPTABLE: Carga la página (sin redirigir)
```

---

## 📸 Dime EXACTAMENTE qué ves en cada test

**Test 1 (/templates/):**
- [ ] Veo lista de archivos ❌
- [ ] Veo 404 ✅
- [ ] Veo página en blanco ✅

**Test 2 (/docs/LOGOUT_SEGURO.md):**
- [ ] Veo el contenido del archivo ❌
- [ ] Veo 404 ✅

**Test 3 (/templates/login):**
- [ ] Carga la página de login ✅
- [ ] Veo 404 ❌

**Test 4 (/templates/login.html):**
- [ ] Redirige a /templates/login ✅
- [ ] Carga con .html en la URL (funciona igual) ✅
- [ ] Veo 404 ❌

---

## 🔍 También Abre DevTools

```
1. F12 (DevTools)
2. Pestaña "Network"
3. Ve a: http://localhost/templates/login.html
4. Mira el status:
   - 301 = Redirigiendo ✅
   - 200 = Cargando sin redirigir ✅
```

---

**Por favor prueba estos 4 tests y dime EXACTAMENTE qué ves en cada uno.** 🧪

