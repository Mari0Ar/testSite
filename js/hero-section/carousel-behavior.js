document.addEventListener("DOMContentLoaded", () => {
    const heroSwiperElement = document.querySelector(".hero-swiper");

    if (typeof Swiper === "undefined" || !heroSwiperElement) {
        return;
    }

    const prefersReducedHeroMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let heroSwiperInstance = null;

    function initHeroSwiper() {
        if (heroSwiperInstance) {
            heroSwiperInstance.destroy(true, true);
        }

        heroSwiperInstance = new Swiper(heroSwiperElement, {
            loop: true,
            speed: prefersReducedHeroMotion.matches ? 0 : 700,
            slidesPerView: 1,
            grabCursor: true,
            effect: "fade",
            fadeEffect: {
                crossFade: true
            },
            autoplay: prefersReducedHeroMotion.matches
                ? false
                : {
                    delay: 3600,
                    disableOnInteraction: false
                },
            pagination: {
                el: ".swiper-pagination",
                clickable: true
            }
        });
    }

    initHeroSwiper();

    if (typeof prefersReducedHeroMotion.addEventListener === "function") {
        prefersReducedHeroMotion.addEventListener("change", initHeroSwiper);
    } else if (typeof prefersReducedHeroMotion.addListener === "function") {
        prefersReducedHeroMotion.addListener(initHeroSwiper);
    }
});
