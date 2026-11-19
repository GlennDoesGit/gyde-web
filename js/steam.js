const GAME_API = "https://api.gyde.site/v1/steam/recent/";
const MAX_GAMES = 2;
const COL_ONLINE = "#60acca";
const COL_PLAYING = "#9fd8a8";
const COL_OFFLINE = "#c56666";

function renderProfile(data) {
    if (!data) return;

    const avatar = document.getElementById("avatar");
    const name = document.getElementById("steam-name");
    const state = document.getElementById("steam-state");

    avatar.src = data.avatar;
    name.textContent = data.steamName;

    if (data.currentGame) {
        state.replaceChildren();
        state.style.color = COL_PLAYING;
        avatar.style.outlineColor = COL_PLAYING;

        const link = document.createElement("a");
        link.href = `https://store.steampowered.com/app/${encodeURIComponent(data.currentGameAppid)}`;
        link.textContent = `Playing ${data.currentGame}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "no-style-link";
        state.appendChild(link);

        const banner = document.createElement("img");
        banner.className = "game-poster";
        banner.src = data.currentGameImage;
        banner.alt = `${data.currentGame} poster`;
        state.appendChild(banner);

        attachPoster(state, banner);
    } else {
        const s = data.status ?? "";
        state.textContent = s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "No info";

        state.style.color = s === "OFFLINE" ? COL_OFFLINE : COL_ONLINE;
        if (s === "ONLINE") {
            avatar.style.outlineColor = COL_ONLINE;
        }
    }
}

function renderGames(games, container) {
    container.replaceChildren();

    if (!games.length) {
        container.textContent = "No information.";
        return;
    }

    for (const game of games) {
        const gameEntry = document.createElement("div");
        gameEntry.className = "game-entry";

        const title = document.createElement("p");
        title.className = "game-title";
        title.textContent = game.gameName;
        gameEntry.appendChild(title);

        const hrsPlayed = document.createElement("p");
        hrsPlayed.className = "hours-played";
        hrsPlayed.textContent = `${formatHours(game.gameHoursTotal)} on record`;
        gameEntry.appendChild(hrsPlayed);

        const banner = document.createElement("img");
        banner.className = "game-poster";
        banner.src = game.gameImage;
        banner.alt = `${game.gameName} poster`;
        gameEntry.appendChild(banner);

        gameEntry.appendChild(banner);
        attachPoster(gameEntry, banner);

        container.appendChild(gameEntry);
    }
}

function formatHours(hours) {
    const totalMinutes = Math.round(Number(hours) * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
}

const POSTER_GAP = 12;

function attachPoster(target, banner) {
    target.addEventListener("mousemove", (e) => {
        banner.style.left = `${e.clientX + POSTER_GAP}px`;
        banner.style.top = `${e.clientY - POSTER_GAP}px`;
        banner.style.transform = "translateY(-100%)";
        banner.style.display = "block";
    });

    target.addEventListener("mouseleave", () => {
        banner.style.display = "none";
    });
}

async function loadGames() {
    const container = document.getElementById("latest-games");
    try {
        const res = await fetch(GAME_API);
        if (!res.ok) throw new Error(`Error from steam.js: ${res.status}`);

        const data = await res.json();
        renderProfile(data);

        // if currently playing a game remove from the list.
        const games = (data.lastPlayedGames ?? []).filter((g) => String(g.appid) !== String(data.currentGameAppid)).slice(0, MAX_GAMES);

        renderGames(games, container);
    } catch (err) {
        console.error("Failed to load games: ", err);
        container.textContent = "Couldn't load recent games.";
    }
}

loadGames();
