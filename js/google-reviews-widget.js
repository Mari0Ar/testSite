document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-google-reviews-widget]").forEach(setupGoogleReviewsWidget);
});

function setupGoogleReviewsWidget(root) {
    const track = root.querySelector("[data-google-reviews-track]");
    const dots = root.querySelector("[data-google-reviews-dots]");
    const prevButton = root.querySelector("[data-google-prev]");
    const nextButton = root.querySelector("[data-google-next]");
    const ratingValue = root.querySelector("[data-google-rating]");
    const fiveStarValue = root.querySelector("[data-google-five-star]");
    const totalValue = root.querySelector("[data-google-total]");
    const profileLink = root.querySelector("[data-google-profile-link]");
    const note = root.querySelector("[data-google-widget-note]");

    if (!track || !dots || !prevButton || !nextButton) {
        return;
    }

    const fallbackReviews = Array.from(track.querySelectorAll("[data-google-review]")).map((card) => ({
        authorName: card.dataset.author || "Nombre del cliente",
        dateLabel: card.dataset.date || "",
        rating: normalizeRating(card.dataset.rating || 5),
        text: card.querySelector(".google-review-text")?.textContent?.trim() || "",
        initials: card.dataset.initials || buildInitials(card.dataset.author || "GC"),
        authorPhotoUrl: "",
        reviewUrl: card.dataset.reviewUrl || "#"
    }));

    let currentIndex = 0;

    if (profileLink && root.dataset.profileUrl?.trim()) {
        profileLink.href = root.dataset.profileUrl.trim();
    }

    function getSlides() {
        return Array.from(track.querySelectorAll("[data-google-review]"));
    }

    function getGap() {
        const styles = window.getComputedStyle(track);
        return parseFloat(styles.columnGap || styles.gap || "0") || 0;
    }

    function buildDots() {
        const slides = getSlides();
        dots.innerHTML = "";

        slides.forEach((_, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "google-reviews-dot";
            dot.setAttribute("aria-label", `Ir a la resena ${index + 1}`);
            dot.addEventListener("click", () => {
                currentIndex = index;
                syncSlider();
            });
            dots.appendChild(dot);
        });
    }

    function syncStats(summary, sourceReviews) {
        const normalizedReviews = sourceReviews.length ? sourceReviews : fallbackReviews;
        const numericRatings = normalizedReviews
            .map((review) => normalizeRating(review.rating))
            .filter((value) => Number.isFinite(value) && value > 0);

        const computedAverage = numericRatings.length
            ? numericRatings.reduce((sum, value) => sum + value, 0) / numericRatings.length
            : 5;

        const average = Number.isFinite(summary.rating) ? summary.rating : computedAverage;
        const total = Number.isFinite(summary.totalReviews) ? summary.totalReviews : normalizedReviews.length;
        const fiveStar = Number.isFinite(summary.fiveStarReviews)
            ? summary.fiveStarReviews
            : normalizedReviews.filter((review) => normalizeRating(review.rating) >= 5).length;

        if (ratingValue) {
            ratingValue.textContent = average.toFixed(1);
        }

        if (fiveStarValue) {
            fiveStarValue.textContent = String(fiveStar);
        }

        if (totalValue) {
            totalValue.textContent = String(total);
        }
    }

    function syncSlider() {
        const slides = getSlides();

        if (!slides.length) {
            track.style.transform = "translate3d(0, 0, 0)";
            return;
        }

        currentIndex = ((currentIndex % slides.length) + slides.length) % slides.length;

        const slideWidth = slides[0].getBoundingClientRect().width + getGap();
        track.style.transform = `translate3d(${-currentIndex * slideWidth}px, 0, 0)`;

        Array.from(dots.children).forEach((dot, index) => {
            dot.classList.toggle("is-active", index === currentIndex);
        });
    }

    function move(direction) {
        const slides = getSlides();

        if (!slides.length) {
            return;
        }

        currentIndex += direction;
        syncSlider();
    }

    function renderReviews(sourceReviews) {
        if (!sourceReviews.length) {
            return;
        }

        track.innerHTML = sourceReviews.map(renderReviewCard).join("");
        buildDots();
        currentIndex = 0;
        syncSlider();
    }

    function renderReviewCard(review) {
        const authorName = escapeHtml(review.authorName || "Cliente");
        const dateLabel = escapeHtml(review.dateLabel || "Google");
        const text = escapeHtml(review.text || "");
        const reviewUrl = escapeHtml(review.reviewUrl || "#");
        const rating = Math.max(1, Math.min(5, normalizeRating(review.rating) || 5));
        const initials = escapeHtml(review.initials || buildInitials(review.authorName || "GC"));
        const starsLabel = `${rating} de 5 estrellas`;
        const photoMarkup = review.authorPhotoUrl
            ? `<img src="${escapeHtml(review.authorPhotoUrl)}" alt="" loading="lazy">`
            : initials;

        return `
            <article class="google-review-card" data-google-review data-rating="${rating}" data-author="${authorName}" data-date="${dateLabel}" data-review-url="${reviewUrl}">
                <div class="google-review-card-top">
                    <div class="google-review-author">
                        <span class="google-review-avatar">${photoMarkup}</span>
                        <div class="google-review-author-copy">
                            <strong>${authorName}</strong>
                            <span>${dateLabel}</span>
                        </div>
                    </div>
                    <span class="google-review-mark" aria-hidden="true"><i class="fa-brands fa-google"></i></span>
                </div>
                <p class="google-review-stars" aria-label="${starsLabel}">${new Array(rating).fill("&#9733;").join("")}</p>
                <p class="google-review-text">${text}</p>
                <span class="google-review-accent" aria-hidden="true"></span>
            </article>
        `;
    }

    prevButton.addEventListener("click", () => move(-1));
    nextButton.addEventListener("click", () => move(1));
    window.addEventListener("resize", syncSlider);

    buildDots();
    syncStats({}, fallbackReviews);
    syncSlider();

    const endpoint = root.dataset.endpoint?.trim();

    if (!endpoint) {
        return;
    }

    fetch(endpoint, {
        headers: {
            Accept: "application/json"
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return response.json();
        })
        .then((payload) => {
            const normalized = normalizePayload(payload, root.dataset.profileUrl || "");

            if (normalized.isPlaceholder) {
                if (profileLink && normalized.profileUrl) {
                    profileLink.href = normalized.profileUrl;
                }

                if (note) {
                    note.textContent = "";
                }

                return;
            }

            if (normalized.reviews.length) {
                renderReviews(normalized.reviews);
            }

            syncStats(normalized, normalized.reviews);

            if (profileLink && normalized.profileUrl) {
                profileLink.href = normalized.profileUrl;
            }

            if (note) {
                note.textContent = formatSyncNote(normalized.generatedAt);
            }
        })
        .catch(() => {
            if (note) {
                note.textContent = "";
            }
        });
}

function normalizePayload(payload, fallbackProfileUrl) {
    const source = Array.isArray(payload)
        ? { reviews: payload }
        : payload || {};

    const reviews = (source.reviews || source.result?.reviews || source.reviewList?.reviews || [])
        .map(normalizeReview)
        .filter((review) => review.authorName || review.text);

    return {
        generatedAt: source.generatedAt || source.updatedAt || source.syncedAt || "",
        isPlaceholder: Boolean(source.isPlaceholder),
        rating: readNumeric(source.rating) ?? readNumeric(source.averageRating) ?? readNumeric(source.result?.rating),
        totalReviews: readNumeric(source.totalReviews) ?? readNumeric(source.totalReviewCount) ?? readNumeric(source.userRatingCount) ?? readNumeric(source.result?.userRatingCount),
        fiveStarReviews: readNumeric(source.fiveStarReviews),
        profileUrl: source.profileUrl || source.googleMapsUri || source.result?.googleMapsUri || fallbackProfileUrl,
        reviews
    };
}

function normalizeReview(review) {
    const authorName = review.authorName
        || review.author_name
        || review.authorAttribution?.displayName
        || review.reviewer?.displayName
        || review.author
        || "Cliente";
    const rating = normalizeRating(review.rating || review.starRating || review.stars || 5);
    const text = (review.text?.text || review.comment || review.originalText?.text || review.text || "").trim();

    return {
        authorName,
        initials: buildInitials(authorName),
        rating,
        text: text || buildFallbackReviewText(rating),
        dateLabel: review.relativeTimeDescription
            || review.relativePublishTimeDescription
            || formatDateLabel(review.publishTime || review.createTime || review.updateTime || review.reviewTime),
        authorPhotoUrl: review.authorPhotoUrl
            || review.author_photo_url
            || review.authorAttribution?.photoUri
            || review.reviewer?.profilePhotoUrl
            || "",
        reviewUrl: review.reviewUrl
            || review.authorAttribution?.uri
            || review.reviewer?.profileUrl
            || "#"
    };
}

function normalizeRating(value) {
    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string") {
        const direct = Number.parseFloat(value);

        if (Number.isFinite(direct)) {
            return direct;
        }

        const enumMap = {
            ONE: 1,
            TWO: 2,
            THREE: 3,
            FOUR: 4,
            FIVE: 5,
            ONE_STAR: 1,
            TWO_STARS: 2,
            THREE_STARS: 3,
            FOUR_STARS: 4,
            FIVE_STARS: 5
        };

        return enumMap[value.toUpperCase()] || 5;
    }

    return 5;
}

function readNumeric(value) {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : null;
}

function buildInitials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("") || "GC";
}

function formatDateLabel(value) {
    if (!value) {
        return "";
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return String(value);
    }

    return parsed.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "short"
    });
}

function formatSyncNote(value) {
    return "";
}

function buildFallbackReviewText(rating) {
    const normalizedRating = normalizeRating(rating);

    if (normalizedRating >= 5) {
        return "Dejo una calificacion de 5 estrellas en Google.";
    }

    return `Dejo una calificacion de ${normalizedRating} estrellas en Google.`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
