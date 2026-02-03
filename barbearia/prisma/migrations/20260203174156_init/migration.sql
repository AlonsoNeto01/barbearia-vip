-- CreateTable
CREATE TABLE "Agendamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomeCliente" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "servico" TEXT NOT NULL,
    "precoTotal" REAL NOT NULL,
    "sinalPago" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Bloqueio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME NOT NULL,
    "motivo" TEXT
);
