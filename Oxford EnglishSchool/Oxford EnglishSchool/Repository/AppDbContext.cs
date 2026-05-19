using Microsoft.EntityFrameworkCore;
using OxfordEnglishSchool.Models;
using OxfordSchoolAPI.Models;

namespace OxfordSchoolAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Professor> Professores => Set<Professor>();
    public DbSet<Aluno>     Alunos      => Set<Aluno>();
    public DbSet<Aula>      Aulas       => Set<Aula>();
    public DbSet<AlunoAula> AlunoAulas => Set<AlunoAula>();
    public DbSet<Usuario> Usuarios { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── Professor ─────────────────────────────────────────────────────
        modelBuilder.Entity<Professor>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.HasIndex(p => p.Email).IsUnique();

            e.Property(p => p.Nome).HasMaxLength(100).IsRequired();
            e.Property(p => p.Email).HasMaxLength(100).IsRequired();
            e.Property(p => p.Especialidade).HasMaxLength(50);
            e.Property(p => p.Telefone).HasMaxLength(20);
        });

        // ── Aluno ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Aluno>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.HasIndex(a => a.Email).IsUnique();

            e.Property(a => a.Nome).HasMaxLength(100).IsRequired();
            e.Property(a => a.Email).HasMaxLength(100).IsRequired();
            e.Property(a => a.Telefone).HasMaxLength(20);
            e.Property(a => a.NivelIngles).HasMaxLength(20);
            e.Property(a => a.Ativo);
        });

        // ── Aula ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Aula>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

            e.Property(a => a.Titulo).HasMaxLength(100).IsRequired();
            e.Property(a => a.Descricao).HasMaxLength(255);
            e.Property(a => a.Modalidade).HasMaxLength(20).IsRequired();
            e.Property(a => a.Sala).HasMaxLength(30);
            e.Property(a => a.LinkOnline).HasMaxLength(255);

            e.HasOne(a => a.Professor)
             .WithMany(p => p.Aulas)
             .HasForeignKey(a => a.ProfessorId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── AlunoAula (N:N) ───────────────────────────────────────────────
        modelBuilder.Entity<AlunoAula>(e =>
        {
            e.HasKey(aa => new { aa.AlunoId, aa.AulaId });

            e.HasOne(aa => aa.Aluno)
             .WithMany(a => a.AlunoAulas)
             .HasForeignKey(aa => aa.AlunoId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(aa => aa.Aula)
             .WithMany(a => a.AlunoAulas)
             .HasForeignKey(aa => aa.AulaId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
