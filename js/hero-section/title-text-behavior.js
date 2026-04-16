const heroWords = [
    "Soluciones Contables.",
    "Asesoramiento personalizado.",
    "Estrategia y planificación.",
    "Crecimiento para tu empresa."
];

const textElement = document.getElementById("dynamic-text");
const prefersReducedHeroMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let heroWordIndex = 0;
let heroTimeouts = [];
let heroSequenceFinished = false;
const heroWordStateClasses = ["is-typing", "is-erasing", "is-resting"];

function clearHeroTimers() {
    heroTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    heroTimeouts = [];
}

function scheduleHeroTask(callback, delay) {
    const timeoutId = window.setTimeout(() => {
        heroTimeouts = heroTimeouts.filter((item) => item !== timeoutId);
        callback();
    }, delay);

    heroTimeouts.push(timeoutId);
}

if (textElement) {
    function setHeroWordState(state) {
        textElement.classList.remove(...heroWordStateClasses);

        if (state) {
            textElement.classList.add(state);
        }
    }

    function applyHeroWordStyle(word) {
        textElement.style.color = "#FFD0F0";
        textElement.style.fontWeight = word === "Soluciones Contables." ? "700" : "600";
    }

    function getTypeDelay(word, characterIndex) {
        const character = word[characterIndex];

        if (character === " ") {
            return 34;
        }

        if (/[.,]/.test(character)) {
            return 92;
        }

        return characterIndex < 3 ? 52 : 44;
    }

    function getEraseDelay(word, characterIndex) {
        const character = word[characterIndex - 1];

        if (character === " ") {
            return 18;
        }

        if (/[.,]/.test(character)) {
            return 26;
        }

        return 20;
    }

    function typeEffect(word, callback, shouldErase = true) {
        let letterIndex = 0;
        textElement.textContent = "";
        applyHeroWordStyle(word);
        setHeroWordState("is-typing");

        function typeLetter() {
            if (letterIndex < word.length) {
                textElement.textContent = word.slice(0, letterIndex + 1);
                letterIndex += 1;
                scheduleHeroTask(typeLetter, getTypeDelay(word, letterIndex - 1));
            } else {
                setHeroWordState("is-resting");

                if (!shouldErase) {
                    heroSequenceFinished = true;

                    if (typeof callback === "function") {
                        scheduleHeroTask(callback, word === "Soluciones Contables." ? 2150 : 1350);
                    }

                    return;
                }

                scheduleHeroTask(() => eraseEffect(callback), word === "Soluciones Contables." ? 2150 : 1350);
            }
        }

        scheduleHeroTask(typeLetter, 60);
    }

    function eraseEffect(callback) {
        const currentWord = textElement.textContent;
        let letterIndex = currentWord.length;
        setHeroWordState("is-erasing");

        function eraseLetter() {
            if (letterIndex > 0) {
                letterIndex -= 1;
                textElement.textContent = currentWord.substring(0, letterIndex);
                scheduleHeroTask(eraseLetter, getEraseDelay(currentWord, letterIndex + 1));
            } else {
                scheduleHeroTask(() => {
                    setHeroWordState("is-typing");
                    callback();
                }, 140);
            }
        }

        scheduleHeroTask(eraseLetter, 70);
    }

    function finishHeroSequence() {
        typeEffect(heroWords[0], null, false);
    }

    function cycleText() {
        if (heroSequenceFinished) {
            return;
        }

        const currentWord = heroWords[heroWordIndex];
        const isLastConnector = heroWordIndex === heroWords.length - 1;

        typeEffect(currentWord, () => {
            if (isLastConnector) {
                eraseEffect(finishHeroSequence);
                return;
            }

            heroWordIndex += 1;
            cycleText();
        });
    }

    function syncHeroMotion() {
        clearHeroTimers();
        heroSequenceFinished = false;

        if (prefersReducedHeroMotion.matches) {
            const firstWord = heroWords[0];
            applyHeroWordStyle(firstWord);
            textElement.textContent = firstWord;
            setHeroWordState("is-resting");
            return;
        }

        heroWordIndex = 0;
        cycleText();
    }

    syncHeroMotion();

    if (typeof prefersReducedHeroMotion.addEventListener === "function") {
        prefersReducedHeroMotion.addEventListener("change", syncHeroMotion);
    } else if (typeof prefersReducedHeroMotion.addListener === "function") {
        prefersReducedHeroMotion.addListener(syncHeroMotion);
    }
}
