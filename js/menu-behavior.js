document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");
    const toggle = document.getElementById("menuToggle");
    const toggleMenu = document.getElementById("mobileMenu");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const deferredSections = Array.from(document.querySelectorAll(".team-section, .services-section, .clients-section, .contact-section"));
    let deferredSectionsDisabled = false;

    function getScrollBehavior() {
        return prefersReducedMotion.matches ? "auto" : "smooth";
    }

    function getScrollTargetTop(target) {
        const offset = 6;
        return Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
    }

    function disableDeferredSectionsForAnchors() {
        if (deferredSectionsDisabled) {
            return;
        }

        deferredSections.forEach((section) => {
            section.style.contentVisibility = "visible";
            section.style.containIntrinsicSize = "auto";
        });

        deferredSectionsDisabled = true;
    }

    function measureStableTargetTop(target, callback) {
        let lastTop = null;
        let stableFrames = 0;
        let attempts = 0;

        function step() {
            const currentTop = getScrollTargetTop(target);

            if (lastTop !== null && Math.abs(currentTop - lastTop) < 1) {
                stableFrames += 1;
            } else {
                stableFrames = 0;
            }

            lastTop = currentTop;
            attempts += 1;

            if (stableFrames >= 2 || attempts >= 8) {
                callback(currentTop);
                return;
            }

            window.requestAnimationFrame(step);
        }

        window.requestAnimationFrame(step);
    }

    function scrollToSection(target) {
        const behavior = getScrollBehavior();
        disableDeferredSectionsForAnchors();

        if (behavior === "auto") {
            window.scrollTo({ top: getScrollTargetTop(target), behavior: "auto" });
            return;
        }

        measureStableTargetTop(target, (top) => {
            window.scrollTo({ top, behavior: "smooth" });
        });
    }

    function setMenuState(isOpen) {
        if (!toggle || !toggleMenu) {
            return;
        }

        toggleMenu.classList.toggle("active", isOpen);
        toggle.classList.toggle("active", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
    }

    if (toggle && toggleMenu) {
        toggle.addEventListener("click", () => {
            const shouldOpen = !toggleMenu.classList.contains("active");
            setMenuState(shouldOpen);
        });

        document.addEventListener("click", (event) => {
            if (!toggleMenu.classList.contains("active")) {
                return;
            }

            if (navbar?.contains(event.target)) {
                return;
            }

            setMenuState(false);
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 900) {
                setMenuState(false);
            }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const href = anchor.getAttribute("href");

            if (!href || href === "#" || anchor.target === "_blank") {
                return;
            }

            const target = document.querySelector(href);

            if (!target) {
                return;
            }

            event.preventDefault();
            setMenuState(false);
            window.requestAnimationFrame(() => {
                scrollToSection(target);
            });
        });
    });
});
