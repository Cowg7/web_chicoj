// src/modules/tour/tour.controller.js
import prisma from '../../config/database.js';
import { AppError, asyncHandler } from '../../middlewares/errorHandler.js';

// POST /tour - Registrar nuevo tour
export const createTour = asyncHandler(async (req, res) => {
  const {
    fecha,
    nombre_servicio,
    precio_servicio,
    tipo_visitante,
    cantidad_visitante,
    idioma,
    observaciones
  } = req.body;
  
  // Validación
  if (!nombre_servicio || !precio_servicio || !tipo_visitante || !cantidad_visitante) {
    throw new AppError('Campos requeridos: nombre_servicio, precio_servicio, tipo_visitante, cantidad_visitante', 400);
  }
  
  const tour = await prisma.tour.create({
    data: {
      fecha: fecha ? new Date(fecha) : new Date(),
      nombre_servicio,
      precio_servicio,
      tipo_visitante,
      cantidad_visitante,
      idioma,
      observaciones
    }
  });
  
  res.status(201).json({
    success: true,
    message: 'Tour registrado exitosamente',
    data: { tour }
  });
});

// GET /tour - Listar tours con filtros
export const getTours = asyncHandler(async (req, res) => {
  const { fecha_desde, fecha_hasta, tipo_visitante, limit = 100 } = req.query;
  
  const where = {};
  
  if (fecha_desde || fecha_hasta) {
    where.fecha = {};
    if (fecha_desde) where.fecha.gte = new Date(fecha_desde);
    if (fecha_hasta) where.fecha.lte = new Date(fecha_hasta);
  }
  
  if (tipo_visitante) {
    where.tipo_visitante = tipo_visitante;
  }
  
  const tours = await prisma.tour.findMany({
    where,
    orderBy: {
      fecha: 'desc'
    },
    take: parseInt(limit)
  });
  
  res.json({
    success: true,
    data: {
      tours,
      total: tours.length
    }
  });
});

// GET /tour/:id - Obtener tour específico
export const getTour = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const tour = await prisma.tour.findUnique({
    where: { id_tour: parseInt(id) }
  });
  
  if (!tour) {
    throw new AppError('Tour no encontrado', 404);
  }
  
  res.json({
    success: true,
    data: { tour }
  });
});

// PATCH /tour/:id - Actualizar tour
export const updateTour = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    fecha,
    nombre_servicio,
    precio_servicio,
    tipo_visitante,
    cantidad_visitante,
    idioma,
    observaciones
  } = req.body;
  
  const tour = await prisma.tour.update({
    where: { id_tour: parseInt(id) },
    data: {
      ...(fecha && { fecha: new Date(fecha) }),
      ...(nombre_servicio && { nombre_servicio }),
      ...(precio_servicio && { precio_servicio }),
      ...(tipo_visitante && { tipo_visitante }),
      ...(cantidad_visitante && { cantidad_visitante }),
      ...(idioma !== undefined && { idioma }),
      ...(observaciones !== undefined && { observaciones })
    }
  });
  
  res.json({
    success: true,
    message: 'Tour actualizado',
    data: { tour }
  });
});

// DELETE /tour/:id - Eliminar tour
export const deleteTour = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await prisma.tour.delete({
    where: { id_tour: parseInt(id) }
  });
  
  res.json({
    success: true,
    message: 'Tour eliminado'
  });
});

// GET /tour/stats - Estadísticas de tours
export const getTourStats = asyncHandler(async (req, res) => {
  const { fecha_desde, fecha_hasta } = req.query;
  
  const where = {};
  
  if (fecha_desde || fecha_hasta) {
    where.fecha = {};
    if (fecha_desde) where.fecha.gte = new Date(fecha_desde);
    if (fecha_hasta) where.fecha.lte = new Date(fecha_hasta);
  } else {
    // Por defecto, último mes
    const hoy = new Date();
    const haceMes = new Date();
    haceMes.setMonth(haceMes.getMonth() - 1);
    where.fecha = {
      gte: haceMes,
      lte: hoy
    };
  }
  
  const tours = await prisma.tour.findMany({ where });
  
  // Calcular estadísticas
  const totalVisitantes = tours.reduce((sum, t) => sum + t.cantidad_visitante, 0);
  const totalIngresos = tours.reduce((sum, t) => 
    sum + (parseFloat(t.precio_servicio) * t.cantidad_visitante), 0
  );
  
  // Agrupar por tipo de visitante
  const porTipo = tours.reduce((acc, t) => {
    if (!acc[t.tipo_visitante]) {
      acc[t.tipo_visitante] = {
        cantidad: 0,
        visitantes: 0,
        ingresos: 0
      };
    }
    acc[t.tipo_visitante].cantidad += 1;
    acc[t.tipo_visitante].visitantes += t.cantidad_visitante;
    acc[t.tipo_visitante].ingresos += parseFloat(t.precio_servicio) * t.cantidad_visitante;
    return acc;
  }, {});
  
  // Agrupar por servicio
  const porServicio = tours.reduce((acc, t) => {
    if (!acc[t.nombre_servicio]) {
      acc[t.nombre_servicio] = {
        cantidad: 0,
        visitantes: 0,
        ingresos: 0
      };
    }
    acc[t.nombre_servicio].cantidad += 1;
    acc[t.nombre_servicio].visitantes += t.cantidad_visitante;
    acc[t.nombre_servicio].ingresos += parseFloat(t.precio_servicio) * t.cantidad_visitante;
    return acc;
  }, {});
  
  res.json({
    success: true,
    data: {
      resumen: {
        total_tours: tours.length,
        total_visitantes: totalVisitantes,
        total_ingresos: totalIngresos.toFixed(2),
        promedio_visitantes_por_tour: tours.length > 0 
          ? (totalVisitantes / tours.length).toFixed(1) 
          : 0
      },
      por_tipo_visitante: porTipo,
      por_servicio: porServicio
    }
  });
});