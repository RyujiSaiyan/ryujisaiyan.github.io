async function loadMods() {
    const container = document.getElementById("modsContainer");
    const response = await fetch("mods.json");
    const mods = await response.json();

    container.innerHTML = "";

    mods.forEach(mod => {
        const youtubeID = extractYouTubeID(mod.youtube);
        const thumbnail = `https://img.youtube.com/vi/${youtubeID}/maxresdefault.jpg`;

        const col = document.createElement("div");
        col.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-3");

        col.innerHTML = `
            <div class="card h-100">
                <img src="${thumbnail}" class="thumbnail card-img-top">

                <div class="card-body d-flex flex-column">
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

// Buscador en tiempo real
document.getElementById("searchInput").addEventListener("input", function () {
    const term = this.value.toLowerCase();
    const cards = document.querySelectorAll("#modsContainer .card");

    cards.forEach(card => {
        const visible = card.innerText.toLowerCase().includes(term);
        card.parentElement.style.display = visible ? "block" : "none";
    });
});

loadMods();
