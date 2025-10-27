// Script para crear/verificar roles del sistema
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROLES_REQUERIDOS = [
  { nombre_rol: 'Administrador', descripcion: 'Acceso completo al sistema' },
  { nombre_rol: 'Gerente', descripcion: 'Acceso a reportes y estadísticas' },
  { nombre_rol: 'Cajero', descripcion: 'Acceso a caja y reportes' },
  { nombre_rol: 'Mesero', descripcion: 'Gestión de órdenes y comandas' },
  { nombre_rol: 'Cocina', descripcion: 'KDS de cocina (comida caliente)' },
  { nombre_rol: 'Bebidas', descripcion: 'KDS de bebidas (bar)' },
  { nombre_rol: 'Coffee', descripcion: 'KDS de coffee shop (café y postres)' },
  { nombre_rol: 'Tour', descripcion: 'Gestión de tours' }
];

async function setupRoles() {
  console.log('🔧 Configurando roles del sistema...\n');

  for (const rol of ROLES_REQUERIDOS) {
    try {
      // Buscar si el rol ya existe (case-insensitive)
      const existente = await prisma.roles.findFirst({
        where: {
          nombre_rol: {
            equals: rol.nombre_rol,
            mode: 'insensitive'
          }
        }
      });

      if (existente) {
        console.log(`✅ Rol "${rol.nombre_rol}" ya existe (ID: ${existente.id_rol})`);
      } else {
        // Crear el rol
        const nuevoRol = await prisma.roles.create({
          data: {
            nombre_rol: rol.nombre_rol,
            descripcion: rol.descripcion
          }
        });
        console.log(`🆕 Rol "${rol.nombre_rol}" creado (ID: ${nuevoRol.id_rol})`);
      }
    } catch (error) {
      console.error(`❌ Error con rol "${rol.nombre_rol}":`, error.message);
    }
  }

  console.log('\n📊 Listado de todos los roles:');
  const todosRoles = await prisma.roles.findMany({
    orderBy: { id_rol: 'asc' }
  });

  todosRoles.forEach(rol => {
    console.log(`   ${rol.id_rol}. ${rol.nombre_rol} - ${rol.descripcion || 'Sin descripción'}`);
  });

  console.log('\n✅ Configuración de roles completada');
}

setupRoles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

