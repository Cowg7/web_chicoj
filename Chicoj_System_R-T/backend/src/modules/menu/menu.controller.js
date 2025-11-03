// src/modules/menu/menu.controller.js
import prisma from '../../config/database.js';
import { AppError, asyncHandler } from '../../middlewares/errorHandler.js';

// GET /menu - Obtener menú completo agrupado por área
export const getMenu = asyncHandler(async (req, res) => {
  const { area, disponible } = req.query;
  
  // Construir filtros
  const where = {};
  if (area) {
    where.area = { nombre: area };
  }
  
  // Filtrar por disponibilidad si se especifica
  if (disponible !== undefined) {
    where.disponible = disponible === 'true';
  }
  
  const platillos = await prisma.platillos.findMany({
    where,
    include: {
      area: {
        select: {
          id_area: true,
          nombre: true,
          descripcion: true
        }
      }
    },
    orderBy: [
      { id_area: 'asc' },
      { nombre: 'asc' }
    ]
  });
  
  // Agrupar por área
  const menuPorArea = platillos.reduce((acc, platillo) => {
    const areaNombre = platillo.area.nombre;
    if (!acc[areaNombre]) {
      acc[areaNombre] = {
        area: platillo.area,
        platillos: []
      };
    }
    acc[areaNombre].platillos.push({
      id_platillo: platillo.id_platillo,
      nombre: platillo.nombre,
      descripcion: platillo.descripcion,
      precio: parseFloat(platillo.precio),
      categoria: platillo.categoria, // ⭐ AGREGAR CATEGORÍA
      disponible: platillo.disponible !== undefined ? platillo.disponible : true
    });
    return acc;
  }, {});
  
  res.json({
    success: true,
    data: {
      menu: Object.values(menuPorArea),
      total: platillos.length
    }
  });
});

// GET /menu/:id - Obtener un platillo específico
export const getPlatillo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const platillo = await prisma.platillos.findUnique({
    where: { id_platillo: parseInt(id) },
    include: {
      area: true
    }
  });
  
  if (!platillo) {
    throw new AppError('Platillo no encontrado', 404);
  }
  
  res.json({
    success: true,
    data: { platillo }
  });
});

// POST /menu - Crear nuevo platillo (solo admin/gerente)
export const createPlatillo = asyncHandler(async (req, res) => {
  console.log('📝 Creando platillo:', req.body);
  
  const { nombre, descripcion, precio, id_area, area, categoria } = req.body;
  
  // Aceptar tanto id_area como area (nombre)
  const areaIdentifier = id_area || area;
  
  console.log('🔍 Buscando área:', areaIdentifier);
  
  if (!nombre || !precio || !areaIdentifier) {
    throw new AppError('Nombre, precio y área son requeridos', 400);
  }
  
  // Buscar área por ID o por nombre
  let areaEncontrada;
  
  if (typeof areaIdentifier === 'number' || !isNaN(parseInt(areaIdentifier))) {
    // Es un ID numérico
    areaEncontrada = await prisma.area.findUnique({
      where: { id_area: parseInt(areaIdentifier) }
    });
  } else {
    // Es un nombre de área
    areaEncontrada = await prisma.area.findFirst({
      where: { 
        nombre: {
          equals: areaIdentifier,
          mode: 'insensitive' // Case insensitive
        }
      }
    });
  }
  
  if (!areaEncontrada) {
    console.log('❌ Área no encontrada:', areaIdentifier);
    throw new AppError(`Área "${areaIdentifier}" no encontrada`, 404);
  }
  
  console.log('✅ Área encontrada:', areaEncontrada);
  
  try {
    const platillo = await prisma.platillos.create({
      data: {
        nombre,
        descripcion: descripcion || '',
        precio: parseFloat(precio),
        id_area: areaEncontrada.id_area,
        categoria: categoria || null // Agregar categoría
      },
      include: {
        area: true
      }
    });
    
    console.log('✅ Platillo creado exitosamente:', platillo.nombre);
    
    res.status(201).json({
      success: true,
      message: 'Platillo creado exitosamente',
      data: { platillo }
    });
  } catch (error) {
    console.error('❌ Error al crear platillo en la BD:', error);
    throw error;
  }
});

// PATCH /menu/:id - Actualizar platillo
export const updatePlatillo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, id_area, categoria } = req.body;
  
  const platillo = await prisma.platillos.update({
    where: { id_platillo: parseInt(id) },
    data: {
      ...(nombre && { nombre }),
      ...(descripcion !== undefined && { descripcion }),
      ...(precio && { precio }),
      ...(id_area && { id_area: parseInt(id_area) }),
      ...(categoria !== undefined && { categoria }) // Agregar categoría
    },
    include: {
      area: true
    }
  });
  
  res.json({
    success: true,
    message: 'Platillo actualizado',
    data: { platillo }
  });
});

// DELETE /menu/:id - Eliminar platillo
export const deletePlatillo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await prisma.platillos.delete({
    where: { id_platillo: parseInt(id) }
  });
  
  res.json({
    success: true,
    message: 'Platillo eliminado'
  });
});

// GET /menu/areas - Obtener todas las áreas
export const getAreas = asyncHandler(async (req, res) => {
  const areas = await prisma.area.findMany({
    include: {
      _count: {
        select: { platillos: true }
      }
    }
  });
  
  res.json({
    success: true,
    data: { areas }
  });
});

// PATCH /menu/:id/disponibilidad - Cambiar disponibilidad de un platillo
export const toggleDisponibilidad = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { disponible } = req.body;
  
  console.log(`🔄 Cambiando disponibilidad del platillo ${id} a:`, disponible);
  
  const platillo = await prisma.platillos.update({
    where: { id_platillo: parseInt(id) },
    data: {
      disponible: disponible
    },
    include: {
      area: true
    }
  });
  
  console.log(`✅ Platillo "${platillo.nombre}" ahora está ${disponible ? 'DISPONIBLE' : 'NO DISPONIBLE'}`);
  
  res.json({
    success: true,
    message: `Platillo ${disponible ? 'activado' : 'desactivado'} exitosamente`,
    data: { platillo }
  });
});