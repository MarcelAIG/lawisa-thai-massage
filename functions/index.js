/**
 * Cloudflare Pages Function — Root & English Homepage (/?lang=en) SEO Handler
 *
 * Serves `/` untouched, and rewrites `/?lang=en` at the edge via HTMLRewriter so
 * search engine crawlers receive an independently indexable English HTML document
 * with a self-referencing canonical (`https://lawisa-thai-massage.pages.dev/?lang=en`),
 * reciprocal `hreflang` annotations, and English metadata directly in the HTTP response.
 */
const EN_CANONICAL = "https://lawisa-thai-massage.pages.dev/?lang=en";
const EN_TITLE = "Authentic Thai Massage Paris 8th – Faubourg Saint-Honoré | LAWISA";
const EN_DESC =
    "Authentic Thai massage salon at 183 Rue du Faubourg Saint-Honoré in Paris 8th, near the Champs-Élysées and Saint-Philippe-du-Roule. Solo & Duo rituals from €45.";
const EN_OG_IMAGE_ALT = "Traditional Thai treatment room at LAWISA Thaï Massage in Paris 8th";

const EN_HREFS = {
    nav_massages_url: "/en/massages/",
    massage_1_url: "/en/massages/traditional-thai-massage/",
    massage_2_url: "/en/massages/warm-oil-thai-massage/",
    massage_3_url: "/en/massages/mixed-thai-warm-oil-massage/",
    massage_4_url: "/en/massages/back-and-shoulders-massage/",
    massage_5_url: "/en/massages/cranial-scalp-massage/",
    massage_6_url: "/en/massages/foot-reflexology/",
    massage_7_url: "/en/massages/jet-lag-recovery-massage/",
    massage_8_url: "/en/massages/office-syndrome-massage/",
    footer_legal_url: "/en/legal-notice/",
    footer_privacy_url: "/en/privacy-policy/"
};

const EN_TEXT = {
    hero_title: 'The Art of Thai Massage<br><span class="hero-title-sub">in the heart of Paris</span>',
    hero_subtitle: "Authentic Thai massage and warm oil rituals on Rue du Faubourg Saint-Honoré in Paris’s 8th&nbsp;arrondissement.",
    section_massages: "Our Massages",
    massage_1: "Traditional Thai Massage",
    massage_2: "Warm Oil Thai Massage",
    massage_3: "Mixed Thai & Warm Oil Massage",
    massage_4: "Back & Shoulders Massage",
    massage_5: "Cranial & Scalp Massage",
    massage_6: "Foot Reflexology / Foot Massage",
    massage_7: "Jet Lag Recovery Massage",
    massage_8: "Office Syndrome Massage",
    about_title: 'The LAWISA Salon,<span class="about-heading-accent">a haven of calm in Paris&nbsp;8th</span>',
    about_lead: "Located at 183&nbsp;Rue du Faubourg Saint-Honoré in Paris’s 8th&nbsp;arrondissement, between the Champs-Élysées and&nbsp;Courcelles, LAWISA welcomes you into a peaceful sanctuary dedicated to traditional Thai&nbsp;massage.",
    offers_subtitle: "Privileged moments thoughtfully crafted to extend your serenity in the heart of&nbsp;Paris&nbsp;8th.",
    faq_a1: "At 183&nbsp;Rue du Faubourg Saint-Honoré in Paris’s 8th&nbsp;arrondissement, steps from the Champs-Élysées and metro stations Saint-Philippe-du-Roule, Miromesnil, and&nbsp;Courcelles.",
    contact_title: "Find Us in the Heart of&nbsp;Paris",
    contact_access_desc: "Located at 183&nbsp;Rue du Faubourg Saint-Honoré in Paris’s 8th&nbsp;arrondissement, steps from the Champs-Élysées and easily reached by metro via Saint-Philippe-du-Roule, Miromesnil, and&nbsp;Courcelles."
};

export async function onRequestGet(context) {
    const res = await context.next();
    const url = new URL(context.request.url);

    if (url.searchParams.get("lang") !== "en" || typeof HTMLRewriter === "undefined") {
        return res;
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
        return res;
    }

    return new HTMLRewriter()
        .on("html", {
            element(el) {
                el.setAttribute("lang", "en");
            }
        })
        .on("title", {
            element(el) {
                el.setInnerContent(EN_TITLE);
            }
        })
        .on('meta[name="description"]', {
            element(el) {
                el.setAttribute("content", EN_DESC);
            }
        })
        .on('link[rel="canonical"]', {
            element(el) {
                el.setAttribute("href", EN_CANONICAL);
            }
        })
        .on('meta[property="og:url"]', {
            element(el) {
                el.setAttribute("content", EN_CANONICAL);
            }
        })
        .on('meta[property="og:locale"]', {
            element(el) {
                el.setAttribute("content", "en_US");
            }
        })
        .on('meta[property="og:locale:alternate"]', {
            element(el) {
                el.setAttribute("content", "fr_FR");
            }
        })
        .on('meta[property="og:title"]', {
            element(el) {
                el.setAttribute("content", EN_TITLE);
            }
        })
        .on('meta[property="og:description"]', {
            element(el) {
                el.setAttribute("content", EN_DESC);
            }
        })
        .on('meta[property="og:image:alt"]', {
            element(el) {
                el.setAttribute("content", EN_OG_IMAGE_ALT);
            }
        })
        .on('meta[name="twitter:title"]', {
            element(el) {
                el.setAttribute("content", EN_TITLE);
            }
        })
        .on('meta[name="twitter:description"]', {
            element(el) {
                el.setAttribute("content", EN_DESC);
            }
        })
        .on("[data-i18n]", {
            element(el) {
                const key = el.getAttribute("data-i18n");
                if (key && Object.prototype.hasOwnProperty.call(EN_TEXT, key)) {
                    el.setInnerContent(EN_TEXT[key], { html: true });
                }
            }
        })
        .on("[data-i18n-href]", {
            element(el) {
                const key = el.getAttribute("data-i18n-href");
                if (key && Object.prototype.hasOwnProperty.call(EN_HREFS, key)) {
                    el.setAttribute("href", EN_HREFS[key]);
                }
            }
        })
        .transform(res);
}
