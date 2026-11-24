const MOVIE_API_URL = "https://api.gyde.site/v1/movies";

function createStars(rating) {
    const wrapper = document.createDocumentFragment();
    const value = rating ?? 0;

    for (let i = 1; i <= 5; i++) {
        const img = document.createElement("img");
        img.alt = "star";

        if (value >= i) {
            img.src = "/images/ui/star-full.png";
        } else if (value >= i - 0.5) {
            img.src = "/images/ui/star-half.png";
        } else {
            img.src = "/images/ui/star-empty.png";
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

function renderMovies(films, container) {
    container.replaceChildren();

    if (!films.length) {
        container.textContent = "No information.";
        return;
    }

    for (const film of films) {
        const movieEntry = document.createElement("div");
        movieEntry.className = "movie-entry";

        const watched = document.createElement("p");
        watched.textContent = formatDate(film.watched);
        watched.className = "date-watched";
        movieEntry.appendChild(watched);

        const title = document.createElement("p");
        title.textContent = film.title + " (" + film.year + ")";
        title.className = "movie-title";
        movieEntry.appendChild(title);

        const rating = document.createElement("div");
        rating.className = "rating";
        rating.appendChild(createStars(film.rating));
        movieEntry.appendChild(rating);

        const poster = document.createElement("img");
        poster.className = "movie-poster";
        poster.src = film.poster;
        poster.alt = `${film.title} poster`;
        movieEntry.appendChild(poster);

        attachPoster(movieEntry, poster);

        container.appendChild(movieEntry);
    }
}

function attachPoster(target, poster) {
    target.addEventListener("mousemove", (e) => {
        banner.style.left = `${e.clientX + POSTER_GAP}px`;
        banner.style.top = `${e.clientY - POSTER_GAP}px`;
        poster.style.transform = "translateY(-100%)";
        poster.style.display = "block";
    });

    target.addEventListener("mouseleave", () => {
        banner.style.display = "none";
    });
}

async function loadMovies() {
    const container = document.getElementById("latest-movies");
    try {
        const res = await fetch(MOVIE_API_URL);
        if (!res.ok) throw new Error(`Error from movies.js: ${res.status}`);
        const { data } = await res.json();
        renderMovies(data, container);
    } catch (err) {
        console.error("Failed to load movies: ", err);
        container.textContent = "Couldn't load recent films.";
    }
}

loadMovies();
