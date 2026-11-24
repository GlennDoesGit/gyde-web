const tooltip = document.getElementById("tooltip");
const offset = 24;
let tooltipTarget = null;

function getTooltipTarget(el) {
    const target = el.closest("[data-tooltip]");
    // keep your original exclusion for nav anchors
    if (target && target.matches("nav a.anchor")) return null;
    return target;
}

function positionTooltip(e) {
    let x = e.clientX + offset;
    let y = e.clientY + offset;

    // keep the tooltip inside the viewport
    const rect = tooltip.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) x = e.clientX - rect.width - offset;
    if (y + rect.height > window.innerHeight) y = e.clientY - rect.height - offset;

    tooltip.style.transform = `translate(${x}px, ${y}px)`;
}

document.addEventListener("mouseover", (e) => {
    const target = getTooltipTarget(e.target);
    if (!target || target === tooltipTarget) return;

    tooltipTarget = target;
    tooltip.innerHTML = target.dataset.tooltip;
    tooltip.style.display = "block";
    positionTooltip(e);
});

document.addEventListener("mousemove", (e) => {
    if (tooltipTarget) positionTooltip(e);
});

document.addEventListener("mouseout", (e) => {
    if (!tooltipTarget) return;
    // ignore moves between children of the same tooltip element
    if (tooltipTarget.contains(e.relatedTarget)) return;

    tooltipTarget = null;
    tooltip.style.display = "none";
});

document.addEventListener("mousemove", (e) => {
    if (!tooltipTarget) return;
    if (!document.contains(tooltipTarget)) {
        tooltipTarget = null;
        tooltip.style.display = "none";
        return;
    }
    positionTooltip(e);
});
