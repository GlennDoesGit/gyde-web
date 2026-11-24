const st_sheetId = "1TmSpuLdpQMXFutpxEUs3YmbpI-B6IE_D1rSrBd4FBHc";
const st_timezone = 8;
const st_refreshMinutes = 5; // 0 for never
const st_spritePath = "/images/status/";

const st_moodId = "status-mood";
const st_textId = "status-text";
const st_dateId = "status-date";
const st_moodImgId = "status-mood-img";

const st_loadingText = "Loading...";
const st_errorText = "Couldn't load status.";
const st_justNowText = "just now";

let v_statuses = null;

const el_mood = document.getElementById(st_moodId);
const el_text = document.getElementById(st_textId);
const el_date = document.getElementById(st_dateId);
const el_moodImg = document.getElementById(st_moodImgId);

let v_statusTime = null;

function parseSheetDate(value) {
    if (typeof value === "string" && value.startsWith("Date(")) {
        const p = value.slice(5, -1).split(",").map(Number);
        const asUtc = Date.UTC(p[0], p[1], p[2], p[3] || 0, p[4] || 0, p[5] || 0);
        return asUtc - st_timezone * 3600 * 1000;
    }
    const d = new Date(value);
    return isNaN(d) ? null : d.getTime();
}

function relativeTime(ms) {
    const seconds = Math.round((Date.now() - ms) / 1000);
    if (seconds < 60) return st_justNowText;

    const units = [
        ["year", 31536000],
        ["month", 2592000],
        ["week", 604800],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
    ];
    const rtf = new Intl.RelativeTimeFormat(navigator.language, { numeric: "always" });
    for (const [unit, secs] of units) {
        if (seconds >= secs) return rtf.format(-Math.floor(seconds / secs), unit);
    }
}

function renderDate() {
    if (el_date && v_statusTime !== null) el_date.textContent = relativeTime(v_statusTime);
}

//normalize mood
function normMood(mood) {
    const name = String(mood)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    return `${st_spritePath}${name}.png`;
}

if (el_text) el_text.textContent = st_loadingText;
loadStatus();

setInterval(renderDate, 30 * 1000); // keep updating so recent post changes without refreshing pgae
if (st_refreshMinutes > 0) setInterval(loadStatus, st_refreshMinutes * 60 * 1000);

// status history
const statusHistory = document.getElementById("status-history");
const statusLogLink = document.getElementById("status-log-link");
const statusHistoryClose = document.getElementById("status-history-close");

function setActiveWindow(win) {
    document.querySelectorAll(".window").forEach((w) => {
        w.classList.toggle("active", w === win);
    });
}

function openStatusHistory() {
    if (!statusHistory.hidden) {
        closeStatusHistory();
        return;
    }

    statusHistory.hidden = false;
    const x = (window.innerWidth - statusHistory.offsetWidth) / 2;
    const y = Math.max(16, (window.innerHeight - statusHistory.offsetHeight) / 3);
    statusHistory.style.left = `${Math.max(0, x)}px`;
    statusHistory.style.top = `${y}px`;
    statusHistory.style.zIndex = ++topZ;

    setActiveWindow(statusHistory);
    loadStatusHistory();
}

function closeStatusHistory() {
    statusHistory.hidden = true;
}

statusLogLink.addEventListener("click", (e) => {
    e.preventDefault();
    openStatusHistory();
});

statusHistoryClose.addEventListener("click", closeStatusHistory);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !statusHistory.hidden) closeStatusHistory();
});

async function fetchStatuses() {
    const url = `https://docs.google.com/spreadsheets/d/${st_sheetId}/gviz/tq?tqx=out:json&headers=1`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Sheet unreachable");
    const raw = await response.text();

    const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    const cols = json.table.cols.map((c) => (c.label || "").trim().toLowerCase());

    const find = (...names) => cols.findIndex((c) => names.includes(c));
    const moodIdx = find("feeling");
    const textIdx = find("status", "text");
    const dateIdx = find("timestamp", "date");

    v_statuses = json.table.rows.map((row) => {
        const cell = (i) => (i >= 0 && row.c[i] ? row.c[i].v : "");
        const dateVal = cell(dateIdx);
        return {
            mood: cell(moodIdx),
            text: cell(textIdx),
            time: dateVal ? parseSheetDate(dateVal) : null,
        };
    });

    return v_statuses;
}
async function loadStatus() {
    try {
        if (!el_text || !el_mood || !el_moodImg || !el_date) return;

        const statuses = await fetchStatuses();

        if (!statuses.length) {
            el_moodImg.src = `${st_spritePath}meh.png`;
            el_mood.textContent = "Unknown";
            el_text.textContent = "No information.";
            el_date.textContent = "A long, long time ago";
            return;
        }

        const last = statuses[statuses.length - 1];
        el_mood.textContent = `Feeling ${last.mood}`;
        el_moodImg.src = normMood(last.mood);
        el_text.textContent = last.text;

        v_statusTime = last.time;
        renderDate();
    } catch (err) {
        console.error("Status widget:", err);
    }
}

// STATUS HISTORY
async function loadStatusHistory() {
    const log = document.getElementById("status-history-log");
    if (!log) return;

    log.textContent = st_loadingText;

    try {
        const statuses = v_statuses;

        if (!statuses.length) {
            log.textContent = "No statuses yet.";
            return;
        }

        log.textContent = "";

        statuses
            .slice()
            .reverse()
            .forEach((s, i) => {
                if (i > 0) {
                    const hr = document.createElement("hr");
                    hr.className = "status-divider";
                    log.appendChild(hr);
                }

                const entry = document.createElement("div");
                entry.className = "status-history-entry";

                const moodWrap = document.createElement("div");
                moodWrap.className = "status-mood-container";

                const img = document.createElement("img");
                img.src = normMood(s.mood);
                img.alt = "";
                img.id = "status-mood-img";

                const mood = document.createElement("span");
                mood.textContent = `Feeling ${s.mood}`;
                mood.id = "status-mood";

                moodWrap.append(img, mood);

                const text = document.createElement("p");
                text.textContent = s.text;

                const date = document.createElement("span");
                date.className = "status-history-date";
                if (s.time !== null) {
                    date.textContent = relativeTime(s.time);
                    date.title = new Date(s.time).toLocaleString();
                }

                entry.append(moodWrap, text, date);
                log.appendChild(entry);
            });
    } catch (err) {
        console.error("Status history:", err);
        log.textContent = st_errorText;
    }
}
