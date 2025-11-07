# 🍽️ EJEMPLOS PARA INSERTAR PLATILLOS - SISTEMA CHICOJ

## 📋 Estructura de un Platillo

Un platillo tiene la siguiente estructura:

```javascript
{
  nombre: String,           // Único, obligatorio
  descripcion: String,      // Opcional
  precio: Decimal(10,2),    // Obligatorio, formato: 99.99
  id_area: Integer,         // Obligatorio (1=Cocina, 2=Bebidas, 3=Coffee)
  categoria: String,        // Obligatorio, depende del área
  disponible: Boolean       // Opcional (default: true)
}
```

---

## 🎯 CATEGORÍAS POR ÁREA

### Área 1: Cocina
- `Desayunos`
- `Almuerzos`
- `Menu Infantil`
- `Refacciones`
- `Refacciones Tipicas`

### Área 2: Bebidas
- `Bebidas Frias`
- `Licuados`
- `Cervezas`
- `Bebidas Desechables`

### Área 3: Coffee
- `Cafe`
- `Postres`

---

## 📝 MÉTODO 1: SQL DIRECTO

### Insertar un Platillo Individual

```sql
-- Platillo de Cocina (Desayuno)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES (
  'Desayuno Chapin',
  'Huevos, frijoles, plátano, queso y tortillas',
  35.00,
  1,  -- Cocina
  'Desayunos',
  true
);

-- Platillo de Bebidas (Licuado)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES (
  'Licuado de Fresa',
  'Licuado natural de fresa con leche',
  22.00,
  2,  -- Bebidas
  'Licuados',
  true
);

-- Platillo de Coffee (Café)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES (
  'Café Americano',
  'Café negro tradicional',
  18.00,
  3,  -- Coffee
  'Cafe',
  true
);
```

---

### Insertar Múltiples Platillos a la Vez

```sql
-- Insertar varios platillos de Cocina
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  -- Desayunos
  ('Desayuno Chapin', 'Huevos, frijoles, plátano, queso y tortillas', 35.00, 1, 'Desayunos', true),
  ('Huevos con Longaniza', 'Huevos revueltos con longaniza guatemalteca', 40.00, 1, 'Desayunos', true),
  ('Panqueques', 'Panqueques con miel y fruta', 30.00, 1, 'Desayunos', true),
  
  -- Almuerzos
  ('Pepián de Pollo', 'Plato típico guatemalteco con especias tradicionales', 65.00, 1, 'Almuerzos', true),
  ('Hilachas', 'Carne de res deshilachada en salsa de tomate', 55.00, 1, 'Almuerzos', true),
  ('Churrasco Chapín', 'Carne asada con chimol y guacamol', 85.00, 1, 'Almuerzos', true),
  
  -- Menú Infantil
  ('Nuggets con Papas', 'Nuggets de pollo con papas fritas', 35.00, 1, 'Menu Infantil', true),
  ('Mini Hamburguesa', 'Hamburguesa pequeña con papas', 38.00, 1, 'Menu Infantil', true);
```

```sql
-- Insertar varios platillos de Bebidas
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  -- Bebidas Frías
  ('Limonada Natural', 'Limonada fresca natural', 15.00, 2, 'Bebidas Frias', true),
  ('Jugo de Naranja', 'Jugo de naranja recién exprimido', 18.00, 2, 'Bebidas Frias', true),
  ('Agua Mineral', 'Agua mineral con gas o sin gas', 12.00, 2, 'Bebidas Frias', true),
  
  -- Licuados
  ('Licuado de Fresa', 'Licuado natural de fresa con leche', 22.00, 2, 'Licuados', true),
  ('Licuado de Banano', 'Licuado de banano con leche y miel', 20.00, 2, 'Licuados', true),
  ('Licuado de Papaya', 'Licuado tropical de papaya', 22.00, 2, 'Licuados', true),
  
  -- Cervezas
  ('Cerveza Nacional', 'Cerveza guatemalteca fría', 25.00, 2, 'Cervezas', true),
  ('Michelada', 'Cerveza preparada con limón y sal', 30.00, 2, 'Cervezas', true);
```

```sql
-- Insertar varios platillos de Coffee
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  -- Café
  ('Café Americano', 'Café negro tradicional', 18.00, 3, 'Cafe', true),
  ('Capuccino', 'Café con leche espumada y canela', 25.00, 3, 'Cafe', true),
  ('Café Latte', 'Café con leche vaporizada', 28.00, 3, 'Cafe', true),
  ('Espresso', 'Café concentrado italiano', 20.00, 3, 'Cafe', true),
  
  -- Postres
  ('Rellenitos de Plátano', 'Postre típico guatemalteco de plátano con frijol', 15.00, 3, 'Postres', true),
  ('Pastel de Chocolate', 'Porción de pastel de chocolate húmedo', 22.00, 3, 'Postres', true),
  ('Tres Leches', 'Pastel de tres leches tradicional', 26.00, 3, 'Postres', true);
```

---

### Ejecutar SQL desde Docker

```bash
# Conectar a PostgreSQL
docker exec -it <contenedor-postgres> psql -U postgres -d restaurante_db

# Una vez dentro, ejecutar los INSERT
restaurante_db=# INSERT INTO platillos ...

# O desde archivo
docker exec -i <contenedor-postgres> psql -U postgres -d restaurante_db < mis-platillos.sql
```

---

## 💻 MÉTODO 2: PRISMA (Backend)

### Ejemplo Individual con `create()`

```javascript
// backend/script-agregar-platillo.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function agregarPlatillo() {
  const platillo = await prisma.platillos.create({
    data: {
      nombre: 'Tacos de Pollo',
      descripcion: '3 tacos con pollo desmenuzado, cebolla y cilantro',
      precio: 45.00,
      id_area: 1,  // Cocina
      categoria: 'Almuerzos',
      disponible: true
    }
  });
  
  console.log('✅ Platillo creado:', platillo);
}

agregarPlatillo()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

### Ejemplo con `upsert()` (Crear o Actualizar)

```javascript
// Si existe, actualiza; si no, crea
async function upsertPlatillo() {
  const platillo = await prisma.platillos.upsert({
    where: { nombre: 'Tacos de Pollo' },
    update: {
      precio: 48.00,  // Actualiza solo el precio si existe
      disponible: true
    },
    create: {
      nombre: 'Tacos de Pollo',
      descripcion: '3 tacos con pollo desmenuzado',
      precio: 45.00,
      id_area: 1,
      categoria: 'Almuerzos',
      disponible: true
    }
  });
  
  console.log('✅ Platillo procesado:', platillo);
}
```

---

### Insertar Múltiples Platillos (Batch)

```javascript
async function insertarMultiplesPlatillos() {
  const platillos = [
    {
      nombre: 'Sopa de Tortilla',
      descripcion: 'Sopa de tortilla con aguacate y queso',
      precio: 35.00,
      id_area: 1,
      categoria: 'Almuerzos',
      disponible: true
    },
    {
      nombre: 'Ceviche de Camarón',
      descripcion: 'Camarones en limón con pico de gallo',
      precio: 75.00,
      id_area: 1,
      categoria: 'Almuerzos',
      disponible: true
    },
    {
      nombre: 'Mojito',
      descripcion: 'Cóctel de ron, menta y limón',
      precio: 45.00,
      id_area: 2,
      categoria: 'Bebidas Frias',
      disponible: true
    }
  ];

  // Insertar todos a la vez
  const resultado = await prisma.platillos.createMany({
    data: platillos,
    skipDuplicates: true  // Omite si ya existe (por nombre)
  });

  console.log(`✅ ${resultado.count} platillos creados`);
}
```

---

### Ejemplo Completo con Validación

```javascript
// backend/crear-platillo-seguro.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function crearPlatilloSeguro(datos) {
  try {
    // 1. Validar que el área existe
    const area = await prisma.area.findUnique({
      where: { id_area: datos.id_area }
    });
    
    if (!area) {
      throw new Error(`Área ${datos.id_area} no existe`);
    }
    
    // 2. Validar categoría según área
    const categoriasValidas = {
      'Cocina': ['Desayunos', 'Almuerzos', 'Menu Infantil', 'Refacciones', 'Refacciones Tipicas'],
      'Bebidas': ['Bebidas Frias', 'Licuados', 'Cervezas', 'Bebidas Desechables'],
      'Coffee': ['Cafe', 'Postres']
    };
    
    const categoriasPermitidas = categoriasValidas[area.nombre];
    
    if (!categoriasPermitidas.includes(datos.categoria)) {
      throw new Error(`Categoría "${datos.categoria}" no válida para ${area.nombre}`);
    }
    
    // 3. Validar precio
    if (datos.precio <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }
    
    // 4. Crear platillo
    const platillo = await prisma.platillos.create({
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion || '',
        precio: datos.precio,
        id_area: datos.id_area,
        categoria: datos.categoria,
        disponible: datos.disponible !== undefined ? datos.disponible : true
      },
      include: {
        area: true  // Incluye datos del área en la respuesta
      }
    });
    
    console.log('✅ Platillo creado exitosamente:');
    console.log(`   ID: ${platillo.id_platillo}`);
    console.log(`   Nombre: ${platillo.nombre}`);
    console.log(`   Área: ${platillo.area.nombre}`);
    console.log(`   Categoría: ${platillo.categoria}`);
    console.log(`   Precio: Q${platillo.precio}`);
    
    return platillo;
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Error: Ya existe un platillo con ese nombre');
    } else {
      console.error('❌ Error:', error.message);
    }
    throw error;
  }
}

// Ejemplo de uso
const nuevoPlatillo = {
  nombre: 'Enchiladas Guatemaltecas',
  descripcion: 'Enchiladas con pollo, remolacha y queso',
  precio: 42.00,
  id_area: 1,  // Cocina
  categoria: 'Almuerzos',
  disponible: true
};

crearPlatilloSeguro(nuevoPlatillo)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 🌐 MÉTODO 3: API REST (Frontend/Postman)

### Crear Platillo vía API

```javascript
// Desde el frontend o Postman

// URL
POST http://localhost:3000/api/menu

// Headers
Content-Type: application/json
Authorization: Bearer <tu-jwt-token>

// Body
{
  "nombre": "Salpicón de Res",
  "descripcion": "Carne de res desmenuzada con rábanos y menta",
  "precio": 60.00,
  "id_area": 1,
  "categoria": "Almuerzos",
  "disponible": true
}
```

---

### Ejemplo con JavaScript `fetch`

```javascript
async function crearPlatilloAPI(platillo) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/menu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      nombre: platillo.nombre,
      descripcion: platillo.descripcion,
      precio: parseFloat(platillo.precio),
      id_area: parseInt(platillo.id_area),
      categoria: platillo.categoria,
      disponible: platillo.disponible !== undefined ? platillo.disponible : true
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear platillo');
  }
  
  const resultado = await response.json();
  console.log('✅ Platillo creado:', resultado);
  return resultado;
}

// Uso
const nuevoPlatillo = {
  nombre: 'Chiles Rellenos',
  descripcion: 'Chiles rellenos de carne con salsa de tomate',
  precio: 55.00,
  id_area: 1,
  categoria: 'Almuerzos'
};

crearPlatilloAPI(nuevoPlatillo)
  .then(platillo => console.log('ID:', platillo.id))
  .catch(error => console.error('Error:', error));
```

---

### Ejemplo con Axios

```javascript
import axios from 'axios';

const crearPlatillo = async (platillo) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/menu',
      platillo,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    console.log('✅ Platillo creado:', response.data);
    return response.data;
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error del servidor:', error.response.data);
    } else {
      console.error('❌ Error de red:', error.message);
    }
    throw error;
  }
};
```

---

## 📋 EJEMPLOS COMPLETOS POR CATEGORÍA

### Categoría: Desayunos (Cocina)

```sql
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Desayuno Chapin', 'Huevos, frijoles, plátano, queso y tortillas', 35.00, 1, 'Desayunos', true),
  ('Huevos con Longaniza', 'Huevos revueltos con longaniza guatemalteca', 40.00, 1, 'Desayunos', true),
  ('Panqueques', 'Panqueques con miel y fruta', 30.00, 1, 'Desayunos', true),
  ('Huevos Rancheros', 'Huevos sobre tortilla con salsa ranchera', 38.00, 1, 'Desayunos', true),
  ('Omelette de Verduras', 'Omelette con vegetales frescos', 32.00, 1, 'Desayunos', true);
```

---

### Categoría: Almuerzos (Cocina)

```sql
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Pepián de Pollo', 'Plato típico guatemalteco con especias tradicionales', 65.00, 1, 'Almuerzos', true),
  ('Hilachas', 'Carne de res deshilachada en salsa de tomate', 55.00, 1, 'Almuerzos', true),
  ('Kaq Ik', 'Caldo de chompipe con chile y especias', 70.00, 1, 'Almuerzos', true),
  ('Churrasco Chapín', 'Carne asada con chimol y guacamol', 85.00, 1, 'Almuerzos', true),
  ('Pollo Encebollado', 'Pechuga de pollo con cebolla y salsa', 50.00, 1, 'Almuerzos', true),
  ('Carne Asada', 'Carne de res a la parrilla', 90.00, 1, 'Almuerzos', true);
```

---

### Categoría: Licuados (Bebidas)

```sql
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Licuado de Fresa', 'Licuado natural de fresa con leche', 22.00, 2, 'Licuados', true),
  ('Licuado de Banano', 'Licuado de banano con leche y miel', 20.00, 2, 'Licuados', true),
  ('Licuado de Papaya', 'Licuado tropical de papaya', 22.00, 2, 'Licuados', true),
  ('Licuado de Mango', 'Licuado de mango fresco', 24.00, 2, 'Licuados', true),
  ('Licuado Mixto', 'Mezcla de frutas tropicales', 26.00, 2, 'Licuados', true);
```

---

### Categoría: Café (Coffee)

```sql
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Café Americano', 'Café negro tradicional', 18.00, 3, 'Cafe', true),
  ('Capuccino', 'Café con leche espumada y canela', 25.00, 3, 'Cafe', true),
  ('Café Latte', 'Café con leche vaporizada', 28.00, 3, 'Cafe', true),
  ('Espresso', 'Café concentrado italiano', 20.00, 3, 'Cafe', true),
  ('Café Moka', 'Café con chocolate y crema', 30.00, 3, 'Cafe', true),
  ('Frappe', 'Café helado batido con hielo', 32.00, 3, 'Cafe', true);
```

---

### Categoría: Postres (Coffee)

```sql
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Rellenitos de Plátano', 'Postre típico guatemalteco de plátano con frijol', 15.00, 3, 'Postres', true),
  ('Pastel de Chocolate', 'Porción de pastel de chocolate húmedo', 22.00, 3, 'Postres', true),
  ('Tres Leches', 'Pastel de tres leches tradicional', 26.00, 3, 'Postres', true),
  ('Flan de Caramelo', 'Flan casero con caramelo', 18.00, 3, 'Postres', true),
  ('Churros con Chocolate', 'Churros crujientes con chocolate caliente', 20.00, 3, 'Postres', true);
```

---

## 🔍 CONSULTAS ÚTILES

### Ver todos los platillos

```sql
SELECT * FROM platillos ORDER BY id_area, categoria, nombre;
```

---

### Ver platillos por área

```sql
-- Cocina
SELECT * FROM platillos WHERE id_area = 1;

-- Bebidas
SELECT * FROM platillos WHERE id_area = 2;

-- Coffee
SELECT * FROM platillos WHERE id_area = 3;
```

---

### Ver platillos por categoría

```sql
SELECT * FROM platillos WHERE categoria = 'Desayunos';
```

---

### Ver platillos disponibles

```sql
SELECT * FROM platillos WHERE disponible = true;
```

---

### Contar platillos por área y categoría

```sql
SELECT 
  a.nombre AS area,
  p.categoria,
  COUNT(*) AS cantidad
FROM platillos p
JOIN area a ON p.id_area = a.id_area
GROUP BY a.nombre, p.categoria
ORDER BY a.nombre, p.categoria;
```

---

## 🛠️ SCRIPTS DE UTILIDAD

### Script SQL Completo: Insertar 41 Platillos

```sql
-- ============================================
-- SCRIPT COMPLETO: 41 PLATILLOS
-- Sistema Chicoj
-- ============================================

BEGIN;

-- ÁREA 1: COCINA (15 platillos)

-- Desayunos (3)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Desayuno Chapin', 'Huevos, frijoles, plátano, queso y tortillas', 35.00, 1, 'Desayunos', true),
  ('Huevos con Longaniza', 'Huevos revueltos con longaniza guatemalteca', 40.00, 1, 'Desayunos', true),
  ('Panqueques', 'Panqueques con miel y fruta', 30.00, 1, 'Desayunos', true);

-- Almuerzos (5)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Pepián de Pollo', 'Plato típico guatemalteco con especias tradicionales', 65.00, 1, 'Almuerzos', true),
  ('Hilachas', 'Carne de res deshilachada en salsa de tomate', 55.00, 1, 'Almuerzos', true),
  ('Kaq Ik', 'Caldo de chompipe con chile y especias', 70.00, 1, 'Almuerzos', true),
  ('Churrasco Chapín', 'Carne asada con chimol y guacamol', 85.00, 1, 'Almuerzos', true),
  ('Pollo Encebollado', 'Pechuga de pollo con cebolla y salsa', 50.00, 1, 'Almuerzos', true);

-- Menu Infantil (2)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Nuggets con Papas', 'Nuggets de pollo con papas fritas', 35.00, 1, 'Menu Infantil', true),
  ('Mini Hamburguesa', 'Hamburguesa pequeña con papas', 38.00, 1, 'Menu Infantil', true);

-- Refacciones (2)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Sandwich de Pollo', 'Sandwich de pollo con vegetales frescos', 28.00, 1, 'Refacciones', true),
  ('Ensalada Mixta', 'Ensalada fresca con aderezo', 25.00, 1, 'Refacciones', true);

-- Refacciones Típicas (3)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Tamalitos de Chipilín', 'Tamalitos con hojas de chipilín', 20.00, 1, 'Refacciones Tipicas', true),
  ('Plátanos Fritos', 'Plátanos maduros fritos con crema y frijoles', 25.00, 1, 'Refacciones Tipicas', true),
  ('Chuchitos', 'Tamalitos guatemaltecos con salsa', 18.00, 1, 'Refacciones Tipicas', true);

-- ÁREA 2: BEBIDAS (13 platillos)

-- Bebidas Frías (4)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Limonada Natural', 'Limonada fresca natural', 15.00, 2, 'Bebidas Frias', true),
  ('Jugo de Naranja', 'Jugo de naranja recién exprimido', 18.00, 2, 'Bebidas Frias', true),
  ('Agua Mineral', 'Agua mineral con gas o sin gas', 12.00, 2, 'Bebidas Frias', true),
  ('Te Helado', 'Té frío con limón', 16.00, 2, 'Bebidas Frias', true);

-- Licuados (3)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Licuado de Fresa', 'Licuado natural de fresa con leche', 22.00, 2, 'Licuados', true),
  ('Licuado de Banano', 'Licuado de banano con leche y miel', 20.00, 2, 'Licuados', true),
  ('Licuado de Papaya', 'Licuado tropical de papaya', 22.00, 2, 'Licuados', true);

-- Cervezas (3)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Cerveza Nacional', 'Cerveza guatemalteca fría', 25.00, 2, 'Cervezas', true),
  ('Cerveza Importada', 'Cerveza importada premium', 35.00, 2, 'Cervezas', true),
  ('Michelada', 'Cerveza preparada con limón y sal', 30.00, 2, 'Cervezas', true);

-- Bebidas Desechables (3)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Refresco Lata', 'Bebida gaseosa en lata', 10.00, 2, 'Bebidas Desechables', true),
  ('Agua Purificada', 'Botella de agua purificada', 8.00, 2, 'Bebidas Desechables', true),
  ('Jugo Envasado', 'Jugo de caja en varios sabores', 12.00, 2, 'Bebidas Desechables', true);

-- ÁREA 3: COFFEE (13 platillos)

-- Café (7)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Café Americano', 'Café negro tradicional', 18.00, 3, 'Cafe', true),
  ('Capuccino', 'Café con leche espumada y canela', 25.00, 3, 'Cafe', true),
  ('Café Latte', 'Café con leche vaporizada', 28.00, 3, 'Cafe', true),
  ('Espresso', 'Café concentrado italiano', 20.00, 3, 'Cafe', true),
  ('Café Moka', 'Café con chocolate y crema', 30.00, 3, 'Cafe', true),
  ('Frappe', 'Café helado batido con hielo', 32.00, 3, 'Cafe', true),
  ('Café con Leche', 'Café tradicional con leche caliente', 22.00, 3, 'Cafe', true);

-- Postres (6)
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES 
  ('Rellenitos de Plátano', 'Postre típico guatemalteco de plátano con frijol', 15.00, 3, 'Postres', true),
  ('Pastel de Chocolate', 'Porción de pastel de chocolate húmedo', 22.00, 3, 'Postres', true),
  ('Pie de Manzana', 'Pie de manzana con canela', 24.00, 3, 'Postres', true),
  ('Churros con Chocolate', 'Churros crujientes con chocolate caliente', 20.00, 3, 'Postres', true),
  ('Tres Leches', 'Pastel de tres leches tradicional', 26.00, 3, 'Postres', true),
  ('Flan de Caramelo', 'Flan casero con caramelo', 18.00, 3, 'Postres', true);

COMMIT;

-- Verificar
SELECT 
  a.nombre AS area,
  p.categoria,
  COUNT(*) AS cantidad
FROM platillos p
JOIN area a ON p.id_area = a.id_area
GROUP BY a.nombre, p.categoria
ORDER BY a.nombre, p.categoria;
```

Guarda este script como `insertar-platillos-completo.sql` y ejecútalo:

```bash
docker exec -i <contenedor-postgres> psql -U postgres -d restaurante_db < insertar-platillos-completo.sql
```

---

## ⚠️ ERRORES COMUNES Y SOLUCIONES

### Error: `duplicate key value violates unique constraint "platillos_nombre_key"`

**Causa:** Ya existe un platillo con ese nombre.

**Solución:**
```sql
-- Opción 1: Cambiar el nombre
INSERT INTO platillos (...) VALUES ('Café Americano Grande', ...);

-- Opción 2: Actualizar el existente
UPDATE platillos SET precio = 20.00 WHERE nombre = 'Café Americano';

-- Opción 3: Eliminar y crear nuevamente
DELETE FROM platillos WHERE nombre = 'Café Americano';
INSERT INTO platillos (...) VALUES ('Café Americano', ...);
```

---

### Error: `violates foreign key constraint "platillos_id_area_fkey"`

**Causa:** El `id_area` no existe.

**Solución:**
```sql
-- Verificar qué áreas existen
SELECT * FROM area;

-- Resultado debe ser:
-- id_area | nombre
-- 1       | Cocina
-- 2       | Bebidas
-- 3       | Coffee
```

---

### Error: `column "categoria" cannot be null`

**Causa:** Falta especificar la categoría.

**Solución:**
```sql
-- Siempre incluir categoría
INSERT INTO platillos (nombre, descripcion, precio, id_area, categoria, disponible)
VALUES ('Mi Platillo', 'Descripción', 50.00, 1, 'Almuerzos', true);
--                                                 ^^^^^^^^^ obligatorio
```

---

## 📊 RESUMEN

| Método | Pros | Contras | Cuándo usar |
|--------|------|---------|-------------|
| **SQL Directo** | Rápido, masivo | Menos seguro, sin validaciones | Migración inicial, muchos platillos |
| **Prisma** | Validaciones, tipado, seguro | Requiere código | Desarrollo, scripts automatizados |
| **API REST** | Validaciones completas, logs | Más lento | Operación normal, frontend |

---

## 🎯 RECOMENDACIONES

1. **Usa SQL directo** para cargar platillos iniciales (seed)
2. **Usa Prisma** para scripts automatizados de mantenimiento
3. **Usa API REST** para operación diaria desde el frontend

---

**Documento creado:** Noviembre 6, 2025  
**Versión:** 1.0  
**Sistema:** Chicoj  
**Total de ejemplos:** 41 platillos completos

