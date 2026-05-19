using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OxfordSchoolAPI.Data;

namespace OxfordSchoolAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RelatoriosController : ControllerBase
{
    private readonly AppDbContext _db;
    public RelatoriosController(AppDbContext db) => _db = db;

    // GET api/relatorios/dashboard
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var totalAlunos      = await _db.Alunos.CountAsync(a => a.Ativo);
        var totalProfessores = await _db.Professores.CountAsync(p => p.Ativo);
        var totalAulas       = await _db.Aulas.CountAsync();
        var aulasPresenciais = await _db.Aulas.CountAsync(a => a.Modalidade == "Presencial");
        var aulasOnline      = await _db.Aulas.CountAsync(a => a.Modalidade == "Online");

        var proximas = await _db.Aulas
            .Include(a => a.Professor)
            .Where(a => a.DataHoraInicio >= DateTime.UtcNow)
            .OrderBy(a => a.DataHoraInicio)
            .Take(5)
            .Select(a => new
            {
                a.Id, a.Titulo, a.Modalidade,
                a.DataHoraInicio,
                Professor = a.Professor!.Nome
            })
            .ToListAsync();

        return Ok(new
        {
            totalAlunos,
            totalProfessores,
            totalAulas,
            aulasPresenciais,
            aulasOnline,
            proximasAulas = proximas
        });
    }

    // GET api/relatorios/alunos-por-nivel
    [HttpGet("alunos-por-nivel")]
    public async Task<IActionResult> AlunosPorNivel()
    {
        var dados = await _db.Alunos
            .Where(a => a.Ativo)
            .GroupBy(a => a.NivelIngles ?? "Não definido")
            .Select(g => new { Nivel = g.Key, Total = g.Count() })
            .ToListAsync();

        return Ok(dados);
    }

    // GET api/relatorios/aulas-professor
    [HttpGet("aulas-professor")]
    public async Task<IActionResult> AulasPorProfessor()
    {
        var dados = await _db.Professores
            .Where(p => p.Ativo)
            .Select(p => new
            {
                p.Nome,
                TotalAulas       = p.Aulas.Count,
                AulasPresenciais = p.Aulas.Count(a => a.Modalidade == "Presencial"),
                AulasOnline      = p.Aulas.Count(a => a.Modalidade == "Online")
            })
            .ToListAsync();

        return Ok(dados);
    }
}
