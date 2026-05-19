using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using OxfordSchoolAPI.Data;
using OxfordEnglishSchool.Models;
using OxfordEnglishSchool.Models.DTOs;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace OxfordSchool.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(
        AppDbContext db,
        IConfiguration config
    )
    {
        _db = db;
        _config = config;
    }

    [HttpGet("gerar-hash")]
    public IActionResult GerarHash()
    {
        var hash =
            BCrypt.Net.BCrypt.HashPassword("123456");

        return Ok(hash);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginDto dto
    )
    {
        var usuario = await _db.Usuarios
            .FirstOrDefaultAsync(x =>
                x.Email == dto.Email &&
                x.Ativo
            );

        if (usuario == null)
        {
            return Unauthorized(
                new
                {
                    message = "Usuário inválido."
                }
            );
        }

        bool senhaValida =
            BCrypt.Net.BCrypt.Verify(
                dto.Senha,
                usuario.SenhaHash
            );

        if (!senhaValida)
        {
            return Unauthorized(
                new
                {
                    message = "Senha inválida."
                }
            );
        }

        var claims = new[]
        {
            new Claim(
                ClaimTypes.Name,
                usuario.Nome
            ),

            new Claim(
                ClaimTypes.Email,
                usuario.Email
            ),

            new Claim(
                ClaimTypes.NameIdentifier,
                usuario.Id.ToString()
            )
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                _config["Jwt:Key"]!
            )
        );

        var creds = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(8),
            signingCredentials: creds
        );

        return Ok(
            new
            {
                token =
                    new JwtSecurityTokenHandler()
                        .WriteToken(token),

                expiracao =
                    DateTime.Now.AddHours(8),

                nome = usuario.Nome,

                email = usuario.Email
            }
        );
    }
}