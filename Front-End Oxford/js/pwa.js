// ─────────────────────────────────────────────────────────────
// PWA: registro do service worker, botão "Instalar app"
// e aviso de modo offline.
// ─────────────────────────────────────────────────────────────

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./sw.js")
            .catch((err) => console.warn("Service worker não registrado:", err));
    });
}

// Botão de instalação (Chrome/Edge/Android)
let eventoInstalacao = null;

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    eventoInstalacao = e;
    const btn = document.getElementById("btnInstalarApp");
    if (btn) btn.hidden = false;
});

// iPhone/iPad: nenhum navegador do iOS dispara "beforeinstallprompt".
// A instalação é manual (Compartilhar → Adicionar à Tela de Início),
// então o botão abre um passo a passo.
function ehIOS() {
    const ua = navigator.userAgent;
    const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    return /iPhone|iPad|iPod/i.test(ua) || iPadOS;
}

function appJaInstalado() {
    return window.navigator.standalone === true ||
        window.matchMedia("(display-mode: standalone)").matches;
}

function prepararInstalacaoIOS() {
    if (!ehIOS() || appJaInstalado()) return;
    const btn = document.getElementById("btnInstalarApp");
    if (btn) btn.hidden = false;
}

function abrirInstrucoesIOS() {
    const modal = document.getElementById("modalInstalarIOS");
    if (modal) modal.style.display = "flex";
}

function fecharInstrucoesIOS() {
    const modal = document.getElementById("modalInstalarIOS");
    if (modal) modal.style.display = "none";
}

window.addEventListener("load", prepararInstalacaoIOS);

function instalarApp() {
    if (!eventoInstalacao) {
        if (ehIOS()) abrirInstrucoesIOS();
        return;
    }
    eventoInstalacao.prompt();
    eventoInstalacao.userChoice.finally(() => {
        eventoInstalacao = null;
        const btn = document.getElementById("btnInstalarApp");
        if (btn) btn.hidden = true;
    });
}

window.addEventListener("appinstalled", () => {
    const btn = document.getElementById("btnInstalarApp");
    if (btn) btn.hidden = true;
});

// Faixa de aviso quando a conexão cai
function atualizarStatusConexao() {
    const aviso = document.getElementById("avisoOffline");
    if (aviso) aviso.hidden = navigator.onLine;
}

window.addEventListener("online", atualizarStatusConexao);
window.addEventListener("offline", atualizarStatusConexao);
window.addEventListener("load", atualizarStatusConexao);
