using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OxfordEnglishSchool.Models;
using OxfordSchoolAPI.Data;
using OxfordSchoolAPI.DTOs;

namespace OxfordSchoolAPI.Controllers;

/// <summary>
/// Usuários que acessam o sistema. Todas as rotas exigem login (política
/// padrão da API). A senha é guardada só como hash BCrypt.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _db;
    public UsuariosController(AppDbContext db) => _db = db;

    // GET api/usuarios
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var lista = await _db.Usuarios
            .OrderBy(u => u.Nome)
            .Select(u => new UsuarioResponseDto(u.Id, u.Nome, u.Email, u.Ativo, u.DataCriacao))
            .ToListAsync();

        return Ok(lista);
    }

    // GET api/usuarios/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var u = await _db.Usuarios.FindAsync(id);
        if (u is null) return NotFound(new { message = "Usuário não encontrado." });

        return Ok(new UsuarioResponseDto(u.Id, u.Nome, u.Email, u.Ativo, u.DataCriacao));
    }

    // POST api/usuarios
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UsuarioCreateDto dto)
    {
        var login = dto.Login?.Trim() ?? "";
        var nome  = string.IsNullOrWhiteSpace(dto.Nome) ? login : dto.Nome.Trim();

        if (login.Length is < 3 or > 100)
            return BadRequest(new { message = "O login deve ter entre 3 e 100 caracteres." });

        if (string.IsNullOrEmpty(dto.Senha) || dto.Senha.Length < 8)
            return BadRequest(new { message = "A senha deve ter pelo menos 8 caracteres." });

        if (nome.Length > 100)
            return BadRequest(new { message = "O nome deve ter no máximo 100 caracteres." });

        if (await _db.Usuarios.AnyAsync(u => u.Email == login))
            return Conflict(new { message = "Login já cadastrado." });

        var usuario = new Usuario
        {
            Id          = Guid.NewGuid(),
            Nome        = nome,
            Email       = login,
            SenhaHash   = BCrypt.Net.BCrypt.HashPassword(dto.Senha, 11),
            Ativo       = true,
            DataCriacao = DateTime.UtcNow
        };

        _db.Usuarios.Add(usuario);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Dois pedidos simultâneos com o mesmo login
            return Conflict(new { message = "Login já cadastrado." });
        }

        return CreatedAtAction(nameof(GetById), new { id = usuario.Id },
            new UsuarioResponseDto(usuario.Id, usuario.Nome, usuario.Email, usuario.Ativo, usuario.DataCriacao));
    }
}
