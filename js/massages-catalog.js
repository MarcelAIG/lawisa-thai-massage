/* ==========================================================================
   LAWISA Curated Massages Menu (/massages/ & /en/massages/)
   Header, scroll reveals & minimalist Atelier Rates Quick-View Dialog
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

    // Minimalist Quick-View Dialog
    const dataEl = document.getElementById('mcat-treatments-data');
    const backdrop = document.getElementById('mcat-qv-backdrop');
    if (!dataEl || !backdrop) return;

    let treatments = {};
    try {
        treatments = JSON.parse(dataEl.textContent || '{}');
    } catch (err) {
        console.error('LAWISA catalog data parse error:', err);
        return;
    }

    const dialog = backdrop.querySelector('.mcat-qv-dialog');
    const closeBtn = document.getElementById('mcat-qv-close');
    const photoEl = document.getElementById('mcat-qv-photo');
    const titleEl = document.getElementById('mcat-qv-title');
    const descEl = document.getElementById('mcat-qv-desc');
    const ratesEl = document.getElementById('mcat-qv-rates');
    const bookBtn = document.getElementById('mcat-qv-book');
    const discoverLink = document.getElementById('mcat-qv-discover');

    let lastTrigger = null;

    function getFocusableElements() {
        return Array.from(
            dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
        ).filter((el) => !el.hidden && el.offsetParent !== null);
    }

    function openQuickView(treatmentId, triggerEl) {
        const item = treatments[treatmentId];
        if (!item) return;

        lastTrigger = triggerEl || document.activeElement;

        photoEl.src = item.image;
        photoEl.alt = item.imageAlt || item.title;
        titleEl.textContent = item.title;

        if (descEl) {
            if (item.description) {
                descEl.textContent = item.description;
                descEl.hidden = false;
            } else {
                descEl.textContent = '';
                descEl.hidden = true;
            }
        }

        ratesEl.innerHTML = '';
        const options = Array.isArray(item.options) ? item.options : [];
        options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'mcat-qv-rate-row' + (idx === 0 ? ' is-selected' : '');
            btn.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');

            const labelSpan = document.createElement('span');
            labelSpan.className = 'mcat-qv-rate-label';
            labelSpan.textContent = opt.label;

            const metaSpan = document.createElement('span');
            metaSpan.className = 'mcat-qv-rate-meta';

            if (opt.duration) {
                const durSpan = document.createElement('span');
                durSpan.className = 'mcat-qv-rate-dur';
                durSpan.textContent = opt.duration;
                metaSpan.appendChild(durSpan);
            }

            const priceSpan = document.createElement('span');
            priceSpan.className = 'mcat-qv-rate-price';
            priceSpan.textContent = opt.price;
            metaSpan.appendChild(priceSpan);

            btn.appendChild(labelSpan);
            btn.appendChild(metaSpan);

            btn.addEventListener('click', () => {
                ratesEl.querySelectorAll('.mcat-qv-rate-row').forEach((row) => {
                    const active = row === btn;
                    row.classList.toggle('is-selected', active);
                    row.setAttribute('aria-pressed', active ? 'true' : 'false');
                });
            });

            ratesEl.appendChild(btn);
        });

        if (bookBtn) {
            bookBtn.href = item.bookUrl;
        }

        if (discoverLink) {
            if (item.detailUrl) {
                discoverLink.href = item.detailUrl;
                discoverLink.hidden = false;
            } else {
                discoverLink.removeAttribute('href');
                discoverLink.hidden = true;
            }
        }

        backdrop.hidden = false;
        document.body.classList.add('mcat-modal-open');
        requestAnimationFrame(() => {
            backdrop.classList.add('is-open');
            if (closeBtn) closeBtn.focus();
        });
    }

    function closeQuickView() {
        backdrop.classList.remove('is-open');
        document.body.classList.remove('mcat-modal-open');

        const finishClose = () => {
            backdrop.hidden = true;
            if (lastTrigger && typeof lastTrigger.focus === 'function') {
                lastTrigger.focus();
            }
        };

        if (reducedMotion) {
            finishClose();
        } else {
            window.setTimeout(finishClose, 260);
        }
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeQuickView);
    }

    backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) {
            closeQuickView();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (backdrop.hidden || !backdrop.classList.contains('is-open')) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            closeQuickView();
            return;
        }

        if (event.key === 'Tab') {
            const focusables = getFocusableElements();
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    document.querySelectorAll('[data-treatment-id]').forEach((card) => {
        const id = card.getAttribute('data-treatment-id');
        const rateBtn = card.querySelector('[data-open-rates]');

        if (rateBtn) {
            rateBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                openQuickView(id, rateBtn);
            });
        }

        card.addEventListener('click', (event) => {
            if (event.target.closest('a, button')) return;
            openQuickView(id, rateBtn || card);
        });

        card.addEventListener('keydown', (event) => {
            if (event.target !== card) return;
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openQuickView(id, rateBtn || card);
            }
        });
    });
})();
