const waveBackgroundTargets = [
    { selector: ".hero-gradient-container", theme: "wave-theme-dark", classTarget: ".hero-section" },
    { selector: ".team-section", theme: "wave-theme-light" },
    { selector: ".services-section", theme: "wave-theme-dark" },
    { selector: ".clients-section", theme: "wave-theme-light" },
    { selector: ".contact-section", theme: "wave-theme-dark" }
];

const prefersReducedWaveMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const isBraveBrowser = typeof navigator !== "undefined"
    && typeof navigator.brave === "object"
    && typeof navigator.brave?.isBrave === "function";

if (isBraveBrowser) {
    document.documentElement.classList.add("is-brave");
}

function buildWaveAnimate(values, duration, begin = "0s", disabled = false) {
    if (prefersReducedWaveMotion.matches || disabled) {
        return "";
    }

    return `<animate attributeName="d" dur="${duration}" repeatCount="indefinite" keyTimes="0;0.333;0.667;1" calcMode="spline" keySplines="0.42 0 0.2 1;0.42 0 0.2 1;0.42 0 0.2 1" begin="${begin}" values="${values}"></animate>`;
}

function buildWaveSvg(idPrefix) {
    const pathOneA = "M0 360L0 214Q165 198 330 220T660 246T990 224T1320 208T1650 242T1980 224L1980 360Z";
    const pathOneB = "M0 360L0 236Q165 254 330 230T660 212T990 248T1320 258T1650 214T1980 238L1980 360Z";
    const pathOneC = "M0 360L0 206Q165 232 330 206T660 238T990 214T1320 226T1650 262T1980 218L1980 360Z";

    const pathTwoA = "M0 360L0 246Q165 274 330 248T660 226T990 238T1320 246T1650 228T1980 252L1980 360Z";
    const pathTwoB = "M0 360L0 228Q165 250 330 220T660 252T990 226T1320 214T1650 246T1980 232L1980 360Z";
    const pathTwoC = "M0 360L0 258Q165 232 330 268T660 236T990 252T1320 230T1650 216T1980 248L1980 360Z";

    const pathThreeA = "M0 360L0 188Q165 176 330 198T660 216T990 194T1320 184T1650 202T1980 192L1980 360Z";
    const pathThreeB = "M0 360L0 210Q165 226 330 194T660 182T990 206T1320 220T1650 190T1980 204L1980 360Z";
    const pathThreeC = "M0 360L0 194Q165 208 330 186T660 214T990 180T1320 196T1650 224T1980 188L1980 360Z";
    const braveLiteMode = isBraveBrowser;

    return `
        <svg viewBox="0 0 1980 360" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs>
                <linearGradient id="${idPrefix}-grad-a" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color: var(--wave-stop-1);"></stop>
                    <stop offset="32%" style="stop-color: var(--wave-stop-2);"></stop>
                    <stop offset="68%" style="stop-color: var(--wave-stop-3);"></stop>
                    <stop offset="100%" style="stop-color: var(--wave-stop-4);"></stop>
                </linearGradient>
                <linearGradient id="${idPrefix}-grad-b" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" style="stop-color: var(--wave-stop-1);"></stop>
                    <stop offset="36%" style="stop-color: var(--wave-stop-2);"></stop>
                    <stop offset="72%" style="stop-color: var(--wave-stop-3);"></stop>
                    <stop offset="100%" style="stop-color: var(--wave-stop-4);"></stop>
                </linearGradient>
            </defs>
            <path class="wave-layer wave-layer-1" fill="url(#${idPrefix}-grad-a)" d="${pathOneA}">
                ${buildWaveAnimate(`${pathOneA};${pathOneB};${pathOneC};${pathOneA}`, braveLiteMode ? "24s" : "17s")}
            </path>
            <path class="wave-layer wave-layer-2" fill="url(#${idPrefix}-grad-b)" d="${pathTwoA}">
                ${buildWaveAnimate(`${pathTwoA};${pathTwoB};${pathTwoC};${pathTwoA}`, braveLiteMode ? "20s" : "13s", braveLiteMode ? "-1.4s" : "-2.8s", braveLiteMode)}
            </path>
            <path class="wave-layer wave-layer-3" fill="url(#${idPrefix}-grad-a)" d="${pathThreeA}">
                ${buildWaveAnimate(`${pathThreeA};${pathThreeB};${pathThreeC};${pathThreeA}`, braveLiteMode ? "18s" : "11s", braveLiteMode ? "-1s" : "-4.2s", braveLiteMode)}
            </path>
        </svg>
    `;
}

function mountWaveBackgrounds() {
    waveBackgroundTargets.forEach((config, index) => {
        const host = document.querySelector(config.selector);

        if (!host || host.querySelector(".section-ambient-wave")) {
            return;
        }

        const waveLayer = document.createElement("div");
        waveLayer.className = `section-ambient-wave ${config.theme}`;
        waveLayer.setAttribute("aria-hidden", "true");
        waveLayer.innerHTML = buildWaveSvg(`section-wave-${index}`);

        if (config.selector === ".hero-gradient-container") {
            host.appendChild(waveLayer);
        } else {
            host.prepend(waveLayer);
        }

        const classTarget = config.classTarget ? document.querySelector(config.classTarget) : host;
        classTarget?.classList.add("has-ambient-wave");
    });
}

function rebuildWaveBackgrounds() {
    document.querySelectorAll(".section-ambient-wave").forEach((waveLayer) => waveLayer.remove());
    mountWaveBackgrounds();
}

mountWaveBackgrounds();

if (typeof prefersReducedWaveMotion.addEventListener === "function") {
    prefersReducedWaveMotion.addEventListener("change", rebuildWaveBackgrounds);
} else if (typeof prefersReducedWaveMotion.addListener === "function") {
    prefersReducedWaveMotion.addListener(rebuildWaveBackgrounds);
}
