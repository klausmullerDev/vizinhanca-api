-- AlterTable
ALTER TABLE "public"."notificacoes" ADD COLUMN     "remetenteId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."notificacoes" ADD CONSTRAINT "notificacoes_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
