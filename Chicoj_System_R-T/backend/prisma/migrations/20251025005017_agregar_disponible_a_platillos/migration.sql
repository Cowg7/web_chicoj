-- AlterTable
ALTER TABLE "platillos" ADD COLUMN     "disponible" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "ix_platillos_disponible" ON "platillos"("disponible");
