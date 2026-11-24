/* ==========================================================================
   LAWISA WhatsApp Concierge Pill Prompt
   Appears automatically on load, refresh, page return (bfcache), and lang switch.
   Auto-tucks label on mobile after 3.8s or scroll so it never obstructs CTAs.
   ========================================================================== */
(function () {
    'use strict';

    const widgets = Array.from(document.querySelectorAll('.whatsapp-widget'));
    if (!widgets.length) return;

    let promptTimer = null;
    let mobileHideTimer = null;

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

    function triggerPrompt(delayMs) {
        clearTimers();

        // On compact phones (<= 480px), keep only the clean circular icon so the pill never covers buttons
        if (window.innerWidth <= 480) {
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
    }, { passive: true });

    triggerPrompt(320);

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            triggerPrompt(220);
        }
    });

    window.addEventListener('lawisa:langchange', () => {
        triggerPrompt(90);
    });
})();
