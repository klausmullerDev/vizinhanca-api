-- CreateTable
CREATE TABLE "public"."chats" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "participante1Id" TEXT NOT NULL,
    "participante2Id" TEXT NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mensagens" (
    "id" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chats_pedidoId_participante1Id_participante2Id_key" ON "public"."chats"("pedidoId", "participante1Id", "participante2Id");

-- AddForeignKey
ALTER TABLE "public"."chats" ADD CONSTRAINT "chats_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "public"."pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chats" ADD CONSTRAINT "chats_participante1Id_fkey" FOREIGN KEY ("participante1Id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chats" ADD CONSTRAINT "chats_participante2Id_fkey" FOREIGN KEY ("participante2Id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mensagens" ADD CONSTRAINT "mensagens_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mensagens" ADD CONSTRAINT "mensagens_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
