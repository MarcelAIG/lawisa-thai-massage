/* ==========================================================================
   LAWISA Massages Collection (/massages/ & /en/massages/) — Lightweight UI Logic
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

    // Card Interaction: Desktop click opens dedicated detail page if present; Touch tap reveals actions first
    const cards = Array.from(document.querySelectorAll('.mcat-card'));
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    cards.forEach((card) => {
        card.addEventListener('click', (event) => {
            if (event.target.closest('a')) return;

            const isRevealed = card.classList.contains('is-revealed');
            const detailUrl = card.getAttribute('data-detail-url');

            if (!supportsHover && !isRevealed) {
                cards.forEach((other) => other !== card && other.classList.remove('is-revealed'));
                card.classList.add('is-revealed');
                return;
            }

            if (detailUrl) {
                window.location.href = detailUrl;
                return;
            }

            cards.forEach((other) => other !== card && other.classList.remove('is-revealed'));
            card.classList.toggle('is-revealed', !isRevealed);
        });
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.mcat-card')) {
            cards.forEach((card) => card.classList.remove('is-revealed'));
        }
    });
})();
