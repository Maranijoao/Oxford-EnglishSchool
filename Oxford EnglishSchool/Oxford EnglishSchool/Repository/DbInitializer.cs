using Microsoft.EntityFrameworkCore;
using OxfordEnglishSchool.Models;
using OxfordSchoolAPI.Models;

namespace OxfordSchoolAPI.Data;

/// <summary>
/// Cria o banco SQLite (se ainda não existir) e insere os dados iniciais:
///  • usuário administrador (Admin:Email / Admin:Senha da configuração);
///  • dados de exemplo (Seed:DadosExemplo = true), úteis na nuvem gratuita,
///    onde o arquivo do banco é recriado sempre que o container reinicia.
/// </summary>
public static class DbInitializer
{
    public static async Task InicializarAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db     = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var log    = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
                                          .CreateLogger("DbInitializer");

        // Garante que a pasta do arquivo .db exista (ex.: /app/data no container)
        var caminho = db.Database.GetDbConnection().DataSource;
        var pasta = Path.GetDirectoryName(Path.GetFullPath(caminho));
        if (!string.IsNullOrEmpty(pasta)) Directory.CreateDirectory(pasta);

        if (await db.Database.EnsureCreatedAsync())
            log.LogInformation("Banco SQLite criado em {Caminho}", caminho);

        await CriarAdminAsync(db, config, log);

        if (config.GetValue("Seed:DadosExemplo", false))
            await CriarDadosExemploAsync(db, log);
    }

    private static async Task CriarAdminAsync(AppDbContext db, IConfiguration config, ILogger log)
    {
        if (await db.Usuarios.AnyAsync()) return;

        var email = config["Admin:Email"];
        var senha = config["Admin:Senha"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(senha))
        {
            log.LogWarning(
                "Nenhum usuário cadastrado. Defina Admin__Email e Admin__Senha " +
                "para criar o administrador automaticamente.");
            return;
        }

        db.Usuarios.Add(new Usuario
        {
            Id          = Guid.NewGuid(),
            Nome        = config["Admin:Nome"] ?? "Administrador",
            Email       = email,
            SenhaHash   = BCrypt.Net.BCrypt.HashPassword(senha, 11),
            Ativo       = true,
            DataCriacao = DateTime.UtcNow
        });

        await db.SaveChangesAsync();
        log.LogInformation("Usuário administrador {Email} criado.", email);
    }

    private static async Task CriarDadosExemploAsync(AppDbContext db, ILogger log)
    {
        if (await db.Professores.AnyAsync()) return;

        var ana = new Professor
        {
            Nome = "Ana Souza", Email = "ana.souza@oxford.com",
            Especialidade = "Conversação", Telefone = "(11) 98888-1000"
        };
        var carlos = new Professor
        {
            Nome = "Carlos Lima", Email = "carlos.lima@oxford.com",
            Especialidade = "Gramática", Telefone = "(11) 98888-2000"
        };

        var alunos = new[]
        {
            new Aluno { Nome = "Beatriz Santos",  Email = "beatriz@email.com", NivelIngles = "Básico",
                        Telefone = "(11) 97777-0001", DataNascimento = new DateOnly(2004, 3, 12) },
            new Aluno { Nome = "Diego Oliveira",  Email = "diego@email.com",   NivelIngles = "Intermediário",
                        Telefone = "(11) 97777-0002", DataNascimento = new DateOnly(1999, 8, 25) },
            new Aluno { Nome = "Fernanda Alves",  Email = "fernanda@email.com", NivelIngles = "Avançado",
                        Telefone = "(11) 97777-0003", DataNascimento = new DateOnly(2001, 11, 2) }
        };

        var hoje = DateTime.UtcNow.Date;
        var aulas = new[]
        {
            new Aula { Titulo = "Conversation Club", Descricao = "Prática de conversação em grupo",
                       Professor = ana, Modalidade = "Presencial", Sala = "Sala 2", VagasMaximas = 12,
                       DataHoraInicio = hoje.AddDays(1).AddHours(22), DataHoraFim = hoje.AddDays(1).AddHours(23) },
            new Aula { Titulo = "Grammar Essentials", Descricao = "Tempos verbais e estruturas básicas",
                       Professor = carlos, Modalidade = "Online", LinkOnline = "https://meet.google.com/oxford-demo",
                       VagasMaximas = 20,
                       DataHoraInicio = hoje.AddDays(2).AddHours(23), DataHoraFim = hoje.AddDays(3) }
        };

        db.Professores.AddRange(ana, carlos);
        db.Alunos.AddRange(alunos);
        db.Aulas.AddRange(aulas);
        db.AlunoAulas.AddRange(
            new AlunoAula { Aluno = alunos[0], Aula = aulas[0] },
            new AlunoAula { Aluno = alunos[1], Aula = aulas[0] },
            new AlunoAula { Aluno = alunos[2], Aula = aulas[1] });

        await db.SaveChangesAsync();
        log.LogInformation("Dados de exemplo inseridos.");
    }
}
