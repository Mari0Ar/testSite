document.addEventListener("DOMContentLoaded", () => {
    const sliderTrack = document.getElementById("clients-slide-track");
    const prevButton = document.getElementById("prev-slide-btn");
    const nextButton = document.getElementById("next-slide-btn");

    if (!sliderTrack || !prevButton || !nextButton || !sliderTrack.children.length) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isTransitioning = false;
    let autoSlideInterval = null;

    function getSlideWidth() {
        const firstSlide = sliderTrack.querySelector(".client-slide");

        if (!firstSlide) {
            return 0;
        }

        const trackStyles = window.getComputedStyle(sliderTrack);
        const gap = Number.parseFloat(trackStyles.gap || trackStyles.columnGap || "0");

        return firstSlide.getBoundingClientRect().width + gap;
    }

    function resetTrackPosition() {
        sliderTrack.style.transition = "none";
        sliderTrack.style.transform = "translateX(0)";
    }

    function moveToPrevSlide() {
        const slideWidth = getSlideWidth();

        if (isTransitioning || !slideWidth) {
            return;
        }

        isTransitioning = true;

        const lastSlide = sliderTrack.lastElementChild;

        if (!lastSlide) {
            isTransitioning = false;
            return;
        }

        sliderTrack.insertBefore(lastSlide, sliderTrack.firstChild);
        sliderTrack.style.transition = "none";
        sliderTrack.style.transform = `translateX(-${slideWidth}px)`;
        sliderTrack.getBoundingClientRect();

        requestAnimationFrame(() => {
            sliderTrack.style.transition = "transform 0.6s ease-in-out";
            sliderTrack.style.transform = "translateX(0)";
        });

        sliderTrack.addEventListener(
            "transitionend",
            () => {
                isTransitioning = false;
            },
            { once: true }
        );
    }

    function moveToNextSlide() {
        const slideWidth = getSlideWidth();

        if (isTransitioning || !slideWidth) {
            return;
        }

        isTransitioning = true;
        sliderTrack.style.transition = "transform 0.6s ease-in-out";
        sliderTrack.style.transform = `translateX(-${slideWidth}px)`;

        sliderTrack.addEventListener(
            "transitionend",
            () => {
                const firstSlide = sliderTrack.firstElementChild;

                sliderTrack.style.transition = "none";
                sliderTrack.style.transform = "translateX(0)";

                if (firstSlide) {
                    sliderTrack.appendChild(firstSlide);
                }

                isTransitioning = false;
            },
            { once: true }
        );
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            window.clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    function startAutoSlide() {
        stopAutoSlide();

        if (prefersReducedMotion.matches) {
            return;
        }

        autoSlideInterval = window.setInterval(moveToNextSlide, 2800);
    }

    prevButton.addEventListener("click", () => {
        stopAutoSlide();
        moveToPrevSlide();
        startAutoSlide();
    });

    nextButton.addEventListener("click", () => {
        stopAutoSlide();
        moveToNextSlide();
        startAutoSlide();
    });

    sliderTrack.addEventListener("mouseenter", stopAutoSlide);
    sliderTrack.addEventListener("mouseleave", startAutoSlide);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopAutoSlide();
        } else {
            startAutoSlide();
        }
    });

    window.addEventListener("resize", resetTrackPosition);

    if (typeof prefersReducedMotion.addEventListener === "function") {
        prefersReducedMotion.addEventListener("change", startAutoSlide);
    } else if (typeof prefersReducedMotion.addListener === "function") {
        prefersReducedMotion.addListener(startAutoSlide);
    }

    startAutoSlide();
});
