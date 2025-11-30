const fs = require("fs");
const fetch = require("node-fetch");

// CONFIG
const API_KEY = process.env.MODS_TOKEN; // La API key se cargará desde Secrets
const CHANNEL_ID = "UCG_Oh0Ty-spxPukCEvfXWjQ";

// Sanitiza URLs
function limpiarURL(url) {
    if (!url) return "";
    return url
        .replace(/\s*\.\s*/g, ".")
        .replace(/\s+/g, "")
        .replace(/\[dot\]/gi, ".")
        .replace(/\(dot\)/gi, ".")
        .replace(/dot/gi, ".")
        .replace(/^http(s?):\/\//, "https://");
}

// Parseo igual que tu función original
function parseMod(item) {
    if (!item.snippet.title.trim().toLowerCase().startsWith("[mod]"))
        return null;

    const videoID = item.id.videoId;
    const desc = item.snippet.description;

    let categorias = [];
    let linkMod = "";

    desc.split("\n").forEach(line => {
        let clean = line
            .replace(/\u200B/g, "")   // ZERO WIDTH SPACE
            .replace(/\u200E/g, "")   // LEFT-TO-RIGHT MARK
            .trim();

        if (clean.toLowerCase().startsWith("categorias")) {
            const raw = clean.split(":")[1] || "";
            categorias = raw
                .split(",")
                .map(x => x.trim())
                .filter(Boolean);
        }

        if (clean.toLowerCase().startsWith("mod:")) {
            linkMod = limpiarURL(clean.split(":")[1].trim());
        }
    });

    return {
        name: item.snippet.title.replace(/\[mod\]/i, "").trim(),
        fecha: item.snippet.publishedAt.substring(0,10),
        categorias,
        desc,
        video: `https://www.youtube.com/watch?v=${videoID}`,
        mod: linkMod,
        thumbnail: item.snippet.thumbnails.high.url,
        imagen_mod: `https://i.ytimg.com/vi/${videoID}/maxresdefault.jpg`,
        videoID
    };
}


async function main() {
    const url =
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}` +
      `&part=snippet,id&order=date&maxResults=50`;

    const resp = await fetch(url);
    const data = await resp.json();

    const items = data.items || [];
    const mods = items.map(parseMod).filter(Boolean);

    // Guardar JSON
    fs.writeFileSync("mods.json", JSON.stringify(mods, null, 2));

    console.log("✔ mods.json generado con éxito:", mods.length, "mods");
}

main().catch(err => {
    console.error("Error generando mods:", err);
    process.exit(1);
});
