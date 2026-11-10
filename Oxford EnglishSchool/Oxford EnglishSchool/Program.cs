using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OxfordSchoolAPI.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ─────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────

builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// DATABASE (SQLite)
// O banco é um arquivo .db. Local: oxford.db na pasta da API.
// No container: /app/data/oxford.db (ConnectionStrings__DefaultConnection).
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
    connectionString = "Data Source=oxford.db";

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(connectionString)
);

// HEALTH CHECK (usado pelo Render para monitorar o container)
builder.Services.AddHealthChecks();

// SWAGGER
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title =
            "Oxford English School API",

        Version =
            "v1",

        Description =
            "API de gerenciamento acadêmico da Oxford English School"
    });

    // Botão "Authorize" no Swagger: cole o token devolvido por /api/Auth/login
    var esquemaBearer = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Token JWT obtido em POST /api/Auth/login",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", esquemaBearer);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        [esquemaBearer] = Array.Empty<string>()
    });
});

// CORS
// Cors:AllowedOrigins (lista separada por vírgula) restringe as origens
// em produção; se não for definido, qualquer origem é aceita.
var allowedOrigins = (builder.Configuration["Cors:AllowedOrigins"] ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    // O navegador envia a origem sem "/" final; aceita a config com ou sem.
    .Select(o => o.TrimEnd('/'))
    .ToArray();

builder.Services.AddCors(opt =>
    opt.AddPolicy(
        "FrontendPolicy",
        policy =>
        {
            if (allowedOrigins.Length > 0)
                policy.WithOrigins(allowedOrigins);
            else
                policy.AllowAnyOrigin();

            policy.AllowAnyMethod()
                  .AllowAnyHeader();
        }
    )
);

// ─────────────────────────────────────────────────────────────
// JWT
// ─────────────────────────────────────────────────────────────

var jwtKey =
    builder.Configuration["Jwt:Key"];

// HS256 exige chave de pelo menos 32 bytes.
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
    throw new InvalidOperationException(
        "Jwt:Key ausente ou menor que 32 caracteres " +
        "(defina a variável de ambiente Jwt__Key).");

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,

                ValidateAudience = true,

                ValidateLifetime = true,

                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    builder.Configuration["Jwt:Issuer"],

                ValidAudience =
                    builder.Configuration["Jwt:Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)
                    ),

                // Token sem "exp" é recusado; só aceita HS256 (o algoritmo
                // usado no login), evitando troca de algoritmo no header.
                RequireExpirationTime = true,

                RequireSignedTokens = true,

                ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 },

                // Tolerância de relógio: padrão é 5 min, reduzido para 1 min.
                ClockSkew = TimeSpan.FromMinutes(1)
            };
    });

// Toda rota exige usuário autenticado, salvo as marcadas com [AllowAnonymous]
// (login, dashboard público só com contagens) e o /health do Render.
builder.Services.AddAuthorization(opt =>
{
    opt.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

// O Render termina o HTTPS no proxy e repassa HTTP para o container.
builder.Services.Configure<ForwardedHeadersOptions>(opt =>
{
    opt.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    opt.KnownNetworks.Clear();
    opt.KnownProxies.Clear();
});

// ─────────────────────────────────────────────────────────────
// PIPELINE
// ─────────────────────────────────────────────────────────────

var app = builder.Build();

// Cria o arquivo SQLite, as tabelas e os dados iniciais, se necessário.
await DbInitializer.InicializarAsync(app.Services);

app.UseForwardedHeaders();

// Swagger só em desenvolvimento (não expõe o mapa da API em produção).
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "Oxford School API v1"
        );

        c.RoutePrefix = "swagger";
    });
}

app.UseCors("FrontendPolicy");

if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// JWT
app.UseAuthentication();

app.UseAuthorization();

// O Render consulta /health sem token para saber se o container está no ar.
app.MapHealthChecks("/health")
   .AllowAnonymous();

if (app.Environment.IsDevelopment())
{
    app.MapGet("/", () => Results.Redirect("/swagger"))
       .AllowAnonymous()
       .ExcludeFromDescription();
}

app.MapControllers();

app.Run();
