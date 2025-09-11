/*
  Warnings:

  - You are about to drop the column `userId` on the `interesses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pedidoId,ajudanteId]` on the table `interesses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ajudanteId` to the `interesses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."interesses" DROP CONSTRAINT "interesses_userId_fkey";

-- AlterTable
ALTER TABLE "public"."interesses" DROP COLUMN "userId",
ADD COLUMN     "ajudanteId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "interesses_pedidoId_ajudanteId_key" ON "public"."interesses"("pedidoId", "ajudanteId");

-- AddForeignKey
ALTER TABLE "public"."interesses" ADD CONSTRAINT "interesses_ajudanteId_fkey" FOREIGN KEY ("ajudanteId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
