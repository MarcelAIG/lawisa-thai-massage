/* ==========================================================================
   LAWISA WhatsApp Concierge Pill Prompt & Mobile Overlap Guard
   - Desktop (> 768px): Shows concierge prompt pill on load, bfcache return, & lang switch.
   - Mobile (<= 768px): Automatically yields (.is-yielding) whenever the floating icon's
     footprint intersects any button, link, card CTA, accordion trigger, map, or modal,
     ensuring it never covers or blocks interactive content.
   ========================================================================== */
(function () {
    'use strict';

    // Sync explicit session language preference on dedicated FR/EN subpages
    try {
        const p = window.location.pathname || '/';
        if (p !== '/' && p !== '/index.html') {
            window.sessionStorage.setItem('lawisa_lang', document.documentElement.lang === 'en' ? 'en' : 'fr');
        }
    } catch (e) {}

    const widgets = Array.from(document.querySelectorAll('.whatsapp-widget'));
    if (!widgets.length) return;

    let promptTimer = null;
    let mobileHideTimer = null;
    let overlapRaf = 0;
    let followUpTimer = null;

    const INTERACTIVE_SELECTOR = [
        'a[href]',
        'button',
        'input',
        'select',
        'textarea',
        'summary',
        'iframe',
        '.lawisa-offer-card-cue',
        '.lawisa-offer-cta',
        '.lawisa-gallery-caption',
        '.lawisa-faq-trigger',
        '.svc-rate-row'
    ].join(',');

    function isMobileViewport() {
        return window.matchMedia
            ? window.matchMedia('(max-width: 768px)').matches
            : window.innerWidth <= 768;
    }

    function clearTimers() {
        if (promptTimer) {
            window.clearTimeout(promptTimer);
            promptTimer = null;
        }
        if (mobileHideTimer) {
            window.clearTimeout(mobileHideTimer);
            mobileHideTimer = null;
        }
    }

    function closeLabelOnly() {
        widgets.forEach((widget) => {
            widget.classList.remove('is-prompt-open');
        });
    }

    function isOverlayOpen() {
        if (document.querySelector('.nav-links.active')) return true;
        if (document.querySelector('#gallery-lightbox.active, .lightbox.active')) return true;
        const qv = document.getElementById('mcat-qv-backdrop');
        if (qv && !qv.hidden) return true;
        return false;
    }

    function isVisibleCandidate(el, widget) {
        if (el === widget || widget.contains(el)) return false;
        if (el.closest('.nav-links:not(.active)')) return false;
        if (el.closest('#gallery-lightbox:not(.active), .lightbox:not(.active)')) return false;
        const qv = el.closest('#mcat-qv-backdrop');
        if (qv && qv.hidden) return false;
        const faqPanel = el.closest('.lawisa-faq-panel');
        if (faqPanel) {
            const faqItem = faqPanel.closest('.lawisa-faq-item');
            const trigger = faqItem && faqItem.querySelector('.lawisa-faq-trigger');
            if (trigger && trigger.getAttribute('aria-expanded') !== 'true') return false;
        }
        const offerReveal = el.closest('.lawisa-offer-card-reveal');
        if (offerReveal) {
            const offerCard = offerReveal.closest('.lawisa-offer-card');
            if (offerCard && !offerCard.classList.contains('is-open')) return false;
        }

        const style = window.getComputedStyle(el);
        const isFadeTarget = el.classList.contains('fade-in-up') || Boolean(el.closest('.fade-in-up'));
        if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.pointerEvents === 'none' ||
            (!isFadeTarget && parseFloat(style.opacity) <= 0.01)
        ) {
            return false;
        }
        return true;
    }

    function checkMobileOverlap() {
        overlapRaf = 0;

        if (!isMobileViewport()) {
            widgets.forEach((widget) => {
                widget.classList.remove('is-yielding');
            });
            return;
        }

        if (isOverlayOpen()) {
            widgets.forEach((widget) => {
                widget.classList.add('is-yielding');
            });
            return;
        }

        const candidates = document.querySelectorAll(INTERACTIVE_SELECTOR);
        const buffer = 8;

        widgets.forEach((widget) => {
            const wRect = widget.getBoundingClientRect();
            if (wRect.width <= 0 || wRect.height <= 0) return;

            const left = wRect.left - buffer;
            const top = wRect.top - buffer;
            const right = wRect.right + buffer;
            const bottom = wRect.bottom + buffer;

            let blocked = false;
            for (let i = 0; i < candidates.length; i++) {
                const el = candidates[i];
                const r = el.getBoundingClientRect();
                if (r.width <= 0 || r.height <= 0) continue;
                if (r.right < left || r.left > right || r.bottom < top || r.top > bottom) continue;
                if (!isVisibleCandidate(el, widget)) continue;
                blocked = true;
                break;
            }

            widget.classList.toggle('is-yielding', blocked);
        });
    }

    function scheduleOverlapCheck(withFollowUp) {
        if (!overlapRaf) {
            overlapRaf = window.requestAnimationFrame(checkMobileOverlap);
        }
        if (withFollowUp) {
            if (followUpTimer) window.clearTimeout(followUpTimer);
            followUpTimer = window.setTimeout(() => {
                followUpTimer = null;
                if (!overlapRaf) {
                    overlapRaf = window.requestAnimationFrame(checkMobileOverlap);
                }
            }, 340);
        }
    }

    function triggerPrompt(delayMs) {
        clearTimers();
        scheduleOverlapCheck(false);

        // On mobile (<= 768px), keep only the clean circular icon so the pill never covers content
        if (isMobileViewport()) {
            closeLabelOnly();
            return;
        }

        widgets.forEach((widget) => {
            widget.classList.remove('is-dismissed', 'is-prompt-open');
            void widget.offsetWidth;
        });

        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const showLabel = () => {
            widgets.forEach((widget) => {
                if (!widget.classList.contains('is-dismissed')) {
                    widget.classList.add('is-prompt-open');
                }
            });
            if (window.innerWidth <= 900) {
                mobileHideTimer = window.setTimeout(closeLabelOnly, 3800);
            }
        };

        if (reduced) {
            showLabel();
            return;
        }

        promptTimer = window.setTimeout(() => {
            promptTimer = null;
            showLabel();
        }, typeof delayMs === 'number' ? delayMs : 280);
    }

    function dismissPrompt() {
        clearTimers();
        widgets.forEach((widget) => {
            widget.classList.remove('is-prompt-open');
            widget.classList.add('is-dismissed');
        });
    }

    widgets.forEach((widget) => {
        widget.addEventListener('click', dismissPrompt);
    });

    window.addEventListener('scroll', () => {
        if (window.innerWidth <= 900 && window.scrollY > 120) {
            closeLabelOnly();
        }
        scheduleOverlapCheck(false);
    }, { passive: true, capture: true });

    window.addEventListener('resize', () => scheduleOverlapCheck(false), { passive: true });
    window.addEventListener('orientationchange', () => scheduleOverlapCheck(true), { passive: true });
    document.addEventListener('click', () => scheduleOverlapCheck(true), { passive: true });
    document.addEventListener('touchend', () => scheduleOverlapCheck(true), { passive: true });
    document.addEventListener('keydown', () => scheduleOverlapCheck(true), { passive: true });
    document.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity' || e.propertyName === 'transform' || e.propertyName === 'grid-template-rows') {
            scheduleOverlapCheck(false);
        }
    }, { passive: true, capture: true });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => scheduleOverlapCheck(true));
    } else {
        scheduleOverlapCheck(true);
    }
    window.addEventListener('load', () => scheduleOverlapCheck(false), { passive: true });

    triggerPrompt(320);

    window.addEventListener('pageshow', (event) => {
        scheduleOverlapCheck(false);
        if (event.persisted) {
            triggerPrompt(220);
        }
    });

    window.addEventListener('lawisa:langchange', () => {
        triggerPrompt(90);
        scheduleOverlapCheck(true);
    });
})();
