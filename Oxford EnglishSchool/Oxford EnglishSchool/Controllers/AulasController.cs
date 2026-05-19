using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OxfordSchoolAPI.Data;
using OxfordSchoolAPI.DTOs;
using OxfordSchoolAPI.Models;

namespace OxfordSchoolAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AulasController : ControllerBase
{
    private readonly AppDbContext _db;
    public AulasController(AppDbContext db) => _db = db;

    // GET api/aulas
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? modalidade  = null,
        [FromQuery] Guid?   professorId = null)
    {
        var query = _db.Aulas
            .Include(a => a.Professor)
            .Include(a => a.AlunoAulas)
            .AsQueryable();

        if (!string.IsNullOrEmpty(modalidade))
            query = query.Where(a => a.Modalidade == modalidade);

        if (professorId.HasValue)
            query = query.Where(a => a.ProfessorId == professorId.Value);

        var lista = await query
            .OrderBy(a => a.DataHoraInicio)
            .Select(a => new AulaResponseDto(
                a.Id, a.Titulo, a.Descricao,
                a.ProfessorId,
                a.Professor != null ? a.Professor.Nome : "",
                a.DataHoraInicio, a.DataHoraFim,
                a.Modalidade, a.Sala, a.LinkOnline,
                a.VagasMaximas, a.AlunoAulas.Count,
                a.DataCriacao))
            .ToListAsync();

        return Ok(lista);
    }

    // GET api/aulas/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var a = await _db.Aulas
            .Include(x => x.Professor)
            .Include(x => x.AlunoAulas)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (a is null) return NotFound(new { message = "Aula não encontrada." });

        return Ok(new AulaResponseDto(
            a.Id, a.Titulo, a.Descricao,
            a.ProfessorId, a.Professor?.Nome ?? "",
            a.DataHoraInicio, a.DataHoraFim,
            a.Modalidade, a.Sala, a.LinkOnline,
            a.VagasMaximas, a.AlunoAulas.Count,
            a.DataCriacao));
    }

    // GET api/aulas/{id}/alunos
    [HttpGet("{id:guid}/alunos")]
    public async Task<IActionResult> GetAlunos(Guid id)
    {
        var existe = await _db.Aulas.AnyAsync(a => a.Id == id);
        if (!existe) return NotFound(new { message = "Aula não encontrada." });

        var alunos = await _db.AlunoAulas
            .Where(aa => aa.AulaId == id)
            .Include(aa => aa.Aluno)
            .Select(aa => new
            {
                aa.Aluno!.Id,
                aa.Aluno.Nome,
                aa.Aluno.Email,
                aa.DataInscricao,
                aa.Presenca
            })
            .ToListAsync();

        return Ok(alunos);
    }

    // POST api/aulas
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AulaCreateDto dto)
    {
        var professorExiste = await _db.Professores.AnyAsync(p => p.Id == dto.ProfessorId && p.Ativo);
        if (!professorExiste) return BadRequest(new { message = "Professor não encontrado ou inativo." });

        if (dto.DataHoraFim <= dto.DataHoraInicio)
            return BadRequest(new { message = "DataHoraFim deve ser posterior ao início." });

        var aula = new Aula
        {
            Titulo         = dto.Titulo,
            Descricao      = dto.Descricao,
            ProfessorId    = dto.ProfessorId,
            DataHoraInicio = dto.DataHoraInicio,
            DataHoraFim    = dto.DataHoraFim,
            Modalidade     = dto.Modalidade,
            Sala           = dto.Sala,
            LinkOnline     = dto.LinkOnline,
            VagasMaximas   = dto.VagasMaximas
        };

        _db.Aulas.Add(aula);
        await _db.SaveChangesAsync();

        var professor = await _db.Professores.FindAsync(aula.ProfessorId);

        return CreatedAtAction(nameof(GetById), new { id = aula.Id },
            new AulaResponseDto(aula.Id, aula.Titulo, aula.Descricao,
                aula.ProfessorId, professor?.Nome ?? "",
                aula.DataHoraInicio, aula.DataHoraFim,
                aula.Modalidade, aula.Sala, aula.LinkOnline,
                aula.VagasMaximas, 0, aula.DataCriacao));
    }

    // PUT api/aulas/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AulaUpdateDto dto)
    {
        var aula = await _db.Aulas.FindAsync(id);
        if (aula is null) return NotFound(new { message = "Aula não encontrada." });

        if (dto.DataHoraFim <= dto.DataHoraInicio)
            return BadRequest(new { message = "DataHoraFim deve ser posterior ao início." });

        aula.Titulo         = dto.Titulo;
        aula.Descricao      = dto.Descricao;
        aula.ProfessorId    = dto.ProfessorId;
        aula.DataHoraInicio = dto.DataHoraInicio;
        aula.DataHoraFim    = dto.DataHoraFim;
        aula.Modalidade     = dto.Modalidade;
        aula.Sala           = dto.Sala;
        aula.LinkOnline     = dto.LinkOnline;
        aula.VagasMaximas   = dto.VagasMaximas;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE api/aulas/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var aula = await _db.Aulas.FindAsync(id);
        if (aula is null) return NotFound(new { message = "Aula não encontrada." });

        _db.Aulas.Remove(aula);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // POST api/aulas/inscrever
    [HttpPost("inscrever")]
    public async Task<IActionResult> Inscrever([FromBody] InscricaoDto dto)
    {
        var aula  = await _db.Aulas.Include(a => a.AlunoAulas).FirstOrDefaultAsync(a => a.Id == dto.AulaId);
        var aluno = await _db.Alunos.FindAsync(dto.AlunoId);

        if (aula  is null) return NotFound(new { message = "Aula não encontrada." });
        if (aluno is null) return NotFound(new { message = "Aluno não encontrado." });

        if (aula.AlunoAulas.Any(aa => aa.AlunoId == dto.AlunoId))
            return Conflict(new { message = "Aluno já inscrito nesta aula." });

        if (aula.AlunoAulas.Count >= aula.VagasMaximas)
            return BadRequest(new { message = "Aula sem vagas disponíveis." });

        _db.AlunoAulas.Add(new AlunoAula { AlunoId = dto.AlunoId, AulaId = dto.AulaId });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Inscrição realizada com sucesso." });
    }

    // PUT api/aulas/presenca
    [HttpPut("presenca")]
    public async Task<IActionResult> RegistrarPresenca([FromBody] PresencaDto dto)
    {
        var registro = await _db.AlunoAulas
            .FirstOrDefaultAsync(aa => aa.AlunoId == dto.AlunoId && aa.AulaId == dto.AulaId);

        if (registro is null) return NotFound(new { message = "Inscrição não encontrada." });

        registro.Presenca = dto.Presenca;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Presença registrada." });
    }
}
