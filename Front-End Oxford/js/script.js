// =========================================
// LOCAL STORAGE
// =========================================


let alunosCadastrados = JSON.parse(localStorage.getItem("alunos")) || [];
let professoresCadastrados = JSON.parse(localStorage.getItem("professores")) || [];


let tipoEdicao = "";
let idEdicao = null;
let aulasCadastradas = [];


// =========================================
// FUNÇÕES BASE
// =========================================

function abrirLogin() {

    document.getElementById(
        "modalLogin"
    ).style.display = "flex";
}

function fecharLogin() {

    document.getElementById(
        "modalLogin"
    ).style.display = "none";
}

// =========================================

async function realizarLogin() {

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();

    const senhaInput =
        document.getElementById(
            "loginSenha"
        );

    const senha = senhaInput.value;

    if (email === "" || senha === "") {

        alert("Preencha e-mail e senha.");

        return;
    }

    try {

        const data = await api("/api/Auth/login", {
            method: "POST",
            body: { email, senha },
            autenticar: false
        });

        // TOKEN
        gravarStorage("token", data.token);

        gravarStorage("usuarioNome", data.nome);

        gravarStorage("usuarioEmail", data.email);

        avisoSessaoMostrado = false;

        senhaInput.value = "";

        fecharLogin();

        atualizarUsuarioLogado();

        atualizarPermissoes();

        alert(
            "Login realizado com sucesso!"
        );

    } catch (error) {

        mostrarErro(error, "Erro ao realizar login.");
    }
}

function atualizarUsuarioLogado() {

    const nome = lerStorage("usuarioNome");

    const div =
        document.getElementById(
            "usuarioLogado"
        );

    if (!div) return;

    if (nome && usuarioEstaLogado()) {

        div.innerHTML = `

            <i class="fas fa-user-circle"></i>
            <span class="usuario-nome"></span>

            <button
                onclick="logout()"
                class="btn-logout"
            >
                Sair
            </button>
        `;

        div.querySelector(".usuario-nome").textContent = nome;

    } else {

        div.innerHTML = "";
    }
}

function logout() {

    limparSessao();

    location.reload();
}

// =========================================

function usuarioEstaLogado() {

    // token presente E dentro da validade
    return tokenValido();
}

function validarLogin() {

    if (!usuarioEstaLogado()) {

        limparSessao();

        atualizarPermissoes();

        alert(
            "Você precisa estar logado."
        );

        abrirLogin();

        return false;
    }

    return true;
}

// Mostra ou esconde o que exige login: seção Administração,
// link do menu e botão Login.
function atualizarPermissoes() {

    const logado = usuarioEstaLogado();

    const adminSection =
        document.getElementById("admin");

    if (adminSection) {
        adminSection.style.display = logado ? "block" : "none";
    }

    document
        .querySelectorAll('nav a[href="#admin"]')
        .forEach(link => {
            link.style.display = logado ? "" : "none";
        });

    const botaoLogin =
        document.querySelector("nav .btn-login");

    if (botaoLogin) {
        botaoLogin.style.display = logado ? "none" : "";
    }
}

// =========================================

function criarId() {
    return Date.now().toString() + Math.random().toString(36).substring(2);
}


function salvarStorage() {
    localStorage.setItem("alunos", JSON.stringify(alunosCadastrados));
    localStorage.setItem("professores", JSON.stringify(professoresCadastrados));
}


// Dashboard público: usa só as contagens de /api/Relatorios/dashboard
// (não baixa as listas de alunos e professores, que exigem login).
async function atualizarDashboard() {

    const campos = {
        totalAlunos: "totalAlunos",
        totalProfessores: "totalProfessores",
        totalAulas: "totalAulas",
        totalNiveis: "totalNiveis"
    };

    const contadores = {
        contadorAlunos: ["totalAlunos", "alunos cadastrados"],
        contadorProfessores: ["totalProfessores", "professores cadastrados"],
        contadorAulas: ["totalAulas", "aulas cadastradas"]
    };

    try {

        const dados = await api("/api/Relatorios/dashboard", {
            autenticar: false
        });

        Object.entries(campos).forEach(([id, chave]) => {
            const el = document.getElementById(id);
            if (el) el.innerText = dados[chave] ?? 0;
        });

        Object.entries(contadores).forEach(([id, [chave, texto]]) => {
            const el = document.getElementById(id);
            if (el) el.innerText = `${dados[chave] ?? 0} ${texto}`;
        });

    } catch (error) {

        // Sem alerta: a página inicial continua utilizável mesmo
        // se a API estiver iniciando (Render free) ou fora do ar.
        console.error(error.message || error);
    }
}


// =========================================
// FORMULÁRIO ALUNO
// =========================================


function abrirFormularioAluno() {

    if (!validarLogin()) {
        return;
    }

    const area = document.getElementById("areaResultado");

    area.style.display = "block";

    area.innerHTML = `

        <h3>
            Cadastro de Aluno
        </h3>

        <input
        id="nomeAluno"
        type="text"
        placeholder="Nome do aluno">

        <input
        id="emailAluno"
        type="email"
        placeholder="Email do aluno">

        <input
        id="telefoneAluno"
        type="text"
        placeholder="Telefone do aluno">

        <input
        id="dataNascimentoAluno"
        type="date">

        <input
        id="nivelAluno"
        type="text"
        placeholder="Nível de inglês">

        <button
        class="btn"
        onclick="salvarAluno()">

            Salvar Aluno

        </button>

    `;

    area.scrollIntoView({
        behavior: "smooth"
    });
}


async function salvarAluno() {

    const aluno = {

        nome: document.getElementById("nomeAluno").value,
        email: document.getElementById("emailAluno").value,
        telefone: document.getElementById("telefoneAluno").value,
        dataNascimento: document.getElementById("dataNascimentoAluno").value,
        nivelIngles: document.getElementById("nivelAluno").value
    };

    // Validação
    if (
        aluno.nome === "" ||
        aluno.email === "" ||
        aluno.telefone === "" ||
        aluno.dataNascimento === "" ||
        aluno.nivelIngles === ""
    ) {
        alert("Preencha todos os campos.");
        return;
    }

    try {

        await api("/api/Alunos", {
            method: "POST",
            body: aluno
        });

        alert("Aluno cadastrado com sucesso!");

        atualizarDashboard();

        abrirFormularioAluno();

    } catch (error) {

        mostrarErro(error, "Erro ao cadastrar aluno.");
    }
}

// =========================================
// FORMULÁRIO PROFESSOR
// =========================================


function abrirFormularioProfessor() {

    if (!validarLogin()) {
        return;
    }

    const area = document.getElementById("areaResultado");

    area.style.display = "block";

    area.innerHTML = `

        <h3>
            Cadastro de Professor
        </h3>

        <input
        id="nomeProfessor"
        type="text"
        placeholder="Nome do professor">

        <input
        id="emailProfessor"
        type="email"
        placeholder="Email do professor">

        <input
        id="telefoneProfessor"
        type="text"
        placeholder="Telefone do professor">

        <input
        id="especialidadeProfessor"
        type="text"
        placeholder="Especialidade">

        <button
        class="btn"
        onclick="salvarProfessor()">

            Salvar Professor

        </button>

    `;

    area.scrollIntoView({
        behavior: "smooth"
    });
}

async function salvarProfessor() {

    const professor = {

        nome: document.getElementById("nomeProfessor").value,

        email: document.getElementById("emailProfessor").value,

        telefone: document.getElementById("telefoneProfessor").value,

        especialidade:
            document.getElementById("especialidadeProfessor").value
    };

    // validação
    if (
        professor.nome === "" ||
        professor.email === "" ||
        professor.telefone === "" ||
        professor.especialidade === ""
    ) {
        alert("Preencha todos os campos.");
        return;
    }

    try {

        await api("/api/Professores", {
            method: "POST",
            body: professor
        });

        alert("Professor cadastrado com sucesso!");

        atualizarDashboard();

        abrirFormularioProfessor();

    } catch (error) {

        mostrarErro(error, "Erro ao cadastrar professor.");
    }
}


// =========================================

async function abrirFormularioAula() {

    if (!validarLogin()) {
        return;
    }

    try {

        // =========================
        // BUSCAR PROFESSORES
        // =========================
        const professores =
            await api("/api/Professores?apenasAtivos=true");

        // =========================
        // TÍTULO MODAL
        // =========================
        document.getElementById("modalTitulo").innerText =
            "Nova Aula";

        // =========================
        // CAMPOS MODAL
        // =========================
        document.getElementById("modalCampos").innerHTML = `

            <div class="form-grid">

                <div class="form-group">

                    <label>
                        Título da Aula
                    </label>

                    <input
                        id="aulaTitulo"
                        type="text"
                        placeholder="Digite o título da aula"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Professor
                    </label>

                    <select id="aulaProfessorId">

                        <option value="">
                            Selecione um professor
                        </option>

                        ${professores.map(professor => `

                            <option value="${escapeHtml(professor.id)}">

                                ${escapeHtml(professor.nome)}

                            </option>

                        `).join("")}

                    </select>

                </div>

                <div class="form-group full-width">

                    <label>
                        Descrição
                    </label>

                    <textarea
                        id="aulaDescricao"
                        placeholder="Descrição da aula">
                    </textarea>

                </div>

                <div class="form-group">

                    <label>
                        Data/Hora Início
                    </label>

                    <input
                        id="aulaInicio"
                        type="datetime-local"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Data/Hora Fim
                    </label>

                    <input
                        id="aulaFim"
                        type="datetime-local"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Modalidade
                    </label>

                    <select id="aulaModalidade">

                        <option value="Online">
                            Online
                        </option>

                        <option value="Presencial">
                            Presencial
                        </option>

                    </select>

                </div>

                <div class="form-group">

                    <label>
                        Sala
                    </label>

                    <input
                        id="aulaSala"
                        type="text"
                        placeholder="Ex: Sala 04"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Link Online
                    </label>

                    <input
                        id="aulaLink"
                        type="text"
                        placeholder="https://..."
                    >

                </div>

                <div class="form-group">

                    <label>
                        Quantidade de Vagas
                    </label>

                    <input
                        id="aulaVagas"
                        type="number"
                        placeholder="20"
                    >

                </div>

            </div>

        `;

        tipoEdicao = "novaAula";
        idEdicao = null;

        document.getElementById("modalEdicao").style.display =
            "flex";

    } catch (error) {

        console.error(error);

        alert(
            "Erro ao abrir formulário de aula."
        );
    }
}


// RELATÓRIOS
// =========================================


async function mostrarRelatorio() {

    if (!validarLogin()) {
        return;
    }

    try {

        [alunosCadastrados, professoresCadastrados] = await Promise.all([
            api("/api/Alunos?apenasAtivos=true"),
            api("/api/Professores?apenasAtivos=true")
        ]);

    } catch (error) {

        mostrarErro(error, "Erro ao carregar o relatório.");
        return;
    }

    const area = document.getElementById("areaResultado");


    area.style.display = "block";


    let html = `
        <h3>
            Relatório Geral
        </h3>
    `;


    if (alunosCadastrados.length > 0) {


        html += `
            <h4>
                Alunos
            </h4>
        `;


        alunosCadastrados.forEach(aluno => {


            html += `
                <p>
                    <strong>Nome:</strong> ${escapeHtml(aluno.nome)}
                </p>


                <p>
                    <strong>Email:</strong> ${escapeHtml(aluno.email)}
                </p>


                <p>
                    <strong>Telefone:</strong> ${escapeHtml(aluno.telefone)}
                </p>


                <p>
                    <strong>Idade:</strong> ${escapeHtml(aluno.idade)}
                </p>


                <p>
                    <strong>Nível:</strong> ${escapeHtml(aluno.nivel)}
                </p>


                <hr>
            `;
        });
    }


    if (professoresCadastrados.length > 0) {


        html += `
            <h4>
                Professores
            </h4>
        `;


        professoresCadastrados.forEach(professor => {


            html += `
                <p>
                    <strong>Nome:</strong> ${escapeHtml(professor.nome)}
                </p>


                <p>
                    <strong>Email:</strong> ${escapeHtml(professor.email)}
                </p>


                <p>
                    <strong>Telefone:</strong> ${escapeHtml(professor.telefone)}
                </p>


                <p>
                    <strong>Especialidade:</strong> ${escapeHtml(professor.especialidade)}
                </p>


                <p>
                    <strong>Horário:</strong> ${escapeHtml(professor.horario)}
                </p>


                <hr>
            `;
        });
    }


    if (
        alunosCadastrados.length === 0 &&
        professoresCadastrados.length === 0
    ) {
        html += `
            <p>
                Nenhum cadastro encontrado.
            </p>
        `;
    }


    area.innerHTML = html;


    area.scrollIntoView({
        behavior: "smooth"
    });
}


// =========================================
// AULAS
// =========================================


function mostrarAulaPresencial() {


    const area = document.getElementById("areaResultado");


    area.style.display = "block";


    area.innerHTML = `


        <h3>
            Aulas Presenciais
        </h3>


        <p>
            <strong>Curso:</strong>
            Inglês Básico
        </p>


        <p>
            <strong>Dias:</strong>
            Segunda e Quarta
        </p>


        <p>
            <strong>Horário:</strong>
            19:00 às 21:00
        </p>


        <p>
            <strong>Sala:</strong>
            Laboratório 02
        </p>


    `;
}


// =========================================
// HORÁRIOS
// =========================================


function mostrarHorarios() {

    if (!validarLogin()) {
        return;
    }

    const area = document.getElementById("areaResultado");


    area.style.display = "block";


    area.innerHTML = `


        <h3>
            Controle de Horários
        </h3>


        <p>
            <strong>Inglês Nível 1:</strong>
            40 horas
        </p>


        <p>
            <strong>Inglês Nível 2:</strong>
            50 horas
        </p>


        <p>
            <strong>Inglês Nível 3:</strong>
            60 horas
        </p>


        <p>
            <strong>Inglês Avançado:</strong>
            80 horas
        </p>


    `;
}


// =========================================
// DASHBOARD
// =========================================


function mostrarDashboard(texto) {


    const painel = document.getElementById("painelInfo");


    painel.style.display = "block";


    painel.innerHTML = `


        <h3>
            Informação
        </h3>


        <p>
            ${escapeHtml(texto)}
        </p>


    `;
}

// =========================================
// ADMIN
// =========================================


async function abrirAdminAlunos() {

    if (!validarLogin()) {
        return;
    }

    const painel =
        document.getElementById("adminPanel");

    painel.style.display = "block";

    painel.innerHTML = `

        <h3>
            Gerenciar Alunos
        </h3>

        <input
            class="admin-search"
            placeholder="Buscar aluno pelo nome..."
            oninput="filtrarAlunos(this.value)"
        >

        <div id="listaAdminAlunos">
            Carregando alunos...
        </div>

    `;

    try {

        alunosCadastrados =
            await api("/api/Alunos?apenasAtivos=true");

        renderizarAlunos(alunosCadastrados);

    } catch (error) {

        const lista = document.getElementById("listaAdminAlunos");

        if (lista) {
            lista.innerHTML = `

            <p>
                Erro ao carregar alunos.
            </p>

        `;
        }

        mostrarErro(error, "Erro ao carregar alunos.");

        if (error.tratado) return;
    }

    painel.scrollIntoView({
        behavior: "smooth"
    });
}

async function renderizarAlunos(listaRecebida = null) {

    const div =
        document.getElementById("listaAdminAlunos");

    try {

        let lista = listaRecebida;

        // =====================================
        // BUSCAR DA API SOMENTE SE NÃO RECEBER LISTA
        // =====================================
        if (!lista) {

            lista = await api("/api/Alunos?apenasAtivos=true");

            // atualiza variável global
            alunosCadastrados = lista;
        }

        // =====================================
        // VALIDAR LISTA
        // =====================================
        if (!Array.isArray(lista)) {

            throw new Error(
                "A lista de alunos é inválida."
            );
        }

        // =====================================
        // SEM ALUNOS
        // =====================================
        if (lista.length === 0) {

            div.innerHTML = `

                <p>
                    Nenhum aluno cadastrado.
                </p>

            `;

            return;
        }

        // =====================================
        // RENDERIZAR TABELA
        // =====================================
        div.innerHTML = `

            <table class="admin-table">

                <tr>

                    <th>Nome</th>

                    <th>Email</th>

                    <th>Telefone</th>

                    <th>Data Nascimento</th>

                    <th>Nível</th>

                    <th>Ações</th>

                </tr>

                ${lista.map(aluno => `

                    <tr>

                        <td>
                            ${escapeHtml(aluno.nome || "-")}
                        </td>

                        <td>
                            ${escapeHtml(aluno.email || "-")}
                        </td>

                        <td>
                            ${escapeHtml(aluno.telefone || "-")}
                        </td>

                        <td>
                            ${aluno.dataNascimento
                ? escapeHtml(formatarData(
                    aluno.dataNascimento
                ))
                : "-"
            }
                        </td>

                        <td>
                            ${escapeHtml(aluno.nivelIngles || "-")}
                        </td>

                        <td>

                            <button
                                class="btn-edit"
                                data-id="${escapeHtml(aluno.id)}"
                                onclick="editarAluno(this.dataset.id)"
                            >

                                Editar

                            </button>

                            <button
                                class="btn-delete"
                                data-id="${escapeHtml(aluno.id)}"
                                onclick="excluirAluno(this.dataset.id)"
                            >

                                Excluir

                            </button>

                        </td>

                    </tr>

                `).join("")}

            </table>

        `;

    } catch (error) {

        console.error(error);

        div.innerHTML = `

            <p>
                Erro ao carregar alunos.
            </p>

        `;
    }
}

function formatarData(data) {

    if (!data) return "";

    return new Date(data).toLocaleDateString("pt-BR");
}


function filtrarAlunos(texto) {

    const textoBusca =
        texto.toLowerCase();

    const alunosFiltrados =
        alunosCadastrados.filter(aluno => {

            return (

                aluno.nome
                    ?.toLowerCase()
                    .includes(textoBusca)

                ||

                aluno.email
                    ?.toLowerCase()
                    .includes(textoBusca)

                ||

                aluno.telefone
                    ?.toLowerCase()
                    .includes(textoBusca)

                ||

                aluno.nivelIngles
                    ?.toLowerCase()
                    .includes(textoBusca)

            );

        });

    renderizarAlunos(alunosFiltrados);
}


let alunoEmEdicao = null;

// Recebe só o id: procura o aluno na lista já carregada e,
// se não estiver lá, busca na API.
async function editarAluno(id) {

    let aluno = alunosCadastrados.find(a => a.id === id);

    if (!aluno) {

        try {

            aluno = await api(`/api/Alunos/${encodeURIComponent(id)}`);

        } catch (error) {

            mostrarErro(error, "Erro ao carregar aluno.");
            return;
        }
    }

    tipoEdicao = "aluno";

    idEdicao = aluno.id;

    alunoEmEdicao = aluno;

    document.getElementById("modalTitulo").innerText =
        "Editar Aluno";

    document.getElementById("modalCampos").innerHTML = `

        <input
            id="editNome"
            type="text"
            value="${escapeHtml(aluno.nome)}"
            placeholder="Nome"
        >

        <input
            id="editEmail"
            type="email"
            value="${escapeHtml(aluno.email)}"
            placeholder="E-mail"
        >

        <input
            id="editTelefone"
            type="text"
            value="${escapeHtml(aluno.telefone)}"
            placeholder="Telefone"
        >

        <input
            id="editDataNascimento"
            type="date"
            value="${aluno.dataNascimento
            ? escapeHtml(aluno.dataNascimento.split('T')[0])
            : ''}"
        >

        <input
            id="editNivel"
            type="text"
            value="${escapeHtml(aluno.nivelIngles)}"
            placeholder="Nível"
        >

    `;

    document.getElementById(
        "modalEdicao"
    ).style.display = "flex";
}

async function salvarEdicaoAluno() {

    const alunoAtualizado = {

        id: idEdicao,

        nome: document.getElementById("editNome").value,

        email: document.getElementById("editEmail").value,

        telefone: document.getElementById("editTelefone").value,

        dataNascimento:
            document.getElementById("editDataNascimento").value,

        nivelIngles:
            document.getElementById("editNivel").value,

        // mantém os dados originais
        dataMatricula: alunoEmEdicao.dataMatricula,

        ativo: alunoEmEdicao.ativo
    };

    try {

        await api(`/api/Alunos/${encodeURIComponent(idEdicao)}`, {
            method: "PUT",
            body: alunoAtualizado
        });

        alert("Aluno atualizado com sucesso!");

        document.getElementById("modalEdicao").style.display = "none";

        // recarrega tabela
        renderizarAlunos();

        atualizarDashboard();

    } catch (error) {

        mostrarErro(error, "Erro ao atualizar aluno.");
    }
}


async function excluirAluno(id) {

    if (!confirm("Deseja realmente excluir este aluno?")) {
        return;
    }

    try {

        await api(`/api/Alunos/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        alert("Aluno excluído com sucesso!");

        atualizarDashboard();

        abrirAdminAlunos();

    } catch (error) {

        mostrarErro(error, "Erro ao excluir aluno.");
    }
}


// =========================================
// ADMIN PROFESSORES
// =========================================


async function abrirAdminProfessores() {

    if (!validarLogin()) {
        return;
    }

    const painel = document.getElementById("adminPanel");

    painel.style.display = "block";

    painel.innerHTML = `

        <h3>
            Gerenciar Professores
        </h3>

        <input
            class="admin-search"
            placeholder="Buscar professor pelo nome..."
            oninput="filtrarProfessores(this.value)"
        >

        <div id="listaAdminProfessores">
            Carregando professores...
        </div>

    `;

    try {

        const professoresCadastrados =
            await api("/api/Professores?apenasAtivos=true");

        renderizarProfessores(professoresCadastrados);

    } catch (error) {

        const lista = document.getElementById("listaAdminProfessores");

        if (lista) {
            lista.innerHTML = `
            <p>
                Erro ao carregar professores.
            </p>
        `;
        }

        mostrarErro(error, "Erro ao carregar professores.");

        if (error.tratado) return;
    }

    painel.scrollIntoView({
        behavior: "smooth"
    });
}

function renderizarProfessores(lista) {


    const div = document.getElementById("listaAdminProfessores");


    if (lista.length === 0) {


        div.innerHTML = `
            <p>
                Nenhum professor cadastrado.
            </p>
        `;


        return;
    }


    div.innerHTML = `


        <table class="admin-table">


            <tr>


                <th>Nome</th>


                <th>Email</th>


                <th>Telefone</th>


                <th>Especialidade</th>                

                <th>Ações</th>


            </tr>


            ${lista.map(professor => `


                <tr>


                    <td>${escapeHtml(professor.nome)}</td>


                    <td>${escapeHtml(professor.email)}</td>


                    <td>${escapeHtml(professor.telefone)}</td>


                    <td>${escapeHtml(professor.especialidade)}</td>


                    <td>


                        <button
                        class="btn-edit"
                        data-id="${escapeHtml(professor.id)}"
                        onclick="editarProfessor(this.dataset.id)">


                            Editar


                        </button>


                        <button
                        class="btn-delete"
                        data-id="${escapeHtml(professor.id)}"
                        onclick="excluirProfessor(this.dataset.id)">


                            Excluir


                        </button>


                    </td>


                </tr>


            `).join("")}


        </table>


    `;
}


function filtrarProfessores(valor) {


    const filtrados = professoresCadastrados.filter(professor =>


        professor.nome.toLowerCase().includes(valor.toLowerCase()) ||


        professor.email.toLowerCase().includes(valor.toLowerCase()) ||


        professor.especialidade.toLowerCase().includes(valor.toLowerCase())
    );


    renderizarProfessores(filtrados);
}


async function editarProfessor(id) {

    tipoEdicao = "professor";

    idEdicao = id;

    try {

        const professor = await api(`/api/Professores/${encodeURIComponent(id)}`);

        document.getElementById("modalTitulo").innerText =
            "Editar Professor";

        document.getElementById("modalCampos").innerHTML = `

            <input
                id="editNome"
                type="text"
                value="${escapeHtml(professor.nome)}"
                placeholder="Nome"
            >

            <input
                id="editEmail"
                type="email"
                value="${escapeHtml(professor.email)}"
                placeholder="E-mail"
            >

            <input
                id="editTelefone"
                type="text"
                value="${escapeHtml(professor.telefone)}"
                placeholder="Telefone"
            >

            <input
                id="editEspecialidade"
                type="text"
                value="${escapeHtml(professor.especialidade)}"
                placeholder="Especialidade"
            >

        `;

        document.getElementById(
            "modalEdicao"
        ).style.display = "flex";

    } catch (error) {

        mostrarErro(error, "Erro ao carregar professor.");
    }
}



async function salvarEdicaoProfessor() {

    const professorAtualizado = {

        nome: document.getElementById("editNome").value,

        email: document.getElementById("editEmail").value,

        telefone: document.getElementById("editTelefone").value,

        especialidade:
            document.getElementById("editEspecialidade").value,

        ativo: true
    };

    // validação
    if (
        professorAtualizado.nome === "" ||
        professorAtualizado.email === "" ||
        professorAtualizado.telefone === "" ||
        professorAtualizado.especialidade === ""
    ) {
        alert("Preencha todos os campos.");
        return;
    }

    try {

        await api(`/api/Professores/${encodeURIComponent(idEdicao)}`, {
            method: "PUT",
            body: professorAtualizado
        });

        alert("Professor atualizado com sucesso!");

        document.getElementById(
            "modalEdicao"
        ).style.display = "none";

        atualizarDashboard();

        abrirAdminProfessores();

    } catch (error) {

        mostrarErro(error, "Erro ao editar professor.");
    }
}


async function excluirProfessor(id) {

    const confirmar = confirm(
        "Deseja realmente excluir este professor?"
    );

    if (!confirmar) {
        return;
    }

    try {

        await api(`/api/Professores/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        alert("Professor excluído com sucesso!");

        atualizarDashboard();

        abrirAdminProfessores();

    } catch (error) {

        mostrarErro(error, "Erro ao excluir professor.");
    }
}

// =========================================

async function abrirAdminAulas() {

    if (!validarLogin()) {
        return;
    }

    const painel = document.getElementById("adminPanel");

    painel.style.display = "block";

    painel.innerHTML = `

        <h3>
            Gerenciar Aulas
        </h3>

        <button
            class="btn"
            onclick="abrirFormularioAula()">

            Nova Aula

        </button>

        <div id="listaAulas"></div>

    `;

    await renderizarAulas();

    painel.scrollIntoView({
        behavior: "smooth"
    });
}

async function renderizarAulas() {

    const div =
        document.getElementById("listaAulas");

    // Painel de aulas fechado: nada para redesenhar.
    if (!div) return;

    try {

        const lista =
            await api("/api/Aulas");

        aulasCadastradas = lista;

        if (lista.length === 0) {

            div.innerHTML = `

                <p>
                    Nenhuma aula cadastrada.
                </p>

            `;

            return;
        }

        div.innerHTML = `

            <table class="admin-table">

                <thead>

                    <tr>

                        <th>Título</th>

                        <th>Professor</th>

                        <th>Modalidade</th>

                        <th>Início</th>

                        <th>Fim</th>

                        <th>Vagas</th>

                        <th>Ações</th>

                    </tr>

                </thead>

                <tbody>

                    ${lista.map(aula => `

                        <tr>

                            <td>
                                ${escapeHtml(aula.titulo)}
                            </td>

                            <td>
                                ${escapeHtml(aula.professorNome)}
                            </td>

                            <td>
                                ${escapeHtml(aula.modalidade)}
                            </td>

                            <td>
                                ${escapeHtml(formatarDataHora(
            aula.dataHoraInicio
        ))}
                            </td>

                            <td>
                                ${escapeHtml(formatarDataHora(
            aula.dataHoraFim
        ))}
                            </td>

                            <td>

                                ${escapeHtml(aula.alunosInscritos)}/
                                ${escapeHtml(aula.vagasMaximas)}

                            </td>

                            <td class="acoes-table">

                                <button
                                    class="btn-edit"
                                    data-id="${escapeHtml(aula.id)}"
                                    onclick="editarAula(this.dataset.id)">

                                    Editar

                                </button>

                                <button
                                    class="btn-delete"
                                    data-id="${escapeHtml(aula.id)}"
                                    onclick="excluirAula(this.dataset.id)">

                                    Excluir

                                </button>

                                <button
    class="btn"
    data-id="${escapeHtml(aula.id)}"
    onclick="abrirAlunosAula(this.dataset.id)">

    Alunos

</button>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        `;

    } catch (error) {

        if (div) {
            div.innerHTML = `

            <p>
                Erro ao carregar aulas.
            </p>

        `;
        }

        mostrarErro(error, "Erro ao carregar aulas.");
    }
}

async function editarAula(id) {

    try {

        const aula =
            await api(`/api/Aulas/${encodeURIComponent(id)}`);

        tipoEdicao = "aula";

        idEdicao = id;

        document.getElementById("modalTitulo").innerText =
            "Editar Aula";

        document.getElementById("modalCampos").innerHTML = `

            <input
                id="aulaTitulo"
                type="text"
                placeholder="Título"
                value="${escapeHtml(aula.titulo)}">

            <textarea
                id="aulaDescricao"
                placeholder="Descrição">${escapeHtml(aula.descricao)}</textarea>

            <input
                id="aulaProfessorId"
                type="text"
                placeholder="Professor ID"
                value="${escapeHtml(aula.professorId)}">

            <input
                id="aulaInicio"
                type="datetime-local"
                value="${escapeHtml(formatarInputDate(aula.dataHoraInicio))}">

            <input
                id="aulaFim"
                type="datetime-local"
                value="${escapeHtml(formatarInputDate(aula.dataHoraFim))}">

            <select id="aulaModalidade">

                <option
                    value="Online"
                    ${aula.modalidade === "Online"
                ? "selected"
                : ""}>

                    Online

                </option>

                <option
                    value="Presencial"
                    ${aula.modalidade === "Presencial"
                ? "selected"
                : ""}>

                    Presencial

                </option>

            </select>

            <input
                id="aulaSala"
                type="text"
                placeholder="Sala"
                value="${escapeHtml(aula.sala)}">

            <input
                id="aulaLink"
                type="text"
                placeholder="Link Online"
                value="${escapeHtml(aula.linkOnline)}">

            <input
                id="aulaVagas"
                type="number"
                placeholder="Vagas"
                value="${escapeHtml(aula.vagasMaximas || 0)}">

        `;

        document.getElementById("modalEdicao").style.display =
            "flex";

    } catch (error) {

        mostrarErro(error, "Erro ao carregar aula.");
    }
}

async function excluirAula(id) {

    const confirmar = confirm(
        "Deseja excluir esta aula?"
    );

    if (!confirmar) return;

    try {

        await api(`/api/Aulas/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        abrirAdminAulas();

    } catch (error) {

        mostrarErro(error, "Erro ao excluir aula.");
    }
}

async function inscreverAluno(aulaId) {

    const alunoId =
        document.getElementById("novoAlunoAula").value;

    if (!alunoId) {

        alert("Selecione um aluno.");
        return;
    }

    try {

        const data = await api("/api/Aulas/inscrever", {
            method: "POST",
            body: { alunoId, aulaId }
        });

        alert(data.message);

        abrirAlunosAula(aulaId);

        atualizarDashboard();

    } catch (error) {

        mostrarErro(error, "Erro ao inscrever aluno.");
    }
}

async function registrarPresenca(
    aulaId,
    alunoId,
    presenca
) {

    try {

        const data = await api("/api/Aulas/presenca", {
            method: "PUT",
            body: { aulaId, alunoId, presenca }
        });

        alert(data.message);

        await abrirAlunosAula(aulaId);

    } catch (error) {

        mostrarErro(error, "Erro ao registrar presença.");
    }
}

async function abrirAlunosAula(aulaId) {

    try {

        // inscritos na aula + todos os alunos (para o select)
        const [alunos, todosAlunos] = await Promise.all([
            api(`/api/Aulas/${encodeURIComponent(aulaId)}/alunos`),
            api("/api/Alunos?apenasAtivos=true")
        ]);

        // =========================
        // MODAL
        // =========================
        document.getElementById("modalTitulo").innerText =
            "Alunos da Aula";

        document.getElementById("modalCampos").innerHTML = `

    <div class="form-group">

        <label>
            Inscrever Aluno
        </label>

        <select id="novoAlunoAula">

            <option value="">
                Selecione um aluno
            </option>

            ${todosAlunos.map(aluno => `

                <option value="${escapeHtml(aluno.id)}">

                    ${escapeHtml(aluno.nome)}

                </option>

            `).join("")}

        </select>

    </div>

    <button
        class="btn-save"
        data-aula-id="${escapeHtml(aulaId)}"
        onclick="inscreverAluno(this.dataset.aulaId)">

        Inscrever Aluno

    </button>

    <div class="table-wrapper">

        <table class="admin-table">

            <thead>

                <tr>

                    <th>Aluno</th>

                    <th>Email</th>

                    <th>Presença</th>

                    <th>Ação</th>

                </tr>

            </thead>

            <tbody>

                ${alunos.map(aluno => `

                    <tr>

                        <td>
                            ${escapeHtml(aluno.nome)}
                        </td>

                        <td>
                            ${escapeHtml(aluno.email)}
                        </td>

                        <td>

                            ${aluno.presenca
                ? `<span class="presenca-ok">
                                        ✅ Presente
                                   </span>`

                : `<span class="presenca-false">
                                        ❌ Ausente
                                   </span>`
            }

                        </td>

                        <td>

                            <button
                                class="btn-presenca"
                                data-aula-id="${escapeHtml(aulaId)}"
                                data-aluno-id="${escapeHtml(aluno.id)}"
                                onclick="registrarPresenca(this.dataset.aulaId, this.dataset.alunoId, true)">

                                Marcar Presença

                            </button>

                        </td>

                    </tr>

                `).join("")}

            </tbody>

        </table>

    </div>
`;

        document.getElementById("modalEdicao").style.display =
            "flex";

    } catch (error) {

        mostrarErro(error, "Erro ao carregar alunos da aula.");
    }
}

function formatarDataHora(data) {

    return new Date(data).toLocaleString("pt-BR");
}

function formatarInputDate(data) {

    return data.slice(0, 16);
}

async function salvarEdicao() {

    // =========================
    // ALUNO
    // =========================
    if (tipoEdicao === "aluno") {

        await salvarEdicaoAluno();

        return;
    }

    // =========================
    // PROFESSOR
    // =========================
    if (tipoEdicao === "professor") {

        const professorAtualizado = {

            nome:
                document.getElementById("editNome").value,

            email:
                document.getElementById("editEmail").value,

            telefone:
                document.getElementById("editTelefone").value,

            especialidade:
                document.getElementById("editEspecialidade").value,

            ativo: true
        };

        // =========================
        // VALIDAÇÃO
        // =========================
        if (
            professorAtualizado.nome === "" ||
            professorAtualizado.email === "" ||
            professorAtualizado.telefone === "" ||
            professorAtualizado.especialidade === ""
        ) {

            alert("Preencha todos os campos.");
            return;
        }

        try {

            await api(`/api/Professores/${encodeURIComponent(idEdicao)}`, {
                method: "PUT",
                body: professorAtualizado
            });

            alert(
                "Professor atualizado com sucesso!"
            );

            atualizarDashboard();

            abrirAdminProfessores();

            fecharModal();

        } catch (error) {

            mostrarErro(error, "Erro ao atualizar professor.");
        }

        return;
    }

    // ========================================
    // NOVA AULA OU EDITAR AULA
    // ========================================
    if (
        tipoEdicao === "novaAula" ||
        tipoEdicao === "aula"
    ) {

        const body = {

            titulo:
                document.getElementById("aulaTitulo").value,

            descricao:
                document.getElementById("aulaDescricao").value,

            professorId:
                document.getElementById("aulaProfessorId").value,

            dataHoraInicio:
                document.getElementById("aulaInicio").value,

            dataHoraFim:
                document.getElementById("aulaFim").value,

            modalidade:
                document.getElementById("aulaModalidade").value,

            sala:
                document.getElementById("aulaSala").value,

            linkOnline:
                document.getElementById("aulaLink").value,

            vagasMaximas:
                parseInt(
                    document.getElementById("aulaVagas").value
                )
        };

        // =========================
        // VALIDAÇÃO
        // =========================
        if (
            body.titulo.trim() === "" ||
            body.professorId.trim() === "" ||
            body.dataHoraInicio === "" ||
            body.dataHoraFim === "" ||
            body.modalidade === "" ||
            isNaN(body.vagasMaximas)
        ) {

            alert(
                "Preencha todos os campos obrigatórios."
            );

            return;
        }

        try {

            // =========================
            // CRIAR NOVA AULA
            // =========================
            if (
                tipoEdicao === "novaAula" ||
                idEdicao === null
            ) {

                await api("/api/Aulas", {
                    method: "POST",
                    body
                });

                alert(
                    "Aula criada com sucesso!"
                );
            }

            // =========================
            // EDITAR AULA
            // =========================
            else {

                await api(`/api/Aulas/${encodeURIComponent(idEdicao)}`, {
                    method: "PUT",
                    body
                });

                alert(
                    "Aula atualizada com sucesso!"
                );
            }

            fecharModal();

            await renderizarAulas();

            await atualizarDashboard();

        } catch (error) {

            mostrarErro(error, "Erro ao salvar aula.");
        }

        return;
    }
}


function fecharModal() {


    document.getElementById("modalEdicao").style.display = "none";
}


// =========================================
// QUALIDADE ISO 25010
// =========================================


function abrirQualidade(tipo) {


    const painel = document.getElementById("painelQualidade");


    painel.style.display = "block";


    // =====================================
    // DESEMPENHO
    // =====================================


    if (tipo === "desempenho") {


        painel.innerHTML = `


            <h3>
                <i class="fas fa-gauge-high"></i>
                Desempenho do Sistema
            </h3>


            <div class="qualidade-grid">


                <div class="qualidade-box">


                    <h4>
                        Tempo de Resposta
                    </h4>


                    <p>
                        Meta: responder em menos de 1 segundo.
                    </p>


                    <div class="progress">
                        <span class="progress-green"
                        style="width:92%"></span>
                    </div>


                    <div class="status status-green">
                        Excelente
                    </div>


                </div>


                <div class="qualidade-box">


                    <h4>
                        Velocidade
                    </h4>


                    <p>
                        Meta: abrir a página inicial em poucos segundos, também no celular.
                    </p>


                    <div class="progress">
                        <span class="progress-green"
                        style="width:88%"></span>
                    </div>


                    <div class="status status-green">
                        Excelente
                    </div>


                </div>


                <div class="qualidade-box">


                    <h4>
                        Uso de Memória
                    </h4>


                    <p>
                        Meta: consumo baixo, compatível com o plano gratuito do servidor.
                    </p>


                    <div class="progress">
                        <span class="progress-yellow"
                        style="width:70%"></span>
                    </div>


                    <div class="status status-yellow">
                        Bom
                    </div>


                </div>


                <div class="qualidade-box">


                    <h4>
                        Usuários Online
                    </h4>


                    <p>
                        Meta: atender vários usuários ao mesmo tempo sem perder desempenho.
                    </p>


                    <div class="progress">
                        <span class="progress-green"
                        style="width:80%"></span>
                    </div>


                    <div class="status status-green">
                        Estável
                    </div>


                </div>


            </div>


        `;
    }


    // =====================================
    // SEGURANÇA
    // =====================================


    if (tipo === "seguranca") {


        painel.innerHTML = `


            <h3>
                <i class="fas fa-lock"></i>
                Segurança do Sistema
            </h3>


            <div class="qualidade-grid">


                <div class="qualidade-box">


                    <h4>
                        <i class="fas fa-shield-halved"></i>
                        Autenticação
                    </h4>


                    <p>
                        Login protegido com validação segura.
                    </p>


                    <div class="status status-green">
                        Seguro
                    </div>


                </div>


                <div class="qualidade-box">


                    <h4>
                        <i class="fas fa-user-lock"></i>
                        Proteção de Dados
                    </h4>


                    <p>
                        Senhas guardadas com hash (BCrypt); dados pessoais acessíveis só com login.
                    </p>


                    <div class="status status-green">
                        Seguro
                    </div>


                </div>


                <div class="qualidade-box">


                    <h4>
                        <i class="fas fa-key"></i>
                        Criptografia
                    </h4>


                    <p>
                        SSL/TLS ativo.
                    </p>


                    <div class="status status-green">
                        Ativa
                    </div>


                </div>


                <div class="qualidade-box">


                    <h4>
                        <i class="fas fa-fingerprint"></i>
                        Controle de Acesso
                    </h4>


                    <p>
                        Restrição para administradores.
                    </p>


                    <div class="status status-yellow">
                        Atenção
                    </div>


                </div>


            </div>


        `;
    }


    // =====================================
    // USABILIDADE
    // =====================================


    if (tipo === "usabilidade") {


        painel.innerHTML = `


            <h3>
                <i class="fas fa-face-smile"></i>
                Usabilidade do Sistema
            </h3>


            <div class="qualidade-grid">


                <div class="qualidade-box">


                    <h4>
                        Satisfação
                    </h4>


                    <div class="estrelas">
                        ★★★★★
                    </div>


                    <p>
                        Meta: alta aprovação, medida por pesquisa de satisfação.
                    </p>


                    <div class="progress">
                        <span class="progress-green"
                        style="width:95%"></span>
                    </div>


                </div>


                <div class="qualidade-box">


                    <h4>
                        Interface
                    </h4>


                    <p>
                        Meta: interface intuitiva e moderna.
                    </p>


                    <div class="progress">
                        <span class="progress-green"
                        style="width:90%"></span>
                    </div>


                </div>


                <div class="qualidade-box">


                    <h4>
                        Exemplos de feedback
                    </h4>


                    <p>
                        “Sistema rápido e organizado.”
                    </p>


                    <p>
                        “Muito fácil cadastrar alunos.”
                    </p>


                    <p>
                        “Visual moderno.”
                    </p>


                </div>


                <div class="qualidade-box">


                    <h4>
                        Aprovação
                    </h4>


                    <p>
                        Meta: boa aceitação dos usuários.
                    </p>


                    <div class="status status-green">
                        Excelente
                    </div>


                </div>


            </div>


        `;
    }


    // =====================================
    // CONFIABILIDADE
    // =====================================


    if (tipo === "confiabilidade") {


        painel.innerHTML = `


            <h3>
                <i class="fas fa-circle-check"></i>
                Confiabilidade do Sistema
            </h3>


            <div class="qualidade-grid">


                <div class="qualidade-box">


                    <h4>
                        Tempo de Atividade
                    </h4>


                    <p>
                        Meta: alta disponibilidade. No plano gratuito, a API hiberna após ~15 min sem uso.
                    </p>


                    <div class="progress">
                        <span class="progress-green"
                        style="width:99%"></span>
                    </div>


                    <div class="status status-green">
                        Alta Confiabilidade
                    </div>


                </div>


                <div class="qualidade-box">


                    <h4>
                        Falhas Registradas
                    </h4>


                    <p>
                        Meta: nenhuma falha crítica; toda falha registrada e corrigida.
                    </p>


                    <div class="status status-green">
                        Estável
                    </div>


                </div>


                <div class="qualidade-box">


                    <h4>
                        Disponibilidade
                    </h4>


                    <p>
                        Meta: sistema disponível 24h.
                    </p>


                    <div class="progress">
                        <span class="progress-green"
                        style="width:97%"></span>
                    </div>


                </div>


                <div class="qualidade-box">


                    <h4>
                        Histórico
                    </h4>


                    <p>
                        Meta: nenhuma queda crítica.
                    </p>


                    <div class="status status-green">
                        Excelente
                    </div>


                </div>


            </div>


        `;
    }


    // Os valores do painel são metas de projeto, não medições reais.
    const titulo = painel.querySelector("h3");

    if (titulo) {
        titulo.insertAdjacentHTML("afterend", `
            <p class="selo-ilustrativo">
                <i class="fas fa-circle-info"></i>
                Exemplo — valores ilustrativos
            </p>
            <p class="nota-ilustrativa">
                Os números e indicadores abaixo são metas do projeto,
                não medições do sistema em uso.
            </p>
        `);
    }

    painel.scrollIntoView({
        behavior: "smooth"
    });
}


// =========================================
// CONTATO
// =========================================


document.getElementById("formContato").addEventListener(
    "submit",
    function (e) {


        e.preventDefault();


        alert("Mensagem enviada com sucesso!");


        document.getElementById("formContato").reset();
    }
);


// =========================================
// INICIAR SISTEMA
// =========================================


// Token vencido de uma visita anterior: encerra a sessão em silêncio.
if (obterToken() && !usuarioEstaLogado()) {
    limparSessao();
}

atualizarPermissoes();

atualizarUsuarioLogado();

atualizarDashboard();


