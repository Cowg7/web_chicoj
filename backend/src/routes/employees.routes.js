// Rutas de Empleados
import express from 'express';
import { 
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAvailableEmployees
} from '../modules/employees/employees.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de empleados
router.get('/available', getAvailableEmployees); // Debe estar antes de /:id
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.patch('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;

