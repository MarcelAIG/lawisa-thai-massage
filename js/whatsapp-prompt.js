/* ==========================================================================
   LAWISA WhatsApp Concierge Pill Prompt
   Appears automatically on load, refresh, page return (bfcache), and lang switch.
   Dismisses cleanly when clicked until next navigation, refresh, or lang switch.
   ========================================================================== */
(function () {
    'use strict';

    const widgets = Array.from(document.querySelectorAll('.whatsapp-widget'));
    if (!widgets.length) return;

    let promptTimer = null;

    function triggerPrompt(delayMs) {
        if (promptTimer) {
            window.clearTimeout(promptTimer);
            promptTimer = null;
        }

        widgets.forEach((widget) => {
            widget.classList.remove('is-dismissed', 'is-prompt-open');
            void widget.offsetWidth;
        });

        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) {
            widgets.forEach((widget) => widget.classList.add('is-prompt-open'));
            return;
        }

        promptTimer = window.setTimeout(() => {
            widgets.forEach((widget) => {
                if (!widget.classList.contains('is-dismissed')) {
                    widget.classList.add('is-prompt-open');
                }
            });
            promptTimer = null;
        }, typeof delayMs === 'number' ? delayMs : 280);
    }

    function dismissPrompt() {
        if (promptTimer) {
            window.clearTimeout(promptTimer);
            promptTimer = null;
        }
        widgets.forEach((widget) => {
            widget.classList.remove('is-prompt-open');
            widget.classList.add('is-dismissed');
        });
    }

    widgets.forEach((widget) => {
        widget.addEventListener('click', dismissPrompt);
    });

    // Trigger on initial entry / refresh
    triggerPrompt(320);

    // Re-trigger when returning via browser Back/Forward cache or visiting another page
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            triggerPrompt(220);
        }
    });

    // Re-trigger whenever homepage language switcher toggles FR <-> EN
    window.addEventListener('lawisa:langchange', () => {
        triggerPrompt(90);
    });
})();
