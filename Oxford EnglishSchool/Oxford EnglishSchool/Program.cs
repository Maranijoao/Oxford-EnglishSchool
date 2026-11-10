using Microsoft.AspNetCore.Authentication.JwtBearer;
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
                    )
            };
    });

builder.Services.AddAuthorization();

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

// Swagger fica disponível também em produção para a apresentação do PIM.
app.UseSwagger();

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint(
        "/swagger/v1/swagger.json",
        "Oxford School API v1"
    );

    c.RoutePrefix = "swagger";
});

app.UseCors("FrontendPolicy");

if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// JWT
app.UseAuthentication();

app.UseAuthorization();

app.MapHealthChecks("/health");

app.MapGet("/", () => Results.Redirect("/swagger"))
   .ExcludeFromDescription();

app.MapControllers();

app.Run();
