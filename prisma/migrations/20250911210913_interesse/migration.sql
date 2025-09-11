/*
  Warnings:

  - You are about to drop the column `ajudanteId` on the `interesses` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `interesses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pedidoId,userId]` on the table `interesses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `interesses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."avaliacoes" DROP CONSTRAINT "avaliacoes_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."enderecos" DROP CONSTRAINT "enderecos_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."interesses" DROP CONSTRAINT "interesses_ajudanteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."interesses" DROP CONSTRAINT "interesses_pedidoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."pedidos" DROP CONSTRAINT "pedidos_authorId_fkey";

-- DropIndex
DROP INDEX "public"."interesses_pedidoId_ajudanteId_key";

-- AlterTable
ALTER TABLE "public"."interesses" DROP COLUMN "ajudanteId",
DROP COLUMN "createdAt",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "interesses_pedidoId_userId_key" ON "public"."interesses"("pedidoId", "userId");

-- AddForeignKey
ALTER TABLE "public"."enderecos" ADD CONSTRAINT "enderecos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedidos" ADD CONSTRAINT "pedidos_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interesses" ADD CONSTRAINT "interesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interesses" ADD CONSTRAINT "interesses_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "public"."pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."avaliacoes" ADD CONSTRAINT "avaliacoes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
