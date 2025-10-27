-- AlterTable
ALTER TABLE "caja_comprobante" ADD COLUMN     "cambio_devuelto" DECIMAL(12,2),
ADD COLUMN     "metodo_pago" VARCHAR(50),
ADD COLUMN     "monto_recibido" DECIMAL(12,2);
