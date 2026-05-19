using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OxfordSchoolAPI.Models;

// ─────────────────────────────────────────────
// Professor
// ─────────────────────────────────────────────
public class Professor
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(100)]
    public string Nome { get; set; } = string.Empty;

    [Required, MaxLength(100), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Especialidade { get; set; }

    [MaxLength(20)]
    public string? Telefone { get; set; }

    public DateTime DataContratacao { get; set; } = DateTime.UtcNow;

    public bool Ativo { get; set; } = true;

    // Navegação
    public ICollection<Aula> Aulas { get; set; } = new List<Aula>();
}

// ─────────────────────────────────────────────
// Aluno
// ─────────────────────────────────────────────
public class Aluno
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(100)]
    public string Nome { get; set; } = string.Empty;

    [Required, MaxLength(100), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Telefone { get; set; }

    public DateOnly? DataNascimento { get; set; }

    [MaxLength(20)]
    public string? NivelIngles { get; set; }   // Básico | Intermediário | Avançado

    public DateTime DataMatricula { get; set; } = DateTime.UtcNow;

    public bool Ativo { get; set; } = true;

    // Navegação
    public ICollection<AlunoAula> AlunoAulas { get; set; } = new List<AlunoAula>();
}

// ─────────────────────────────────────────────
// Aula
// ─────────────────────────────────────────────
public class Aula
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(100)]
    public string Titulo { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Descricao { get; set; }

    [Required]
    public Guid ProfessorId { get; set; }

    [Required]
    public DateTime DataHoraInicio { get; set; }

    [Required]
    public DateTime DataHoraFim { get; set; }

    [Required, MaxLength(20)]
    public string Modalidade { get; set; } = "Presencial";  // Presencial | Online

    [MaxLength(30)]
    public string? Sala { get; set; }

    [MaxLength(255)]
    public string? LinkOnline { get; set; }

    public int VagasMaximas { get; set; } = 10;

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    // Navegação
    public Professor? Professor { get; set; }
    public ICollection<AlunoAula> AlunoAulas { get; set; } = new List<AlunoAula>();
}

// ─────────────────────────────────────────────
// AlunoAula  (tabela associativa N:N)
// ─────────────────────────────────────────────
public class AlunoAula
{
    public Guid AlunoId { get; set; }
    public Aluno? Aluno { get; set; }

    public Guid AulaId { get; set; }
    public Aula? Aula { get; set; }

    public DateTime DataInscricao { get; set; } = DateTime.UtcNow;
    public bool? Presenca { get; set; }
}
