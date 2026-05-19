using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OxfordSchoolAPI.Data;
using OxfordSchoolAPI.DTOs;
using OxfordSchoolAPI.Models;

namespace OxfordSchoolAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlunosController : ControllerBase
{
    private readonly AppDbContext _db;
    public AlunosController(AppDbContext db) => _db = db;

    // GET api/alunos
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool apenasAtivos = true,
        [FromQuery] string? nivel     = null)
    {
        var query = _db.Alunos.AsQueryable();

        if (apenasAtivos)          query = query.Where(a => a.Ativo);
        if (!string.IsNullOrEmpty(nivel)) query = query.Where(a => a.NivelIngles == nivel);

        var lista = await query
            .Select(a => new AlunoResponseDto(
                a.Id, a.Nome, a.Email, a.Telefone,
                a.DataNascimento, a.NivelIngles, a.DataMatricula, a.Ativo))
            .ToListAsync();

        return Ok(lista);
    }

    // GET api/alunos/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var a = await _db.Alunos.FindAsync(id);
        if (a is null) return NotFound(new { message = "Aluno não encontrado." });

        return Ok(new AlunoResponseDto(
            a.Id, a.Nome, a.Email, a.Telefone,
            a.DataNascimento, a.NivelIngles, a.DataMatricula, a.Ativo));
    }

    // POST api/alunos
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AlunoCreateDto dto)
    {
        if (await _db.Alunos.AnyAsync(a => a.Email == dto.Email))
            return Conflict(new { message = "E-mail já cadastrado." });

        var aluno = new Aluno
        {
            Nome           = dto.Nome,
            Email          = dto.Email,
            Telefone       = dto.Telefone,
            DataNascimento = dto.DataNascimento,
            NivelIngles    = dto.NivelIngles
        };

        _db.Alunos.Add(aluno);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = aluno.Id },
            new AlunoResponseDto(aluno.Id, aluno.Nome, aluno.Email, aluno.Telefone,
                aluno.DataNascimento, aluno.NivelIngles, aluno.DataMatricula, aluno.Ativo));
    }

    // PUT api/alunos/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AlunoUpdateDto dto)
    {
        var aluno = await _db.Alunos.FindAsync(id);
        if (aluno is null) return NotFound(new { message = "Aluno não encontrado." });

        if (await _db.Alunos.AnyAsync(a => a.Email == dto.Email && a.Id != id))
            return Conflict(new { message = "E-mail já utilizado por outro aluno." });

        aluno.Nome           = dto.Nome;
        aluno.Email          = dto.Email;
        aluno.Telefone       = dto.Telefone;
        aluno.DataNascimento = dto.DataNascimento;
        aluno.NivelIngles    = dto.NivelIngles;
        aluno.Ativo          = dto.Ativo;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE api/alunos/{id}  (soft delete)
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var aluno = await _db.Alunos.FindAsync(id);
        if (aluno is null) return NotFound(new { message = "Aluno não encontrado." });

        aluno.Ativo = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
