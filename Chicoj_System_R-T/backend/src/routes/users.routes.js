// Rutas de Gestión de Usuarios (Admin)
import express from 'express';
import { 
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  createRole,
  updateRole,
  deleteRole
} from '../modules/users/users.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de roles
router.get('/roles', getRoles);
router.post('/roles', createRole);
router.patch('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);

// Rutas de usuarios
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

