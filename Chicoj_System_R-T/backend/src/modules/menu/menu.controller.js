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
      },
      categoria: {
        select: {
          id_categoria: true,
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
      id_categoria: platillo.id_categoria,
      categoria: platillo.categoria?.nombre || null, // Nombre de la categoría como string (para compatibilidad)
      categoriaObj: platillo.categoria, // Objeto completo de categoría si se necesita
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
      area: true,
      categoria: true
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
  console.log('[NOTE] Creando platillo:', req.body);
  
  const { nombre, descripcion, precio, id_area, area, id_categoria } = req.body;
  
  // Aceptar tanto id_area como area (nombre)
  const areaIdentifier = id_area || area;
  
  console.log('[CHECK] Buscando área:', areaIdentifier);
  
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
    console.log('[ERROR] Área no encontrada:', areaIdentifier);
    throw new AppError(`Área "${areaIdentifier}" no encontrada`, 404);
  }
  
  console.log('[OK] Área encontrada:', areaEncontrada);
  
  try {
    const platillo = await prisma.platillos.create({
      data: {
        nombre,
        descripcion: descripcion || '',
        precio: parseFloat(precio),
        id_area: areaEncontrada.id_area,
        id_categoria: id_categoria ? parseInt(id_categoria) : null
      },
      include: {
        area: true,
        categoria: true
      }
    });
    
    console.log('[OK] Platillo creado exitosamente:', platillo.nombre);
    
    res.status(201).json({
      success: true,
      message: 'Platillo creado exitosamente',
      data: { platillo }
    });
  } catch (error) {
    console.error('[ERROR] Error al crear platillo en la BD:', error);
    throw error;
  }
});

// PATCH /menu/:id - Actualizar platillo
export const updatePlatillo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, id_area, id_categoria } = req.body;
  
  const platillo = await prisma.platillos.update({
    where: { id_platillo: parseInt(id) },
    data: {
      ...(nombre && { nombre }),
      ...(descripcion !== undefined && { descripcion }),
      ...(precio && { precio }),
      ...(id_area && { id_area: parseInt(id_area) }),
      ...(id_categoria !== undefined && { id_categoria: id_categoria ? parseInt(id_categoria) : null })
    },
    include: {
      area: true,
      categoria: true
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
  
  // Verificar si el platillo existe
  const platillo = await prisma.platillos.findUnique({
    where: { id_platillo: parseInt(id) }
  });
  
  if (!platillo) {
    throw new AppError('Platillo no encontrado', 404);
  }
  
  // Verificar si el platillo tiene comandas asociadas
  const comandasAsociadas = await prisma.comanda.count({
    where: { id_platillo: parseInt(id) }
  });
  
  if (comandasAsociadas > 0) {
    throw new AppError(
      `No se puede eliminar el platillo "${platillo.nombre}" porque tiene ${comandasAsociadas} orden(es) asociada(s). ` +
      `Por seguridad, los platillos con historial de órdenes no pueden ser eliminados. ` +
      `Si deseas que no aparezca en el menú, puedes desactivarlo en su lugar.`,
      400
    );
  }
  
  // Si no tiene comandas, eliminar
  await prisma.platillos.delete({
    where: { id_platillo: parseInt(id) }
  });
  
  res.json({
    success: true,
    message: 'Platillo eliminado exitosamente'
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
  
  console.log(`[LOAD] Cambiando disponibilidad del platillo ${id} a:`, disponible);
  
  const platillo = await prisma.platillos.update({
    where: { id_platillo: parseInt(id) },
    data: {
      disponible: disponible
    },
    include: {
      area: true
    }
  });
  
  console.log(`[OK] Platillo "${platillo.nombre}" ahora está ${disponible ? 'DISPONIBLE' : 'NO DISPONIBLE'}`);
  
  res.json({
    success: true,
    message: `Platillo ${disponible ? 'activado' : 'desactivado'} exitosamente`,
    data: { platillo }
  });
});