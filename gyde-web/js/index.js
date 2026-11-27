// TIME WIDGET
// Credits to https://louispretends.com for these snippets. I really liked it on his site.
const timeElement = document.getElementById("local-time");

if (timeElement) {
    const timezone = Intl.DateTimeFormat([], { timeZoneName: "short" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName").value;

    function updateTime() {
        timeElement.textContent =
            new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }) +
            " (" +
            timezone +
            ")";
    }

    updateTime();
    setInterval(updateTime, 1000);
}

// WEATHER WIDGET

// Wind speed descriptions (km/h) named based on Beaufort Wind Scale.
function getWindDescription(speed) {
    if (speed < 1) return "Still Air";
    if (speed < 6) return "Light Air";
    if (speed < 12) return "Light Breeze";
    if (speed < 20) return "Gentle Breeze";
    if (speed < 29) return "Moderate Breeze";
    if (speed < 39) return "Fresh Breeze";
    if (speed < 50) return "Strong Breeze";
    if (speed < 62) return "Near Gale";
    if (speed < 75) return "Gale";
    return "Storm";
}

// Weather groups name and group based on WMO 4677 codes.
const weatherGroups = [
    {
        range: [0, 0],
        desc: "Clear Sky",
        iconDay: "clear-day.png",
        iconNight: "clear-night.png",
    },

    {
        range: [1, 1],
        desc: "Mostly Clear",
        iconDay: "mostly-clear-day.png",
        iconNight: "mostly-clear-night.png",
    },

    {
        range: [2, 2],
        desc: "Cloudy",
        iconDay: "cloudy.png",
        iconNight: "cloudy.png",
    },

    {
        range: [3, 5],
        desc: "Overcast",
        iconDay: "overcast.png",
        iconNight: "overcast.png",
    },

    // OpenMeteo reporting fog in SG for some reason, overriding to cloudy.
    // {
    //     range: [40, 49],
    //     desc: "fog",
    //     iconDay: "fog.png",
    //     iconNight: "fog.png",
    // },

    {
        range: [40, 49],
        desc: "Cloudy",
        iconDay: "cloudy.png",
        iconNight: "cloudy.png",
    },

    // Drizzle group (WMO 50–59)
    {
        range: [50, 59],
        desc: "Drizzle",
        iconDay: "drizzle.png",
        iconNight: "drizzle.png",
    },

    // Rain group (WMO 60–69)
    {
        range: [60, 69],
        desc: "Rain",
        iconDay: "rain.png",
        iconNight: "rain.png",
    },

    // Snowfall group (WMO 70–79)
    {
        range: [70, 79],
        desc: "Snow",
        iconDay: "snow.png",
        iconNight: "snow.png",
    },

    // Rain showers (WMO 80–84)
    {
        range: [80, 84],
        desc: "Rain Showers",
        iconDay: "rain-showers.png",
        iconNight: "rain-showers.png",
    },

    // Thunderstorm (WMO 95–99)
    {
        range: [95, 99],
        desc: "Thunderstorm",
        iconDay: "storm.png",
        iconNight: "storm.png",
    },
];

function getWeatherInfo(code, isDay) {
    for (const group of weatherGroups) {
        // skip if excluded
        if (group.exclude && group.exclude.includes(code)) {
            continue;
        }

        // set if included
        if (group.include && group.include.includes(code)) {
            return {
                desc: group.desc,
                icon: isDay ? group.iconDay : group.iconNight,
            };
        }

        // check range
        if (group.range && code >= group.range[0] && code <= group.range[1]) {
            return {
                desc: group.desc,
                icon: isDay ? group.iconDay : group.iconNight,
            };
        }
    }

    return {
        desc: "Unknown",
        icon: "NoData.png",
    };
}

const weatherTemp = document.getElementById("weather-temp");
const weatherDesc = document.getElementById("weather-desc");
const weatherWind = document.getElementById("weather-wind");
const weatherIcon = document.getElementById("weather-icon");

if (weatherTemp && weatherDesc && weatherWind && weatherIcon) {
    function loadWeather() {
        fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=1.3551&longitude=103.9901&current=temperature_2m,is_day,weather_code,wind_speed_10m&timezone=Asia%2FSingapore",
        )
            .then((res) => res.json())

            .then((data) => {
                const temp = data.current.temperature_2m;
                const code = data.current.weather_code;
                const wind = data.current.wind_speed_10m;
                const isDay = data.current.is_day === 1;

                const weather = getWeatherInfo(code, isDay);

                weatherTemp.textContent = temp + "°C";

                weatherDesc.textContent = weather.desc;

                weatherWind.textContent = getWindDescription(wind) + " (" + wind + " km/h)";

                weatherIcon.src = "images/weather/" + weather.icon;

                const highlightColor = isDay ? "var(--color-highlight)" : "var(--color-highlight2)";
                weatherTemp.style.color = highlightColor;
                weatherDesc.style.color = highlightColor;
            })

            .catch(() => {
                weatherTemp.textContent = "Unavailable";
                weatherDesc.textContent = "Unavailable";
                weatherWind.textContent = "Unavailable";
                weatherIcon.src = "images/weather/NoData.png";
            });
    }

    loadWeather();

    // refresh every 20 minutes
    setInterval(loadWeather, 1200000);
}

// DATE WIDGET
let currTime = new Date();
const Months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const TodayWords = ["cool", "goofy", "fun", "interesting", "productive", "important"];

// Hash to randomize word per day.
function hash(n) {
    n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
    n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
    n = n ^ (n >>> 16);
    return n >>> 0;
}

function PickWord() {
    const dayNum = Math.round(Date.UTC(currTime.getFullYear(), currTime.getMonth(), currTime.getDate()) / 86400000);

    return TodayWords[hash(dayNum) % TodayWords.length];
}

const HOLIDAYS = [
    // FORMAT: name, date / time of celeb, holiday or observance, country

    // holidays
    { name: "New Year's", date: "01-01", type: "holiday" },
    { name: "Easter", easter: true, type: "holiday" },
    { name: "Independence Day", date: "07-04", type: "holiday", country: "US" },
    { name: "Labor Day", month: 9, weekday: 0, nth: 1, type: "holiday", country: "US" },
    { name: "Thanksgiving", month: 11, weekday: 3, nth: 4, type: "holiday", country: "US" },
    { name: "Christmas", date: "12-25", type: "holiday" },

    // observances
    { name: "Valentine's Day", date: "02-14", type: "observance" },
    { name: "April Fools'", date: "04-01", type: "observance" },
    { name: "Earth Day", date: "04-22", type: "observance" },
    { name: "Mother's Day", month: 5, weekday: 6, nth: 2, type: "observance" },
    { name: "Father's Day", month: 6, weekday: 6, nth: 3, type: "observance" },
    { name: "Halloween", date: "10-31", type: "observance" },
    { name: "Christmas Eve", date: "12-24", type: "observance" },
    { name: "New Year's Eve", date: "12-31", type: "observance" },
];

// wild formula for calculating easter
// https://en.wikipedia.org/wiki/Date_of_Easter#Anonymous_Gregorian_algorithm
function easter(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return { month, day };
}

function dayOf(h, year, month) {
    if (h.easter) {
        const e = easter(year);
        return e.month === month ? e.day : null;
    }
    if (h.date) {
        const [m, d] = h.date.split("-").map(Number);
        return m === month ? d : null;
    }
    if (h.month !== month) return null;

    const weekday = (h.weekday + 1) % 7;
    const firstDow = new Date(year, month - 1, 1).getDay();
    return 1 + ((weekday - firstDow + 7) % 7) + (h.nth - 1) * 7;
}

function SetDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const today = now.getDate();
    const todaysWord = PickWord();

    const events = {};
    for (const h of HOLIDAYS) {
        const d = dayOf(h, year, month);
        if (!d) continue;
        if (!events[d]) events[d] = [];
        events[d].push(h);
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
    const monthName = now.toLocaleString("en-US", { month: "long" });

    let html = `<h2>${monthName}</h2><table id="date-table">
    <tr class="date-days"><td>M</td><td>T</td><td>W</td><td>T</td><td>F</td><td>S</td><td>S</td></tr><tr>`;

    for (let i = 0; i < offset; i++) html += "<td></td>";

    for (let d = 1; d <= daysInMonth; d++) {
        const items = events[d] || [];
        const isToday = d === today;

        let tips = [];
        if (isToday && items.length) {
            tips = items.map((h) => `Celebrate <strong>${h.name}</strong> today!`);
        } else {
            if (isToday) tips.push(`Do something <strong>${todaysWord}</strong> today!`);
            tips.push(...items.map((h) => h.name + (h.country ? ` (${h.country})` : "")));
        }

        // one class per type present on this day: "holiday" and/or "observance"
        const types = [...new Set(items.map((h) => h.type).filter(Boolean))];

        const attrs = [isToday && 'id="today"', types.length && `class="${types.join(" ")}"`, tips.length && `data-tooltip="${tips.join("<br>")}"`]
            .filter(Boolean)
            .join(" ");

        html += `<td ${attrs}>${d}</td>`;
        if ((offset + d) % 7 === 0) html += "</tr><tr>";
    }

    html += "</tr></table>";
    document.getElementById("date-header").innerHTML = html;
}

SetDate();

// RANDOM
// CPU stat under comment section
const cpuField = document.getElementById("cpu-use");

setInterval(() => {
    cpuField.textContent = `CPU Usage: ${Math.floor(3 + Math.random() * 5)}%`;
}, 1500);

// NAV CATEGORY TOOLTIP
const categoryTooltip = document.getElementById("category-tooltip");

if (categoryTooltip) {
    document.querySelectorAll("nav a.anchor[data-tooltip]").forEach((link) => {
        function showTooltip() {
            categoryTooltip.textContent = link.dataset.tooltip;
            categoryTooltip.hidden = false;
        }

        function hideTooltip() {
            categoryTooltip.hidden = true;
        }

        link.addEventListener("mouseenter", showTooltip);
        link.addEventListener("mouseleave", hideTooltip);
        link.addEventListener("focus", showTooltip);
        link.addEventListener("blur", hideTooltip);
    });
}

const siteButtons = [
    { file: "gydes-88x31.gif", alt: "Gyde's Web" },
    { file: "gydesite-btn2.gif", alt: "Gyde's Web" },
];

const buttonTextarea = document.getElementById("site-button-txt");

document.querySelectorAll(".site-button-img").forEach((img) => {
    img.addEventListener("click", () => {
        const file = img.dataset.button;
        buttonTextarea.value = `<a href="https://gyde.site/"><img src="https://gyde.site/images/buttons/${file}" alt="Gyde's Site"></a>`;
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const popcorn = document.querySelector(".popcorn");
    if (!popcorn || !window.gsap) return;

    const sprites = ["images/random/kernel1.png", "images/random/kernel2.png"];
    const shakeSound = new Audio("audio/random/popcorn_shake.mp3");

    const baseRotation = Number(gsap.getProperty(popcorn, "rotation"));

    const shake = () =>
        gsap.to(popcorn, {
            overwrite: "auto",
            keyframes: [
                { rotation: baseRotation - 4, duration: 0.07 },
                { rotation: baseRotation + 4, duration: 0.07 },
                { rotation: baseRotation - 3, duration: 0.07 },
                { rotation: baseRotation + 3, duration: 0.07 },
                { rotation: baseRotation - 2, duration: 0.07 },
                { rotation: baseRotation, duration: 0.07, ease: "power2.out" },
            ],
        });

    const flingKernel = () => {
        const kernel = document.createElement("img");
        kernel.src = gsap.utils.random(sprites);
        kernel.className = "popcorn-kernel";
        popcorn.parentElement.append(kernel);

        gsap.set(kernel, {
            left: popcorn.offsetLeft + popcorn.offsetWidth / 2,
            top: popcorn.offsetTop + popcorn.offsetHeight / 3,
            xPercent: -50,
            yPercent: -50,
            scale: 0.6,
        });

        const dur = 0.7;
        const apex = gsap.utils.random(30, 50);
        const drift = gsap.utils.random(-60, 60);

        gsap.timeline({ onComplete: () => kernel.remove() })
            .to(kernel, { x: drift, rotation: gsap.utils.random(-360, 360), duration: dur, ease: "none" }, 0)
            .to(kernel, { y: -apex, duration: dur / 2, ease: "power2.out" }, 0)
            .to(kernel, { y: `+=${apex}`, duration: dur / 2, ease: "power2.in" }, dur / 2)
            .to(kernel, { opacity: 0, duration: 0.2 }, dur - 0.2);
    };

    popcorn.addEventListener("mouseenter", () => {
        shake();
        shakeSound.play().catch(() => {});
        for (let i = 0; i < 6; i++) flingKernel();
    });
});
