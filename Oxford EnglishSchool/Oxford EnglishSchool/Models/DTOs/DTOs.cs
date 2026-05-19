namespace OxfordSchoolAPI.DTOs;

// ─── Professor ────────────────────────────────
public record ProfessorCreateDto(
    string Nome,
    string Email,
    string? Especialidade,
    string? Telefone
);

public record ProfessorUpdateDto(
    string Nome,
    string Email,
    string? Especialidade,
    string? Telefone,
    bool Ativo
);

public record ProfessorResponseDto(
    Guid Id,
    string Nome,
    string Email,
    string? Especialidade,
    string? Telefone,
    DateTime DataContratacao,
    bool Ativo,
    int TotalAulas
);

// ─── Aluno ────────────────────────────────────
public record AlunoCreateDto(
    string Nome,
    string Email,
    string? Telefone,
    DateOnly? DataNascimento,
    string? NivelIngles
);

public record AlunoUpdateDto(
    string Nome,
    string Email,
    string? Telefone,
    DateOnly? DataNascimento,
    string? NivelIngles,
    bool Ativo
);

public record AlunoResponseDto(
    Guid Id,
    string Nome,
    string Email,
    string? Telefone,
    DateOnly? DataNascimento,
    string? NivelIngles,
    DateTime DataMatricula,
    bool Ativo
);

// ─── Aula ─────────────────────────────────────
public record AulaCreateDto(
    string Titulo,
    string? Descricao,
    Guid ProfessorId,
    DateTime DataHoraInicio,
    DateTime DataHoraFim,
    string Modalidade,
    string? Sala,
    string? LinkOnline,
    int VagasMaximas
);

public record AulaUpdateDto(
    string Titulo,
    string? Descricao,
    Guid ProfessorId,
    DateTime DataHoraInicio,
    DateTime DataHoraFim,
    string Modalidade,
    string? Sala,
    string? LinkOnline,
    int VagasMaximas
);

public record AulaResponseDto(
    Guid Id,
    string Titulo,
    string? Descricao,
    Guid ProfessorId,
    string ProfessorNome,
    DateTime DataHoraInicio,
    DateTime DataHoraFim,
    string Modalidade,
    string? Sala,
    string? LinkOnline,
    int VagasMaximas,
    int AlunosInscritos,
    DateTime DataCriacao
);

// ─── Inscrição ────────────────────────────────
public record InscricaoDto(Guid AlunoId, Guid AulaId);
public record PresencaDto(Guid AlunoId, Guid AulaId, bool Presenca);
