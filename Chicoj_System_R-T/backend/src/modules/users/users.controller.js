// Controlador de Gestión de Usuarios (Admin)
import prisma from '../../config/database.js';
import bcrypt from 'bcrypt';
import { AppError, asyncHandler } from '../../middlewares/errorHandler.js';

// GET /users - Listar todos los usuarios
export const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.usuarios.findMany({
    include: {
      empleado: true,
      rol: true
    },
    orderBy: {
      id_usuario: 'asc'
    }
  });

  console.log(`👥 ${users.length} usuarios encontrados`);

  res.json({
    success: true,
    data: { users, total: users.length }
  });
});

// GET /users/:id - Obtener un usuario por ID
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.usuarios.findUnique({
    where: { id_usuario: parseInt(id) },
    include: {
      empleado: true,
      rol: true
    }
  });

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  // No enviar el hash de la contraseña
  const { contrasena_hash, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: { user: userWithoutPassword }
  });
});

// POST /users - Crear un nuevo usuario
export const createUser = asyncHandler(async (req, res) => {
  const { id_empleado, usuario_nombre, contrasena, id_rol } = req.body;

  // Validar campos requeridos
  if (!id_empleado || !usuario_nombre || !contrasena || !id_rol) {
    throw new AppError('Empleado, nombre de usuario, contraseña y rol son requeridos', 400);
  }

  // Verificar que el empleado existe
  const employee = await prisma.empleados.findUnique({
    where: { id_empleado: parseInt(id_empleado) }
  });

  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }

  // Verificar que el empleado no tenga ya un usuario
  const existingUser = await prisma.usuarios.findFirst({
    where: { id_empleado: parseInt(id_empleado) }
  });

  if (existingUser) {
    throw new AppError('Este empleado ya tiene un usuario asignado', 400);
  }

  // Verificar que el nombre de usuario no exista
  const usernameExists = await prisma.usuarios.findFirst({
    where: {
      OR: [
        { usuario_nombre },
        { empleado: { correo_electronico: usuario_nombre } }
      ]
    }
  });

  if (usernameExists) {
    throw new AppError('El nombre de usuario ya existe', 400);
  }

  // Verificar que el rol existe
  const role = await prisma.roles.findUnique({
    where: { id_rol: parseInt(id_rol) }
  });

  if (!role) {
    throw new AppError('Rol no encontrado', 404);
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(contrasena, 10);

  // Crear el usuario
  const newUser = await prisma.usuarios.create({
    data: {
      id_empleado: parseInt(id_empleado),
      usuario_nombre,
      contrasena_hash: hashedPassword,
      id_rol: parseInt(id_rol)
    },
    include: {
      empleado: true,
      rol: true
    }
  });

  console.log(`✅ Usuario creado: ${newUser.usuario_nombre} para ${employee.nombre} ${employee.apellidos}`);

  // No enviar el hash de la contraseña
  const { contrasena_hash, ...userWithoutPassword } = newUser;

  res.status(201).json({
    success: true,
    message: 'Usuario creado exitosamente',
    data: { user: userWithoutPassword }
  });
});

// PATCH /users/:id - Actualizar un usuario
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { usuario_nombre, contrasena, id_rol } = req.body;

  // Verificar que el usuario existe
  const existingUser = await prisma.usuarios.findUnique({
    where: { id_usuario: parseInt(id) }
  });

  if (!existingUser) {
    throw new AppError('Usuario no encontrado', 404);
  }

  // Si se está cambiando el nombre de usuario, verificar que no exista
  if (usuario_nombre && usuario_nombre !== existingUser.usuario_nombre) {
    const usernameExists = await prisma.usuarios.findFirst({
      where: {
        usuario_nombre,
        id_usuario: { not: parseInt(id) }
      }
    });

    if (usernameExists) {
      throw new AppError('El nombre de usuario ya existe', 400);
    }
  }

  // Preparar datos de actualización
  const updateData = {};
  if (usuario_nombre) updateData.usuario_nombre = usuario_nombre;
  if (id_rol) updateData.id_rol = parseInt(id_rol);
  if (contrasena) {
    updateData.contrasena_hash = await bcrypt.hash(contrasena, 10);
  }

  // Actualizar el usuario
  const updatedUser = await prisma.usuarios.update({
    where: { id_usuario: parseInt(id) },
    data: updateData,
    include: {
      empleado: true,
      rol: true
    }
  });

  console.log(`✅ Usuario actualizado: ${updatedUser.usuario_nombre}`);

  // No enviar el hash de la contraseña
  const { contrasena_hash, ...userWithoutPassword } = updatedUser;

  res.json({
    success: true,
    message: 'Usuario actualizado exitosamente',
    data: { user: userWithoutPassword }
  });
});

// DELETE /users/:id - Eliminar un usuario
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar que el usuario existe
  const existingUser = await prisma.usuarios.findUnique({
    where: { id_usuario: parseInt(id) },
    include: {
      empleado: true
    }
  });

  if (!existingUser) {
    throw new AppError('Usuario no encontrado', 404);
  }

  // Eliminar el usuario
  await prisma.usuarios.delete({
    where: { id_usuario: parseInt(id) }
  });

  console.log(`🗑️ Usuario eliminado: ${existingUser.usuario_nombre}`);

  res.json({
    success: true,
    message: 'Usuario eliminado exitosamente'
  });
});

// GET /users/roles - Listar todos los roles disponibles
export const getRoles = asyncHandler(async (req, res) => {
  const roles = await prisma.roles.findMany({
    orderBy: {
      nombre_rol: 'asc'
    }
  });

  res.json({
    success: true,
    data: { roles, total: roles.length }
  });
});

// POST /users/roles - Crear un nuevo rol
export const createRole = asyncHandler(async (req, res) => {
  const { nombre_rol, descripcion } = req.body;

  // Validar campos requeridos
  if (!nombre_rol) {
    throw new AppError('El nombre del rol es requerido', 400);
  }

  // Verificar que el rol no exista
  const existingRole = await prisma.roles.findUnique({
    where: { nombre_rol }
  });

  if (existingRole) {
    throw new AppError('Ya existe un rol con ese nombre', 400);
  }

  // Crear el rol
  const newRole = await prisma.roles.create({
    data: {
      nombre_rol,
      descripcion: descripcion || null
    }
  });

  console.log(`✅ Rol creado: ${newRole.nombre_rol} (ID: ${newRole.id_rol})`);

  res.status(201).json({
    success: true,
    message: 'Rol creado exitosamente',
    data: { role: newRole }
  });
});

// PATCH /users/roles/:id - Actualizar un rol
export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre_rol, descripcion } = req.body;

  // Verificar que el rol existe
  const existingRole = await prisma.roles.findUnique({
    where: { id_rol: parseInt(id) }
  });

  if (!existingRole) {
    throw new AppError('Rol no encontrado', 404);
  }

  // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
  if (nombre_rol && nombre_rol !== existingRole.nombre_rol) {
    const duplicateRole = await prisma.roles.findUnique({
      where: { nombre_rol }
    });

    if (duplicateRole) {
      throw new AppError('Ya existe un rol con ese nombre', 400);
    }
  }

  // Actualizar el rol
  const updatedRole = await prisma.roles.update({
    where: { id_rol: parseInt(id) },
    data: {
      ...(nombre_rol && { nombre_rol }),
      ...(descripcion !== undefined && { descripcion })
    }
  });

  console.log(`✅ Rol actualizado: ${updatedRole.nombre_rol} (ID: ${updatedRole.id_rol})`);

  res.json({
    success: true,
    message: 'Rol actualizado exitosamente',
    data: { role: updatedRole }
  });
});

// DELETE /users/roles/:id - Eliminar un rol
export const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar que el rol existe
  const existingRole = await prisma.roles.findUnique({
    where: { id_rol: parseInt(id) }
  });

  if (!existingRole) {
    throw new AppError('Rol no encontrado', 404);
  }

  // Verificar que no haya usuarios con este rol
  const usersWithRole = await prisma.usuarios.count({
    where: { id_rol: parseInt(id) }
  });

  if (usersWithRole > 0) {
    throw new AppError(`No se puede eliminar. Hay ${usersWithRole} usuario(s) con este rol`, 400);
  }

  // Eliminar el rol
  await prisma.roles.delete({
    where: { id_rol: parseInt(id) }
  });

  console.log(`🗑️ Rol eliminado: ${existingRole.nombre_rol} (ID: ${existingRole.id_rol})`);

  res.json({
    success: true,
    message: 'Rol eliminado exitosamente'
  });
});

