/*
  Warnings:

  - Added the required column `descricao` to the `pedidos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titulo` to the `pedidos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."pedidos" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descricao" TEXT NOT NULL,
ADD COLUMN     "titulo" TEXT NOT NULL;
