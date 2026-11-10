-- ─────────────────────────────────────────────────────────────
-- Oxford English School — schema do banco (SQLite)
--
-- Gerado a partir do modelo do Entity Framework (AppDbContext).
-- A API cria estas tabelas sozinha ao iniciar (EnsureCreated);
-- este arquivo serve como referência / documentação do modelo físico.
-- Para criar manualmente: sqlite3 oxford.db < database/schema-sqlite.sql
-- ─────────────────────────────────────────────────────────────

PRAGMA foreign_keys = ON;

CREATE TABLE "Alunos" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_Alunos" PRIMARY KEY,
    "Nome" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Telefone" TEXT NULL,
    "DataNascimento" TEXT NULL,
    "NivelIngles" TEXT NULL,
    "DataMatricula" TEXT NOT NULL,
    "Ativo" INTEGER NOT NULL
);

CREATE TABLE "Professores" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_Professores" PRIMARY KEY,
    "Nome" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Especialidade" TEXT NULL,
    "Telefone" TEXT NULL,
    "DataContratacao" TEXT NOT NULL,
    "Ativo" INTEGER NOT NULL
);

CREATE TABLE "Usuarios" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_Usuarios" PRIMARY KEY,
    "Nome" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "SenhaHash" TEXT NOT NULL,
    "Ativo" INTEGER NOT NULL,
    "DataCriacao" TEXT NOT NULL
);

CREATE TABLE "Aulas" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_Aulas" PRIMARY KEY,
    "Titulo" TEXT NOT NULL,
    "Descricao" TEXT NULL,
    "ProfessorId" TEXT NOT NULL,
    "DataHoraInicio" TEXT NOT NULL,
    "DataHoraFim" TEXT NOT NULL,
    "Modalidade" TEXT NOT NULL,
    "Sala" TEXT NULL,
    "LinkOnline" TEXT NULL,
    "VagasMaximas" INTEGER NOT NULL,
    "DataCriacao" TEXT NOT NULL,
    CONSTRAINT "FK_Aulas_Professores_ProfessorId" FOREIGN KEY ("ProfessorId") REFERENCES "Professores" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "AlunoAulas" (
    "AlunoId" TEXT NOT NULL,
    "AulaId" TEXT NOT NULL,
    "DataInscricao" TEXT NOT NULL,
    "Presenca" INTEGER NULL,
    CONSTRAINT "PK_AlunoAulas" PRIMARY KEY ("AlunoId", "AulaId"),
    CONSTRAINT "FK_AlunoAulas_Alunos_AlunoId" FOREIGN KEY ("AlunoId") REFERENCES "Alunos" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_AlunoAulas_Aulas_AulaId" FOREIGN KEY ("AulaId") REFERENCES "Aulas" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_AlunoAulas_AulaId" ON "AlunoAulas" ("AulaId");

CREATE UNIQUE INDEX "IX_Alunos_Email" ON "Alunos" ("Email");

CREATE INDEX "IX_Aulas_ProfessorId" ON "Aulas" ("ProfessorId");

CREATE UNIQUE INDEX "IX_Professores_Email" ON "Professores" ("Email");

