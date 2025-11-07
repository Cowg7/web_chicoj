# 🌱 Seed Actualizado - Base de Datos Chicoj

## 📋 Resumen de Cambios

El archivo `seed.js` ha sido actualizado con las siguientes mejoras:

### ✨ Nuevas Características

1. **✅ Campo `categoria` en todos los platillos**
2. **✅ Nuevo rol: "Tour"**
3. **✅ Nuevo usuario: tour1/tour123**
4. **✅ 26 platillos en total (anteriormente 9)**
5. **✅ Mayor variedad de categorías**

---

## 👥 Usuarios Disponibles

| Usuario    | Contraseña  | Rol            | Empleado              | Email                     |
|------------|-------------|----------------|-----------------------|---------------------------|
| admin      | admin123    | Administrador  | Admin Sistema         | admin@chicoj.com          |
| gerente1   | gerente123  | Gerente        | María López           | gerente@chicoj.com        |
| cajero1    | cajero123   | Cajero         | Carlos Ramírez        | cajero@chicoj.com         |
| mesero1    | mesero123   | Mesero         | Juan Pérez            | mesero@chicoj.com         |
| cocina1    | cocina123   | Cocina         | Pedro González        | cocina1@chicoj.com        |
| bebidas1   | bebidas123  | Cocina         | Ana Martínez          | bebidas1@chicoj.com       |
| coffee1    | coffee123   | Cocina         | Luis Fernández        | coffee1@chicoj.com        |
| **tour1**  | **tour123** | **Tour** ⭐   | **Sofia Méndez** ⭐   | **tour@chicoj.com** ⭐    |

---

## 🍽️ Platillos por Área

### 1. 🍳 Cocina (15 platillos)

#### Desayunos (3)
- **Desayuno Chapín** - Q35.00
  - Huevos, frijoles, plátano, queso y tortillas
- **Huevos con Longaniza** - Q40.00
  - Huevos revueltos con longaniza guatemalteca
- **Panqueques** - Q30.00
  - Panqueques con miel y fruta

#### Almuerzos (5)
- **Pepián de Pollo** - Q65.00
  - Plato típico guatemalteco con especias tradicionales
- **Hilachas** - Q55.00
  - Carne de res deshilachada en salsa de tomate
- **Kaq Ik** - Q70.00
  - Caldo de chompipe con chile y especias
- **Churrasco Chapín** - Q85.00
  - Carne asada con chimol y guacamol
- **Pollo Encebollado** - Q50.00
  - Pechuga de pollo con cebolla y salsa

#### Menú Infantil (2)
- **Nuggets con Papas** - Q35.00
  - Nuggets de pollo con papas fritas
- **Mini Hamburguesa** - Q38.00
  - Hamburguesa pequeña con papas

#### Refacciones (2)
- **Sandwich de Pollo** - Q28.00
  - Sandwich de pollo con vegetales frescos
- **Ensalada Mixta** - Q25.00
  - Ensalada fresca con aderezo

#### Refacciones Típicas (3)
- **Tamalitos de Chipilín** - Q20.00
  - Tamalitos con hojas de chipilín
- **Plátanos Fritos** - Q25.00
  - Plátanos maduros fritos con crema y frijoles
- **Chuchitos** - Q18.00
  - Tamalitos guatemaltecos con salsa

---

### 2. 🍹 Bebidas (13 platillos)

#### Bebidas Frías (4)
- **Limonada Natural** - Q15.00
  - Limonada fresca natural
- **Jugo de Naranja** - Q18.00
  - Jugo de naranja recién exprimido
- **Agua Mineral** - Q12.00
  - Agua mineral con gas o sin gas
- **Té Helado** - Q16.00
  - Té frío con limón

#### Licuados (3)
- **Licuado de Fresa** - Q22.00
  - Licuado natural de fresa con leche
- **Licuado de Banano** - Q20.00
  - Licuado de banano con leche y miel
- **Licuado de Papaya** - Q22.00
  - Licuado tropical de papaya

#### Cervezas (3)
- **Cerveza Nacional** - Q25.00
  - Cerveza guatemalteca fría
- **Cerveza Importada** - Q35.00
  - Cerveza importada premium
- **Michelada** - Q30.00
  - Cerveza preparada con limón y sal

#### Bebidas Desechables (3)
- **Refresco Lata** - Q10.00
  - Bebida gaseosa en lata
- **Agua Purificada** - Q8.00
  - Botella de agua purificada
- **Jugo Envasado** - Q12.00
  - Jugo de caja en varios sabores

---

### 3. ☕ Coffee (13 platillos)

#### Café (7)
- **Café Americano** - Q18.00
  - Café negro tradicional
- **Capuccino** - Q25.00
  - Café con leche espumada y canela
- **Café Latte** - Q28.00
  - Café con leche vaporizada
- **Espresso** - Q20.00
  - Café concentrado italiano
- **Café Moka** - Q30.00
  - Café con chocolate y crema
- **Frappe** - Q32.00
  - Café helado batido con hielo
- **Café con Leche** - Q22.00
  - Café tradicional con leche caliente

#### Postres (6)
- **Rellenitos de Plátano** - Q15.00
  - Postre típico guatemalteco de plátano con frijol
- **Pastel de Chocolate** - Q22.00
  - Porción de pastel de chocolate húmedo
- **Pie de Manzana** - Q24.00
  - Pie de manzana con canela
- **Churros con Chocolate** - Q20.00
  - Churros crujientes con chocolate caliente
- **Tres Leches** - Q26.00
  - Pastel de tres leches tradicional
- **Flan de Caramelo** - Q18.00
  - Flan casero con caramelo

---

## 📊 Estadísticas

| Área     | Total Platillos | Categorías                                                                |
|----------|-----------------|---------------------------------------------------------------------------|
| Cocina   | 15              | Desayunos (3), Almuerzos (5), Menu Infantil (2), Refacciones (2), Refacciones Tipicas (3) |
| Bebidas  | 13              | Bebidas Frias (4), Licuados (3), Cervezas (3), Bebidas Desechables (3)  |
| Coffee   | 13              | Cafe (7), Postres (6)                                                     |
| **TOTAL**| **41**          | **12 categorías únicas**                                                  |

---

## 🚀 Cómo Ejecutar el Seed

### Opción 1: Script PowerShell (Recomendado)

```powershell
.\ejecutar-seed.ps1
```

### Opción 2: Docker Exec

```powershell
docker exec chicoj-backend npm run seed
```

### Opción 3: Desde el contenedor

```bash
docker exec -it chicoj-backend sh
npm run seed
```

---

## ⚠️ Notas Importantes

1. **Upsert**: El seed usa operaciones `upsert`, lo que significa que:
   - Si un registro no existe, se crea
   - Si ya existe, se actualiza con los datos del seed
   - No duplica datos si se ejecuta múltiples veces

2. **Contraseñas**: Todas las contraseñas están hasheadas con `bcrypt` (10 rounds)

3. **Campo `categoria`**: Asegúrate de que la columna `categoria` exista en la tabla `platillos`:
   ```sql
   ALTER TABLE platillos ADD COLUMN categoria VARCHAR(100);
   CREATE INDEX ix_platillos_categoria ON platillos(categoria);
   ```

4. **Rol Tour**: El nuevo rol "Tour" tiene permisos específicos para gestión de tours y reservas

---

## 🎯 Casos de Uso

### Usuario Tour
El usuario `tour1` está diseñado para:
- ✅ Gestionar reservas de tours
- ✅ Ver disponibilidad de tours
- ✅ Registrar nuevos tours
- ✅ Generar reportes de tours
- ✅ Administrar itinerarios

### Categorías de Platillos
Las categorías permiten:
- ✅ Filtrar platillos por tipo
- ✅ Generar reportes por categoría
- ✅ Organizar el menú visualmente
- ✅ Facilitar la búsqueda de platillos
- ✅ Analizar ventas por categoría

---

## 📝 Verificación Post-Seed

Después de ejecutar el seed, verifica que todo esté correcto:

```sql
-- Verificar roles
SELECT * FROM roles;

-- Verificar usuarios
SELECT u.usuario_nombre, e.nombre, e.apellidos, r.nombre_rol 
FROM usuarios u
JOIN empleados e ON u.id_empleado = e.id_empleado
JOIN roles r ON u.id_rol = r.id_rol;

-- Verificar platillos con categorías
SELECT nombre, categoria, precio, a.nombre as area
FROM platillos p
JOIN area a ON p.id_area = a.id_area
ORDER BY a.nombre, categoria, nombre;

-- Contar platillos por categoría
SELECT categoria, COUNT(*) as total
FROM platillos
GROUP BY categoria
ORDER BY total DESC;
```

---

## 🔄 Actualizar desde Seed Anterior

Si ya tienes un sistema con datos, puedes:

1. **Mantener datos existentes**: El seed solo creará lo que no existe
2. **Agregar el usuario tour**: Se creará automáticamente
3. **Actualizar platillos**: Los existentes se actualizarán con las nuevas categorías
4. **Agregar nuevos platillos**: Se crearán los que no existan

---

## 📞 Soporte

Si encuentras algún problema con el seed:

1. Verifica que el contenedor `chicoj-backend` esté corriendo
2. Verifica que el contenedor `chicoj-postgres` esté corriendo
3. Revisa los logs del backend: `docker logs chicoj-backend`
4. Verifica la conexión a la base de datos en el archivo `.env`

---

**Última actualización**: Noviembre 3, 2025  
**Versión**: 2.0  
**Autor**: Sistema Chicoj

