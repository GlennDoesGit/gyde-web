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

const tooltip = document.getElementById("tooltip");
const offset = 24;

document.querySelectorAll("[data-tooltip]:not(nav a.anchor)").forEach((el) => {
    el.addEventListener("mouseenter", () => {
        tooltip.innerHTML = el.dataset.tooltip;
        tooltip.style.display = "block";
    });

    el.addEventListener("mousemove", (e) => {
        let x = e.clientX + offset;
        let y = e.clientY + offset;

        // keep the tooltip inside the viewport
        const rect = tooltip.getBoundingClientRect();
        if (x + rect.width > window.innerWidth) x = e.clientX - rect.width - offset;
        if (y + rect.height > window.innerHeight) y = e.clientY - rect.height - offset;

        tooltip.style.transform = `translate(${x}px, ${y}px)`;
    });

    el.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
    });
});
