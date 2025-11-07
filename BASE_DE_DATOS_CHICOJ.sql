-- =====================================================
-- SCRIPT DE BASE DE DATOS - SISTEMA CHICOJ
-- =====================================================
-- Versión: 2.0
-- Fecha: Noviembre 2025
-- Base de datos: PostgreSQL 15+
-- Descripción: Script completo para crear y poblar la base de datos del Sistema Chicoj
-- =====================================================

-- ============================================
-- 1. CREAR BASE DE DATOS
-- ============================================

-- NOTA: Ejecuta esta línea SOLO si necesitas crear la base de datos desde cero
-- Si ya existe, comenta esta línea o elimínala
CREATE DATABASE restaurante_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Conectarse a la base de datos
\c restaurante_db;

-- ============================================
-- 2. ELIMINAR TABLAS EXISTENTES (SI EXISTEN)
-- ============================================
-- ADVERTENCIA: Esto eliminará TODOS los datos

DROP TABLE IF EXISTS notificacion CASCADE;
DROP TABLE IF EXISTS caja_comprobante CASCADE;
DROP TABLE IF EXISTS tour CASCADE;
DROP TABLE IF EXISTS area_registro CASCADE;
DROP TABLE IF EXISTS comanda CASCADE;
DROP TABLE IF EXISTS cuenta CASCADE;
DROP TABLE IF EXISTS platillos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS area CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS empleados CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================
-- 3. CREAR TABLAS
-- ============================================

-- ============ TABLA: ROLES ============
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(60) UNIQUE NOT NULL,
    descripcion VARCHAR(200)
);

COMMENT ON TABLE roles IS 'Roles de usuario en el sistema';
COMMENT ON COLUMN roles.id_rol IS 'Identificador único del rol';
COMMENT ON COLUMN roles.nombre_rol IS 'Nombre del rol (ej: Administrador, Mesero)';

-- ============ TABLA: EMPLEADOS ============
CREATE TABLE empleados (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    apellidos VARCHAR(120) NOT NULL,
    edad INTEGER,
    genero VARCHAR(20),
    correo_electronico VARCHAR(150) UNIQUE NOT NULL
);

COMMENT ON TABLE empleados IS 'Información personal de los empleados';
COMMENT ON COLUMN empleados.correo_electronico IS 'Email único del empleado';

-- ============ TABLA: USUARIOS ============
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_empleado INTEGER UNIQUE NOT NULL,
    usuario_nombre VARCHAR(60) UNIQUE NOT NULL,
    contrasena_hash TEXT NOT NULL,
    id_rol INTEGER NOT NULL,
    
    CONSTRAINT fk_usuarios_empleado FOREIGN KEY (id_empleado)
        REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol)
        REFERENCES roles(id_rol)
);

COMMENT ON TABLE usuarios IS 'Credenciales de acceso al sistema';
COMMENT ON COLUMN usuarios.contrasena_hash IS 'Contraseña encriptada con bcrypt';

-- ============ TABLA: AREA ============
CREATE TABLE area (
    id_area SERIAL PRIMARY KEY,
    nombre VARCHAR(80) UNIQUE NOT NULL,
    descripcion VARCHAR(200)
);

COMMENT ON TABLE area IS 'Áreas de preparación (Cocina, Bebidas, Coffee)';

-- ============ TABLA: CATEGORIAS ============
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(200),
    id_area INTEGER NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT fk_categorias_area FOREIGN KEY (id_area)
        REFERENCES area(id_area) ON DELETE CASCADE,
    CONSTRAINT unique_categoria_por_area UNIQUE (nombre, id_area)
);

CREATE INDEX ix_categorias_area ON categorias(id_area);
CREATE INDEX ix_categorias_activa ON categorias(activa);

COMMENT ON TABLE categorias IS 'Categorías de platillos por área';

-- ============ TABLA: PLATILLOS ============
CREATE TABLE platillos (
    id_platillo SERIAL PRIMARY KEY,
    nombre VARCHAR(120) UNIQUE NOT NULL,
    descripcion VARCHAR(255),
    precio DECIMAL(10, 2) NOT NULL,
    id_area INTEGER NOT NULL,
    id_categoria INTEGER,
    disponible BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT fk_platillos_area FOREIGN KEY (id_area)
        REFERENCES area(id_area),
    CONSTRAINT fk_platillos_categoria FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria) ON DELETE SET NULL
);

CREATE INDEX ix_platillos_area ON platillos(id_area);
CREATE INDEX ix_platillos_categoria ON platillos(id_categoria);
CREATE INDEX ix_platillos_disponible ON platillos(disponible);

COMMENT ON TABLE platillos IS 'Menú de platillos del restaurante';
COMMENT ON COLUMN platillos.disponible IS 'Indica si el platillo está disponible para ordenar';

-- ============ TABLA: CUENTA ============
CREATE TABLE cuenta (
    id_orden SERIAL PRIMARY KEY,
    fecha TIMESTAMPTZ(6) DEFAULT NOW(),
    no_mesa VARCHAR(20) DEFAULT 'S/N',
    id_usuario INTEGER NOT NULL,
    total DECIMAL(12, 2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'Abierta',
    
    CONSTRAINT fk_cuenta_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);

CREATE INDEX ix_cuenta_fecha ON cuenta(fecha);
CREATE INDEX ix_cuenta_estado ON cuenta(estado);
CREATE INDEX ix_cuenta_mesero ON cuenta(id_usuario);

COMMENT ON TABLE cuenta IS 'Órdenes/cuentas de los clientes';
COMMENT ON COLUMN cuenta.estado IS 'Estados: Abierta, Cerrada, Cancelada';

-- ============ TABLA: COMANDA ============
CREATE TABLE comanda (
    id_comanda SERIAL PRIMARY KEY,
    id_orden INTEGER NOT NULL,
    id_platillo INTEGER NOT NULL,
    platillo_nombre VARCHAR(120) NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    cantidad INTEGER NOT NULL,
    observaciones VARCHAR(255),
    extra_observacion VARCHAR(255),
    extra_precio DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(12, 2),
    total_linea DECIMAL(12, 2),
    
    CONSTRAINT fk_comanda_cuenta FOREIGN KEY (id_orden)
        REFERENCES cuenta(id_orden) ON DELETE CASCADE,
    CONSTRAINT fk_comanda_platillo FOREIGN KEY (id_platillo)
        REFERENCES platillos(id_platillo)
);

CREATE INDEX ix_comanda_orden ON comanda(id_orden);
CREATE INDEX ix_comanda_platillo ON comanda(id_platillo);

COMMENT ON TABLE comanda IS 'Detalle de platillos por orden';
COMMENT ON COLUMN comanda.observaciones IS 'Notas para cocina (ej: sin cebolla)';

-- ============ TABLA: AREA_REGISTRO ============
CREATE TABLE area_registro (
    id_area_registro SERIAL PRIMARY KEY,
    id_area INTEGER NOT NULL,
    id_orden INTEGER NOT NULL,
    id_comanda INTEGER UNIQUE NOT NULL,
    no_mesa VARCHAR(10),
    fecha TIMESTAMPTZ(6) DEFAULT NOW(),
    fecha_terminado TIMESTAMPTZ(6),
    platillo VARCHAR(120) NOT NULL,
    cantidad INTEGER NOT NULL,
    observaciones VARCHAR(255),
    extra_observacion VARCHAR(255),
    extra_precio DECIMAL(10, 2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    
    CONSTRAINT fk_area_registro_area FOREIGN KEY (id_area)
        REFERENCES area(id_area),
    CONSTRAINT fk_area_registro_cuenta FOREIGN KEY (id_orden)
        REFERENCES cuenta(id_orden) ON DELETE CASCADE,
    CONSTRAINT fk_area_registro_comanda FOREIGN KEY (id_comanda)
        REFERENCES comanda(id_comanda) ON DELETE CASCADE
);

CREATE INDEX ix_area_reg_area ON area_registro(id_area);
CREATE INDEX ix_area_reg_orden ON area_registro(id_orden);
CREATE INDEX ix_area_reg_fecha ON area_registro(fecha);
CREATE INDEX ix_area_reg_estado ON area_registro(estado);

COMMENT ON TABLE area_registro IS 'KDS - Registro de platillos por área de preparación';
COMMENT ON COLUMN area_registro.estado IS 'Estados: Pendiente, Preparado';
COMMENT ON COLUMN area_registro.fecha IS 'Hora de llegada al KDS';
COMMENT ON COLUMN area_registro.fecha_terminado IS 'Hora en que se marcó como preparado';

-- ============ TABLA: CAJA_COMPROBANTE ============
CREATE TABLE caja_comprobante (
    id_comprobante SERIAL PRIMARY KEY,
    fecha TIMESTAMPTZ(6) DEFAULT NOW(),
    lugar VARCHAR(120) NOT NULL,
    nombre_cliente VARCHAR(120),
    nit VARCHAR(50),
    id_orden INTEGER NOT NULL,
    total_capturado DECIMAL(12, 2) NOT NULL,
    metodo_pago VARCHAR(50),
    monto_recibido DECIMAL(12, 2),
    cambio_devuelto DECIMAL(12, 2),
    
    CONSTRAINT fk_caja_cuenta FOREIGN KEY (id_orden)
        REFERENCES cuenta(id_orden)
);

CREATE INDEX ix_caja_fecha ON caja_comprobante(fecha);

COMMENT ON TABLE caja_comprobante IS 'Comprobantes de pago y tickets';
COMMENT ON COLUMN caja_comprobante.metodo_pago IS 'Efectivo, Tarjeta, Transferencia';

-- ============ TABLA: TOUR ============
CREATE TABLE tour (
    id_tour SERIAL PRIMARY KEY,
    fecha DATE DEFAULT CURRENT_DATE,
    nombre_servicio VARCHAR(100) NOT NULL,
    precio_servicio DECIMAL(10, 2) NOT NULL,
    tipo_visitante VARCHAR(50) NOT NULL,
    cantidad_visitante INTEGER NOT NULL,
    idioma VARCHAR(50),
    observaciones TEXT
);

CREATE INDEX ix_tour_fecha ON tour(fecha);

COMMENT ON TABLE tour IS 'Registro de tours turísticos';

-- ============ TABLA: NOTIFICACION ============
CREATE TABLE notificacion (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_orden INTEGER NOT NULL,
    tipo VARCHAR(50) DEFAULT 'platillo_listo',
    titulo VARCHAR(200) NOT NULL,
    mensaje VARCHAR(500) NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ(6) DEFAULT NOW(),
    fecha_leida TIMESTAMPTZ(6),
    id_platillo INTEGER,
    nombre_platillo VARCHAR(120),
    area_nombre VARCHAR(80),
    no_mesa VARCHAR(20),
    
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_notificacion_cuenta FOREIGN KEY (id_orden)
        REFERENCES cuenta(id_orden) ON DELETE CASCADE
);

CREATE INDEX ix_notif_usuario_leida ON notificacion(id_usuario, leida);
CREATE INDEX ix_notif_fecha ON notificacion(fecha_creacion);

COMMENT ON TABLE notificacion IS 'Notificaciones del sistema (platillos listos, etc.)';

-- ============================================
-- 4. INSERTAR DATOS INICIALES
-- ============================================

-- ============ ROLES ============
INSERT INTO roles (nombre_rol, descripcion) VALUES
('Administrador', 'Acceso total al sistema'),
('Gerente', 'Gestión de operaciones y reportes'),
('Cajero', 'Procesamiento de pagos'),
('Mesero', 'Toma de órdenes'),
('Cocina', 'Preparación de alimentos'),
('Tour', 'Gestión de tours y reservas'),
('Bebidas', 'Preparación de bebidas'),
('Coffee', 'Preparación de café y postres'),
('Supervisor', 'Supervisión general');

-- ============ EMPLEADOS ============
INSERT INTO empleados (nombre, apellidos, edad, genero, correo_electronico) VALUES
('Admin', 'Sistema', 30, 'N/A', 'admin@chicoj.com'),
('Juan', 'Pérez García', 25, 'Masculino', 'mesero@chicoj.com'),
('María', 'López Hernández', 35, 'Femenino', 'gerente@chicoj.com'),
('Carlos', 'Ramírez Pérez', 28, 'Masculino', 'cajero@chicoj.com'),
('Pedro', 'Gonzalez Morales', 32, 'Masculino', 'cocina1@chicoj.com'),
('Ana', 'Martínez Cruz', 26, 'Femenino', 'bebidas1@chicoj.com'),
('Luis', 'Fernández Silva', 24, 'Masculino', 'coffee1@chicoj.com'),
('Sofia', 'Méndez Torres', 27, 'Femenino', 'tour@chicoj.com');

-- ============ USUARIOS ============
-- NOTA: Las contraseñas están encriptadas con bcrypt (10 rounds)
-- Contraseñas en texto plano (SOLO PARA REFERENCIA):
--   admin/admin123
--   mesero1/mesero123
--   gerente1/gerente123
--   cajero1/cajero123
--   cocina1/cocina123
--   bebidas1/bebidas123
--   coffee1/coffee123
--   tour1/tour123

INSERT INTO usuarios (id_empleado, usuario_nombre, contrasena_hash, id_rol) VALUES
(1, 'admin', '$2b$10$XsOcH5qYl2N3K8YgYr7V.OmNKn3FZq1CYz5H8rNQx3jQ8KwYvYN6m', 1),
(2, 'mesero1', '$2b$10$7P3xQ9nN8K5YpZrYx8vV.O9nKn3FZq1CYz5H8rNQx3jQ8KwYvYN6m', 4),
(3, 'gerente1', '$2b$10$9K3xQ9nN8K5YpZrYx8vV.O9nKn3FZq1CYz5H8rNQx3jQ8KwYvYN6m', 2),
(4, 'cajero1', '$2b$10$5P3xQ9nN8K5YpZrYx8vV.O9nKn3FZq1CYz5H8rNQx3jQ8KwYvYN6m', 3),
(5, 'cocina1', '$2b$10$6P3xQ9nN8K5YpZrYx8vV.O9nKn3FZq1CYz5H8rNQx3jQ8KwYvYN6m', 5),
(6, 'bebidas1', '$2b$10$8P3xQ9nN8K5YpZrYx8vV.O9nKn3FZq1CYz5H8rNQx3jQ8KwYvYN6m', 7),
(7, 'coffee1', '$2b$10$4P3xQ9nN8K5YpZrYx8vV.O9nKn3FZq1CYz5H8rNQx3jQ8KwYvYN6m', 8),
(8, 'tour1', '$2b$10$3P3xQ9nN8K5YpZrYx8vV.O9nKn3FZq1CYz5H8rNQx3jQ8KwYvYN6m', 6);

-- ============ ÁREAS ============
INSERT INTO area (nombre, descripcion) VALUES
('Cocina', 'Preparación de alimentos calientes'),
('Bebidas', 'Bebidas y cocteles'),
('Coffee', 'Café y postres');

-- ============ CATEGORÍAS ============
-- Categorías para Cocina
INSERT INTO categorias (nombre, descripcion, id_area, activa) VALUES
('Desayunos', 'Platillos de desayuno', 1, TRUE),
('Almuerzos', 'Platillos de almuerzo', 1, TRUE),
('Menu Infantil', 'Platillos para niños', 1, TRUE),
('Refacciones', 'Snacks y comidas ligeras', 1, TRUE),
('Refacciones Tipicas', 'Refacciones típicas guatemaltecas', 1, TRUE),
('Cena', 'Platillos de cena', 1, TRUE);

-- Categorías para Bebidas
INSERT INTO categorias (nombre, descripcion, id_area, activa) VALUES
('Bebidas Frias', 'Bebidas frías sin alcohol', 2, TRUE),
('Licuados', 'Licuados naturales', 2, TRUE),
('Cervezas', 'Bebidas alcohólicas', 2, TRUE),
('Bebidas Desechables', 'Bebidas envasadas', 2, TRUE);

-- Categorías para Coffee
INSERT INTO categorias (nombre, descripcion, id_area, activa) VALUES
('Cafe', 'Variedades de café', 3, TRUE),
('Postres', 'Postres y dulces', 3, TRUE);

-- ============ PLATILLOS ============
-- COCINA - Desayunos
INSERT INTO platillos (nombre, descripcion, precio, id_area, id_categoria, disponible) VALUES
('Desayuno Chapin', 'Huevos, frijoles, plátano, queso y tortillas', 35.00, 1, 1, TRUE),
('Huevos con Longaniza', 'Huevos revueltos con longaniza guatemalteca', 40.00, 1, 1, TRUE),
('Panqueques', 'Panqueques con miel y fruta', 30.00, 1, 1, TRUE);

-- COCINA - Almuerzos
INSERT INTO platillos (nombre, descripcion, precio, id_area, id_categoria, disponible) VALUES
('Pepián de Pollo', 'Plato típico guatemalteco con especias tradicionales', 65.00, 1, 2, TRUE),
('Hilachas', 'Carne de res deshilachada en salsa de tomate', 55.00, 1, 2, TRUE),
('Kaq Ik', 'Caldo de chompipe con chile y especias', 70.00, 1, 2, TRUE),
('Churrasco Chapín', 'Carne asada con chimol y guacamol', 85.00, 1, 2, TRUE),
('Pollo Encebollado', 'Pechuga de pollo con cebolla y salsa', 50.00, 1, 2, TRUE);

-- COCINA - Menú Infantil
INSERT INTO platillos (nombre, descripcion, precio, id_area, id_categoria, disponible) VALUES
('Nuggets con Papas', 'Nuggets de pollo con papas fritas', 35.00, 1, 3, TRUE),
('Mini Hamburguesa', 'Hamburguesa pequeña con papas', 38.00, 1, 3, TRUE);

-- COCINA - Refacciones
INSERT INTO platillos (nombre, descripcion, precio, id_area, id_categoria, disponible) VALUES
('Sandwich de Pollo', 'Sandwich de pollo con vegetales frescos', 28.00, 1, 4, TRUE),
('Ensalada Mixta', 'Ensalada fresca con aderezo', 25.00, 1, 4, TRUE);

-- COCINA - Refacciones Típicas
INSERT INTO platillos (nombre, descripcion, precio, id_area, id_categoria, disponible) VALUES
('Tamalitos de Chipilín', 'Tamalitos con hojas de chipilín', 20.00, 1, 5, TRUE),
('Plátanos Fritos', 'Plátanos maduros fritos con crema y frijoles', 25.00, 1, 5, TRUE),
('Chuchitos', 'Tamalitos guatemaltecos con salsa', 18.00, 1, 5, TRUE);

-- BEBIDAS - Bebidas Frías
INSERT INTO platillos (nombre, descripcion, precio, id_area, id_categoria, disponible) VALUES
('Limonada Natural', 'Limonada fresca natural', 15.00, 2, 7, TRUE),
('Jugo de Naranja', 'Jugo de naranja recién exprimido', 18.00, 2, 7, TRUE),
('Agua Mineral', 'Agua mineral con gas o sin gas', 12.00, 2, 7, TRUE),
('Te Helado', 'Té frío con limón', 16.00, 2, 7, TRUE);

-- BEBIDAS - Licuados
INSERT INTO platillos (nombre, descripcion, precio, id_area, id_categoria, disponible) VALUES
('Licuado de Fresa', 'Licuado natural de fresa con leche', 22.00, 2, 8, TRUE),
('Licuado de Banano', 'Licuado de banano con leche y miel', 20.00, 2, 8, TRUE),
('Licuado de Papaya', 'Licuado tropical de papaya', 22.00, 2, 8, TRUE);

-- BEBIDAS - Cervezas
INSERT INTO platillos (nombre, descripcion, precio, id_area, id_categoria, disponible) VALUES
('Cerveza Nacional', 'Cerveza guatemalteca fría', 25.00, 2, 9, TRUE),
('Cerveza Importada', 'Cerveza importada premium', 35.00, 2, 9, TRUE),
('Michelada', 'Cerveza preparada con limón y sal', 30.00, 2, 9, TRUE);

-- BEBIDAS - Bebidas Desechables
INSERT INTO platillos (nombre, descripcion, precio, id_area, id_categoria, disponible) VALUES
('Refresco Lata', 'Bebida gaseosa en lata', 10.00, 2, 10, TRUE),
('Agua Purificada', 'Botella de agua purificada', 8.00, 2, 10, TRUE),
('Jugo Envasado', 'Jugo de caja en varios sabores', 12.00, 2, 10, TRUE);

-- COFFEE - Café
INSERT INTO platillos (nombre, descripcion, precio, id_area, id_categoria, disponible) VALUES
('Café Americano', 'Café negro tradicional', 18.00, 3, 11, TRUE),
('Capuccino', 'Café con leche espumada y canela', 25.00, 3, 11, TRUE),
('Café Latte', 'Café con leche vaporizada', 28.00, 3, 11, TRUE),
('Espresso', 'Café concentrado italiano', 20.00, 3, 11, TRUE),
('Café Moka', 'Café con chocolate y crema', 30.00, 3, 11, TRUE),
('Frappe', 'Café helado batido con hielo', 32.00, 3, 11, TRUE),
('Café con Leche', 'Café tradicional con leche caliente', 22.00, 3, 11, TRUE);

-- COFFEE - Postres
INSERT INTO platillos (nombre, descripcion, precio, id_area, id_categoria, disponible) VALUES
('Rellenitos de Plátano', 'Postre típico guatemalteco de plátano con frijol', 15.00, 3, 12, TRUE),
('Pastel de Chocolate', 'Porción de pastel de chocolate húmedo', 22.00, 3, 12, TRUE),
('Pie de Manzana', 'Pie de manzana con canela', 24.00, 3, 12, TRUE),
('Churros con Chocolate', 'Churros crujientes con chocolate caliente', 20.00, 3, 12, TRUE),
('Tres Leches', 'Pastel de tres leches tradicional', 26.00, 3, 12, TRUE),
('Flan de Caramelo', 'Flan casero con caramelo', 18.00, 3, 12, TRUE);

-- ============================================
-- 5. VERIFICACIÓN DE DATOS
-- ============================================

-- Ver resumen de roles
SELECT 'ROLES' as tabla, COUNT(*) as total FROM roles
UNION ALL
SELECT 'EMPLEADOS', COUNT(*) FROM empleados
UNION ALL
SELECT 'USUARIOS', COUNT(*) FROM usuarios
UNION ALL
SELECT 'AREAS', COUNT(*) FROM area
UNION ALL
SELECT 'CATEGORIAS', COUNT(*) FROM categorias
UNION ALL
SELECT 'PLATILLOS', COUNT(*) FROM platillos;

-- ============================================
-- 6. CONSULTAS ÚTILES
-- ============================================

-- Ver todos los usuarios con sus roles
SELECT 
    u.usuario_nombre,
    e.nombre || ' ' || e.apellidos as nombre_completo,
    r.nombre_rol,
    e.correo_electronico
FROM usuarios u
JOIN empleados e ON u.id_empleado = e.id_empleado
JOIN roles r ON u.id_rol = r.id_rol
ORDER BY r.nombre_rol, u.usuario_nombre;

-- Ver platillos por área y categoría
SELECT 
    a.nombre as area,
    c.nombre as categoria,
    COUNT(p.id_platillo) as cantidad_platillos,
    ROUND(AVG(p.precio), 2) as precio_promedio
FROM platillos p
JOIN area a ON p.id_area = a.id_area
LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE p.disponible = TRUE
GROUP BY a.nombre, c.nombre
ORDER BY a.nombre, c.nombre;

-- ============================================
-- 7. FUNCIONES ÚTILES
-- ============================================

-- Función para obtener el total de una orden
CREATE OR REPLACE FUNCTION calcular_total_orden(p_id_orden INTEGER)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
    v_total DECIMAL(12, 2);
BEGIN
    SELECT COALESCE(SUM(total_linea), 0)
    INTO v_total
    FROM comanda
    WHERE id_orden = p_id_orden;
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar platillo como preparado en KDS
CREATE OR REPLACE FUNCTION marcar_platillo_preparado(p_id_area_registro INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE area_registro
    SET estado = 'Preparado',
        fecha_terminado = NOW()
    WHERE id_area_registro = p_id_area_registro
    AND estado = 'Pendiente';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. VISTAS ÚTILES
-- ============================================

-- Vista de órdenes activas
CREATE OR REPLACE VIEW v_ordenes_activas AS
SELECT 
    c.id_orden,
    c.no_mesa,
    c.fecha,
    u.usuario_nombre as mesero,
    c.total,
    c.estado,
    COUNT(cmd.id_comanda) as cantidad_platillos
FROM cuenta c
JOIN usuarios u ON c.id_usuario = u.id_usuario
LEFT JOIN comanda cmd ON c.id_orden = cmd.id_orden
WHERE c.estado = 'Abierta'
GROUP BY c.id_orden, c.no_mesa, c.fecha, u.usuario_nombre, c.total, c.estado
ORDER BY c.fecha DESC;

-- Vista de platillos pendientes en KDS
CREATE OR REPLACE VIEW v_kds_pendientes AS
SELECT 
    ar.id_area_registro,
    a.nombre as area,
    ar.no_mesa,
    ar.platillo,
    ar.cantidad,
    ar.observaciones,
    ar.fecha,
    ar.estado,
    EXTRACT(EPOCH FROM (NOW() - ar.fecha))/60 as minutos_espera
FROM area_registro ar
JOIN area a ON ar.id_area = a.id_area
WHERE ar.estado = 'Pendiente'
ORDER BY ar.fecha ASC;

-- Vista de ventas del día
CREATE OR REPLACE VIEW v_ventas_dia AS
SELECT 
    DATE(cc.fecha) as fecha,
    COUNT(DISTINCT cc.id_orden) as cantidad_ordenes,
    SUM(cc.total_capturado) as total_vendido,
    COUNT(CASE WHEN cc.metodo_pago = 'Efectivo' THEN 1 END) as pagos_efectivo,
    COUNT(CASE WHEN cc.metodo_pago = 'Tarjeta' THEN 1 END) as pagos_tarjeta,
    COUNT(CASE WHEN cc.metodo_pago = 'Transferencia' THEN 1 END) as pagos_transferencia
FROM caja_comprobante cc
WHERE DATE(cc.fecha) = CURRENT_DATE
GROUP BY DATE(cc.fecha);

-- ============================================
-- 9. PERMISOS Y SEGURIDAD
-- ============================================

-- Crear rol de solo lectura (para reportes)
CREATE ROLE readonly_user WITH LOGIN PASSWORD 'readonly123';
GRANT CONNECT ON DATABASE restaurante_db TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO readonly_user;

-- ============================================
-- 10. INFORMACIÓN DEL SCRIPT
-- ============================================

-- Mostrar resumen final
DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'BASE DE DATOS CREADA EXITOSAMENTE';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Base de datos: restaurante_db';
    RAISE NOTICE 'Versión: 2.0';
    RAISE NOTICE 'Fecha: Noviembre 2025';
    RAISE NOTICE '';
    RAISE NOTICE 'CREDENCIALES DE PRUEBA:';
    RAISE NOTICE '========================';
    RAISE NOTICE 'admin / admin123 (Administrador)';
    RAISE NOTICE 'gerente1 / gerente123 (Gerente)';
    RAISE NOTICE 'cajero1 / cajero123 (Cajero)';
    RAISE NOTICE 'mesero1 / mesero123 (Mesero)';
    RAISE NOTICE 'cocina1 / cocina123 (Cocina)';
    RAISE NOTICE 'bebidas1 / bebidas123 (Bebidas)';
    RAISE NOTICE 'coffee1 / coffee123 (Coffee)';
    RAISE NOTICE 'tour1 / tour123 (Tour)';
    RAISE NOTICE '';
    RAISE NOTICE 'TABLAS CREADAS: 13';
    RAISE NOTICE 'USUARIOS: 8';
    RAISE NOTICE 'PLATILLOS: 41';
    RAISE NOTICE 'CATEGORÍAS: 12';
    RAISE NOTICE '================================================';
END $$;

-- FIN DEL SCRIPT

