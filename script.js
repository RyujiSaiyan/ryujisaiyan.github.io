let modsData = [];

async function loadMods() {
    const container = document.getElementById("modsContainer");
    const response = await fetch("mods.json");
    modsData = await response.json();

    generateCategoryFilters();
    generateCategoryButtons();
    displayMods(modsData);
}

function displayMods(mods) {
    const container = document.getElementById("modsContainer");
    container.innerHTML = "";

    mods.forEach(mod => {
        const youtubeID = extractYouTubeID(mod.youtube);
        const thumbnail = `https://img.youtube.com/vi/${youtubeID}/maxresdefault.jpg`;

        const col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

        col.innerHTML = `
            <div class="card h-100">
                <img src="${thumbnail}" class="thumbnail card-img-top">

                <div class="card-body d-flex flex-column">
                    <span class="badge bg-primary mb-2">${mod.category}</span>
                    <h5 class="card-title">${mod.title}</h5>
                    <p class="card-desc">${mod.description}</p>

                    <div class="mt-auto">
                        <a href="${mod.youtube}" target="_blank" class="btn btn-video w-100 mb-2">Ver Video</a>
                        <a href="${mod.download}" target="_blank" class="btn btn-download w-100">Descargar</a>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(col);
    });
}

function extractYouTubeID(url) {
    const regex = /(?:v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : "";
}

function generateCategoryFilters() {
    const categories = [...new Set(modsData.map(m => m.category))];
    const box = document.getElementById("categoryFilters");

    box.innerHTML = `
        <button class="btn btn-outline-light me-2" onclick="displayMods(modsData)">Todos</button>
    `;

    categories.forEach(cat => {
        box.innerHTML += `
            <button class="btn btn-outline-info me-2" onclick="filterByCategory('${cat}')">${cat}</button>
        `;
    });
}

function generateCategoryButtons() {
    const categories = [...new Set(modsData.map(m => m.category))];
    const list = document.getElementById("categoriesList");

    categories.forEach(cat => {
        list.innerHTML += `
            <button class="btn btn-info" onclick="filterByCategory('${cat}'); document.querySelector('[data-bs-target=\"#mods\"]').click();">
                ${cat}
            </button>
        `;
    });
}

function filterByCategory(category) {
    const filtered = modsData.filter(m => m.category === category);
    displayMods(filtered);
}

document.getElementById("searchInput").addEventListener("input", function () {
    const term = this.value.toLowerCase();
    const filtered = modsData.filter(m => m.title.toLowerCase().includes(term));
    displayMods(filtered);
});

loadMods();
