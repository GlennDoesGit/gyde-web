const splashTexts = [
    "nat 1...",
    "welcome!",
    "a portfolio website",
    "a personal website",
    "bump me to work on a game",
    "webmaster probably sleep deprived.",
    "there's probably a bug somewhere",
    "make games",
    "optimized soon",
    "likely programming",
    "probably responsive",
    "make it exist first",
    "make it good later",
    "you should make an indie website",
    "listen to joji",
    "listen to girl in red",
    "listen to coldplay",
    "listen to porter robinson",
    "listen to c418",
    "nat 20!",
    "it works for me",
    "javascript is hard",
    "javascript is scary",
    "css is very cool",
    "but minecraft did it first",
    "webmaster LOVES APIs!!!",
    "I love the indie web!",
    "it's cool to self host",
    "what a thrill",
    "すしとみずください",
    "ジャイドのウェブ",
    "にほんごのべんきょする",
    "made with hard work and love for the indie-web",
];

splashTexts.push(`1 in ${splashTexts.length + 1} to get this btw`);

const splashElement = document.getElementById("splash-text");

const randomIndex = Math.floor(Math.random() * splashTexts.length);

splashElement.textContent = splashTexts[randomIndex];

document.querySelectorAll(".wave-text").forEach((waveText) => {
    const string = waveText.textContent;
    waveText.textContent = "";

    [...string].forEach((char, i) => {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.animationDelay = `${i * 0.1}s`;
        waveText.appendChild(span);
    });
});

// Header morphing.
document.addEventListener("DOMContentLoaded", () => {
    const anchors = document.querySelectorAll(".anchor");

    anchors.forEach((anchor, index) => {
        const path = anchor.querySelector("path");
        const textPath = anchor.querySelector("textPath");

        if (!path) return;

        const pathId = `path-${index}`;
        path.setAttribute("id", pathId);
        if (textPath) textPath.setAttribute("href", `#${pathId}`);

        const animateTo = (d, ease, duration = 1) => {
            gsap.killTweensOf(path);
            gsap.to(path, { attr: { d }, ease, duration });
        };

        const OPEN_D = "M 10, 70 Q 100, 40 190, 70";
        const CLOSE_D = "M 10, 70 Q 100, 70 190, 70";

        const li = anchor.closest("li") || anchor.parentElement;
        if (!li) return;

        li.addEventListener("pointerenter", () => animateTo(OPEN_D, "elastic.out(1.3, 0.4)", 0.8));
        li.addEventListener("pointerleave", () => animateTo(CLOSE_D, "elastic.out(1.1, 0.3)", 1.2));

        li.addEventListener("focusin", () => animateTo(OPEN_D, "elastic.out(1.3, 0.4)", 0.8));
        li.addEventListener("focusout", () => animateTo(CLOSE_D, "elastic.out(1.6, 0.2)", 0.8));
    });
});

// Win95 Window Focusing
document.querySelectorAll(".window").forEach((win) => {
    win.addEventListener("mousedown", () => {
        document.querySelectorAll(".window").forEach((w) => w.classList.remove("active"));
        win.classList.add("active");
    });
});

// Activate all windows if clicked outside.
document.addEventListener("mousedown", (e) => {
    if (!e.target.closest(".window")) {
        document.querySelectorAll(".window").forEach((win) => {
            win.classList.add("active");
        });
    }
});

// Win98 window dragging
let topZ = 900;

function makeDraggable(win) {
    const bar = win.querySelector(".winbar");
    if (!bar) return;

    let offsetX = 0;
    let offsetY = 0;

    bar.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".controls")) return;

        const rect = win.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        win.style.zIndex = ++topZ;
        bar.setPointerCapture(e.pointerId);

        const onMove = (ev) => {
            const maxX = window.innerWidth - win.offsetWidth;
            const maxY = window.innerHeight - win.offsetHeight;
            const x = Math.min(Math.max(0, ev.clientX - offsetX), Math.max(0, maxX));
            const y = Math.min(Math.max(0, ev.clientY - offsetY), Math.max(0, maxY));
            win.style.left = `${x}px`;
            win.style.top = `${y}px`;
        };

        const onUp = (ev) => {
            bar.releasePointerCapture(ev.pointerId);
            bar.removeEventListener("pointermove", onMove);
            bar.removeEventListener("pointerup", onUp);
            bar.removeEventListener("pointercancel", onUp);
        };

        bar.addEventListener("pointermove", onMove);
        bar.addEventListener("pointerup", onUp);
        bar.addEventListener("pointercancel", onUp);
    });
}

document.querySelectorAll(".window.draggable").forEach(makeDraggable);
