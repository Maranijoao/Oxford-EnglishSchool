// ─────────────────────────────────────────────────────────────
// Ajustes para celular
//  • menu hambúrguer no cabeçalho;
//  • rótulos nas células das tabelas do admin, para que no celular
//    cada linha vire um "card" (o CSS usa o atributo data-label).
// ─────────────────────────────────────────────────────────────

function alternarMenu(forcarAberto) {
    const header = document.querySelector("header");
    const botao = document.querySelector(".menu-toggle");
    if (!header || !botao) return;

    const aberto = typeof forcarAberto === "boolean"
        ? forcarAberto
        : !header.classList.contains("menu-aberto");

    header.classList.toggle("menu-aberto", aberto);
    botao.setAttribute("aria-expanded", String(aberto));
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    const icone = botao.querySelector("i");
    if (icone) icone.className = aberto ? "fa-solid fa-xmark" : "fa-solid fa-bars";
}

// Fecha o menu ao escolher um item ou tocar fora dele
document.addEventListener("click", (e) => {
    const header = document.querySelector("header");
    if (!header || !header.classList.contains("menu-aberto")) return;

    const caminho = e.composedPath();
    const dentroHeader = caminho.includes(header);
    if (caminho.some((el) => el.classList && el.classList.contains("menu-toggle"))) return;

    const clicouItem = dentroHeader &&
        caminho.some((el) => el.matches && el.matches("#menuPrincipal a, #menuPrincipal button"));
    const clicouFora = !dentroHeader;

    if (clicouItem || clicouFora) alternarMenu(false);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") alternarMenu(false);
});

// Volta ao estado normal ao passar para a largura de desktop
window.matchMedia("(min-width: 993px)").addEventListener("change", (mq) => {
    if (mq.matches) alternarMenu(false);
});

// ── Tabelas responsivas ───────────────────────────────────────
function rotularTabelas(raiz = document) {
    raiz.querySelectorAll("table.admin-table").forEach((tabela) => {
        const linhas = [...tabela.querySelectorAll("tr")];
        const cabecalho = linhas.find((tr) => tr.querySelector("th"));
        if (!cabecalho) return;

        cabecalho.classList.add("linha-cabecalho");
        const rotulos = [...cabecalho.querySelectorAll("th")]
            .map((th) => th.textContent.trim());

        linhas
            .filter((tr) => tr !== cabecalho)
            .forEach((tr) => {
                [...tr.children].forEach((td, i) => {
                    if (td.tagName === "TD" && rotulos[i] && !td.dataset.label) {
                        td.dataset.label = rotulos[i];
                    }
                });
            });
    });
}

// As tabelas são criadas dinamicamente pelo script.js
new MutationObserver(() => rotularTabelas())
    .observe(document.body, { childList: true, subtree: true });

rotularTabelas();
