/*
  Warnings:

  - A unique constraint covering the columns `[pedidoId,avaliadorId]` on the table `avaliacoes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."avaliacoes_pedidoId_key";

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_pedidoId_avaliadorId_key" ON "public"."avaliacoes"("pedidoId", "avaliadorId");
