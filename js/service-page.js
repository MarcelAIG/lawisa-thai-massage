/* ==========================================================================
   LAWISA Service Detail Pages — Lightweight Interactions
   ========================================================================== */
(function () {
    'use strict';

    // Sticky Header Scroll State
    const header = document.getElementById('header');
    if (header) {
        const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 36);
        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });
    }

    // Mobile Menu Drawer Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileBtn && navLinks) {
        const setMenuOpen = (isOpen) => {
            navLinks.classList.toggle('active', isOpen);
            mobileBtn.setAttribute('aria-expanded', String(isOpen));
        };

        mobileBtn.addEventListener('click', () => setMenuOpen(!navLinks.classList.contains('active')));
        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMenuOpen(false));
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                setMenuOpen(false);
                mobileBtn.focus();
            }
        });
    }

    // Smooth Scroll Reveal (respects prefers-reduced-motion)
    const revealEls = document.querySelectorAll('.fade-in-up');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach((el) => el.classList.add('visible'));
    } else {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -24px 0px', threshold: 0.06 }
        );
        revealEls.forEach((el) => observer.observe(el));
    }

    // Compact Rate Selection
    const rateButtons = Array.from(document.querySelectorAll('[data-rate-option]'));
    const statusEl = document.getElementById('svc-rate-status');
    const ctaEl = document.getElementById('svc-rate-cta');

    if (rateButtons.length > 0 && statusEl) {
        rateButtons.forEach((button) => {
            button.addEventListener('click', () => {
                rateButtons.forEach((btn) => {
                    const active = btn === button;
                    btn.classList.toggle('is-selected', active);
                    btn.setAttribute('aria-pressed', String(active));
                });

                const summary = button.getAttribute('data-rate-summary');
                const url = button.getAttribute('data-fresha-url');
                if (summary) statusEl.textContent = summary;
                if (url && ctaEl) ctaEl.setAttribute('href', url);
            });
        });
    }
    // Connected Card Click Navigation (preserves Fresha booking button)
    document.querySelectorAll('[data-detail-card]').forEach((card) => {
        card.addEventListener('click', (event) => {
            if (event.target.closest('a')) return;
            const detailLink = card.querySelector('.service-detail-link');
            if (detailLink && detailLink.getAttribute('href')) {
                window.location.href = detailLink.getAttribute('href');
            }
        });
    });
})();
