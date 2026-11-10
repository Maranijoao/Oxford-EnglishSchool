// ─────────────────────────────────────────────────────────────
// Configuração do front-end
// API_URL aponta para a API local durante o desenvolvimento e
// para a API publicada no Render quando o site está na nuvem.
// Depois do primeiro deploy no Render, troque API_URL_PRODUCAO
// pela URL do seu serviço (ex.: https://oxford-api.onrender.com).
// ─────────────────────────────────────────────────────────────

const API_URL_LOCAL = "https://localhost:7131";
const API_URL_PRODUCAO = "https://oxford-api.onrender.com";

const API_URL = ["localhost", "127.0.0.1"].includes(location.hostname)
    ? API_URL_LOCAL
    : API_URL_PRODUCAO;
