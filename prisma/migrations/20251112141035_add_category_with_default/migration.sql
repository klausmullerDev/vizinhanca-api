-- AlterTable
ALTER TABLE "public"."categorias" ADD COLUMN     "iconUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."pedidos" ADD COLUMN     "categoriaId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."pedidos" ADD CONSTRAINT "pedidos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
