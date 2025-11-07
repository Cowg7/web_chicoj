// src/modules/categorias/categorias.controller.js
import prisma from '../../config/database.js';
import { AppError, asyncHandler } from '../../middlewares/errorHandler.js';

// GET /categorias - Obtener todas las categorías
export const getCategorias = asyncHandler(async (req, res) => {
  const { id_area, activa } = req.query;
  
  // Construir filtros
  const where = {};
  if (id_area) {
    where.id_area = parseInt(id_area);
  }
  if (activa !== undefined) {
    where.activa = activa === 'true';
  }
  
  const categorias = await prisma.categorias.findMany({
    where,
    include: {
      area: {
        select: {
          id_area: true,
          nombre: true
        }
      },
      _count: {
        select: { platillos: true }
      }
    },
    orderBy: [
      { id_area: 'asc' },
      { nombre: 'asc' }
    ]
  });
  
  res.json({
    success: true,
    data: {
      categorias,
      total: categorias.length
    }
  });
});

// GET /categorias/:id - Obtener una categoría específica
export const getCategoria = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const categoria = await prisma.categorias.findUnique({
    where: { id_categoria: parseInt(id) },
    include: {
      area: true,
      _count: {
        select: { platillos: true }
      }
    }
  });
  
  if (!categoria) {
    throw new AppError('Categoría no encontrada', 404);
  }
  
  res.json({
    success: true,
    data: { categoria }
  });
});

// POST /categorias - Crear nueva categoría
export const createCategoria = asyncHandler(async (req, res) => {
  console.log('[NOTE] Creando categoría:', req.body);
  
  const { nombre, descripcion, id_area } = req.body;
  
  if (!nombre || !id_area) {
    throw new AppError('Nombre y área son requeridos', 400);
  }
  
  // Verificar que el área existe
  const area = await prisma.area.findUnique({
    where: { id_area: parseInt(id_area) }
  });
  
  if (!area) {
    throw new AppError(`Área con ID ${id_area} no encontrada`, 404);
  }
  
  // Verificar que no exista una categoría con el mismo nombre en la misma área
  const categoriaExistente = await prisma.categorias.findFirst({
    where: {
      nombre: nombre.trim(),
      id_area: parseInt(id_area)
    }
  });
  
  if (categoriaExistente) {
    throw new AppError(
      `Ya existe una categoría con el nombre "${nombre}" en el área "${area.nombre}"`,
      409
    );
  }
  
  try {
    const categoria = await prisma.categorias.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        id_area: parseInt(id_area)
      },
      include: {
        area: true
      }
    });
    
    console.log('[OK] Categoría creada exitosamente:', categoria.nombre);
    
    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { categoria }
    });
  } catch (error) {
    console.error('[ERROR] Error al crear categoría en la BD:', error);
    throw error;
  }
});

// PATCH /categorias/:id - Actualizar categoría
export const updateCategoria = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, id_area, activa } = req.body;
  
  // Verificar que la categoría existe
  const categoriaActual = await prisma.categorias.findUnique({
    where: { id_categoria: parseInt(id) }
  });
  
  if (!categoriaActual) {
    throw new AppError('Categoría no encontrada', 404);
  }
  
  // Si se está cambiando el nombre o área, verificar que no exista duplicado
  if (nombre || id_area) {
    const nuevoNombre = nombre?.trim() || categoriaActual.nombre;
    const nuevoIdArea = id_area ? parseInt(id_area) : categoriaActual.id_area;
    
    const categoriaExistente = await prisma.categorias.findFirst({
      where: {
        nombre: nuevoNombre,
        id_area: nuevoIdArea,
        NOT: {
          id_categoria: parseInt(id)
        }
      }
    });
    
    if (categoriaExistente) {
      throw new AppError(
        `Ya existe una categoría con el nombre "${nuevoNombre}" en esta área`,
        409
      );
    }
  }
  
  const categoria = await prisma.categorias.update({
    where: { id_categoria: parseInt(id) },
    data: {
      ...(nombre && { nombre: nombre.trim() }),
      ...(descripcion !== undefined && { descripcion: descripcion?.trim() || null }),
      ...(id_area && { id_area: parseInt(id_area) }),
      ...(activa !== undefined && { activa })
    },
    include: {
      area: true,
      _count: {
        select: { platillos: true }
      }
    }
  });
  
  res.json({
    success: true,
    message: 'Categoría actualizada exitosamente',
    data: { categoria }
  });
});

// DELETE /categorias/:id - Eliminar categoría
export const deleteCategoria = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Verificar si la categoría existe
  const categoria = await prisma.categorias.findUnique({
    where: { id_categoria: parseInt(id) },
    include: {
      _count: {
        select: { platillos: true }
      }
    }
  });
  
  if (!categoria) {
    throw new AppError('Categoría no encontrada', 404);
  }
  
  // Verificar si tiene platillos asociados
  if (categoria._count.platillos > 0) {
    throw new AppError(
      `No se puede eliminar la categoría "${categoria.nombre}" porque tiene ${categoria._count.platillos} platillo(s) asociado(s). ` +
      `Por seguridad, las categorías con platillos no pueden ser eliminadas. ` +
      `Si deseas que no esté disponible, puedes desactivarla en su lugar.`,
      400
    );
  }
  
  // Si no tiene platillos, eliminar
  await prisma.categorias.delete({
    where: { id_categoria: parseInt(id) }
  });
  
  res.json({
    success: true,
    message: 'Categoría eliminada exitosamente'
  });
});

// PATCH /categorias/:id/toggle - Activar/Desactivar categoría
export const toggleCategoria = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { activa } = req.body;
  
  console.log(`[LOAD] Cambiando estado de categoría ${id} a:`, activa);
  
  const categoria = await prisma.categorias.update({
    where: { id_categoria: parseInt(id) },
    data: { activa },
    include: {
      area: true
    }
  });
  
  console.log(`[OK] Categoría "${categoria.nombre}" ahora está ${activa ? 'ACTIVA' : 'INACTIVA'}`);
  
  res.json({
    success: true,
    message: `Categoría ${activa ? 'activada' : 'desactivada'} exitosamente`,
    data: { categoria }
  });
});

