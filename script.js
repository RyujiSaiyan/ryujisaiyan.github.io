async function loadMods() {
    const container = document.getElementById("modsContainer");
    const response = await fetch("mods.json");
    const mods = await response.json();

    container.innerHTML = "";

    mods.forEach(mod => {
        const youtubeID = extractYouTubeID(mod.youtube);
        const thumbnail = `https://img.youtube.com/vi/${youtubeID}/hqdefault.jpg`;

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${thumbnail}" class="thumbnail" alt="Miniatura">

            <div class="card-content">
                <div class="card-title">${mod.title}</div>
                <div class="card-desc">${mod.description}</div>

                <div class="card-buttons">
                    <a class="btn-video" href="${mod.youtube}" target="_blank">Video</a>
                    <a class="btn-download" href="${mod.download}" target="_blank">Descargar</a>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function extractYouTubeID(url) {
    const regex = /(?:v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : "";
}

document.getElementById("searchInput").addEventListener("input", function() {
    const term = this.value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(term) ? "block" : "none";
    });
});

loadMods();
