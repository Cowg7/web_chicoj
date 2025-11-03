// src/modules/auth/auth.controller.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database.js';
import { config } from '../../config/index.js';
import { AppError, asyncHandler } from '../../middlewares/errorHandler.js';
import { emailService } from '../../services/email.service.js';

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

// ============ RECUPERACIÓN DE CONTRASEÑA ============
// Almacenamiento temporal de códigos (en memoria)
// En producción, considera usar Redis
const codigosRecuperacion = new Map();

// Limpiar códigos expirados cada 5 minutos
setInterval(() => {
  const ahora = Date.now();
  for (const [key, value] of codigosRecuperacion.entries()) {
    if (ahora > value.expira) {
      codigosRecuperacion.delete(key);
      console.log('🗑️ Código expirado eliminado:', key);
    }
  }
}, 5 * 60 * 1000);

// POST /auth/solicitar-recuperacion
export const solicitarRecuperacion = asyncHandler(async (req, res) => {
  const { usuario } = req.body;
  
  if (!usuario) {
    throw new AppError('El usuario es requerido', 400);
  }
  
  // Buscar usuario
  const usuarioEncontrado = await prisma.usuarios.findUnique({
    where: { usuario_nombre: usuario },
    include: {
      empleado: true
    }
  });
  
  if (!usuarioEncontrado) {
    throw new AppError('Usuario no encontrado', 404);
  }
  
  // Generar código de 6 dígitos
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Guardar código con expiración de 15 minutos
  const expira = Date.now() + (15 * 60 * 1000);
  codigosRecuperacion.set(usuario.toLowerCase(), {
    codigo,
    expira,
    intentos: 0
  });
  
  console.log(`🔐 Código de recuperación generado para ${usuario}: ${codigo}`);
  console.log(`⏰ Expira en: ${new Date(expira).toLocaleString()}`);
  
  // Intentar enviar email
  let emailEnviado = false;
  try {
    await emailService.enviarCodigoRecuperacion(
      usuarioEncontrado.empleado.correo_electronico,
      usuarioEncontrado.empleado.nombre,
      codigo
    );
    emailEnviado = true;
    console.log('📧 Código enviado por email a:', usuarioEncontrado.empleado.correo_electronico);
  } catch (error) {
    console.warn('⚠️ No se pudo enviar el email:', error.message);
    // En desarrollo, continuamos sin email. En producción, podrías lanzar un error.
  }
  
  // Respuesta según el entorno
  const response = {
    success: true,
    message: emailEnviado 
      ? 'Código enviado a tu correo electrónico' 
      : 'Código de recuperación generado',
    email: usuarioEncontrado.empleado.correo_electronico.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Ocultar email parcialmente
    expiresIn: '15 minutos'
  };
  
  // Solo en desarrollo, enviar el código en la respuesta
  if (config.env === 'development' && !emailEnviado) {
    response.codigo = codigo;
    response.dev_note = 'Email no configurado. Código mostrado solo en desarrollo.';
  }
  
  res.json(response);
});

// POST /auth/restablecer-password
export const restablecerPassword = asyncHandler(async (req, res) => {
  const { usuario, codigo, nuevaPassword } = req.body;
  
  // Validaciones
  if (!usuario || !codigo || !nuevaPassword) {
    throw new AppError('Todos los campos son requeridos', 400);
  }
  
  if (nuevaPassword.length < 6) {
    throw new AppError('La contraseña debe tener al menos 6 caracteres', 400);
  }
  
  // Verificar código
  const datosRecuperacion = codigosRecuperacion.get(usuario.toLowerCase());
  
  if (!datosRecuperacion) {
    throw new AppError('Código inválido o expirado', 400);
  }
  
  // Verificar expiración
  if (Date.now() > datosRecuperacion.expira) {
    codigosRecuperacion.delete(usuario.toLowerCase());
    throw new AppError('El código ha expirado', 400);
  }
  
  // Verificar intentos (máximo 3)
  if (datosRecuperacion.intentos >= 3) {
    codigosRecuperacion.delete(usuario.toLowerCase());
    throw new AppError('Demasiados intentos fallidos', 429);
  }
  
  // Verificar código
  if (datosRecuperacion.codigo !== codigo) {
    datosRecuperacion.intentos++;
    throw new AppError(`Código incorrecto (${datosRecuperacion.intentos}/3)`, 400);
  }
  
  // Buscar usuario
  const usuarioEncontrado = await prisma.usuarios.findUnique({
    where: { usuario_nombre: usuario }
  });
  
  if (!usuarioEncontrado) {
    throw new AppError('Usuario no encontrado', 404);
  }
  
  // Hash de nueva contraseña
  const hashedPassword = await bcrypt.hash(nuevaPassword, config.bcrypt.rounds);
  
  // Actualizar contraseña
  await prisma.usuarios.update({
    where: { id_usuario: usuarioEncontrado.id_usuario },
    data: { contrasena_hash: hashedPassword }
  });
  
  // Eliminar código usado
  codigosRecuperacion.delete(usuario.toLowerCase());
  
  console.log(`✅ Contraseña restablecida para: ${usuario}`);
  
  // Enviar email de confirmación
  try {
    await emailService.enviarConfirmacionCambio(
      usuarioEncontrado.empleado.correo_electronico,
      usuarioEncontrado.empleado.nombre
    );
    console.log('📧 Confirmación enviada por email');
  } catch (error) {
    console.warn('⚠️ No se pudo enviar email de confirmación:', error.message);
    // No lanzamos error porque el cambio ya se realizó
  }
  
  res.json({
    success: true,
    message: 'Contraseña restablecida exitosamente'
  });
});