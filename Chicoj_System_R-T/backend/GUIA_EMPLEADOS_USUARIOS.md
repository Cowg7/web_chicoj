# 📋 Guía de Gestión de Empleados y Usuarios - Sistema Chicoj

## ✅ **MÓDULOS IMPLEMENTADOS**

Se han creado dos módulos completos:
1. **Gestión de Empleados** - CRUD completo de empleados
2. **Gestión de Usuarios** - Asignación de usuarios y roles a empleados

---

## 🎯 **FUNCIONALIDADES**

### **1. Gestión de Empleados**

#### **📋 Lista de Empleados** (`empleados_control.html`)
- ✅ Muestra todos los empleados registrados
- ✅ Información mostrada:
  - ID
  - Nombre
  - Apellidos
  - Edad
  - Correo electrónico
- ✅ Acciones disponibles:
  - **Editar** - Modifica los datos del empleado
  - **Eliminar** - Borra el empleado (solo si NO tiene usuario asignado)
- ✅ Botón "+ Agregar empleado" para crear nuevos empleados

#### **➕ Agregar/Editar Empleado** (`agregar_empleados.html`)
- ✅ Formulario con campos:
  - Nombre (requerido)
  - Apellidos (requerido)
  - Edad (opcional)
  - Correo electrónico (requerido, debe ser válido y único)
- ✅ Validaciones:
  - Campos requeridos
  - Formato de correo válido
  - Correo único (no puede repetirse)
- ✅ Modo edición: Carga datos del empleado y permite actualizar
- ✅ Redirige automáticamente a la lista después de guardar

---

### **2. Gestión de Usuarios**

#### **👥 Lista de Usuarios** (`control-usuarios.html`)
- ✅ Muestra todos los usuarios del sistema
- ✅ Información mostrada:
  - ID
  - Empleado asociado
  - Nombre de usuario (@usuario)
  - Rol (con badge de color)
- ✅ Acciones disponibles:
  - **Editar** - Modifica usuario y rol
  - **Eliminar** - Borra el usuario (el empleado NO se elimina)
- ✅ Botones:
  - "+ Agregar usuario" - Crea nuevo usuario
  - "+ Agregar rol" - (Funcionalidad futura)

#### **🔐 Agregar/Editar Usuario** (`agregar_usuarios.html`)
- ✅ Formulario con campos:
  - **Empleado** (select) - Lista de empleados SIN usuario asignado
  - **Rol** (select) - Lista de roles disponibles
  - **Usuario** (texto) - Nombre de usuario único
  - **Contraseña** (password) - Mínimo 8 caracteres
  - **Confirmar contraseña** (password) - Debe coincidir
- ✅ Validaciones:
  - Todos los campos requeridos
  - Contraseñas deben coincidir
  - Contraseña mínimo 8 caracteres
  - Nombre de usuario único
  - Un empleado solo puede tener UN usuario
- ✅ Modo edición:
  - Carga datos del usuario
  - Empleado no se puede cambiar (disabled)
  - Contraseña opcional (dejar en blanco para mantener la actual)
- ✅ Redirige automáticamente a la lista después de guardar

---

## 🔌 **ENDPOINTS DE LA API**

### **Empleados** (`/api/employees`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/employees` | Listar todos los empleados |
| GET | `/api/employees/available` | Listar empleados sin usuario asignado |
| GET | `/api/employees/:id` | Obtener un empleado por ID |
| POST | `/api/employees` | Crear un nuevo empleado |
| PATCH | `/api/employees/:id` | Actualizar un empleado |
| DELETE | `/api/employees/:id` | Eliminar un empleado |

### **Usuarios** (`/api/users`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Listar todos los usuarios |
| GET | `/api/users/roles` | Listar todos los roles disponibles |
| GET | `/api/users/:id` | Obtener un usuario por ID |
| POST | `/api/users` | Crear un nuevo usuario |
| PATCH | `/api/users/:id` | Actualizar un usuario |
| DELETE | `/api/users/:id` | Eliminar un usuario |

---

## 📁 **ARCHIVOS CREADOS**

### **Backend:**
```
backend/src/
├── modules/
│   ├── employees/
│   │   └── employees.controller.js  ✅ Controlador de empleados
│   └── users/
│       └── users.controller.js      ✅ Controlador de usuarios (admin)
└── routes/
    ├── employees.routes.js          ✅ Rutas de empleados
    ├── users.routes.js              ✅ Rutas de usuarios
    └── index.js                     ✅ Actualizado (rutas agregadas)
```

### **Frontend:**
```
fronted/
├── scripts/
│   ├── config.js                    ✅ Actualizado (endpoints agregados)
│   ├── api.js                       ✅ Actualizado (métodos agregados)
│   ├── empleados-control.js         ✅ Script para lista de empleados
│   ├── agregar-empleados.js         ✅ Script para agregar/editar empleado
│   ├── control-usuarios.js          ✅ Script para lista de usuarios
│   └── agregar-usuarios.js          ✅ Script para agregar/editar usuario
└── templates/administracion/
    ├── empleados_control.html       ✅ Actualizado (scripts agregados)
    ├── agregar_empleados.html       ✅ Actualizado (scripts agregados)
    ├── control-usuarios.html        ✅ Actualizado (scripts agregados)
    └── agregar_usuarios.html        ✅ Actualizado (scripts agregados)
```

---

## 🧪 **CÓMO PROBAR**

### **1. Probar Gestión de Empleados:**

```
1. Login como: admin / admin123
2. Ir a: http://localhost:8080/templates/administracion/empleados_control.html
3. ✅ Ver lista de empleados existentes (del seed)
4. Click "+ Agregar empleado"
5. Llenar formulario:
   - Nombre: "Carlos"
   - Apellidos: "López García"
   - Edad: 28
   - Correo: "carlos.lopez@chicoj.com"
6. Click "Ingresar"
7. ✅ Debe redirigir a la lista con el nuevo empleado
8. Click "Editar" en cualquier empleado
9. Modificar datos y click "Actualizar"
10. ✅ Debe actualizar y redirigir a la lista
```

### **2. Probar Gestión de Usuarios:**

```
1. Login como: admin / admin123
2. Ir a: http://localhost:8080/templates/administracion/control-usuarios.html
3. ✅ Ver lista de usuarios existentes
4. Click "+ Agregar usuario"
5. Llenar formulario:
   - Empleado: Seleccionar "Carlos López García" (del paso anterior)
   - Rol: Seleccionar "Mesero"
   - Usuario: "carlos123"
   - Contraseña: "carlos123456"
   - Confirmar contraseña: "carlos123456"
6. Click "Ingresar"
7. ✅ Debe crear usuario y redirigir a la lista
8. ✅ El empleado "Carlos López García" ya NO aparecerá en el select al crear otro usuario
9. Hacer logout
10. Login como: carlos123 / carlos123456
11. ✅ Debe redirigir según el rol asignado (Mesero → Comandas)
```

### **3. Probar Validaciones:**

```
❌ Intentar crear empleado con correo duplicado
✅ Debe mostrar: "Ya existe un empleado con ese correo electrónico"

❌ Intentar crear usuario con contraseñas diferentes
✅ Debe mostrar: "Las contraseñas no coinciden"

❌ Intentar crear usuario con contraseña corta
✅ Debe mostrar: "La contraseña debe tener al menos 8 caracteres"

❌ Intentar asignar usuario a empleado que ya tiene usuario
✅ Debe mostrar: "Este empleado ya tiene un usuario asignado"

❌ Intentar eliminar empleado que tiene usuario asignado
✅ Debe mostrar: "No se puede eliminar un empleado que tiene un usuario asignado"
```

---

## 🎨 **BADGES DE ROLES** (en control-usuarios.html)

Los roles se muestran con badges de colores:

- **Administrador** → Rojo (`badge-admin`)
- **Gerente** → Azul oscuro (`badge-gerente`)
- **Mesero** → Verde (`badge-mesero`)
- **Cajero/Caja** → Naranja (`badge-caja`)
- **Cocina** → Morado (`badge-cocina`)
- **Bebidas** → Cyan (`badge-bebidas`)
- **Coffee** → Marrón (`badge-coffee`)

---

## 🔒 **REGLAS DE NEGOCIO**

### **Empleados:**
- ✅ El correo electrónico debe ser único
- ✅ Solo se puede eliminar un empleado si NO tiene usuario asignado
- ✅ Nombre, apellidos y correo son obligatorios
- ✅ Edad es opcional

### **Usuarios:**
- ✅ Un empleado solo puede tener UN usuario
- ✅ El nombre de usuario debe ser único
- ✅ La contraseña debe tener mínimo 8 caracteres
- ✅ Al eliminar un usuario, el empleado NO se elimina (solo se desvincula)
- ✅ En modo edición, NO se puede cambiar el empleado asociado
- ✅ En modo edición, la contraseña es opcional (dejar en blanco para mantener)

---

## 🚀 **FLUJO COMPLETO RECOMENDADO**

```
1️⃣  Crear Empleado
    └─ Ir a "Lista de empleados"
    └─ Click "+ Agregar empleado"
    └─ Llenar datos (nombre, apellidos, correo)
    └─ Click "Ingresar"
    └─ ✅ Empleado creado

2️⃣  Asignar Usuario y Rol
    └─ Ir a "Lista de usuarios"
    └─ Click "+ Agregar usuario"
    └─ Seleccionar empleado (solo aparecen los que NO tienen usuario)
    └─ Seleccionar rol (Admin, Mesero, Cajero, etc.)
    └─ Ingresar nombre de usuario y contraseña
    └─ Click "Ingresar"
    └─ ✅ Usuario creado y asignado

3️⃣  Probar Login
    └─ Hacer logout
    └─ Login con el nuevo usuario
    └─ ✅ Debe funcionar y redirigir según el rol
```

---

## 💡 **TIPS**

- **Para ver empleados disponibles:** Solo aparecen en el select de usuarios aquellos empleados que NO tienen usuario asignado
- **Para editar usuario:** No se puede cambiar el empleado, solo el rol y contraseña
- **Para eliminar empleado:** Primero debes eliminar su usuario (si tiene uno)
- **Contraseñas seguras:** Se hashean con bcrypt en el backend (10 rounds)
- **Validación de correo:** Se verifica que tenga formato válido (@dominio.com)

---

## ✅ **CHECKLIST DE FUNCIONALIDADES**

- [x] CRUD completo de empleados
- [x] CRUD completo de usuarios
- [x] Validación de correo único
- [x] Validación de usuario único
- [x] Validación de contraseñas
- [x] Hasheo de contraseñas con bcrypt
- [x] Select dinámico de empleados disponibles
- [x] Select dinámico de roles
- [x] Modo edición para empleados
- [x] Modo edición para usuarios
- [x] Prevención de eliminación si tiene relaciones
- [x] Redirección automática después de guardar
- [x] Badges de colores para roles
- [x] Mensajes de éxito y error
- [x] Autenticación requerida en todas las vistas

---

**¡El sistema de gestión de empleados y usuarios está 100% funcional! 🎉**

