using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OxfordSchoolAPI.Data;
using OxfordSchoolAPI.DTOs;
using OxfordSchoolAPI.Models;

namespace OxfordSchoolAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfessoresController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProfessoresController(AppDbContext db) => _db = db;

    // GET api/professores
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool apenasAtivos = true)
    {
        var query = _db.Professores
            .Include(p => p.Aulas)
            .AsQueryable();

        if (apenasAtivos) query = query.Where(p => p.Ativo);

        var lista = await query
            .Select(p => new ProfessorResponseDto(
                p.Id, p.Nome, p.Email, p.Especialidade, p.Telefone,
                p.DataContratacao, p.Ativo,
                p.Aulas.Count))
            .ToListAsync();

        return Ok(lista);
    }

    // GET api/professores/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var p = await _db.Professores
            .Include(x => x.Aulas)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (p is null) return NotFound(new { message = "Professor não encontrado." });

        return Ok(new ProfessorResponseDto(
            p.Id, p.Nome, p.Email, p.Especialidade, p.Telefone,
            p.DataContratacao, p.Ativo, p.Aulas.Count));
    }

    // POST api/professores
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProfessorCreateDto dto)
    {
        if (await _db.Professores.AnyAsync(p => p.Email == dto.Email))
            return Conflict(new { message = "E-mail já cadastrado." });

        var professor = new Professor
        {
            Nome          = dto.Nome,
            Email         = dto.Email,
            Especialidade = dto.Especialidade,
            Telefone      = dto.Telefone
        };

        _db.Professores.Add(professor);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = professor.Id },
            new ProfessorResponseDto(professor.Id, professor.Nome, professor.Email,
                professor.Especialidade, professor.Telefone,
                professor.DataContratacao, professor.Ativo, 0));
    }

    // PUT api/professores/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ProfessorUpdateDto dto)
    {
        var professor = await _db.Professores.FindAsync(id);
        if (professor is null) return NotFound(new { message = "Professor não encontrado." });

        if (await _db.Professores.AnyAsync(p => p.Email == dto.Email && p.Id != id))
            return Conflict(new { message = "E-mail já utilizado por outro professor." });

        professor.Nome          = dto.Nome;
        professor.Email         = dto.Email;
        professor.Especialidade = dto.Especialidade;
        professor.Telefone      = dto.Telefone;
        professor.Ativo         = dto.Ativo;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE api/professores/{id}  (soft delete)
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var professor = await _db.Professores.FindAsync(id);
        if (professor is null) return NotFound(new { message = "Professor não encontrado." });

        professor.Ativo = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
