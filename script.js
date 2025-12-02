/* ========================================================= */
/* ==================== CONFIGURACIÓN ====================== */
/* ========================================================= */

const API_KEY = "AIzaSyBR8qY-Qkp5W35JO8Al_IKrRIjThs3p2I0";
const CHANNEL_ID = "UCG_Oh0Ty-spxPukCEvfXWjQ";

/* ========================================================= */
/* ===================== FETCH YOUTUBE ====================== */
/* ========================================================= */

async function fetchYouTube() {
    const url =
        `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}` +
        `&channelId=${CHANNEL_ID}&part=snippet,id&order=date&type=video&maxResults=50`;

    const res = await fetch(url);
    return await res.json();
}

function isModVideo(item) {
    return item.snippet.title.includes("[Mod]");
}

function parseMod(item) {
    const title = item.snippet.title;
    const videoID = item.id.videoId;
    const desc = item.snippet.description;

    let categorias = [], saga = "", linkMod = "";

    desc.split("\n").forEach(line => {
        let ln = line.trim();

        if (ln.startsWith("Categorias:") || ln.startsWith("Categorías:"))
            categorias = ln.replace(/Categorias:|Categorías:/, "")
                .split(",").map(t => t.trim()).filter(Boolean);

        if (ln.startsWith("Saga:"))
            saga = ln.replace("Saga:", "").trim();

        if (ln.startsWith("Mod:"))
            linkMod = ln.replace("Mod:", "").trim();
    });

    return {
        titulo: title.replace("[Mod]", "").trim(),
        fecha: item.snippet.publishedAt.substring(0, 10),
        categorias,
        saga,
        descripcion: desc,
        video: `https://www.youtube.com/watch?v=${videoID}`,
        descarga: linkMod,
        thumbnail: item.snippet.thumbnails.high.url,
        imagen_mod: `https://i.ytimg.com/vi/${videoID}/maxresdefault.jpg`,
        videoID
    };
}

/* ========================================================= */
/* ===================== NAV TOGGLE ========================= */
/* ========================================================= */

const nav = document.querySelector("header nav");
const navToggle = document.querySelector(".nav-toggle");

if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
        nav.classList.toggle("active");
    });
}

/* ========================================================= */
/* ===================== MODS + TRAJES ====================== */
/* ========================================================= */

let modsData = [];
let currentModIndex = null;
let currentVariantIndex = 0;
let currentDamaged = false;

function pickFirst(...vals) {
    for (const v of vals) {
        if (v !== undefined && v !== null && v !== "") return v;
    }
    return "";
}

/* Carga de mods y creación de cards */
async function loadMods() {
    try {
        const res = await fetch("mods.json");
        const data = await res.json();
        modsData = data;

        const container = document.getElementById("mods-list");
        if (!container) return;

        container.innerHTML = "";

        data.forEach((mod, index) => {
            let baseState = mod;

            if (mod.variants && mod.variants.length) {
                const v0 = mod.variants[0];
                baseState = v0.normal || v0.damaged || mod;
            }

            const cardSubtitle = pickFirst(
                baseState.subtitle,
                mod.subtitle
            );

            const cardImage = pickFirst(
                baseState.render,
                baseState.chart,
                mod.render,
                mod.chart
            );

            const card = document.createElement("article");
            card.className = "char-card";

            card.dataset.category = mod.category || "";
            card.dataset.saga = mod.saga || "";
            card.dataset.modIndex = String(index);

            card.innerHTML = `
                <div class="char-info">
                    <h3>${mod.title}</h3>
                    <p class="char-subtitle">${cardSubtitle || ""}</p>
                </div>

                <div class="char-portrait">
                    <div class="hex-wrapper">
                        <div class="hex-inner">
                            <img src="${cardImage}" alt="${mod.title}">
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (e) {
        console.error("Error cargando mods.json", e);
    }
}

/* Aplica una variante concreta (normal/dañado) al modal */
function applyModVariant(mod, variantIndex = 0, damaged = false) {
    const variants = mod.variants || [];
    const v = variants[variantIndex] || {};
    const state = damaged ? (v.damaged || v.normal || {}) : (v.normal || v.damaged || {});

    const title = pickFirst(mod.title);
    const subtitle = pickFirst(
        state.subtitle,
        v.subtitle,
        mod.subtitle
    );
    const category = pickFirst(
        state.category,
        v.category,
        mod.category
    );
    const saga = pickFirst(
        state.saga,
        v.saga,
        mod.saga
    );
    const description = pickFirst(
        state.description,
        v.description,
        mod.description
    );

    const bg = pickFirst(
        state.background,
        v.background,
        mod.background
    );

    // Imagen grande (puedes ajustar: chart/render según prefieras)
    const render = pickFirst(
        state.chart,
        state.render,
        v.chart,
        v.render,
        mod.chart,
        mod.render
    );

    // Imagen pequeña del recuadro (opcional)
    const chart = pickFirst(
        state.renderSmall,
        state.render,
        v.render,
        v.chart,
        mod.render,
        mod.chart
    );

    const video = pickFirst(
        state.video,
        v.video,
        mod.video
    );
    const download = pickFirst(
        state.download,
        v.download,
        mod.download
    );

    const titleEl = document.getElementById("mod-title");
    const subtitleEl = document.getElementById("mod-subtitle");
    const categoryEl = document.getElementById("mod-category");
    const sagaEl = document.getElementById("mod-saga");
    const descEl = document.getElementById("mod-description");
    const bgEl = document.getElementById("mod-bg");
    const renderEl = document.getElementById("mod-render");
    const chartEl = document.getElementById("mod-chart");
    const videoEl = document.getElementById("mod-video");
    const dlEl = document.getElementById("mod-download");
    const chartBox = document.querySelector(".fighter-modal__chart");

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
    if (categoryEl) categoryEl.textContent = category;
    if (sagaEl) sagaEl.textContent = saga;
    if (descEl) descEl.textContent = description;

    if (bgEl && bg) {
        bgEl.src = bg;
        bgEl.alt = `Fondo de ${title}`;
    }

    if (renderEl && render) {
        renderEl.src = render;
        renderEl.alt = `Arte de ${title}`;
    }

    if (chartBox && chartEl) {
        if (chart) {
            chartEl.src = chart;
            chartEl.alt = `Chart de ${title}`;
            chartBox.style.display = "block";
        } else {
            chartBox.style.display = "none";
        }
    }

    if (videoEl && video) videoEl.href = video;
    if (dlEl && download) dlEl.href = download;
}

/* Crea pills de trajes (solo 8: Traje 1..8) */
function setupSkins(mod) {
    const container = document.getElementById("mod-skins");
    if (!container) return;

    const variants = mod.variants || [];
    container.innerHTML = "";

    if (!variants.length) {
        container.style.display = "none";
        return;
    }

    container.style.display = "flex";

    variants.forEach((v, idx) => {
        const btn = document.createElement("button");
        btn.className = "skin-pill" + (idx === 0 ? " is-active" : "");
        btn.textContent = v.name || `Traje ${idx + 1}`;

        btn.addEventListener("click", () => {
            currentVariantIndex = idx;
            container.querySelectorAll(".skin-pill").forEach(b => b.classList.remove("is-active"));
            btn.classList.add("is-active");

            const modAgain = modsData[currentModIndex];
            if (modAgain) applyModVariant(modAgain, currentVariantIndex, currentDamaged);
        });

        container.appendChild(btn);
    });
}

/* Botón NORMAL/DAÑADO */
function setupDamageToggle(mod) {
    const btn = document.getElementById("mod-damage-toggle");
    if (!btn) return;

    const variants = mod.variants || [];
    const anyDamaged = variants.some(v => v.damaged);

    if (!anyDamaged) {
        btn.style.display = "none";
        currentDamaged = false;
        return;
    }

    btn.style.display = "inline-flex";
    currentDamaged = false;
    btn.classList.remove("is-active");
    btn.textContent = "Normal";

    btn.onclick = () => {
        currentDamaged = !currentDamaged;
        btn.classList.toggle("is-active", currentDamaged);
        btn.textContent = currentDamaged ? "Dañado" : "Normal";

        const modAgain = modsData[currentModIndex];
        if (modAgain) applyModVariant(modAgain, currentVariantIndex, currentDamaged);
    };
}

/* Abre modal */
function openModModal(index) {
    const modal = document.getElementById("mod-modal");
    if (!modal || !modsData.length) return;

    const mod = modsData[index];
    if (!mod) return;

    currentModIndex = index;
    currentVariantIndex = 0;
    currentDamaged = false;

    setupSkins(mod);
    setupDamageToggle(mod);
    applyModVariant(mod, currentVariantIndex, currentDamaged);

    modal.classList.add("is-active");
}

/* Cierra modal */
function closeModModal() {
    const modal = document.getElementById("mod-modal");
    if (!modal) return;
    modal.classList.remove("is-active");
}

/* Clicks globales: abrir cards y cerrar modal */
document.addEventListener("click", (e) => {
    const card = e.target.closest(".char-card");
    if (card && card.dataset.modIndex != null) {
        const index = Number(card.dataset.modIndex);
        if (!Number.isNaN(index)) {
            openModModal(index);
        }
    }

    if (
        e.target.id === "mod-modal" ||
        e.target.closest(".mod-modal__close")
    ) {
        closeModModal();
    }
});

/* Cerrar con ESC */
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        const modal = document.getElementById("mod-modal");
        if (modal && modal.classList.contains("is-active")) {
            closeModModal();
        }
    }
});

/* ========================================================= */
/* ===================== YOUTUBE INFO ======================= */
/* ========================================================= */

async function loadLastVideo() {
    try {
        const url =
            `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}` +
            `&channelId=${CHANNEL_ID}` +
            `&part=snippet,id` +
            `&order=date` +
            `&type=video` +
            `&maxResults=1`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.items || !data.items.length) {
            const titleEl = document.getElementById("yt-video-title");
            if (titleEl) titleEl.innerText = "No se encontró video.";
            return;
        }

        const item = data.items[0];
        const vid = item.id.videoId;

        const iframe = document.getElementById("yt-last-video");
        const titleEl = document.getElementById("yt-video-title");
        const dateEl = document.getElementById("yt-video-date");
        const descEl = document.getElementById("yt-video-desc");
        const linkEl = document.getElementById("yt-video-link");

        if (iframe) iframe.src = `https://www.youtube.com/embed/${vid}`;
        if (titleEl) titleEl.innerText = item.snippet.title;
        if (dateEl) dateEl.innerText = "Publicado: " + item.snippet.publishedAt.substring(0, 10);

        if (descEl) {
            const text = item.snippet.description || "";
            descEl.innerText = text.length > 180 ? text.substring(0, 180) + "..." : text;
        }

        if (linkEl) linkEl.href = `https://www.youtube.com/watch?v=${vid}`;
    } catch (e) {
        console.error("Error cargando el video.", e);
        const titleEl = document.getElementById("yt-video-title");
        if (titleEl) titleEl.innerText = "Error cargando el video.";
    }
}

async function loadChannelName() {
    try {
        const url =
            `https://www.googleapis.com/youtube/v3/channels?part=snippet` +
            `&id=${CHANNEL_ID}&key=${API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();
        const channel = data.items && data.items[0];
        if (!channel) return;

        const title = channel.snippet.title;
        const thumbUrl = channel.snippet.thumbnails.high.url;
        const desc = channel.snippet.description;

        const channelNameEl = document.getElementById("channel-name");
        const ytNameEl = document.getElementById("yt-name");
        const channelImageEl = document.getElementById("channel-image");
        const channelDescEl = document.getElementById("channel-desc");

        if (channelNameEl) channelNameEl.innerText = title;
        if (ytNameEl) ytNameEl.innerText = title;
        if (channelImageEl) channelImageEl.src = thumbUrl;
        if (channelDescEl) channelDescEl.innerText = desc;
    } catch (e) {
        console.error("Error cargando datos del canal", e);
    }
}

/* ========================================================= */
/* ========================= INIT =========================== */
/* ========================================================= */

(async () => {
    loadChannelName();
    loadLastVideo();
    loadMods();
})();
