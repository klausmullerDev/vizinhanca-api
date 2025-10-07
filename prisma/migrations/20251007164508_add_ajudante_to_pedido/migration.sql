-- AlterTable
ALTER TABLE "public"."pedidos" ADD COLUMN     "ajudanteId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."pedidos" ADD CONSTRAINT "pedidos_ajudanteId_fkey" FOREIGN KEY ("ajudanteId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
