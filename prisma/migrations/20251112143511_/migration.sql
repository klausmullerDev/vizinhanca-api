/*
  Warnings:

  - Made the column `categoriaId` on table `pedidos` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."pedidos" DROP CONSTRAINT "pedidos_categoriaId_fkey";

-- AlterTable
ALTER TABLE "public"."pedidos" ALTER COLUMN "categoriaId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."pedidos" ADD CONSTRAINT "pedidos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
