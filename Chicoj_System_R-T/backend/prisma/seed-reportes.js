// Script para generar 100 registros de órdenes para reportes
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Estados posibles de las órdenes
const estados = ['Finalizada', 'Finalizada', 'Finalizada', 'Finalizada', 'En Caja', 'Preparada'];

// Números de mesa variados
const mesas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Llevar', 'Delivery'];

// Función para generar fecha aleatoria en los últimos 3 meses
function getRandomDate() {
  const hoy = new Date();
  const tresMesesAtras = new Date();
  tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
  
  const timestamp = tresMesesAtras.getTime() + 
    Math.random() * (hoy.getTime() - tresMesesAtras.getTime());
  
  return new Date(timestamp);
}

// Función para generar hora aleatoria del día
function getRandomDateTime(fecha) {
  const nuevaFecha = new Date(fecha);
  const hora = Math.floor(Math.random() * 14) + 8; // Entre 8am y 10pm
  const minutos = Math.floor(Math.random() * 60);
  nuevaFecha.setHours(hora, minutos, 0, 0);
  return nuevaFecha;
}

// Función para obtener elemento aleatorio de un array
function random(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Función para obtener número aleatorio entre min y max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedReportes() {
  console.log('🌱 Iniciando seed de 100 órdenes para reportes...\n');

  try {
    // Obtener platillos existentes
    const platillos = await prisma.platillos.findMany({
      where: {
        disponible: true
      }
    });

    if (platillos.length === 0) {
      console.log('❌ No hay platillos disponibles. Ejecuta el seed principal primero.');
      return;
    }

    console.log(`📋 ${platillos.length} platillos disponibles`);

    // Obtener usuarios (meseros)
    const usuarios = await prisma.usuarios.findMany();

    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios. Ejecuta el seed principal primero.');
      return;
    }

    console.log(`👥 ${usuarios.length} usuarios disponibles\n`);

    // Generar 100 órdenes
    console.log('🎫 Generando 100 órdenes...\n');
    
    let insertados = 0;
    
    for (let i = 0; i < 100; i++) {
      const fecha = getRandomDateTime(getRandomDate());
      const usuario = random(usuarios);
      const mesa = random(mesas);
      const estado = random(estados);
      
      // Generar entre 1 y 5 platillos por orden
      const cantidadPlatillos = randomInt(1, 5);
      const platillosOrden = [];
      let totalOrden = 0;
      
      for (let j = 0; j < cantidadPlatillos; j++) {
        const platillo = random(platillos);
        const cantidad = randomInt(1, 3);
        const precio = parseFloat(platillo.precio);
        const subtotal = precio * cantidad;
        
        platillosOrden.push({
          id_platillo: platillo.id_platillo,
          platillo_nombre: platillo.nombre,
          precio_unitario: precio,
          cantidad: cantidad,
          observaciones: randomInt(1, 10) > 7 ? 'Sin cebolla' : null,
          subtotal: subtotal,
          total_linea: subtotal
        });
        
        totalOrden += subtotal;
      }

      try {
        // Crear la cuenta con sus comandas
        await prisma.cuenta.create({
          data: {
            fecha: fecha,
            no_mesa: mesa,
            id_usuario: usuario.id_usuario,
            total: totalOrden,
            estado: estado,
            comandas: {
              create: platillosOrden
            }
          }
        });
        
        insertados++;
        
        if (insertados % 20 === 0) {
          console.log(`  ✅ ${insertados}/100 órdenes creadas...`);
        }
      } catch (error) {
        console.error(`❌ Error al insertar orden ${i + 1}:`, error.message);
      }
    }

    console.log(`\n✨ Seed completado!\n`);
    console.log(`📊 Resumen:`);
    console.log(`   - Órdenes insertadas: ${insertados}`);
    
    // Mostrar estadísticas
    const totalCuentas = await prisma.cuenta.count();
    const totalComandas = await prisma.comanda.count();
    const cuentasFinalizadas = await prisma.cuenta.count({
      where: { estado: 'Finalizada' }
    });
    
    const totalVentas = await prisma.cuenta.aggregate({
      where: { estado: 'Finalizada' },
      _sum: {
        total: true
      }
    });

    console.log(`   - Total órdenes en BD: ${totalCuentas}`);
    console.log(`   - Total comandas en BD: ${totalComandas}`);
    console.log(`   - Órdenes finalizadas: ${cuentasFinalizadas}`);
    console.log(`   - Total ventas: Q${totalVentas._sum.total || 0}`);
    console.log(`\n🎉 ¡100 órdenes generadas exitosamente!`);

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar seed
seedReportes()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });


