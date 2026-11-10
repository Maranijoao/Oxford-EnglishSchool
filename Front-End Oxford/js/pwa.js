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

function instalarApp() {
    if (!eventoInstalacao) return;
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
