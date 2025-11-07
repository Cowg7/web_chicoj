// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // ============ ROLES ============
  console.log('📋 Creando roles...');
  const roles = await Promise.all([
    prisma.roles.upsert({
      where: { nombre_rol: 'Administrador' },
      update: {},
      create: {
        nombre_rol: 'Administrador',
        descripcion: 'Acceso total al sistema'
      }
    }),
    prisma.roles.upsert({
      where: { nombre_rol: 'Gerente' },
      update: {},
      create: {
        nombre_rol: 'Gerente',
        descripcion: 'Gestión de operaciones y reportes'
      }
    }),
    prisma.roles.upsert({
      where: { nombre_rol: 'Cajero' },
      update: {},
      create: {
        nombre_rol: 'Cajero',
        descripcion: 'Procesamiento de pagos'
      }
    }),
    prisma.roles.upsert({
      where: { nombre_rol: 'Mesero' },
      update: {},
      create: {
        nombre_rol: 'Mesero',
        descripcion: 'Toma de órdenes'
      }
    }),
    prisma.roles.upsert({
      where: { nombre_rol: 'Cocina' },
      update: {},
      create: {
        nombre_rol: 'Cocina',
        descripcion: 'Preparación de alimentos'
      }
    }),
    prisma.roles.upsert({
      where: { nombre_rol: 'Tour' },
      update: {},
      create: {
        nombre_rol: 'Tour',
        descripcion: 'Gestión de tours y reservas'
      }
    })
  ]);
  console.log(`✅ ${roles.length} roles creados\n`);

  // ============ EMPLEADOS Y USUARIOS ============
  console.log('👤 Creando empleados y usuarios...');
  
  const adminEmpleado = await prisma.empleados.upsert({
    where: { correo_electronico: 'admin@chicoj.com' },
    update: {},
    create: {
      nombre: 'Admin',
      apellidos: 'Sistema',
      edad: 30,
      genero: 'N/A',
      correo_electronico: 'admin@chicoj.com'
    }
  });

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.usuarios.upsert({
    where: { usuario_nombre: 'admin' },
    update: {},
    create: {
      usuario_nombre: 'admin',
      contrasena_hash: adminPassword,
      id_empleado: adminEmpleado.id_empleado,
      id_rol: roles[0].id_rol // Administrador
    }
  });

  const meseroEmpleado = await prisma.empleados.upsert({
    where: { correo_electronico: 'mesero@chicoj.com' },
    update: {},
    create: {
      nombre: 'Juan',
      apellidos: 'Pérez García',
      edad: 25,
      genero: 'Masculino',
      correo_electronico: 'mesero@chicoj.com'
    }
  });

  const meseroPassword = await bcrypt.hash('mesero123', 10);
  await prisma.usuarios.upsert({
    where: { usuario_nombre: 'mesero1' },
    update: {},
    create: {
      usuario_nombre: 'mesero1',
      contrasena_hash: meseroPassword,
      id_empleado: meseroEmpleado.id_empleado,
      id_rol: roles[3].id_rol // Mesero
    }
  });

  // Gerente
  const gerenteEmpleado = await prisma.empleados.upsert({
    where: { correo_electronico: 'gerente@chicoj.com' },
    update: {},
    create: {
      nombre: 'María',
      apellidos: 'López Hernández',
      edad: 35,
      genero: 'Femenino',
      correo_electronico: 'gerente@chicoj.com'
    }
  });

  const gerentePassword = await bcrypt.hash('gerente123', 10);
  await prisma.usuarios.upsert({
    where: { usuario_nombre: 'gerente1' },
    update: {},
    create: {
      usuario_nombre: 'gerente1',
      contrasena_hash: gerentePassword,
      id_empleado: gerenteEmpleado.id_empleado,
      id_rol: roles[1].id_rol // Gerente
    }
  });

  // Cajero
  const cajeroEmpleado = await prisma.empleados.upsert({
    where: { correo_electronico: 'cajero@chicoj.com' },
    update: {},
    create: {
      nombre: 'Carlos',
      apellidos: 'Ramírez Pérez',
      edad: 28,
      genero: 'Masculino',
      correo_electronico: 'cajero@chicoj.com'
    }
  });

  const cajeroPassword = await bcrypt.hash('cajero123', 10);
  await prisma.usuarios.upsert({
    where: { usuario_nombre: 'cajero1' },
    update: {},
    create: {
      usuario_nombre: 'cajero1',
      contrasena_hash: cajeroPassword,
      id_empleado: cajeroEmpleado.id_empleado,
      id_rol: roles[2].id_rol // Cajero
    }
  });

  // Cocineros por área
  const cocinero1Empleado = await prisma.empleados.upsert({
    where: { correo_electronico: 'cocina1@chicoj.com' },
    update: {},
    create: {
      nombre: 'Pedro',
      apellidos: 'Gonzalez Morales',
      edad: 32,
      genero: 'Masculino',
      correo_electronico: 'cocina1@chicoj.com'
    }
  });

  const cocinero1Password = await bcrypt.hash('cocina123', 10);
  await prisma.usuarios.upsert({
    where: { usuario_nombre: 'cocina1' },
    update: {},
    create: {
      usuario_nombre: 'cocina1',
      contrasena_hash: cocinero1Password,
      id_empleado: cocinero1Empleado.id_empleado,
      id_rol: roles[4].id_rol // Cocina
    }
  });

  const bartender1Empleado = await prisma.empleados.upsert({
    where: { correo_electronico: 'bebidas1@chicoj.com' },
    update: {},
    create: {
      nombre: 'Ana',
      apellidos: 'Martínez Cruz',
      edad: 26,
      genero: 'Femenino',
      correo_electronico: 'bebidas1@chicoj.com'
    }
  });

  const bartender1Password = await bcrypt.hash('bebidas123', 10);
  await prisma.usuarios.upsert({
    where: { usuario_nombre: 'bebidas1' },
    update: {},
    create: {
      usuario_nombre: 'bebidas1',
      contrasena_hash: bartender1Password,
      id_empleado: bartender1Empleado.id_empleado,
      id_rol: roles[4].id_rol // Cocina (mismo rol, diferente área)
    }
  });

  const barista1Empleado = await prisma.empleados.upsert({
    where: { correo_electronico: 'coffee1@chicoj.com' },
    update: {},
    create: {
      nombre: 'Luis',
      apellidos: 'Fernández Silva',
      edad: 24,
      genero: 'Masculino',
      correo_electronico: 'coffee1@chicoj.com'
    }
  });

  const barista1Password = await bcrypt.hash('coffee123', 10);
  await prisma.usuarios.upsert({
    where: { usuario_nombre: 'coffee1' },
    update: {},
    create: {
      usuario_nombre: 'coffee1',
      contrasena_hash: barista1Password,
      id_empleado: barista1Empleado.id_empleado,
      id_rol: roles[4].id_rol // Cocina (mismo rol, diferente área)
    }
  });

  // Usuario Tour
  const tourEmpleado = await prisma.empleados.upsert({
    where: { correo_electronico: 'tour@chicoj.com' },
    update: {},
    create: {
      nombre: 'Sofia',
      apellidos: 'Méndez Torres',
      edad: 27,
      genero: 'Femenino',
      correo_electronico: 'tour@chicoj.com'
    }
  });

  const tourPassword = await bcrypt.hash('tour123', 10);
  await prisma.usuarios.upsert({
    where: { usuario_nombre: 'tour1' },
    update: {},
    create: {
      usuario_nombre: 'tour1',
      contrasena_hash: tourPassword,
      id_empleado: tourEmpleado.id_empleado,
      id_rol: roles[5].id_rol // Tour
    }
  });

  console.log('✅ Usuarios creados:');
  console.log('   - admin/admin123 (Administrador)');
  console.log('   - gerente1/gerente123 (Gerente)');
  console.log('   - cajero1/cajero123 (Cajero)');
  console.log('   - mesero1/mesero123 (Mesero)');
  console.log('   - cocina1/cocina123 (Cocina)');
  console.log('   - bebidas1/bebidas123 (Bebidas)');
  console.log('   - coffee1/coffee123 (Coffee)');
  console.log('   - tour1/tour123 (Tour)\n');

  // ============ ÁREAS ============
  console.log('🍳 Creando áreas...');
  const areas = await Promise.all([
    prisma.area.upsert({
      where: { nombre: 'Cocina' },
      update: {},
      create: {
        nombre: 'Cocina',
        descripcion: 'Preparación de alimentos calientes'
      }
    }),
    prisma.area.upsert({
      where: { nombre: 'Bebidas' },
      update: {},
      create: {
        nombre: 'Bebidas',
        descripcion: 'Bebidas y cocteles'
      }
    }),
    prisma.area.upsert({
      where: { nombre: 'Coffee' },
      update: {},
      create: {
        nombre: 'Coffee',
        descripcion: 'Café y postres'
      }
    }),
  ]);
  console.log(`✅ ${areas.length} áreas creadas\n`);

  // ============ PLATILLOS CON CATEGORÍAS ============
  console.log('🍽️  Creando platillos con categorías...');
  
  const platillosCocina = [
    // Desayunos
    { nombre: 'Desayuno Chapin', descripcion: 'Huevos, frijoles, plátano, queso y tortillas', precio: 35.00, categoria: 'Desayunos' },
    { nombre: 'Huevos con Longaniza', descripcion: 'Huevos revueltos con longaniza guatemalteca', precio: 40.00, categoria: 'Desayunos' },
    { nombre: 'Panqueques', descripcion: 'Panqueques con miel y fruta', precio: 30.00, categoria: 'Desayunos' },
    
    // Almuerzos
    { nombre: 'Pepián de Pollo', descripcion: 'Plato típico guatemalteco con especias tradicionales', precio: 65.00, categoria: 'Almuerzos' },
    { nombre: 'Hilachas', descripcion: 'Carne de res deshilachada en salsa de tomate', precio: 55.00, categoria: 'Almuerzos' },
    { nombre: 'Kaq Ik', descripcion: 'Caldo de chompipe con chile y especias', precio: 70.00, categoria: 'Almuerzos' },
    { nombre: 'Churrasco Chapín', descripcion: 'Carne asada con chimol y guacamol', precio: 85.00, categoria: 'Almuerzos' },
    { nombre: 'Pollo Encebollado', descripcion: 'Pechuga de pollo con cebolla y salsa', precio: 50.00, categoria: 'Almuerzos' },
    
    // Menú Infantil
    { nombre: 'Nuggets con Papas', descripcion: 'Nuggets de pollo con papas fritas', precio: 35.00, categoria: 'Menu Infantil' },
    { nombre: 'Mini Hamburguesa', descripcion: 'Hamburguesa pequeña con papas', precio: 38.00, categoria: 'Menu Infantil' },
    
    // Refacciones
    { nombre: 'Sandwich de Pollo', descripcion: 'Sandwich de pollo con vegetales frescos', precio: 28.00, categoria: 'Refacciones' },
    { nombre: 'Ensalada Mixta', descripcion: 'Ensalada fresca con aderezo', precio: 25.00, categoria: 'Refacciones' },
    
    // Refacciones Típicas
    { nombre: 'Tamalitos de Chipilín', descripcion: 'Tamalitos con hojas de chipilín', precio: 20.00, categoria: 'Refacciones Tipicas' },
    { nombre: 'Plátanos Fritos', descripcion: 'Plátanos maduros fritos con crema y frijoles', precio: 25.00, categoria: 'Refacciones Tipicas' },
    { nombre: 'Chuchitos', descripcion: 'Tamalitos guatemaltecos con salsa', precio: 18.00, categoria: 'Refacciones Tipicas' },
  ];

  const platillosBar = [
    // Bebidas Frías
    { nombre: 'Limonada Natural', descripcion: 'Limonada fresca natural', precio: 15.00, categoria: 'Bebidas Frias' },
    { nombre: 'Jugo de Naranja', descripcion: 'Jugo de naranja recién exprimido', precio: 18.00, categoria: 'Bebidas Frias' },
    { nombre: 'Agua Mineral', descripcion: 'Agua mineral con gas o sin gas', precio: 12.00, categoria: 'Bebidas Frias' },
    { nombre: 'Te Helado', descripcion: 'Té frío con limón', precio: 16.00, categoria: 'Bebidas Frias' },
    
    // Licuados
    { nombre: 'Licuado de Fresa', descripcion: 'Licuado natural de fresa con leche', precio: 22.00, categoria: 'Licuados' },
    { nombre: 'Licuado de Banano', descripcion: 'Licuado de banano con leche y miel', precio: 20.00, categoria: 'Licuados' },
    { nombre: 'Licuado de Papaya', descripcion: 'Licuado tropical de papaya', precio: 22.00, categoria: 'Licuados' },
    
    // Cervezas
    { nombre: 'Cerveza Nacional', descripcion: 'Cerveza guatemalteca fría', precio: 25.00, categoria: 'Cervezas' },
    { nombre: 'Cerveza Importada', descripcion: 'Cerveza importada premium', precio: 35.00, categoria: 'Cervezas' },
    { nombre: 'Michelada', descripcion: 'Cerveza preparada con limón y sal', precio: 30.00, categoria: 'Cervezas' },
    
    // Bebidas Desechables
    { nombre: 'Refresco Lata', descripcion: 'Bebida gaseosa en lata', precio: 10.00, categoria: 'Bebidas Desechables' },
    { nombre: 'Agua Purificada', descripcion: 'Botella de agua purificada', precio: 8.00, categoria: 'Bebidas Desechables' },
    { nombre: 'Jugo Envasado', descripcion: 'Jugo de caja en varios sabores', precio: 12.00, categoria: 'Bebidas Desechables' },
  ];

  const platillosCoffee = [
    // Café
    { nombre: 'Café Americano', descripcion: 'Café negro tradicional', precio: 18.00, categoria: 'Cafe' },
    { nombre: 'Capuccino', descripcion: 'Café con leche espumada y canela', precio: 25.00, categoria: 'Cafe' },
    { nombre: 'Café Latte', descripcion: 'Café con leche vaporizada', precio: 28.00, categoria: 'Cafe' },
    { nombre: 'Espresso', descripcion: 'Café concentrado italiano', precio: 20.00, categoria: 'Cafe' },
    { nombre: 'Café Moka', descripcion: 'Café con chocolate y crema', precio: 30.00, categoria: 'Cafe' },
    { nombre: 'Frappe', descripcion: 'Café helado batido con hielo', precio: 32.00, categoria: 'Cafe' },
    { nombre: 'Café con Leche', descripcion: 'Café tradicional con leche caliente', precio: 22.00, categoria: 'Cafe' },
    
    // Postres
    { nombre: 'Rellenitos de Plátano', descripcion: 'Postre típico guatemalteco de plátano con frijol', precio: 15.00, categoria: 'Postres' },
    { nombre: 'Pastel de Chocolate', descripcion: 'Porción de pastel de chocolate húmedo', precio: 22.00, categoria: 'Postres' },
    { nombre: 'Pie de Manzana', descripcion: 'Pie de manzana con canela', precio: 24.00, categoria: 'Postres' },
    { nombre: 'Churros con Chocolate', descripcion: 'Churros crujientes con chocolate caliente', precio: 20.00, categoria: 'Postres' },
    { nombre: 'Tres Leches', descripcion: 'Pastel de tres leches tradicional', precio: 26.00, categoria: 'Postres' },
    { nombre: 'Flan de Caramelo', descripcion: 'Flan casero con caramelo', precio: 18.00, categoria: 'Postres' },
  ];

  for (const p of platillosCocina) {
    await prisma.platillos.upsert({
      where: { nombre: p.nombre },
      update: {},
      create: { ...p, id_area: areas[0].id_area }
    });
  }

  for (const p of platillosBar) {
    await prisma.platillos.upsert({
      where: { nombre: p.nombre },
      update: {},
      create: { ...p, id_area: areas[1].id_area }
    });
  }

  for (const p of platillosCoffee) {
    await prisma.platillos.upsert({
      where: { nombre: p.nombre },
      update: {},
      create: { ...p, id_area: areas[2].id_area }
    });
  }

  const totalPlatillos = platillosCocina.length + platillosBar.length + platillosCoffee.length;
  console.log(`✅ ${totalPlatillos} platillos creados con categorías\n`);
  
  console.log('📊 Resumen de categorías:');
  console.log('   Cocina (15): Desayunos (3), Almuerzos (5), Menu Infantil (2), Refacciones (2), Refacciones Tipicas (3)');
  console.log('   Bebidas (13): Bebidas Frias (4), Licuados (3), Cervezas (3), Bebidas Desechables (3)');
  console.log('   Coffee (13): Cafe (7), Postres (6)\n');

  console.log('✨ Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });