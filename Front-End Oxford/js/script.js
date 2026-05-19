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
        ).value;

    const senha =
        document.getElementById(
            "loginSenha"
        ).value;

    if (email === "" || senha === "") {

        alert("Preencha e-mail e senha.");

        return;
    }

    try {

        const response = await fetch(
            "https://localhost:7131/api/Auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    senha
                })
            }
        );

        if (!response.ok) {

            throw new Error(
                "Usuário ou senha inválidos."
            );
        }

        const data = await response.json();

        console.log("LOGIN:", data);

        // TOKEN
        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "usuarioNome",
            data.nome
        );

        localStorage.setItem(
            "usuarioEmail",
            data.email
        );

        alert(
            "Login realizado com sucesso!"
        );

        fecharLogin();

        atualizarUsuarioLogado();

    } catch (error) {

        console.error(error);

        alert(
            "Erro ao realizar login."
        );
    }
}

function atualizarUsuarioLogado() {

    const nome =
        localStorage.getItem(
            "usuarioNome"
        );

    const div =
        document.getElementById(
            "usuarioLogado"
        );

    if (nome) {

        div.innerHTML = `

            <i class="fas fa-user-circle"></i>
            ${nome}

            <button
                onclick="logout()"
                class="btn-logout"
            >
                Sair
            </button>
        `;
    }
}

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("usuarioNome");

    localStorage.removeItem("usuarioEmail");

    location.reload();
}

// =========================================

function usuarioEstaLogado() {

    const token =
        localStorage.getItem("token");

    return token !== null;
}

function validarLogin() {

    if (!usuarioEstaLogado()) {

        alert(
            "Você precisa estar logado."
        );

        abrirLogin();

        return false;
    }

    return true;
}

function atualizarPermissoes() {

    const adminSection =
        document.getElementById("admin");

    if (!usuarioEstaLogado()) {

        adminSection.style.display =
            "none";

    } else {

        adminSection.style.display =
            "block";
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


async function atualizarDashboard() {

    const totalAlunos =
        document.getElementById("totalAlunos");

    const totalProfessores =
        document.getElementById("totalProfessores");

    const totalAulas =
        document.getElementById("totalAulas");

    const totalNiveis =
        document.getElementById("totalNiveis");

    const contadorAlunos =
        document.getElementById("contadorAlunos");

    const contadorProfessores =
        document.getElementById("contadorProfessores");

    const contadorAulas =
        document.getElementById("contadorAulas");

    try {

        // =========================
        // BUSCAR AULAS
        // =========================
        const responseAulas = await fetch(
            "https://localhost:7131/api/Aulas",
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!responseAulas.ok) {
            throw new Error("Erro ao buscar aulas.");
        }

        aulasCadastradas =
            await responseAulas.json();

        // =========================
        // BUSCAR ALUNOS
        // =========================
        const responseAlunos = await fetch(
            "https://localhost:7131/api/Alunos?apenasAtivos=true",
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!responseAlunos.ok) {
            throw new Error("Erro ao buscar alunos.");
        }

        alunosCadastrados =
            await responseAlunos.json();

        // =========================
        // BUSCAR PROFESSORES
        // =========================
        const responseProfessores = await fetch(
            "https://localhost:7131/api/Professores?apenasAtivos=true",
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!responseProfessores.ok) {
            throw new Error(
                "Erro ao buscar professores."
            );
        }

        professoresCadastrados =
            await responseProfessores.json();

        // =========================
        // TOTAL ALUNOS
        // =========================
        if (totalAlunos) {

            totalAlunos.innerText =
                alunosCadastrados.length;
        }

        // =========================
        // TOTAL PROFESSORES
        // =========================
        if (totalProfessores) {

            totalProfessores.innerText =
                professoresCadastrados.length;
        }

        // =========================
        // TOTAL AULAS
        // =========================
        if (totalAulas) {

            totalAulas.innerText =
                (alunosCadastrados.length * 2) + "h";
        }

        // =========================
        // TOTAL NÍVEIS
        // =========================
        if (totalNiveis) {

            const niveis = [

                ...new Set(
                    alunosCadastrados.map(
                        aluno =>
                            aluno.nivel ||
                            aluno.nivelIngles
                    )
                )

            ];

            totalNiveis.innerText =
                niveis.length;
        }

        // =========================
        // CONTADOR ALUNOS
        // =========================
        if (contadorAlunos) {

            contadorAlunos.innerText =
                alunosCadastrados.length +
                " alunos cadastrados";
        }

        // =========================
        // CONTADOR PROFESSORES
        // =========================
        if (contadorProfessores) {

            contadorProfessores.innerText =
                professoresCadastrados.length +
                " professores cadastrados";
        }

        // =========================
        // CONTADOR AULAS
        // =========================
        if (contadorAulas) {

            contadorAulas.innerText =
                aulasCadastradas.length +
                " aulas cadastradas";
        }

    } catch (error) {

        console.error(error);

        alert(
            "Erro ao atualizar dashboard."
        );
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

        const response = await fetch("https://localhost:7131/api/Alunos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(aluno)
        });

        if (!response.ok) {
            throw new Error("Erro ao cadastrar aluno.");
        }

        const alunoCriado = await response.json();

        console.log("Aluno criado:", alunoCriado);

        alert("Aluno cadastrado com sucesso!");

        atualizarDashboard();

        abrirFormularioAluno();

    } catch (error) {

        console.error(error);

        alert("Erro ao conectar com a API.");
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

        const response = await fetch(
            "https://localhost:7131/api/Professores",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(professor)
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao cadastrar professor.");
        }

        const professorCriado = await response.json();

        console.log("Professor criado:", professorCriado);

        alert("Professor cadastrado com sucesso!");

        atualizarDashboard();

        abrirFormularioProfessor();

    } catch (error) {

        console.error(error);

        alert("Erro ao conectar com a API.");
    }
}


// =========================================

async function abrirFormularioAula() {

    const token = localStorage.getItem("token");

    try {

        // =========================
        // BUSCAR PROFESSORES
        // =========================
        const response = await fetch(
            "https://localhost:7131/api/Professores?apenasAtivos=true",
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "Erro ao carregar professores."
            );
        }

        const professores = await response.json();

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

                            <option value="${professor.id}">

                                ${professor.nome}

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


function mostrarRelatorio() {

    if (!validarLogin()) {
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
                    <strong>Nome:</strong> ${aluno.nome}
                </p>


                <p>
                    <strong>Email:</strong> ${aluno.email}
                </p>


                <p>
                    <strong>Telefone:</strong> ${aluno.telefone}
                </p>


                <p>
                    <strong>Idade:</strong> ${aluno.idade}
                </p>


                <p>
                    <strong>Nível:</strong> ${aluno.nivel}
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
                    <strong>Nome:</strong> ${professor.nome}
                </p>


                <p>
                    <strong>Email:</strong> ${professor.email}
                </p>


                <p>
                    <strong>Telefone:</strong> ${professor.telefone}
                </p>


                <p>
                    <strong>Especialidade:</strong> ${professor.especialidade}
                </p>


                <p>
                    <strong>Horário:</strong> ${professor.horario}
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
            ${texto}
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

        const response = await fetch(
            "https://localhost:7131/api/Alunos?apenasAtivos=true",
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar alunos.");
        }

        alunosCadastrados =
            await response.json();

        console.log(
            "Alunos encontrados:",
            alunosCadastrados
        );

        renderizarAlunos(alunosCadastrados);

    } catch (error) {

        console.error(error);

        document.getElementById(
            "listaAdminAlunos"
        ).innerHTML = `

            <p>
                Erro ao carregar alunos.
            </p>

        `;

        alert("Erro ao conectar com a API.");
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

            const response = await fetch(
                "https://localhost:7131/api/Alunos?apenasAtivos=true",
                {
                    method: "GET",

                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Erro ao buscar alunos."
                );
            }

            lista = await response.json();

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
                            ${aluno.nome || "-"}
                        </td>

                        <td>
                            ${aluno.email || "-"}
                        </td>

                        <td>
                            ${aluno.telefone || "-"}
                        </td>

                        <td>
                            ${aluno.dataNascimento
                ? formatarData(
                    aluno.dataNascimento
                )
                : "-"
            }
                        </td>

                        <td>
                            ${aluno.nivelIngles || "-"}
                        </td>

                        <td>

                            <button
                                class="btn-edit"
                                onclick='editarAluno(${JSON.stringify(aluno)})'
                            >

                                Editar

                            </button>

                            <button
                                class="btn-delete"
                                onclick="excluirAluno('${aluno.id}')"
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

function editarAluno(aluno) {

    tipoEdicao = "aluno";

    idEdicao = aluno.id;

    alunoEmEdicao = aluno;

    document.getElementById("modalTitulo").innerText =
        "Editar Aluno";

    document.getElementById("modalCampos").innerHTML = `

        <input
            id="editNome"
            type="text"
            value="${aluno.nome}"
            placeholder="Nome"
        >

        <input
            id="editEmail"
            type="email"
            value="${aluno.email}"
            placeholder="E-mail"
        >

        <input
            id="editTelefone"
            type="text"
            value="${aluno.telefone}"
            placeholder="Telefone"
        >

        <input
            id="editDataNascimento"
            type="date"
            value="${aluno.dataNascimento
            ? aluno.dataNascimento.split('T')[0]
            : ''}"
        >

        <input
            id="editNivel"
            type="text"
            value="${aluno.nivelIngles}"
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

        const response = await fetch(
            `https://localhost:7131/api/Alunos/${idEdicao}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(alunoAtualizado)
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao atualizar aluno.");
        }

        alert("Aluno atualizado com sucesso!");

        document.getElementById("modalEdicao").style.display = "none";

        // recarrega tabela
        renderizarAlunos();

        atualizarDashboard();

    } catch (error) {

        console.error(error);

        alert("Erro ao conectar com a API.");
    }
}


async function excluirAluno(id) {

    if (!confirm("Deseja realmente excluir este aluno?")) {
        return;
    }

    try {

        const response = await fetch(
            `https://localhost:7131/api/Alunos/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao excluir aluno.");
        }

        alert("Aluno excluído com sucesso!");

        atualizarDashboard();

        abrirAdminAlunos();

    } catch (error) {

        console.error(error);

        alert("Erro ao conectar com a API.");
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

        const response = await fetch(
            "https://localhost:7131/api/Professores?apenasAtivos=true",
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar professores.");
        }

        const professoresCadastrados = await response.json();

        console.log(
            "Professores encontrados:",
            professoresCadastrados
        );

        renderizarProfessores(professoresCadastrados);

    } catch (error) {

        console.error(error);

        document.getElementById(
            "listaAdminProfessores"
        ).innerHTML = `
            <p>
                Erro ao carregar professores.
            </p>
        `;

        alert("Erro ao conectar com a API.");
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


                    <td>${professor.nome}</td>


                    <td>${professor.email}</td>


                    <td>${professor.telefone}</td>


                    <td>${professor.especialidade}</td>


                    <td>


                        <button
                        class="btn-edit"
                        onclick="editarProfessor('${professor.id}')">


                            Editar


                        </button>


                        <button
                        class="btn-delete"
                        onclick="excluirProfessor('${professor.id}')">


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

        const response = await fetch(
            `https://localhost:7131/api/Professores/${id}`,
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar professor.");
        }

        const professor = await response.json();

        console.log("Professor encontrado:", professor);

        document.getElementById("modalTitulo").innerText =
            "Editar Professor";

        document.getElementById("modalCampos").innerHTML = `

            <input
                id="editNome"
                type="text"
                value="${professor.nome}"
                placeholder="Nome"
            >

            <input
                id="editEmail"
                type="email"
                value="${professor.email}"
                placeholder="E-mail"
            >

            <input
                id="editTelefone"
                type="text"
                value="${professor.telefone}"
                placeholder="Telefone"
            >

            <input
                id="editEspecialidade"
                type="text"
                value="${professor.especialidade}"
                placeholder="Especialidade"
            >

        `;

        document.getElementById(
            "modalEdicao"
        ).style.display = "flex";

    } catch (error) {

        console.error(error);

        alert("Erro ao carregar professor.");
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

        const response = await fetch(
            `https://localhost:7131/api/Professores/${idEdicao}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(professorAtualizado)
            }
        );

        if (!response.ok) {

            const erro = await response.text();

            console.error("Erro API:", erro);

            throw new Error("Erro ao editar professor.");
        }

        alert("Professor atualizado com sucesso!");

        document.getElementById(
            "modalEdicao"
        ).style.display = "none";

        atualizarDashboard();

        abrirAdminProfessores();

    } catch (error) {

        console.error(error);

        alert("Erro ao conectar com a API.");
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

        const response = await fetch(
            `https://localhost:7131/api/Professores/${id}`,
            {
                method: "DELETE",

                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao excluir professor.");
        }

        alert("Professor excluído com sucesso!");

        atualizarDashboard();

        abrirAdminProfessores();

    } catch (error) {

        console.error(error);

        alert("Erro ao conectar com a API.");
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

    const token =
        localStorage.getItem("token");

    try {

        const response = await fetch(
            "https://localhost:7131/api/Aulas",
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "Erro ao buscar aulas."
            );
        }

        const lista =
            await response.json();

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
                                ${aula.titulo}
                            </td>

                            <td>
                                ${aula.professorNome}
                            </td>

                            <td>
                                ${aula.modalidade}
                            </td>

                            <td>
                                ${formatarDataHora(
            aula.dataHoraInicio
        )}
                            </td>

                            <td>
                                ${formatarDataHora(
            aula.dataHoraFim
        )}
                            </td>

                            <td>

                                ${aula.alunosInscritos}/
                                ${aula.vagasMaximas}

                            </td>

                            <td class="acoes-table">

                                <button
                                    class="btn-edit"
                                    onclick="editarAula('${aula.id}')">

                                    Editar

                                </button>

                                <button
                                    class="btn-delete"
                                    onclick="excluirAula('${aula.id}')">

                                    Excluir

                                </button>

                                <button
    class="btn"
    onclick="abrirAlunosAula('${aula.id}')">

    Alunos

</button>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        `;

    } catch (error) {

        console.error(error);

        div.innerHTML = `

            <p>
                Erro ao carregar aulas.
            </p>

        `;
    }
}

async function editarAula(id) {

    const token =
        localStorage.getItem("token");

    try {

        const response = await fetch(
            `https://localhost:7131/api/Aulas/${id}`,
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "Erro ao buscar aula."
            );
        }

        const aula =
            await response.json();

        tipoEdicao = "aula";

        idEdicao = id;

        document.getElementById("modalTitulo").innerText =
            "Editar Aula";

        document.getElementById("modalCampos").innerHTML = `

            <input
                id="aulaTitulo"
                type="text"
                placeholder="Título"
                value="${aula.titulo || ""}">

            <textarea
                id="aulaDescricao"
                placeholder="Descrição">${aula.descricao || ""}</textarea>

            <input
                id="aulaProfessorId"
                type="text"
                placeholder="Professor ID"
                value="${aula.professorId || ""}">

            <input
                id="aulaInicio"
                type="datetime-local"
                value="${formatarInputDate(aula.dataHoraInicio)}">

            <input
                id="aulaFim"
                type="datetime-local"
                value="${formatarInputDate(aula.dataHoraFim)}">

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
                value="${aula.sala || ""}">

            <input
                id="aulaLink"
                type="text"
                placeholder="Link Online"
                value="${aula.linkOnline || ""}">

            <input
                id="aulaVagas"
                type="number"
                placeholder="Vagas"
                value="${aula.vagasMaximas || 0}">

        `;

        document.getElementById("modalEdicao").style.display =
            "flex";

    } catch (error) {

        console.error(error);

        alert(
            "Erro ao carregar aula."
        );
    }
}

async function excluirAula(id) {

    const confirmar = confirm(
        "Deseja excluir esta aula?"
    );

    if (!confirmar) return;

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `https://localhost:7131/api/Aulas/${id}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao excluir aula.");
        }

        abrirAdminAulas();

    } catch (error) {

        console.error(error);

        alert("Erro ao excluir aula.");
    }
}

async function inscreverAluno(aulaId) {

    const token = localStorage.getItem("token");

    const alunoId =
        document.getElementById("novoAlunoAula").value;

    if (!alunoId) {

        alert("Selecione um aluno.");
        return;
    }

    try {

        const response = await fetch(
            "https://localhost:7131/api/Aulas/inscrever",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    alunoId,
                    aulaId
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);
            return;
        }

        alert(data.message);

        abrirAlunosAula(aulaId);

        atualizarDashboard();

    } catch (error) {

        console.error(error);

        alert(
            "Erro ao inscrever aluno."
        );
    }
}

async function registrarPresenca(
    aulaId,
    alunoId,
    presenca
) {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            "https://localhost:7131/api/Aulas/presenca",
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    aulaId,
                    alunoId,
                    presenca
                })
            }
        );

        const data = await response.json();

        alert(data.message);

        await abrirAlunosAula(aulaId);

    } catch (error) {

        console.error(error);

        alert("Erro ao registrar presença.");
    }
}

async function abrirAlunosAula(aulaId) {

    const token = localStorage.getItem("token");

    try {

        // =========================
        // BUSCAR ALUNOS INSCRITOS
        // =========================
        const response = await fetch(
            `https://localhost:7131/api/Aulas/${aulaId}/alunos`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "Erro ao carregar alunos."
            );
        }

        const alunos = await response.json();

        // =========================
        // BUSCAR TODOS OS ALUNOS
        // =========================
        const responseTodos = await fetch(
            "https://localhost:7131/api/Alunos?apenasAtivos=true",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const todosAlunos =
            await responseTodos.json();

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

                <option value="${aluno.id}">

                    ${aluno.nome}

                </option>

            `).join("")}

        </select>

    </div>

    <button
        class="btn-save"
        onclick="inscreverAluno('${aulaId}')">

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
                            ${aluno.nome}
                        </td>

                        <td>
                            ${aluno.email}
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
                                onclick="
                                    registrarPresenca(
                                        '${aulaId}',
                                        '${aluno.id}',
                                        true
                                    )
                                ">

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

        console.error(error);

        alert(
            "Erro ao carregar alunos da aula."
        );
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

        alunosCadastrados =
            alunosCadastrados.map(aluno => {

                if (aluno.id === idEdicao) {

                    return {

                        id: aluno.id,

                        nome:
                            document.getElementById("editNome").value,

                        email:
                            document.getElementById("editEmail").value,

                        telefone:
                            document.getElementById("editTelefone").value,

                        idade:
                            document.getElementById("editIdade").value,

                        nivel:
                            document.getElementById("editNivel").value
                    };
                }

                return aluno;
            });

        salvarStorage();

        atualizarDashboard();

        abrirAdminAlunos();

        fecharModal();

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

            const response = await fetch(
                `https://localhost:7131/api/Professores/${idEdicao}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(
                        professorAtualizado
                    )
                }
            );

            if (!response.ok) {

                const erro =
                    await response.text();

                console.error("Erro API:", erro);

                throw new Error(
                    "Erro ao atualizar professor."
                );
            }

            alert(
                "Professor atualizado com sucesso!"
            );

            atualizarDashboard();

            abrirAdminProfessores();

            fecharModal();

        } catch (error) {

            console.error(error);

            alert(
                "Erro ao conectar com a API."
            );
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

        const token =
            localStorage.getItem("token");

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

                console.log(
                    "CRIANDO AULA:",
                    body
                );

                const response = await fetch(
                    "https://localhost:7131/api/Aulas",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify(body)
                    }
                );

                if (!response.ok) {

                    const erro =
                        await response.text();

                    console.error(
                        "ERRO API:",
                        erro
                    );

                    throw new Error(
                        "Erro ao criar aula."
                    );
                }

                alert(
                    "Aula criada com sucesso!"
                );
            }

            // =========================
            // EDITAR AULA
            // =========================
            else {

                console.log(
                    "EDITANDO AULA:",
                    body
                );

                const response = await fetch(
                    `https://localhost:7131/api/Aulas/${idEdicao}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify(body)
                    }
                );

                if (!response.ok) {

                    const erro =
                        await response.text();

                    console.error(
                        "ERRO API:",
                        erro
                    );

                    throw new Error(
                        "Erro ao atualizar aula."
                    );
                }

                alert(
                    "Aula atualizada com sucesso!"
                );
            }

            fecharModal();

            await renderizarAulas();

            await atualizarDashboard();

        } catch (error) {

            console.error(error);

            alert("Erro ao salvar aula.");
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
                        Média de 0.8 segundos.
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
                        Carregamento rápido.
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
                        Consumo otimizado.
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
                        127 usuários conectados.
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
                        Dados criptografados.
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
                        95% dos usuários aprovam o sistema.
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
                        Interface intuitiva e moderna.
                    </p>


                    <div class="progress">
                        <span class="progress-green"
                        style="width:90%"></span>
                    </div>


                </div>


                <div class="qualidade-box">


                    <h4>
                        Feedbacks
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
                        Excelente aceitação dos usuários.
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
                        99.8% uptime mensal.
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
                        Apenas 2 falhas leves.
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
                        Sistema disponível 24h.
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
                        Sem quedas críticas.
                    </p>


                    <div class="status status-green">
                        Excelente
                    </div>


                </div>


            </div>


        `;
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


atualizarDashboard();

atualizarUsuarioLogado();


