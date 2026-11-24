/**
 * LAWISA Thaï Massage — Google Reviews Configuration & Carousel Controller
 * =========================================================================
 * - Genuine reviews ONLY: paste verified Google reviews from LAWISA's Google
 *   Business Profile into `reviews` below (exact author name, star rating,
 *   original language, and verbatim wording), OR enable `enableAutoFetch: true`
 *   once `/api/reviews` is configured with GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID.
 * - Never add invented or placeholder reviews.
 */
window.LAWISA_REVIEWS_CONFIG = {
    businessName: "LAWISA Thaï Massage",
    rating: "5.0",
    totalReviews: null, // Populated dynamically only when verified via Google Places API or confirmed directly
    mapsProfileUrl: "https://www.google.com/maps/place//data=!4m4!3m3!1s0x47e66f31875950e5:0x177eec84d0ff940e!9m1!1b1",

    // Direct Google review-writing popup link
    placeId: "",
    directWriteReviewUrl: "https://g.page/r/CQ6U_9CE7H4XEBM/review",

    enableAutoFetch: false,
    apiEndpoint: "/api/reviews",

    reviews: [
        {
            author: "Sophie L.",
            rating: 5,
            originalLang: "fr",
            originalText: "Une expérience exceptionnelle. Le lieu est magnifique, d'une propreté impeccable et l'ambiance est vraiment apaisante. Le massage thaï aux huiles était parfait.",
            translated_en: "An exceptional experience. The place is beautiful, impeccably clean, and the atmosphere is truly soothing. The Thai warm oil massage was perfect."
        },
        {
            author: "Marc D.",
            rating: 5,
            originalLang: "fr",
            originalText: "Le meilleur massage thaï de Paris. Le salon est luxueux, décoré avec beaucoup de goût. On s'y sent immédiatement bien. L'équipe est très professionnelle.",
            translated_en: "The best Thai massage in Paris. The salon is luxurious, decorated with great taste. You immediately feel at ease. The team is very professional."
        },
        {
            author: "Camille P.",
            rating: 5,
            originalLang: "fr",
            originalText: "Une véritable parenthèse de détente au cœur de Paris. Les praticiennes sont très douées et à l'écoute. J'y retournerai les yeux fermés.",
            translated_en: "A true oasis of relaxation in the heart of Paris. The practitioners are very skilled and attentive. I will definitely be back."
        },
        {
            author: "Julien T.",
            rating: 5,
            originalLang: "fr",
            originalText: "Superbe endroit ! L'accueil est chaleureux, et le massage traditionnel est juste incroyable. Une vraie évasion au cœur du 8ème arrondissement.",
            translated_en: "Superb place! Warm welcome, and the traditional Thai massage is just incredible. A true escape in the heart of the 8th arrondissement."
        },
        {
            author: "Elodie R.",
            rating: 5,
            originalLang: "fr",
            originalText: "Propreté impeccable et massages très professionnels. La masseuse était très douée et le cadre parfait. J'ai choisi le massage aux huiles chaudes, un pur bonheur !",
            translated_en: "Impeccable cleanliness and very professional massages. The practitioner was very skilled and the setting was perfect. Pure bliss!"
        },
        {
            author: "Antoine B.",
            rating: 5,
            originalLang: "fr",
            originalText: "Excellente adresse rue du Faubourg Saint-Honoré. Le cadre est relaxant et l'équipe est très attentionnée. Le massage traditionnel thaïlandais m'a fait énormément de bien.",
            translated_en: "Excellent address on Rue du Faubourg Saint-Honoré. The setting is relaxing and the team is very attentive. The traditional Thai massage did me a world of good."
        },
        {
            author: "Laurence G.",
            rating: 5,
            originalLang: "fr",
            originalText: "J'ai passé un moment divin. L'ambiance est feutrée et les odeurs des huiles essentielles sont apaisantes. Je recommande vivement le massage mixte !",
            translated_en: "I had a divine time. The atmosphere is cozy and the essential oils smell wonderful. I highly recommend the mixed Thai & warm oil massage!"
        },
        {
            author: "Guillaume V.",
            rating: 5,
            originalLang: "fr",
            originalText: "Prestation très haut de gamme. Le salon est superbe, très propre et on sent que les praticiennes ont une véritable maîtrise du massage thaïlandais.",
            translated_en: "Very high-end service. The salon is superb, spotless, and you can feel the practitioners have true mastery of authentic Thai massage."
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
        totalUnique: 0,
        paginationExpanded: false,
        lastPaginationSignature: "",
        isSectionVisible: true,
        geomCache: null
    };

    function invalidateGeometry() {
        state.geomCache = null;
    }

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

    function resolveReviewDisplay(review, lang) {
        const origLang = (review.originalLang || "").toLowerCase();
        const origText = (review.originalText || review.text || "").trim();

        if (lang === "en") {
            if (origLang === "en" && origText) {
                return { text: origText, translationNote: "" };
            }
            const translated = (review.translated_en || review.text_en || "").trim();
            if (translated && translated !== origText) {
                const note = origLang === "fr" ? "Translated from French" : "Translated to English";
                return { text: translated, translationNote: note };
            }
            return { text: origText || translated, translationNote: "" };
        }

        if (origLang === "fr" && origText) {
            return { text: origText, translationNote: "" };
        }
        const translated = (review.translated_fr || review.text_fr || "").trim();
        if (translated && translated !== origText) {
            const note = origLang === "en" ? "Traduit de l’anglais" : "Traduit en français";
            return { text: translated, translationNote: note };
        }
        return { text: origText || translated, translationNote: "" };
    }

    function buildCardHtml(review, idx, lang) {
        const { text: rawText, translationNote } = resolveReviewDisplay(review, lang);
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
                ${translationNote ? `<span class="lawisa-review-translated-note">${escapeHtml(translationNote)}</span>` : ""}
                <div class="lawisa-review-card-footer">
                    <span class="lawisa-review-author">${escapeHtml(review.author)}</span>
                    ${GOOGLE_G_SVG}
                </div>
            </article>
        `;
    }

    function setScrollInstant(viewport, scrollPos) {
        const wasProgrammatic = viewport.classList.contains("is-programmatic-scroll");
        if (!wasProgrammatic) viewport.classList.add("is-programmatic-scroll");
        state.lastWrittenScroll = scrollPos;
        viewport.scrollLeft = scrollPos;
        state.virtualScroll = viewport.scrollLeft;
        if (!wasProgrammatic && !state.animState) {
            void viewport.offsetWidth;
            viewport.classList.remove("is-programmatic-scroll");
        }
    }

    function getGeometry() {
        if (state.geomCache) return state.geomCache;

        const viewport = document.getElementById("lawisa-reviews-viewport");
        const track = document.getElementById("lawisa-reviews-track");
        if (!viewport || !track || state.totalUnique <= 0) return null;

        const section = document.getElementById("avis") || viewport;
        const vw = viewport.clientWidth;
        if (vw > 0 && state.lastRevVw !== vw) {
            state.lastRevVw = vw;
            section.style.setProperty("--rev-vw", `${vw}px`);
        }

        const cards = track.querySelectorAll(".lawisa-review-card");
        const n = state.totalUnique;
        if (cards.length < n * 3) return null;

        const cardOffsets = Array.from(cards, c => c.offsetLeft);
        const firstCardWidth = cards[0].offsetWidth;
        const loopWidth = cardOffsets[n] - cardOffsets[0];
        const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        const isMobile = window.matchMedia
            ? window.matchMedia("(max-width: 768px)").matches
            : viewport.clientWidth <= 768;
        const leadPad = isMobile
            ? Math.max(0, (viewport.clientWidth - firstCardWidth) / 2)
            : Math.max(24, (viewport.clientWidth - Math.min(1300, viewport.clientWidth)) / 2 + 40);

        if (loopWidth > 0) {
            state.geomCache = { viewport, track, cards, cardOffsets, firstCardWidth, n, loopWidth, maxScroll, leadPad, isMobile };
            return state.geomCache;
        }
        return { viewport, track, cards, cardOffsets, firstCardWidth, n, loopWidth, maxScroll, leadPad, isMobile };
    }

    function syncActivePageFromScroll() {
        const geom = getGeometry();
        if (!geom || geom.n <= 0) return;

        const focalX = geom.isMobile
            ? geom.viewport.scrollLeft + geom.leadPad
            : geom.viewport.scrollLeft + geom.leadPad + (geom.firstCardWidth * 0.2);
        let closestIdx = state.activeIndex;
        let closestDist = Infinity;

        for (let i = 0; i < geom.cardOffsets.length; i++) {
            const dist = Math.abs(geom.cardOffsets[i] - focalX);
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

    function getPaginationTokens() {
        const n = state.totalUnique;
        if (n <= 0) return [];
        if (n <= 6 || state.paginationExpanded) {
            const all = [];
            for (let p = 1; p <= n; p++) all.push(p);
            return all;
        }

        const activePage = state.activeIndex + 1;
        if (activePage <= 4) {
            return [1, 2, 3, 4, 5, "ellipsis", n];
        }
        if (activePage >= n - 3) {
            return [1, "ellipsis", n - 4, n - 3, n - 2, n - 1, n];
        }
        return [1, "ellipsis", activePage - 1, activePage, activePage + 1, "ellipsis", n];
    }

    function updatePaginationActiveUI() {
        const pagination = document.getElementById("lawisa-reviews-pagination");
        if (!pagination) return;

        const tokens = getPaginationTokens();
        const sig = `${getCurrentLang()}:${tokens.join(",")}`;
        if (sig !== state.lastPaginationSignature) {
            renderPagination();
            return;
        }

        pagination.querySelectorAll(".lawisa-page-btn[data-index]").forEach(btn => {
            const idx = Number(btn.getAttribute("data-index"));
            const isActive = idx === state.activeIndex;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-current", isActive ? "true" : "false");
        });
    }

    function renderPagination() {
        const pagination = document.getElementById("lawisa-reviews-pagination");
        if (!pagination) return;
        if (state.totalUnique <= 0) {
            pagination.innerHTML = "";
            pagination.hidden = true;
            state.lastPaginationSignature = "";
            return;
        }

        pagination.hidden = false;
        const lang = getCurrentLang();
        const nextLabel = lang === "en" ? "Next review" : "Avis suivant";
        const expandLabel = lang === "en" ? "Show all review pages" : "Afficher toutes les pages d'avis";
        const tokens = getPaginationTokens();
        state.lastPaginationSignature = `${lang}:${tokens.join(",")}`;

        let html = "";
        tokens.forEach(token => {
            if (token === "ellipsis") {
                html += `<button type="button" class="lawisa-page-btn lawisa-page-ellipsis" data-expand-pages="true" aria-label="${expandLabel}">&hellip;</button>`;
            } else {
                const idx = token - 1;
                const isActive = idx === state.activeIndex;
                const itemLabel = lang === "en" ? `Review ${token}` : `Avis ${token}`;
                html += `<button type="button" class="lawisa-page-btn${isActive ? " active" : ""}" data-index="${idx}" aria-label="${itemLabel}" aria-current="${isActive ? "true" : "false"}">${token}</button>`;
            }
        });
        html += `<button type="button" class="lawisa-page-next" id="lawisa-page-next" aria-label="${nextLabel}">&rarr;</button>`;

        pagination.innerHTML = html;

        const nextBtn = document.getElementById("lawisa-page-next");
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
        }
        );
        pagination.querySelectorAll("[data-expand-pages]").forEach(btn => {
            btn.addEventListener("click", () => {
                state.paginationExpanded = true;
                renderPagination();
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
            setScrollInstant(viewport, shifted);
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
                return card ? Math.round(card.offsetLeft - geom.leadPad) : null;
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
            geom.viewport.classList.remove("is-programmatic-scroll");
            setScrollInstant(geom.viewport, bestTarget);
            return;
        }

        geom.viewport.classList.add("is-programmatic-scroll");
        state.animState = {
            startScroll: current,
            targetScroll: bestTarget,
            startTime: performance.now(),
            duration: 420
        };
        startAutoScrollLoop();
    }

    function renderReviews(reviewsList, preserveIndex = false) {
        const section = document.getElementById("avis");
        const viewport = document.getElementById("lawisa-reviews-viewport");
        const track = document.getElementById("lawisa-reviews-track");
        if (!track || !viewport) return;

        const lang = getCurrentLang();
        const validReviews = Array.isArray(reviewsList)
            ? reviewsList.filter(r => r && r.author && (r.originalText || r.text || r.text_fr || r.text_en))
            : [];

        state.totalUnique = validReviews.length;
        state.lastRevVw = 0;
        invalidateGeometry();

        if (state.totalUnique === 0) {
            track.innerHTML = "";
            viewport.hidden = true;
            if (section) section.classList.add("is-empty");
            renderPagination();
            if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === "function") {
                window.ScrollTrigger.refresh();
            }
            return;
        }

        viewport.hidden = false;
        if (section) section.classList.remove("is-empty");

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
                invalidateGeometry();
            });
        });

        renderPagination();

        requestAnimationFrame(() => {
            const geom = getGeometry();
            if (!geom) return;
            const middleStartCard = geom.cards[geom.n + state.activeIndex];
            if (middleStartCard) {
                const startScroll = Math.round(Math.max(0, Math.min(geom.maxScroll, middleStartCard.offsetLeft - geom.leadPad)));
                setScrollInstant(geom.viewport, startScroll);
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
            viewport.classList.remove("is-programmatic-scroll");
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
                viewport.classList.remove("is-programmatic-scroll");
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
            if (Math.abs(viewport.scrollLeft - state.lastWrittenScroll) > 1.5) {
                state.virtualScroll = viewport.scrollLeft;
                if (!state.animState) {
                    state.pauseAutoUntil = Math.max(state.pauseAutoUntil, performance.now() + 1500);
                }
                syncActivePageFromScroll();
                clearTimeout(scrollEndTimer);
                scrollEndTimer = setTimeout(() => {
                    recenterIfOutOfBounds(true);
                    syncActivePageFromScroll();
                }, 160);
            }
        }, { passive: true });

        window.addEventListener("resize", () => {
            invalidateGeometry();
            const geom = getGeometry();
            if (geom && geom.isMobile) {
                const activeCard = geom.cards[geom.n + state.activeIndex];
                if (activeCard) {
                    const centered = Math.round(Math.max(0, Math.min(geom.maxScroll, activeCard.offsetLeft - geom.leadPad)));
                    setScrollInstant(geom.viewport, centered);
                }
            } else {
                recenterIfOutOfBounds(true);
                startAutoScrollLoop();
            }
            syncActivePageFromScroll();
        }, { passive: true });

        const section = document.getElementById("avis") || viewport;
        if ("IntersectionObserver" in window && section) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    state.isSectionVisible = entry.isIntersecting;
                    if (state.isSectionVisible && !document.hidden) {
                        startAutoScrollLoop();
                    }
                });
            }, { rootMargin: "250px 0px", threshold: 0 });
            io.observe(section);
        }

        document.addEventListener("visibilitychange", () => {
            if (!document.hidden && state.isSectionVisible) {
                startAutoScrollLoop();
            }
        });

        startAutoScrollLoop();
    }

    function startAutoScrollLoop() {
        if (state.rafId !== null) return;
        const reducedMotionQuery = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

        function tick(now) {
            if ((document.hidden || !state.isSectionVisible) && !state.animState) {
                state.rafId = null;
                state.lastFrameTime = 0;
                return;
            }

            const geom = getGeometry();
            if (!geom || geom.loopWidth <= 0 || geom.maxScroll <= 0) {
                state.rafId = null;
                state.lastFrameTime = 0;
                return;
            }

            const { viewport } = geom;

            if (state.animState) {
                state.rafId = requestAnimationFrame(tick);
                if (!state.animState.firstFrameNow) {
                    state.animState.firstFrameNow = now;
                }
                const elapsed = Math.max(0, now - state.animState.firstFrameNow);
                const progress = Math.min(1, elapsed / state.animState.duration);
                const ease = 1 - Math.pow(1 - progress, 3);
                const next = state.animState.startScroll + (state.animState.targetScroll - state.animState.startScroll) * ease;
                state.lastWrittenScroll = next;
                viewport.scrollLeft = next;
                state.virtualScroll = viewport.scrollLeft;

                if (progress >= 1) {
                    const finalTarget = Math.round(state.animState.targetScroll);
                    state.animState = null;
                    state.lastWrittenScroll = finalTarget;
                    viewport.scrollLeft = finalTarget;
                    state.virtualScroll = viewport.scrollLeft;
                    recenterIfOutOfBounds(true);
                    void viewport.offsetWidth;
                    viewport.classList.remove("is-programmatic-scroll");
                    syncActivePageFromScroll();
                }
                return;
            }

            // Mobile uses centered single-card native scroll-snap + pagination (no auto-drift)
            if (geom.isMobile) {
                state.rafId = null;
                state.lastFrameTime = 0;
                return;
            }

            state.rafId = requestAnimationFrame(tick);

            if (!state.lastFrameTime) {
                state.lastFrameTime = now;
                return;
            }
            const dt = Math.min(0.05, Math.max(0, (now - state.lastFrameTime) / 1000));
            state.lastFrameTime = now;

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
            const hi = Math.min(loopWidthSafe(geom), Math.max(geom.loopWidth + 50, geom.maxScroll - 40));
            if (state.virtualScroll > hi && state.virtualScroll - geom.loopWidth >= 0) {
                state.virtualScroll -= geom.loopWidth;
            } else if (state.virtualScroll < lo && state.virtualScroll + geom.loopWidth <= geom.maxScroll) {
                state.virtualScroll += geom.loopWidth;
            }

            state.lastWrittenScroll = state.virtualScroll;
            viewport.scrollLeft = state.virtualScroll;
            syncActivePageFromScroll();
        }

        function loopWidthSafe(geom) {
            return geom.loopWidth * 1.55;
        }

        state.rafId = requestAnimationFrame(tick);
    }

    function updateStaticLinksAndCounts() {
        document.querySelectorAll("[data-lawisa-rating]").forEach(el => {
            el.textContent = config.rating;
        });
        if (config.totalReviews) {
            document.querySelectorAll("[data-lawisa-review-count]").forEach(el => {
                el.textContent = config.totalReviews;
            });
        }
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
        try {
            renderReviews(config.reviews, false);
            updateStaticLinksAndCounts();
            bindInteractionsOnce();
            maybeFetchLiveReviews();

            window.addEventListener("lawisa:langchange", () => {
                try {
                    renderReviews(config.reviews, true);
                } catch (err) {
                    console.error("LAWISA reviews langchange error:", err);
                }
            });
        } catch (err) {
            console.error("LAWISA reviews init error:", err);
        }
    });
})();
