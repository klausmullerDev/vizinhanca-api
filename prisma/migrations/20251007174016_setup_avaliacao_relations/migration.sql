/*
  Warnings:

  - You are about to drop the column `authorId` on the `avaliacoes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pedidoId]` on the table `avaliacoes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `avaliadoId` to the `avaliacoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avaliadorId` to the `avaliacoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nota` to the `avaliacoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pedidoId` to the `avaliacoes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."avaliacoes" DROP CONSTRAINT "avaliacoes_authorId_fkey";

-- AlterTable
ALTER TABLE "public"."avaliacoes" DROP COLUMN "authorId",
ADD COLUMN     "avaliadoId" TEXT NOT NULL,
ADD COLUMN     "avaliadorId" TEXT NOT NULL,
ADD COLUMN     "comentario" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nota" INTEGER NOT NULL,
ADD COLUMN     "pedidoId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_pedidoId_key" ON "public"."avaliacoes"("pedidoId");

-- AddForeignKey
ALTER TABLE "public"."avaliacoes" ADD CONSTRAINT "avaliacoes_avaliadorId_fkey" FOREIGN KEY ("avaliadorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."avaliacoes" ADD CONSTRAINT "avaliacoes_avaliadoId_fkey" FOREIGN KEY ("avaliadoId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."avaliacoes" ADD CONSTRAINT "avaliacoes_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "public"."pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
