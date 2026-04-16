document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.getElementById("googleReviewsCarousel");
    const viewport = document.getElementById("googleReviewsViewport");
    const track = document.getElementById("googleReviewsTrack");
    const prevButton = document.getElementById("googleReviewsPrev");
    const nextButton = document.getElementById("googleReviewsNext");
    const pagination = document.getElementById("googleReviewsPagination");

    if (!carousel || !viewport || !track || !prevButton || !nextButton || !pagination) {
        return;
    }

    const cards = Array.from(track.querySelectorAll(".google-review-card"));

    if (cards.length < 2) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dots = [];
    let activeIndex = 0;
    let autoAdvanceId = null;
    let isVisible = false;
    let scrollFrame = null;

    function getScrollBehavior(preferredBehavior) {
        if (prefersReducedMotion.matches) {
            return "auto";
        }

        return preferredBehavior || "smooth";
    }

    function getCardOffset(index) {
        const card = cards[index];

        if (!card) {
            return 0;
        }

        return card.offsetLeft - track.offsetLeft;
    }

    function updateDots() {
        dots.forEach((dot, index) => {
            const isActive = index === activeIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-current", isActive ? "true" : "false");
        });
    }

    function goToReview(index, preferredBehavior) {
        activeIndex = (index + cards.length) % cards.length;
        viewport.scrollTo({
            left: getCardOffset(activeIndex),
            behavior: getScrollBehavior(preferredBehavior)
        });
        updateDots();
    }

    function syncIndexWithScroll() {
        const scrollLeft = viewport.scrollLeft;
        let closestIndex = 0;
        let smallestDelta = Number.POSITIVE_INFINITY;

        cards.forEach((card, index) => {
            const delta = Math.abs(getCardOffset(index) - scrollLeft);

            if (delta < smallestDelta) {
                smallestDelta = delta;
                closestIndex = index;
            }
        });

        activeIndex = closestIndex;
        updateDots();
    }

    function stopAutoAdvance() {
        if (autoAdvanceId) {
            window.clearInterval(autoAdvanceId);
            autoAdvanceId = null;
        }
    }

    function shouldAutoAdvance() {
        return !prefersReducedMotion.matches && !document.hidden && isVisible;
    }

    function startAutoAdvance() {
        stopAutoAdvance();

        if (!shouldAutoAdvance()) {
            return;
        }

        autoAdvanceId = window.setInterval(() => {
            goToReview(activeIndex + 1);
        }, 4200);
    }

    function buildDots() {
        cards.forEach((card, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", `Ir a la resena ${index + 1}`);
            dot.addEventListener("click", () => {
                stopAutoAdvance();
                goToReview(index);
                startAutoAdvance();
            });
            dots.push(dot);
            pagination.appendChild(dot);
        });
    }

    prevButton.addEventListener("click", () => {
        stopAutoAdvance();
        goToReview(activeIndex - 1);
        startAutoAdvance();
    });

    nextButton.addEventListener("click", () => {
        stopAutoAdvance();
        goToReview(activeIndex + 1);
        startAutoAdvance();
    });

    carousel.addEventListener("mouseenter", stopAutoAdvance);
    carousel.addEventListener("mouseleave", startAutoAdvance);
    carousel.addEventListener("focusin", stopAutoAdvance);
    carousel.addEventListener("focusout", startAutoAdvance);

    viewport.addEventListener("scroll", () => {
        if (scrollFrame) {
            window.cancelAnimationFrame(scrollFrame);
        }

        scrollFrame = window.requestAnimationFrame(syncIndexWithScroll);
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopAutoAdvance();
            return;
        }

        startAutoAdvance();
    });

    if ("ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(() => {
            goToReview(activeIndex, "auto");
        });

        resizeObserver.observe(viewport);
    } else {
        window.addEventListener("resize", () => goToReview(activeIndex, "auto"));
    }

    if ("IntersectionObserver" in window) {
        const visibilityObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    isVisible = entry.isIntersecting;

                    if (isVisible) {
                        startAutoAdvance();
                    } else {
                        stopAutoAdvance();
                    }
                });
            },
            {
                rootMargin: "220px 0px",
                threshold: 0.2
            }
        );

        visibilityObserver.observe(carousel);
    } else {
        isVisible = true;
    }

    if (typeof prefersReducedMotion.addEventListener === "function") {
        prefersReducedMotion.addEventListener("change", startAutoAdvance);
    } else if (typeof prefersReducedMotion.addListener === "function") {
        prefersReducedMotion.addListener(startAutoAdvance);
    }

    buildDots();
    goToReview(0, "auto");
    startAutoAdvance();
});
