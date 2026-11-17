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

    const state = {
        activeIndex: 0,
        virtualScroll: 0,
        lastWrittenScroll: -1,
        isHovering: false,
        isTouching: false,
        isDragging: false,
        justDragged: false,
        pauseAutoUntil: 0,
        animState: null,
        rafId: null,
        lastFrameTime: 0,
        bound: false,
        totalUnique: 0
    };

    const AUTO_SCROLL_PX_PER_SEC = 34;

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

    function getCurrentLang() {
        return document.documentElement.lang === "en" ? "en" : "fr";
    }

    function buildCardHtml(review, idx, lang) {
        const rawText = (lang === "en" ? (review.text_en || review.text_fr || review.text) : (review.text_fr || review.text)) || "";
        const moreLabel = lang === "en" ? "More" : "Plus";
        const lessLabel = lang === "en" ? "Less" : "Moins";
        const isLong = rawText.length > 125;
        const shortText = isLong ? rawText.slice(0, 122).trim() + "..." : rawText;
        const ratingNum = Number(review.rating) || 5;
        const stars = "★".repeat(ratingNum);
        const starsAriaLabel = lang === "en" ? `${ratingNum} out of 5 stars` : `${ratingNum} sur 5 étoiles`;

        return `
            <article class="lawisa-review-card" data-review-index="${idx}" data-full-text="${escapeHtml(rawText)}" data-short-text="${escapeHtml(shortText)}">
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

    function getGeometry() {
        const viewport = document.getElementById("lawisa-reviews-viewport");
        const track = document.getElementById("lawisa-reviews-track");
        if (!viewport || !track || state.totalUnique <= 0) return null;

        const cards = track.querySelectorAll(".lawisa-review-card");
        const n = state.totalUnique;
        if (cards.length < n * 3) return null;

        const loopWidth = cards[n].offsetLeft - cards[0].offsetLeft;
        const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        const isMobile = viewport.clientWidth < 768;
        const leadPad = isMobile
            ? Math.max(16, (viewport.clientWidth - cards[0].offsetWidth) / 2)
            : Math.max(24, (viewport.clientWidth - Math.min(1300, viewport.clientWidth)) / 2 + 40);

        return { viewport, track, cards, n, loopWidth, maxScroll, leadPad };
    }

    function syncActivePageFromScroll() {
        const geom = getGeometry();
        if (!geom || geom.n <= 0) return;

        const focalX = geom.viewport.scrollLeft + geom.leadPad + (geom.cards[0].offsetWidth * 0.2);
        let closestIdx = state.activeIndex;
        let closestDist = Infinity;

        for (let i = 0; i < geom.cards.length; i++) {
            const cardLeft = geom.cards[i].offsetLeft;
            const dist = Math.abs(cardLeft - focalX);
            if (dist < closestDist) {
                closestDist = dist;
                closestIdx = i % geom.n;
            }
        }

        if (closestIdx !== state.activeIndex) {
            state.activeIndex = closestIdx;
            updatePaginationActiveUI();
        }
    }

    function updatePaginationActiveUI() {
        const pagination = document.getElementById("lawisa-reviews-pagination");
        if (!pagination) return;
        pagination.querySelectorAll(".lawisa-page-btn[data-index]").forEach(btn => {
            const idx = Number(btn.getAttribute("data-index"));
            const isActive = idx === state.activeIndex;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-current", isActive ? "true" : "false");
        });
    }

    function renderPagination() {
        const pagination = document.getElementById("lawisa-reviews-pagination");
        if (!pagination || state.totalUnique <= 0) return;

        const lang = getCurrentLang();
        const prevLabel = lang === "en" ? "Previous review" : "Avis précédent";
        const nextLabel = lang === "en" ? "Next review" : "Avis suivant";

        let html = `<button type="button" class="lawisa-page-prev" id="lawisa-page-prev" aria-label="${prevLabel}">&#10094;</button>`;
        for (let i = 0; i < state.totalUnique; i++) {
            const isActive = i === state.activeIndex;
            const itemLabel = lang === "en" ? `Review ${i + 1}` : `Avis ${i + 1}`;
            html += `<button type="button" class="lawisa-page-btn${isActive ? " active" : ""}" data-index="${i}" aria-label="${itemLabel}" aria-current="${isActive ? "true" : "false"}">${i + 1}</button>`;
        }
        html += `<button type="button" class="lawisa-page-next" id="lawisa-page-next" aria-label="${nextLabel}">&#10095;</button>`;

        pagination.innerHTML = html;

        const prevBtn = document.getElementById("lawisa-page-prev");
        const nextBtn = document.getElementById("lawisa-page-next");

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                const target = (state.activeIndex - 1 + state.totalUnique) % state.totalUnique;
                scrollToReview(target, true);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                const target = (state.activeIndex + 1) % state.totalUnique;
                scrollToReview(target, true);
            });
        }
        pagination.querySelectorAll(".lawisa-page-btn[data-index]").forEach(btn => {
            btn.addEventListener("click", () => {
                const target = Number(btn.getAttribute("data-index")) || 0;
                scrollToReview(target, true);
            });
        });
    }

    function recenterIfOutOfBounds(force = false) {
        const geom = getGeometry();
        if (!geom || geom.loopWidth <= 0 || geom.maxScroll <= 0) return;

        const { viewport, loopWidth, maxScroll } = geom;
        const lo = loopWidth * 0.45;
        const hi = Math.min(loopWidth * 1.55, Math.max(loopWidth + 50, maxScroll - 40));
        let cur = viewport.scrollLeft;

        if (!force && (state.isTouching || state.isDragging || state.animState)) {
            if (cur > 24 && cur < maxScroll - 24) return;
        }

        let shifted = cur;
        if (cur < lo && cur + loopWidth <= maxScroll) {
            shifted = cur + loopWidth;
        } else if (cur > hi && cur - loopWidth >= 0) {
            shifted = cur - loopWidth;
        }

        if (shifted !== cur) {
            state.lastWrittenScroll = shifted;
            viewport.scrollLeft = shifted;
            state.virtualScroll = shifted;
        }
    }

    function scrollToReview(targetIndex, smooth = true) {
        const geom = getGeometry();
        if (!geom || geom.n <= 0) return;

        const idx = ((targetIndex % geom.n) + geom.n) % geom.n;
        const current = geom.viewport.scrollLeft;
        const candidates = [idx, geom.n + idx, geom.n * 2 + idx]
            .map(cardIdx => {
                const card = geom.cards[cardIdx];
                return card ? card.offsetLeft - geom.leadPad : null;
            })
            .filter(pos => pos !== null && pos >= 0 && pos <= geom.maxScroll);

        if (candidates.length === 0) return;

        let bestTarget = candidates[0];
        let bestDist = Math.abs(bestTarget - current);
        for (let i = 1; i < candidates.length; i++) {
            const dist = Math.abs(candidates[i] - current);
            if (dist < bestDist) {
                bestDist = dist;
                bestTarget = candidates[i];
            }
        }

        state.activeIndex = idx;
        updatePaginationActiveUI();
        state.pauseAutoUntil = performance.now() + 3500;

        if (!smooth) {
            state.animState = null;
            state.lastWrittenScroll = bestTarget;
            geom.viewport.scrollLeft = bestTarget;
            state.virtualScroll = bestTarget;
            return;
        }

        state.animState = {
            startScroll: current,
            targetScroll: bestTarget,
            startTime: performance.now(),
            duration: 420
        };
    }

    function renderReviews(reviewsList, preserveIndex = false) {
        const track = document.getElementById("lawisa-reviews-track");
        if (!track) return;

        const lang = getCurrentLang();
        const validReviews = Array.isArray(reviewsList) && reviewsList.length > 0 ? reviewsList : config.reviews;
        state.totalUnique = validReviews.length;
        if (!preserveIndex || state.activeIndex >= state.totalUnique) {
            state.activeIndex = 0;
        }

        // Triple copy allows seamless infinite scrolling in both directions without hitting edges
        const fullMarqueeSet = [...validReviews, ...validReviews, ...validReviews];
        track.innerHTML = fullMarqueeSet.map((r, i) => buildCardHtml(r, i % state.totalUnique, lang)).join("");

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

        renderPagination();

        requestAnimationFrame(() => {
            const geom = getGeometry();
            if (!geom) return;
            const middleStartCard = geom.cards[geom.n + state.activeIndex];
            if (middleStartCard) {
                const startScroll = Math.max(0, Math.min(geom.maxScroll, middleStartCard.offsetLeft - geom.leadPad));
                state.lastWrittenScroll = startScroll;
                geom.viewport.scrollLeft = startScroll;
                state.virtualScroll = startScroll;
            }
        });
    }

    function bindInteractionsOnce() {
        if (state.bound) return;
        const viewport = document.getElementById("lawisa-reviews-viewport");
        if (!viewport) return;
        state.bound = true;

        viewport.addEventListener("pointerenter", (e) => {
            if (e.pointerType === "mouse") {
                state.isHovering = true;
            }
        });

        viewport.addEventListener("pointerleave", (e) => {
            if (e.pointerType === "mouse") {
                state.isHovering = false;
            }
        });

        viewport.addEventListener("touchstart", () => {
            state.isTouching = true;
            state.animState = null;
            state.pauseAutoUntil = performance.now() + 2200;
        }, { passive: true });

        viewport.addEventListener("touchend", () => {
            state.isTouching = false;
            state.pauseAutoUntil = performance.now() + 1800;
        }, { passive: true });

        viewport.addEventListener("touchcancel", () => {
            state.isTouching = false;
            state.pauseAutoUntil = performance.now() + 1800;
        }, { passive: true });

        viewport.addEventListener("wheel", (e) => {
            if (Math.abs(e.deltaX) > 2 || e.shiftKey) {
                state.animState = null;
                state.pauseAutoUntil = performance.now() + 2000;
            }
        }, { passive: true });

        let dragStartX = 0;
        let dragStartScroll = 0;
        let mouseDown = false;

        viewport.addEventListener("pointerdown", (e) => {
            if (e.pointerType !== "mouse" || e.button !== 0) return;
            if (e.target.closest("button, a")) return;
            mouseDown = true;
            state.isDragging = false;
            dragStartX = e.clientX;
            dragStartScroll = viewport.scrollLeft;
        });

        window.addEventListener("pointermove", (e) => {
            if (!mouseDown) return;
            const dx = e.clientX - dragStartX;
            if (!state.isDragging && Math.abs(dx) > 5) {
                state.isDragging = true;
                state.animState = null;
                viewport.classList.add("is-dragging");
            }
            if (state.isDragging) {
                const nextScroll = dragStartScroll - dx;
                state.lastWrittenScroll = nextScroll;
                viewport.scrollLeft = nextScroll;
                state.virtualScroll = viewport.scrollLeft;
                state.pauseAutoUntil = performance.now() + 2000;
                recenterIfOutOfBounds(false);
                syncActivePageFromScroll();
            }
        });

        function finishMouseDrag() {
            if (!mouseDown) return;
            mouseDown = false;
            if (state.isDragging) {
                state.isDragging = false;
                state.justDragged = true;
                viewport.classList.remove("is-dragging");
                state.pauseAutoUntil = performance.now() + 1800;
                recenterIfOutOfBounds(true);
                syncActivePageFromScroll();
                setTimeout(() => {
                    state.justDragged = false;
                }, 80);
            }
        }

        window.addEventListener("pointerup", finishMouseDrag);
        window.addEventListener("pointercancel", finishMouseDrag);

        viewport.addEventListener("click", (e) => {
            if (state.justDragged) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        let scrollEndTimer = null;
        viewport.addEventListener("scroll", () => {
            if (Math.abs(viewport.scrollLeft - state.lastWrittenScroll) > 2.5) {
                state.virtualScroll = viewport.scrollLeft;
                if (!state.animState) {
                    state.pauseAutoUntil = Math.max(state.pauseAutoUntil, performance.now() + 1500);
                }
                syncActivePageFromScroll();
                clearTimeout(scrollEndTimer);
                scrollEndTimer = setTimeout(() => {
                    recenterIfOutOfBounds(true);
                    syncActivePageFromScroll();
                }, 140);
            }
        }, { passive: true });

        window.addEventListener("resize", () => {
            recenterIfOutOfBounds(true);
            syncActivePageFromScroll();
        });

        startAutoScrollLoop();
    }

    function startAutoScrollLoop() {
        if (state.rafId !== null) return;
        const reducedMotionQuery = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

        function tick(now) {
            state.rafId = requestAnimationFrame(tick);

            if (!state.lastFrameTime) {
                state.lastFrameTime = now;
                return;
            }
            const dt = Math.min(0.05, Math.max(0, (now - state.lastFrameTime) / 1000));
            state.lastFrameTime = now;

            const geom = getGeometry();
            if (!geom || geom.loopWidth <= 0 || geom.maxScroll <= 0) return;

            const { viewport } = geom;

            if (state.animState) {
                const elapsed = now - state.animState.startTime;
                const progress = Math.min(1, elapsed / state.animState.duration);
                const ease = 1 - Math.pow(1 - progress, 3);
                const next = state.animState.startScroll + (state.animState.targetScroll - state.animState.startScroll) * ease;
                state.lastWrittenScroll = next;
                viewport.scrollLeft = next;
                state.virtualScroll = viewport.scrollLeft;
                syncActivePageFromScroll();

                if (progress >= 1) {
                    state.animState = null;
                    recenterIfOutOfBounds(true);
                    syncActivePageFromScroll();
                }
                return;
            }

            const reduceMotion = reducedMotionQuery && reducedMotionQuery.matches;
            if (
                reduceMotion ||
                document.hidden ||
                state.isHovering ||
                state.isTouching ||
                state.isDragging ||
                now < state.pauseAutoUntil
            ) {
                return;
            }

            if (Math.abs(viewport.scrollLeft - state.virtualScroll) > 2) {
                state.virtualScroll = viewport.scrollLeft;
            }

            state.virtualScroll += AUTO_SCROLL_PX_PER_SEC * dt;

            const lo = geom.loopWidth * 0.45;
            const hi = Math.min(geom.loopWidth * 1.55, Math.max(geom.loopWidth + 50, geom.maxScroll - 40));
            if (state.virtualScroll > hi && state.virtualScroll - geom.loopWidth >= 0) {
                state.virtualScroll -= geom.loopWidth;
            } else if (state.virtualScroll < lo && state.virtualScroll + geom.loopWidth <= geom.maxScroll) {
                state.virtualScroll += geom.loopWidth;
            }

            state.lastWrittenScroll = state.virtualScroll;
            viewport.scrollLeft = state.virtualScroll;
            syncActivePageFromScroll();
        }

        state.rafId = requestAnimationFrame(tick);
    }

    function updateStaticLinksAndCounts() {
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
                renderReviews(config.reviews, false);
            }
            updateStaticLinksAndCounts();
        } catch (_) {}
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderReviews(config.reviews, false);
        updateStaticLinksAndCounts();
        bindInteractionsOnce();
        maybeFetchLiveReviews();

        window.addEventListener("lawisa:langchange", () => {
            renderReviews(config.reviews, true);
        });
    });
})();
