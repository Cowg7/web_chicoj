-- AlterTable
ALTER TABLE "area_registro" ADD COLUMN     "estado" VARCHAR(20) NOT NULL DEFAULT 'Pendiente';

-- CreateIndex
CREATE INDEX "ix_area_reg_estado" ON "area_registro"("estado");
