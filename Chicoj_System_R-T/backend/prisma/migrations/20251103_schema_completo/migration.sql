-- CreateTable
CREATE TABLE IF NOT EXISTS "roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(60) NOT NULL,
    "descripcion" VARCHAR(200),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "empleados" (
    "id_empleado" SERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "apellidos" VARCHAR(120) NOT NULL,
    "edad" INTEGER,
    "genero" VARCHAR(20),
    "correo_electronico" VARCHAR(150) NOT NULL,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("id_empleado")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "id_empleado" INTEGER NOT NULL,
    "usuario_nombre" VARCHAR(60) NOT NULL,
    "contrasena_hash" TEXT NOT NULL,
    "id_rol" INTEGER NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "area" (
    "id_area" SERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "descripcion" VARCHAR(200),

    CONSTRAINT "area_pkey" PRIMARY KEY ("id_area")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "platillos" (
    "id_platillo" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "descripcion" VARCHAR(255),
    "precio" DECIMAL(10,2) NOT NULL,
    "id_area" INTEGER NOT NULL,
    "categoria" VARCHAR(100),
    "disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "platillos_pkey" PRIMARY KEY ("id_platillo")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "cuenta" (
    "id_orden" SERIAL NOT NULL,
    "fecha" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "no_mesa" VARCHAR(20) NOT NULL DEFAULT 'S/N',
    "id_usuario" INTEGER NOT NULL,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Abierta',

    CONSTRAINT "cuenta_pkey" PRIMARY KEY ("id_orden")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "comanda" (
    "id_comanda" SERIAL NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "id_platillo" INTEGER NOT NULL,
    "platillo_nombre" VARCHAR(120) NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "observaciones" VARCHAR(255),
    "extra_observacion" VARCHAR(255),
    "extra_precio" DECIMAL(10,2) DEFAULT 0,
    "subtotal" DECIMAL(12,2),
    "total_linea" DECIMAL(12,2),

    CONSTRAINT "comanda_pkey" PRIMARY KEY ("id_comanda")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "area_registro" (
    "id_area_registro" SERIAL NOT NULL,
    "id_area" INTEGER NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "id_comanda" INTEGER NOT NULL,
    "no_mesa" VARCHAR(10),
    "fecha" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_terminado" TIMESTAMPTZ(6),
    "platillo" VARCHAR(120) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "observaciones" VARCHAR(255),
    "extra_observacion" VARCHAR(255),
    "extra_precio" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Pendiente',

    CONSTRAINT "area_registro_pkey" PRIMARY KEY ("id_area_registro")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "caja_comprobante" (
    "id_comprobante" SERIAL NOT NULL,
    "fecha" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lugar" VARCHAR(120) NOT NULL,
    "nombre_cliente" VARCHAR(120),
    "nit" VARCHAR(50),
    "id_orden" INTEGER NOT NULL,
    "total_capturado" DECIMAL(12,2) NOT NULL,
    "metodo_pago" VARCHAR(50),
    "monto_recibido" DECIMAL(12,2),
    "cambio_devuelto" DECIMAL(12,2),

    CONSTRAINT "caja_comprobante_pkey" PRIMARY KEY ("id_comprobante")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tour" (
    "id_tour" SERIAL NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_DATE,
    "nombre_servicio" VARCHAR(100) NOT NULL,
    "precio_servicio" DECIMAL(10,2) NOT NULL,
    "tipo_visitante" VARCHAR(50) NOT NULL,
    "cantidad_visitante" INTEGER NOT NULL,
    "idioma" VARCHAR(50),
    "observaciones" TEXT,

    CONSTRAINT "tour_pkey" PRIMARY KEY ("id_tour")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "notificacion" (
    "id_notificacion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "tipo" VARCHAR(50) NOT NULL DEFAULT 'platillo_listo',
    "titulo" VARCHAR(200) NOT NULL,
    "mensaje" VARCHAR(500) NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_leida" TIMESTAMPTZ(6),
    "id_platillo" INTEGER,
    "nombre_platillo" VARCHAR(120),
    "area_nombre" VARCHAR(80),
    "no_mesa" VARCHAR(20),

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id_notificacion")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "roles_nombre_rol_key" ON "roles"("nombre_rol");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "empleados_correo_electronico_key" ON "empleados"("correo_electronico");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_id_empleado_key" ON "usuarios"("id_empleado");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_usuario_nombre_key" ON "usuarios"("usuario_nombre");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "area_nombre_key" ON "area"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "platillos_nombre_key" ON "platillos"("nombre");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_platillos_area" ON "platillos"("id_area");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_platillos_categoria" ON "platillos"("categoria");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_platillos_disponible" ON "platillos"("disponible");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_cuenta_fecha" ON "cuenta"("fecha");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_cuenta_estado" ON "cuenta"("estado");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_cuenta_mesero" ON "cuenta"("id_usuario");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_comanda_orden" ON "comanda"("id_orden");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_comanda_platillo" ON "comanda"("id_platillo");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "area_registro_id_comanda_key" ON "area_registro"("id_comanda");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_area_reg_area" ON "area_registro"("id_area");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_area_reg_orden" ON "area_registro"("id_orden");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_area_reg_fecha" ON "area_registro"("fecha");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_area_reg_estado" ON "area_registro"("estado");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_caja_fecha" ON "caja_comprobante"("fecha");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_tour_fecha" ON "tour"("fecha");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_notif_usuario_leida" ON "notificacion"("id_usuario", "leida");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_notif_fecha" ON "notificacion"("fecha_creacion");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "empleados"("id_empleado") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platillos" ADD CONSTRAINT "platillos_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta" ADD CONSTRAINT "cuenta_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comanda" ADD CONSTRAINT "comanda_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "cuenta"("id_orden") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comanda" ADD CONSTRAINT "comanda_id_platillo_fkey" FOREIGN KEY ("id_platillo") REFERENCES "platillos"("id_platillo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_registro" ADD CONSTRAINT "area_registro_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_registro" ADD CONSTRAINT "area_registro_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "cuenta"("id_orden") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_registro" ADD CONSTRAINT "area_registro_id_comanda_fkey" FOREIGN KEY ("id_comanda") REFERENCES "comanda"("id_comanda") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caja_comprobante" ADD CONSTRAINT "caja_comprobante_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "cuenta"("id_orden") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "cuenta"("id_orden") ON DELETE CASCADE ON UPDATE CASCADE;

