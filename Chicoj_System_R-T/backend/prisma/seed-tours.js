// Script para generar 100 registros de tours con datos variados
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Datos de ejemplo para generar tours variados
const servicios = [
  { nombre: 'Recorrido', precio: 50 },
  { nombre: 'Recorrido y Canopy', precio: 150 },
  { nombre: 'Solo Canopy', precio: 100 },
  { nombre: 'Tour Gastronómico', precio: 75 },
  { nombre: 'Recorrido Nocturno', precio: 85 }
];

const tiposVisitante = ['Nacional', 'Extranjero', 'Estudiante'];
const idiomas = ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', null];
const observaciones = [
  'Tour completo sin inconvenientes',
  'Grupo familiar con niños',
  'Visitantes corporativos',
  'Estudiantes universitarios',
  'Turistas internacionales',
  'Celebración especial',
  'Grupo de la tercera edad',
  null,
  null,
  null
];

// Función para generar fecha aleatoria en los últimos 6 meses
function getRandomDate() {
  const hoy = new Date();
  const seiseMesesAtras = new Date();
  seiseMesesAtras.setMonth(seiseMesesAtras.getMonth() - 6);
  
  const timestamp = seiseMesesAtras.getTime() + 
    Math.random() * (hoy.getTime() - seiseMesesAtras.getTime());
  
  return new Date(timestamp);
}

// Función para obtener elemento aleatorio de un array
function random(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Función para obtener número aleatorio entre min y max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedTours() {
  console.log('🌱 Iniciando seed de 100 tours...\n');

  try {
    // Generar 100 tours
    console.log('🎫 Generando 100 registros de tours...\n');
    
    const tours = [];
    for (let i = 0; i < 100; i++) {
      const servicio = random(servicios);
      const cantidad = randomInt(1, 15); // De 1 a 15 visitantes
      
      const tourData = {
        fecha: getRandomDate(),
        nombre_servicio: servicio.nombre,
        precio_servicio: servicio.precio,
        tipo_visitante: random(tiposVisitante),
        cantidad_visitante: cantidad,
        idioma: random(idiomas),
        observaciones: random(observaciones)
      };
      
      tours.push(tourData);
      
      // Mostrar progreso cada 10 registros
      if ((i + 1) % 10 === 0) {
        console.log(`  ⏳ Preparados ${i + 1}/100 tours...`);
      }
    }

    console.log('\n💾 Insertando tours en la base de datos...\n');

    // Insertar todos los tours
    let insertados = 0;
    for (const tour of tours) {
      try {
        await prisma.tour.create({
          data: tour
        });
        insertados++;
        
        if (insertados % 20 === 0) {
          console.log(`  ✅ ${insertados}/100 tours insertados...`);
        }
      } catch (error) {
        console.error(`❌ Error al insertar tour:`, error.message);
      }
    }

    console.log(`\n✨ Seed completado!\n`);
    console.log(`📊 Resumen:`);
    console.log(`   - Tours insertados: ${insertados}`);
    
    // Mostrar estadísticas
    const totalTours = await prisma.tour.count();

    console.log(`   - Total tours en BD: ${totalTours}`);
    console.log(`\n🎉 ¡100 tours generados exitosamente!`);

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar seed
seedTours()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

