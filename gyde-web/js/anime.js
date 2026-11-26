const MAL_API_URL = "https://api.gyde.site/v1/mal";

const entryToShow = 2;

function createHearts(rating) {
    const wrapper = document.createDocumentFragment();
    const rawValue = rating ?? 0;
    const value = Math.max(0, rawValue / 2);

    for (let i = 1; i <= 5; i++) {
        const img = document.createElement("img");
        img.alt = "heart";

        if (value >= i) {
            img.src = "../images/ui/heart-full.png";
        } else if (value >= i - 0.5) {
            img.src = "../images/ui/heart-half.png";
        } else {
            img.src = "../images/ui/heart-empty.png";
        }

        wrapper.appendChild(img);
    }

    return wrapper;
}

// Format YYYY-MM-DD to full date with suffix. Credits to HSIN.
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-GB", { month: "long" });
    const year = date.getFullYear();

    const suffix = ((d) => {
        if (d > 3 && d < 21) return "th";
        switch (d % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    })(day);

    return `${day}${suffix} ${month} ${year}`;
}

function renderAnimes(animes, container) {
    container.replaceChildren();

    const visibleAnimes = Array.isArray(animes) ? animes.slice(0, entryToShow) : [];

    if (!visibleAnimes.length) {
        container.textContent = "No information.";
        return;
    }

    for (const anime of visibleAnimes) {
        const animeEntry = document.createElement("div");
        animeEntry.className = "movie-entry";

        const watched = document.createElement("p");
        watched.textContent = formatDate(anime.updatedAt);
        watched.className = "date-watched";
        animeEntry.appendChild(watched);

        const title = document.createElement("p");
        title.className = "movie-title";

        const titleText = document.createElement("span");
        titleText.className = "anime-title";
        titleText.textContent = anime.title;

        const episodes = document.createElement("span");
        episodes.className = "anime-episodes";
        episodes.textContent = `${anime.epsWatched} / ${anime.numEpisodes}`;
        episodes.dataset.tooltip = "Episode progress";

        title.append(titleText, " ", episodes);
        animeEntry.appendChild(title);

        const rating = document.createElement("div");
        rating.className = "rating";
        rating.appendChild(createHearts(anime.score));
        animeEntry.appendChild(rating);

        if (anime.isRewatching) {
            const rewatching = document.createElement("img");
            rewatching.src = "../images/ui/rewatch.png";
            rewatching.className = "rewatching-icon";
            rewatching.alt = "rewatching";
            rating.appendChild(rewatching);

            const rewatchingTxt = document.createElement("span");
            rewatchingTxt.textContent = "rewatch";
            rewatchingTxt.className = "rewatch-txt";
            rating.appendChild(rewatchingTxt);
        }

        const poster = document.createElement("img");
        poster.className = "movie-poster";
        poster.src = anime.mainPicture.medium;
        poster.alt = `${anime.title} poster`;
        animeEntry.appendChild(poster);

        attachPoster(animeEntry, poster);

        container.appendChild(animeEntry);
    }
}

const POSTER_GAP = 12;

function attachPoster(target, poster) {
    target.addEventListener("mousemove", (e) => {
        if (e.target.closest(".anime-episodes")) {
            poster.style.display = "none";
            return;
        }

        poster.style.left = `${e.clientX + POSTER_GAP}px`;
        poster.style.top = `${e.clientY - POSTER_GAP}px`;
        poster.style.transform = "translateY(-100%)";
        poster.style.display = "block";
    });

    target.addEventListener("mouseleave", () => {
        poster.style.display = "none";
    });
}
async function loadAnimes() {
    const container = document.getElementById("latest-animes");
    try {
        const res = await fetch(MAL_API_URL);
        if (!res.ok) throw new Error(`Error from anime.js: ${res.status}`);
        const { data } = await res.json();
        renderAnimes(data, container);
    } catch (err) {
        console.error("Failed to load animes: ", err);
        container.textContent = "Couldn't load recent animes.";
    }
}

loadAnimes();
