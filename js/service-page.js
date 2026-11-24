/* ==========================================================================
   LAWISA Service Detail Pages — Lightweight Interactions
   Header sticky state, mobile menu, scroll reveals & pricing selector.
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
        const syncHeaderOffset = () => {
            if (header) {
                document.documentElement.style.setProperty('--mobile-header-h', `${header.offsetHeight}px`);
            }
        };

        const setMenuOpen = (isOpen) => {
            syncHeaderOffset();
            navLinks.classList.toggle('active', isOpen);
            if (header) header.classList.toggle('menu-open', isOpen);
            mobileBtn.setAttribute('aria-expanded', String(isOpen));
        };

        mobileBtn.addEventListener('click', () => setMenuOpen(!navLinks.classList.contains('active')));
        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMenuOpen(false));
        });
        document.addEventListener('click', (event) => {
            if (navLinks.classList.contains('active') && header && !header.contains(event.target)) {
                setMenuOpen(false);
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                setMenuOpen(false);
                mobileBtn.focus();
            }
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024 && navLinks.classList.contains('active')) {
                setMenuOpen(false);
            }
        }, { passive: true });
    }

    // Scroll Reveal (respects prefers-reduced-motion)
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

    // Compact Rate Option Selection
    const rateButtons = Array.from(document.querySelectorAll('[data-rate-option]'));
    const ctaEl = document.getElementById('svc-rate-cta');

    if (rateButtons.length > 0) {
        rateButtons.forEach((button) => {
            button.addEventListener('click', () => {
                rateButtons.forEach((btn) => {
                    const active = btn === button;
                    btn.classList.toggle('is-selected', active);
                    btn.setAttribute('aria-pressed', String(active));
                });

                const url = button.getAttribute('data-fresha-url');
                if (url && ctaEl) {
                    ctaEl.setAttribute('href', url);
                }
            });
        });
    }
})();
