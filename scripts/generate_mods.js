const fs = require("fs");
const fetch = require("node-fetch");

// CONFIG
const API_KEY = process.env.YT_API_KEY;
const CHANNEL_ID = "UCG_Oh0Ty-spxPukCEvfXWjQ";
const UPLOADS_PLAYLIST = "UU" + CHANNEL_ID.substring(2);

// Limpia URLs de descarga
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

// Parseo tolerante
function parseMod(item) {
    const title = item.snippet.title.trim().toLowerCase();
    if (!title.startsWith("[mod]")) return null;

    const videoID = item.contentDetails.videoId;
    const desc = item.snippet.description || "";

    let categorias = [];
    let linkMod = "";

    desc.split("\n").forEach(line => {
        let clean = line
            .replace(/\u200B/g, "")
            .replace(/\u200E/g, "")
            .trim();

        // Categorias:
        if (clean.toLowerCase().startsWith("categorias")) {
            const raw = clean.split(":")[1] || "";
            categorias = raw.split(",").map(x => x.trim()).filter(Boolean);
        }

        // Mod:
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
    let allVideos = [];
    let nextPageToken = "";

    console.log("🔎 Buscando todos los videos de la playlist de subidos...");

    do {
        const url =
            `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}` +
            `&playlistId=${UPLOADS_PLAYLIST}&part=snippet,contentDetails&maxResults=50` +
            (nextPageToken ? `&pageToken=${nextPageToken}` : "");

        const resp = await fetch(url);
        const data = await resp.json();

        allVideos.push(...(data.items || []));
        nextPageToken = data.nextPageToken || "";

        console.log(`→ Encontrados ${allVideos.length} videos hasta ahora...`);

    } while (nextPageToken);

    console.log("✔ Total videos encontrados:", allVideos.length);

    const mods = allVideos
        .map(parseMod)
        .filter(Boolean)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    fs.writeFileSync("mods.json", JSON.stringify(mods, null, 2));

    console.log("✔ mods.json generado con éxito:", mods.length, "mods");
}

main().catch(err => {
    console.error("❌ Error generando mods:", err);
    process.exit(1);
});
