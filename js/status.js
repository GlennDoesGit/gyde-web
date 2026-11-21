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

async function loadStatus() {
    try {
        let url = `https://docs.google.com/spreadsheets/d/${st_sheetId}/gviz/tq?tqx=out:json&headers=1`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Sheet unreachable");
        const raw = await response.text();

        // if elements somehow cant be found
        if (!el_text || !el_mood || !el_moodImg || !st_dateId) {
            return;
        }

        const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));

        const cols = json.table.cols.map((c) => (c.label || "").trim().toLowerCase());
        const rows = json.table.rows;
        if (!rows.length) {
            el_moodImg.src = `${st_spritePath}meh.png`;
            el_mood.textContent = "Unknown";
            el_text.textContent = "No information.";
            el_date.textContent = "A long, long time ago";
            throw new Error("No statuses.");
        }

        const find = (...names) => cols.findIndex((c) => names.includes(c));
        const moodIdx = find("feeling");
        const textIdx = find("status", "text");
        const dateIdx = find("timestamp", "date");

        const last = rows[rows.length - 1].c;
        const cell = (i) => (i >= 0 && last[i] ? last[i].v : "");

        if (el_mood) el_mood.textContent = `Feeling ${cell(moodIdx)}`;
        if (el_moodImg) el_moodImg.src = normMood(cell(moodIdx));
        if (el_text) el_text.textContent = cell(textIdx);

        const dateVal = cell(dateIdx);
        v_statusTime = dateVal ? parseSheetDate(dateVal) : null;
        renderDate();
    } catch (err) {
        console.error("Status widget:", err);
    }
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

setInterval(renderDate, 30 * 1000); // keep recent times like "2 minutes ago" ticking
if (st_refreshMinutes > 0) setInterval(loadStatus, st_refreshMinutes * 60 * 1000);
