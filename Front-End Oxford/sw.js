// ─────────────────────────────────────────────────────────────
// Service Worker — Oxford English School (PWA)
//
// Estratégias:
//  • App shell (HTML/CSS/JS/ícones): pré-cache na instalação,
//    servido do cache e atualizado em segundo plano.
//  • GET na API sem login (só o dashboard público): network-first;
//    sem rede, devolve a última resposta salva.
//  • GET na API com "Authorization": sempre na rede e NUNCA salvo
//    no cache, para que listas com dados pessoais não fiquem no
//    aparelho depois do logout.
//  • POST/PUT/DELETE: sempre direto na rede (nunca cacheados).
//  • CDNs (Font Awesome etc.): stale-while-revalidate.
// Ao alterar arquivos do app, incremente VERSION.
// ─────────────────────────────────────────────────────────────

const VERSION = "v8";
const SHELL_CACHE = `oxford-shell-${VERSION}`;
const API_CACHE = `oxford-api-${VERSION}`;
const CDN_CACHE = `oxford-cdn-${VERSION}`;

const SHELL_FILES = [
    "./",
    "./index.html",
    "./offline.html",
    "./css/style.css",
    "./js/config.js",
    "./js/api.js",
    "./js/script.js",
    "./js/pwa.js",
    "./js/mobile.js",
    "./manifest.webmanifest",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/maskable-512.png",
    "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE)
            .then((cache) => cache.addAll(SHELL_FILES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    const atuais = [SHELL_CACHE, API_CACHE, CDN_CACHE];
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => !atuais.includes(k)).map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;          // escrita vai sempre para a rede

    const url = new URL(req.url);

    if (url.pathname.includes("/api/")) {
        if (req.headers.has("Authorization")) {
            event.respondWith(somenteRede(req));
        } else {
            event.respondWith(networkFirst(req));
        }
        return;
    }

    if (url.origin === self.location.origin) {
        if (req.mode === "navigate") {
            event.respondWith(navegacao(req));
        } else {
            event.respondWith(staleWhileRevalidate(req, SHELL_CACHE));
        }
        return;
    }

    if (url.hostname.endsWith("cdnjs.cloudflare.com")) {
        event.respondWith(staleWhileRevalidate(req, CDN_CACHE));
    }
});

async function networkFirst(req) {
    const cache = await caches.open(API_CACHE);
    try {
        const resp = await fetch(req);
        if (resp.ok) cache.put(req, resp.clone());
        return resp;
    } catch (err) {
        const salvo = await cache.match(req);
        if (salvo) return salvo;
        return new Response(
            JSON.stringify({ message: "Sem conexão e sem dados salvos para esta consulta." }),
            { status: 503, headers: { "Content-Type": "application/json" } }
        );
    }
}

// Rotas autenticadas: vai à rede e não guarda nada.
async function somenteRede(req) {
    try {
        return await fetch(req);
    } catch (err) {
        return new Response(
            JSON.stringify({ message: "Sem conexão. Esta consulta precisa de internet." }),
            { status: 503, headers: { "Content-Type": "application/json" } }
        );
    }
}

async function staleWhileRevalidate(req, cacheName) {
    const cache = await caches.open(cacheName);
    const salvo = await cache.match(req);
    const rede = fetch(req)
        .then((resp) => {
            if (resp.ok || resp.type === "opaque") cache.put(req, resp.clone());
            return resp;
        })
        .catch(() => undefined);
    return salvo || (await rede) || Response.error();
}

async function navegacao(req) {
    try {
        const resp = await fetch(req);
        const cache = await caches.open(SHELL_CACHE);
        cache.put("./index.html", resp.clone());
        return resp;
    } catch (err) {
        return (await caches.match("./index.html"))
            || (await caches.match("./offline.html"));
    }
}
