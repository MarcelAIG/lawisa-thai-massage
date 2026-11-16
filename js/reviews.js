/**
 * LAWISA Thaï Massage — Google Reviews Configuration & Carousel Controller
 * =========================================================================
 * - Easy manual updates: edit the `reviews` array below at any time.
 * - Optional automatic updates: set `enableAutoFetch: true` when `/api/reviews`
 *   is configured with GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID.
 */
window.LAWISA_REVIEWS_CONFIG = {
    businessName: "LAWISA Thaï Massage",
    rating: "5.0",
    totalReviews: 222,
    mapsProfileUrl: "https://maps.app.goo.gl/87m61ci81Ua11WW76",

    // Paste your Google Place ID (e.g. "ChIJ...") or direct review-request URL ("https://g.page/r/.../review")
    // When set, the "Leave a Review" button opens Google's write-review modal directly;
    // otherwise it opens LAWISA's Google Business Profile listing.
    placeId: "",
    directWriteReviewUrl: "",

    enableAutoFetch: false,
    apiEndpoint: "/api/reviews",

    reviews: [
        {
            author: "Sophie L.",
            rating: 5,
            text_fr: "Une expérience exceptionnelle. Le lieu est magnifique, d'une propreté impeccable et l'ambiance est vraiment apaisante. Le massage thaï aux huiles était parfait.",
            text_en: "An exceptional experience. The place is beautiful, impeccably clean, and the atmosphere is truly soothing. The Thai warm oil massage was perfect."
        },
        {
            author: "Marc D.",
            rating: 5,
            text_fr: "Le meilleur massage thaï de Paris. Le salon est luxueux, décoré avec beaucoup de goût. On s'y sent immédiatement bien. L'équipe est très professionnelle.",
            text_en: "The best Thai massage in Paris. The salon is luxurious, decorated with great taste. You immediately feel at ease. The team is very professional."
        },
        {
            author: "Camille P.",
            rating: 5,
            text_fr: "Une véritable parenthèse de détente au cœur de Paris. Les praticiennes sont très douées et à l'écoute. J'y retournerai les yeux fermés.",
            text_en: "A true oasis of relaxation in the heart of Paris. The practitioners are very skilled and attentive. I will definitely be back."
        },
        {
            author: "Julien T.",
            rating: 5,
            text_fr: "Superbe endroit ! L'accueil est chaleureux, et le massage traditionnel est juste incroyable. Une vraie évasion au cœur du 8ème arrondissement.",
            text_en: "Superb place! Warm welcome, and the traditional Thai massage is just incredible. A true escape in the heart of the 8th arrondissement."
        },
        {
            author: "Elodie R.",
            rating: 5,
            text_fr: "Propreté impeccable et massages très professionnels. La masseuse était très douée et le cadre parfait. J'ai choisi le massage aux huiles chaudes, un pur bonheur !",
            text_en: "Impeccable cleanliness and very professional massages. The practitioner was very skilled and the setting was perfect. Pure bliss!"
        },
        {
            author: "Antoine B.",
            rating: 5,
            text_fr: "Excellente adresse rue du Faubourg Saint-Honoré. Le cadre est relaxant et l'équipe est très attentionnée. Le massage traditionnel thaïlandais m'a fait énormément de bien.",
            text_en: "Excellent address on Rue du Faubourg Saint-Honoré. The setting is relaxing and the team is very attentive. The traditional Thai massage did me a world of good."
        },
        {
            author: "Laurence G.",
            rating: 5,
            text_fr: "J'ai passé un moment divin. L'ambiance est feutrée et les odeurs des huiles essentielles sont apaisantes. Je recommande vivement le massage mixte !",
            text_en: "I had a divine time. The atmosphere is cozy and the essential oils smell wonderful. I highly recommend the mixed Thai & warm oil massage!"
        },
        {
            author: "Guillaume V.",
            rating: 5,
            text_fr: "Prestation très haut de gamme. Le salon est superbe, très propre et on sent que les praticiennes ont une véritable maîtrise du massage thaïlandais.",
            text_en: "Very high-end service. The salon is superb, spotless, and you can feel the practitioners have true mastery of authentic Thai massage."
        }
    ]
};

(function initLawisaReviews() {
    const config = window.LAWISA_REVIEWS_CONFIG;
    if (!config) return;

    const GOOGLE_G_SVG = `
        <svg class="lawisa-review-g-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"/>
            <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"/>
        </svg>
    `;

    function getWriteReviewTargetUrl() {
        if (config.directWriteReviewUrl && config.directWriteReviewUrl.trim() !== "") {
            return config.directWriteReviewUrl.trim();
        }
        if (config.placeId && config.placeId.trim() !== "") {
            return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(config.placeId.trim())}`;
        }
        return config.mapsProfileUrl;
    }

    function escapeHtml(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function buildCardHtml(review, lang) {
        const rawText = (lang === "en" ? (review.text_en || review.text_fr || review.text) : (review.text_fr || review.text)) || "";
        const moreLabel = lang === "en" ? "More" : "Plus";
        const lessLabel = lang === "en" ? "Less" : "Moins";
        const isLong = rawText.length > 125;
        const shortText = isLong ? rawText.slice(0, 122).trim() + "..." : rawText;
        const ratingNum = Number(review.rating) || 5;
        const stars = "★".repeat(ratingNum);
        const starsAriaLabel = lang === "en" ? `${ratingNum} out of 5 stars` : `${ratingNum} sur 5 étoiles`;

        return `
            <article class="lawisa-review-card" data-full-text="${escapeHtml(rawText)}" data-short-text="${escapeHtml(shortText)}">
                <div class="lawisa-review-card-top">
                    <span class="lawisa-review-score">${ratingNum}</span>
                    <span class="lawisa-review-stars" aria-label="${starsAriaLabel}">${stars}</span>
                </div>
                <p class="lawisa-review-body">
                    <span class="lawisa-review-body-text">${escapeHtml(shortText)}</span>
                    ${isLong ? `<button type="button" class="lawisa-review-more-btn" data-more-label="${moreLabel}" data-less-label="${lessLabel}">${moreLabel}</button>` : ""}
                </p>
                <div class="lawisa-review-card-footer">
                    <span class="lawisa-review-author">${escapeHtml(review.author)}</span>
                    ${GOOGLE_G_SVG}
                </div>
            </article>
        `;
    }

    function renderReviews(reviewsList) {
        const track = document.getElementById("lawisa-reviews-track");
        if (!track) return;

        const lang = document.documentElement.lang === "en" ? "en" : "fr";
        const validReviews = Array.isArray(reviewsList) && reviewsList.length > 0 ? reviewsList : config.reviews;

        // Duplicate once for seamless 0% -> -50% right-to-left loop
        const fullMarqueeSet = [...validReviews, ...validReviews];
        track.innerHTML = fullMarqueeSet.map(r => buildCardHtml(r, lang)).join("");

        track.querySelectorAll(".lawisa-review-more-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const card = btn.closest(".lawisa-review-card");
                const textEl = card.querySelector(".lawisa-review-body-text");
                const expanded = card.classList.toggle("is-expanded");
                textEl.textContent = expanded ? card.getAttribute("data-full-text") : card.getAttribute("data-short-text");
                btn.textContent = expanded ? btn.getAttribute("data-less-label") : btn.getAttribute("data-more-label");
            });
        });
    }

    function setupControlsAndButtons() {
        document.querySelectorAll("[data-lawisa-rating]").forEach(el => {
            el.textContent = config.rating;
        });
        document.querySelectorAll("[data-lawisa-review-count]").forEach(el => {
            el.textContent = config.totalReviews;
        });
        document.querySelectorAll("[data-lawisa-maps-link]").forEach(el => {
            el.setAttribute("href", config.mapsProfileUrl);
        });

        const leaveBtn = document.getElementById("lawisa-leave-review-btn");
        if (leaveBtn) {
            leaveBtn.setAttribute("href", getWriteReviewTargetUrl());
            leaveBtn.setAttribute("target", "_blank");
            leaveBtn.setAttribute("rel", "noopener noreferrer");
        }

        const viewport = document.getElementById("lawisa-reviews-viewport");
        const track = document.getElementById("lawisa-reviews-track");
        const pageBtns = document.querySelectorAll(".lawisa-page-btn[data-page]");
        const nextBtn = document.getElementById("lawisa-page-next");
        let activePage = 1;

        function setPage(pageNum) {
            activePage = pageNum;
            pageBtns.forEach(b => {
                b.classList.toggle("active", Number(b.getAttribute("data-page")) === activePage);
            });
            if (viewport && track) {
                track.classList.add("is-paused");
                const offset = (activePage - 1) * 356;
                track.style.setProperty("--manual-offset", `-${offset}px`);
                clearTimeout(track._resumeTimer);
                track._resumeTimer = setTimeout(() => {
                    track.style.setProperty("--manual-offset", "0px");
                    track.classList.remove("is-paused");
                }, 4000);
            }
        }

        pageBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                setPage(Number(btn.getAttribute("data-page")) || 1);
            });
        });

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                const nextPage = activePage >= 5 ? 1 : activePage + 1;
                setPage(nextPage);
            });
        }
    }

    async function maybeFetchLiveReviews() {
        if (!config.enableAutoFetch || !config.apiEndpoint) return;
        try {
            const res = await fetch(config.apiEndpoint, { headers: { Accept: "application/json" } });
            if (!res.ok) return;
            const data = await res.json();
            if (data.rating) config.rating = String(data.rating.toFixed ? data.rating.toFixed(1) : data.rating);
            if (data.userRatingCount) config.totalReviews = data.userRatingCount;
            if (data.placeId && !config.placeId) config.placeId = data.placeId;
            if (data.writeReviewUri && !config.directWriteReviewUrl) config.directWriteReviewUrl = data.writeReviewUri;
            if (Array.isArray(data.reviews) && data.reviews.length > 0) {
                config.reviews = data.reviews;
                renderReviews(config.reviews);
            }
            setupControlsAndButtons();
        } catch (_) {}
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderReviews(config.reviews);
        setupControlsAndButtons();
        maybeFetchLiveReviews();

        window.addEventListener("lawisa:langchange", () => {
            renderReviews(config.reviews);
        });
    });
})();
