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

  console.log('✅ Usuarios creados:');
  console.log('   - admin/admin123 (Administrador)');
  console.log('   - gerente1/gerente123 (Gerente)');
  console.log('   - cajero1/cajero123 (Cajero)');
  console.log('   - mesero1/mesero123 (Mesero)');
  console.log('   - cocina1/cocina123 (Cocina)');
  console.log('   - bebidas1/bebidas123 (Bebidas)');
  console.log('   - coffee1/coffee123 (Coffee)\n');

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

  // ============ PLATILLOS ============
  console.log('🍽️  Creando platillos...');
  
  const platillosCocina = [
    { nombre: 'Pepián de Pollo', descripcion: 'Plato típico guatemalteco', precio: 65.00 },
    { nombre: 'Hilachas', descripcion: 'Carne deshilachada en salsa', precio: 55.00 },
    { nombre: 'Kaq Ik', descripcion: 'Caldo de chompipe', precio: 70.00 },
  ];

  const platillosBar = [
    { nombre: 'Michelada', descripcion: 'Cerveza preparada', precio: 30.00 },
    { nombre: 'Mojito', descripcion: 'Coctel de ron', precio: 35.00 },
    { nombre: 'Piña Colada', descripcion: 'Coctel tropical', precio: 38.00 },
  ];

  const platillosCoffee = [
    { nombre: 'Café Americano', descripcion: 'Café negro', precio: 18.00 },
    { nombre: 'Capuccino', descripcion: 'Café con leche espumada', precio: 25.00 },
    { nombre: 'Rellenitos de Plátano', descripcion: 'Postre típico', precio: 15.00 },
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

  console.log(`✅ ${platillosCocina.length + platillosBar.length + platillosCoffee.length} platillos creados\n`);

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