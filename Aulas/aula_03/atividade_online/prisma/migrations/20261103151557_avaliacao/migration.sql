-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "questaoId" TEXT NOT NULL,
    "avaliacao" TEXT NOT NULL,
    "comentario" TEXT,
    "valorAvaliado" TEXT NOT NULL,
    "avaliadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Avaliacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Avaliacao_usuarioId_questaoId_key" ON "Avaliacao"("usuarioId", "questaoId");
