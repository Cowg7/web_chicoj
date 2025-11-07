// Controlador de Empleados
import prisma from '../../config/database.js';
import { AppError, asyncHandler } from '../../middlewares/errorHandler.js';

// GET /employees - Listar todos los empleados
export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await prisma.empleados.findMany({
    include: {
      usuarios: true // Relación uno a uno, devuelve un objeto o null
    },
    orderBy: {
      id_empleado: 'asc'
    }
  });

  console.log(`📋 ${employees.length} empleados encontrados`);

  res.json({
    success: true,
    data: { employees, total: employees.length }
  });
});

// GET /employees/:id - Obtener un empleado por ID
export const getEmployeeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employee = await prisma.empleados.findUnique({
    where: { id_empleado: parseInt(id) },
    include: {
      usuarios: true // Relación uno a uno
    }
  });

  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }

  res.json({
    success: true,
    data: { employee }
  });
});

// POST /employees - Crear un nuevo empleado
export const createEmployee = asyncHandler(async (req, res) => {
  const { nombre, apellidos, edad, genero, correo_electronico } = req.body;

  // Validar campos requeridos
  if (!nombre || !apellidos || !correo_electronico) {
    throw new AppError('Nombre, apellidos y correo son requeridos', 400);
  }

  // Verificar si el correo ya existe
  const existingEmployee = await prisma.empleados.findUnique({
    where: { correo_electronico }
  });

  if (existingEmployee) {
    throw new AppError('Ya existe un empleado con ese correo electrónico', 400);
  }

  // Crear el empleado
  const newEmployee = await prisma.empleados.create({
    data: {
      nombre,
      apellidos,
      edad: edad ? parseInt(edad) : null,
      genero: genero || null,
      correo_electronico
    }
  });

  console.log(`✅ Empleado creado: ${newEmployee.nombre} ${newEmployee.apellidos} (ID: ${newEmployee.id_empleado})`);

  res.status(201).json({
    success: true,
    message: 'Empleado creado exitosamente',
    data: { employee: newEmployee }
  });
});

// PATCH /employees/:id - Actualizar un empleado
export const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, apellidos, edad, genero, correo_electronico } = req.body;

  // Verificar que el empleado existe
  const existingEmployee = await prisma.empleados.findUnique({
    where: { id_empleado: parseInt(id) }
  });

  if (!existingEmployee) {
    throw new AppError('Empleado no encontrado', 404);
  }

  // Si se está cambiando el correo, verificar que no exista
  if (correo_electronico && correo_electronico !== existingEmployee.correo_electronico) {
    const emailExists = await prisma.empleados.findUnique({
      where: { correo_electronico }
    });

    if (emailExists) {
      throw new AppError('Ya existe un empleado con ese correo electrónico', 400);
    }
  }

  // Actualizar el empleado
  const updatedEmployee = await prisma.empleados.update({
    where: { id_empleado: parseInt(id) },
    data: {
      ...(nombre && { nombre }),
      ...(apellidos && { apellidos }),
      ...(edad !== undefined && { edad: edad ? parseInt(edad) : null }),
      ...(genero !== undefined && { genero }),
      ...(correo_electronico && { correo_electronico })
    }
  });

  console.log(`✅ Empleado actualizado: ${updatedEmployee.nombre} ${updatedEmployee.apellidos}`);

  res.json({
    success: true,
    message: 'Empleado actualizado exitosamente',
    data: { employee: updatedEmployee }
  });
});

// DELETE /employees/:id - Eliminar un empleado
export const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar que el empleado existe
  const existingEmployee = await prisma.empleados.findUnique({
    where: { id_empleado: parseInt(id) },
    include: {
      usuarios: true
    }
  });

  if (!existingEmployee) {
    throw new AppError('Empleado no encontrado', 404);
  }

  // Verificar si el empleado tiene un usuario asignado (relación uno a uno)
  if (existingEmployee.usuarios) {
    throw new AppError('No se puede eliminar un empleado que tiene un usuario asignado. Elimina primero el usuario.', 400);
  }

  // Eliminar el empleado
  await prisma.empleados.delete({
    where: { id_empleado: parseInt(id) }
  });

  console.log(`🗑️ Empleado eliminado: ${existingEmployee.nombre} ${existingEmployee.apellidos}`);

  res.json({
    success: true,
    message: 'Empleado eliminado exitosamente'
  });
});

// GET /employees/available - Listar empleados sin usuario asignado
export const getAvailableEmployees = asyncHandler(async (req, res) => {
  const employees = await prisma.empleados.findMany({
    where: {
      usuarios: null // En relación uno a uno, verificar si es null
    },
    orderBy: {
      apellidos: 'asc'
    }
  });

  console.log(`📋 ${employees.length} empleados disponibles (sin usuario asignado)`);

  res.json({
    success: true,
    data: { employees, total: employees.length }
  });
});

