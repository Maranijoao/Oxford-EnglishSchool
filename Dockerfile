# ─────────────────────────────────────────────────────────────
# Oxford English School API — imagem Docker (multi-stage)
# Build:  docker build -t oxford-api .
# Run:    docker run -p 8080:8080 \
#           -e Jwt__Key="..." -e Admin__Email="..." -e Admin__Senha="..." \
#           -v oxford-data:/app/data oxford-api
# ─────────────────────────────────────────────────────────────

# ---------- build ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Oxford EnglishSchool/Oxford EnglishSchool/Oxford EnglishSchool.csproj", "api/"]
RUN dotnet restore "api/Oxford EnglishSchool.csproj"

COPY ["Oxford EnglishSchool/Oxford EnglishSchool/", "api/"]
RUN dotnet publish "api/Oxford EnglishSchool.csproj" \
    -c Release -o /app/publish /p:UseAppHost=false

# ---------- runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_HTTP_PORTS=8080 \
    ConnectionStrings__DefaultConnection="Data Source=/app/data/oxford.db"

EXPOSE 8080

COPY --from=build /app/publish .

# Pasta do arquivo SQLite, gravável pelo usuário não-root "app"
# (já incluso na imagem aspnet). Monte um volume aqui para persistir.
RUN mkdir -p /app/data && chown app:app /app/data
VOLUME /app/data

USER app

ENTRYPOINT ["dotnet", "Oxford EnglishSchool.dll"]
