// src/modules/auth/auth.controller.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database.js';
import { config } from '../../config/index.js';
import { AppError, asyncHandler } from '../../middlewares/errorHandler.js';

// POST /auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  
  // Aceptar tanto email como username
  const loginIdentifier = username || email;
  
  // Validación básica
  if (!loginIdentifier || !password) {
    throw new AppError('Usuario/Email y contraseña son requeridos', 400);
  }
  
  // Buscar usuario con sus relaciones
  const user = await prisma.usuarios.findUnique({
    where: { usuario_nombre: loginIdentifier }, // Puede ser usuario o email
    include: {
      empleado: true,
      rol: true
    }
  });
  
  // Si no encontró por usuario, buscar por email del empleado
  let usuario = user;
  if (!usuario) {
    const empleado = await prisma.empleados.findUnique({
      where: { correo_electronico: loginIdentifier.toLowerCase() }
    });
    
    if (empleado) {
      usuario = await prisma.usuarios.findUnique({
        where: { id_empleado: empleado.id_empleado },
        include: {
          empleado: true,
          rol: true
        }
      });
    }
  }
  
  if (!usuario) {
    console.log('❌ Usuario no encontrado:', loginIdentifier);
    throw new AppError('Credenciales inválidas', 401);
  }
  
  console.log('✅ Usuario encontrado:', usuario.usuario_nombre);
  
  // Verificar contraseña
  const isValidPassword = await bcrypt.compare(password, usuario.contrasena_hash);
  console.log('🔐 Verificación de contraseña:', isValidPassword ? '✅ Correcta' : '❌ Incorrecta');
  
  if (!isValidPassword) {
    throw new AppError('Credenciales inválidas', 401);
  }
  
  // Generar JWT
  const token = jwt.sign(
    { 
      userId: usuario.id_usuario,
      username: usuario.usuario_nombre,
      role: usuario.rol.nombre_rol,
      empleadoId: usuario.empleado.id_empleado
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
  
  // Preparar respuesta sin contraseña
  const { contrasena_hash, ...userWithoutPassword } = usuario;
  
  res.json({
    success: true,
    data: {
      user: {
        id: userWithoutPassword.id_usuario,
        username: userWithoutPassword.usuario_nombre,
        nombre: userWithoutPassword.empleado.nombre,
        apellidos: userWithoutPassword.empleado.apellidos,
        email: userWithoutPassword.empleado.correo_electronico,
        rol: userWithoutPassword.rol.nombre_rol
      },
      token,
      expiresIn: config.jwt.expiresIn
    }
  });
});

// POST /auth/register (solo para admins)
export const register = asyncHandler(async (req, res) => {
  const { 
    nombre, 
    apellidos, 
    edad, 
    genero, 
    correo_electronico,
    usuario_nombre,
    contrasena,
    id_rol 
  } = req.body;
  
  // Validación
  if (!nombre || !apellidos || !correo_electronico || !usuario_nombre || !contrasena) {
    throw new AppError('Todos los campos son requeridos', 400);
  }
  
  // Verificar si ya existe
  const existingEmail = await prisma.empleados.findUnique({
    where: { correo_electronico }
  });
  
  if (existingEmail) {
    throw new AppError('El correo ya está registrado', 409);
  }
  
  const existingUser = await prisma.usuarios.findUnique({
    where: { usuario_nombre }
  });
  
  if (existingUser) {
    throw new AppError('El nombre de usuario ya existe', 409);
  }
  
  // Hash de contraseña
  const hashedPassword = await bcrypt.hash(contrasena, config.bcrypt.rounds);
  
  // Crear empleado y usuario en transacción
  const result = await prisma.$transaction(async (tx) => {
    const empleado = await tx.empleados.create({
      data: {
        nombre,
        apellidos,
        edad,
        genero,
        correo_electronico
      }
    });
    
    const usuario = await tx.usuarios.create({
      data: {
        usuario_nombre,
        contrasena_hash: hashedPassword,
        id_empleado: empleado.id_empleado,
        id_rol: id_rol || 4 // Por defecto Mesero
      },
      include: {
        empleado: true,
        rol: true
      }
    });
    
    return usuario;
  });
  
  const { contrasena_hash, ...userWithoutPassword } = result;
  
  res.status(201).json({
    success: true,
    message: 'Usuario creado exitosamente',
    data: {
      user: userWithoutPassword
    }
  });
});

// GET /auth/me (obtener usuario actual)
export const getMe = asyncHandler(async (req, res) => {
  const usuario = await prisma.usuarios.findUnique({
    where: { id_usuario: req.user.userId },
    include: {
      empleado: true,
      rol: true
    }
  });
  
  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }
  
  const { contrasena_hash, ...userWithoutPassword } = usuario;
  
  res.json({
    success: true,
    data: { user: userWithoutPassword }
  });
});