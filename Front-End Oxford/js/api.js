// ─────────────────────────────────────────────────────────────
// Acesso à API e sessão do usuário
//
//   const alunos = await api("/api/Alunos?apenasAtivos=true");
//   await api("/api/Alunos", { method: "POST", body: aluno });
//
// • monta a URL a partir de API_URL (config.js);
// • envia o token como "Authorization: Bearer ...";
// • converte o corpo para JSON e devolve a resposta já convertida
//   (null quando a API não devolve corpo, ex.: 204);
// • quando a resposta não é ok, lança ErroApi com a mensagem da API;
// • em 401 (ou token vencido), encerra a sessão e abre o login.
// ─────────────────────────────────────────────────────────────

class ErroApi extends Error {
    constructor(mensagem, status, tratado = false) {
        super(mensagem);
        this.name = "ErroApi";
        this.status = status;
        // tratado = o usuário já foi avisado (ex.: sessão expirada)
        this.tratado = tratado;
    }
}

// ── Sessão ────────────────────────────────────────────────────

function obterToken() {
    return localStorage.getItem("token");
}

// Lê o "exp" do JWT. Serve só para a interface: quem garante
// a segurança é a API, que valida assinatura e validade.
function tokenValido() {
    const token = obterToken();
    if (!token) return false;

    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

function limparSessao() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioNome");
    localStorage.removeItem("usuarioEmail");
}

let avisoSessaoMostrado = false;

// Chamada quando a API recusa o token: limpa tudo que exige login
// e leva o usuário de volta à tela de entrada (um aviso por vez).
function sessaoExpirada() {
    limparSessao();

    ["adminPanel", "areaResultado"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = "";
            el.style.display = "none";
        }
    });

    const modal = document.getElementById("modalEdicao");
    if (modal) modal.style.display = "none";

    if (typeof atualizarPermissoes === "function") atualizarPermissoes();
    if (typeof atualizarUsuarioLogado === "function") atualizarUsuarioLogado();

    if (!avisoSessaoMostrado) {
        avisoSessaoMostrado = true;
        alert("Sua sessão expirou. Entre novamente.");
    }

    if (typeof abrirLogin === "function") abrirLogin();
}

// ── Requisições ───────────────────────────────────────────────

function mensagemDeErro(dados, status) {
    if (dados && typeof dados === "object") {
        if (dados.message) return dados.message;

        // Erros de validação do ASP.NET (ProblemDetails)
        if (dados.errors) {
            const primeiros = Object.values(dados.errors).flat().slice(0, 3);
            if (primeiros.length) return primeiros.join("\n");
        }

        if (dados.title) return dados.title;
    }

    if (status === 403) return "Você não tem permissão para esta ação.";
    if (status === 404) return "Registro não encontrado.";
    if (status === 409) return "Este registro já existe.";
    if (status >= 500) return "Erro no servidor. Tente novamente em instantes.";

    return `Erro na requisição (${status}).`;
}

async function api(caminho, opcoes = {}) {
    const { method = "GET", body, autenticar = true } = opcoes;

    const headers = { Accept: "application/json" };

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (autenticar) {
        if (!tokenValido()) {
            sessaoExpirada();
            throw new ErroApi("Sua sessão expirou. Entre novamente.", 401, true);
        }
        headers.Authorization = `Bearer ${obterToken()}`;
    }

    let resposta;

    try {
        resposta = await fetch(`${API_URL}${caminho}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
    } catch {
        throw new ErroApi(
            "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
            0
        );
    }

    if (resposta.status === 401 && autenticar) {
        sessaoExpirada();
        throw new ErroApi("Sua sessão expirou. Entre novamente.", 401, true);
    }

    const texto = await resposta.text();
    let dados = null;

    if (texto) {
        try {
            dados = JSON.parse(texto);
        } catch {
            dados = texto;
        }
    }

    if (!resposta.ok) {
        throw new ErroApi(mensagemDeErro(dados, resposta.status), resposta.status);
    }

    return dados;
}

// Exibe o erro ao usuário (uma vez) e registra só a mensagem no console,
// sem dados pessoais nem token.
function mostrarErro(erro, mensagemPadrao = "Não foi possível concluir a operação.") {
    if (erro && erro.tratado) return;
    console.error(erro && erro.message ? erro.message : erro);
    alert((erro && erro.message) || mensagemPadrao);
}
