-- CreateTable
CREATE TABLE "notificacion" (
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
CREATE INDEX "ix_notif_usuario_leida" ON "notificacion"("id_usuario", "leida");

-- CreateIndex
CREATE INDEX "ix_notif_fecha" ON "notificacion"("fecha_creacion");

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "cuenta"("id_orden") ON DELETE CASCADE ON UPDATE CASCADE;
