(function () {
    const translations = {
        en: {
            nav: { home: "Home", about: "About", services: "Services", contact: "Contact Us" },
            hero: {
                tag: "Trusted B2B Partner",
                title: "Built for Manufacturing & Export",
                subtitle: "From strategy to execution—we deliver reliable supply chains and quality solutions so your business grows globally.",
                cta: "Get in Touch"
            },
            about: {
                title: "Partners in Growth",
                intro: "We are a professional B2B partner focused on manufacturing and export.",
                p1: "With years of experience in international trade, we help businesses grow through reliable supply chains, quality products, and strategic partnerships.",
                p2: "Our team combines industry expertise with a customer-first approach—delivering solutions that drive results and build lasting relationships."
            },
            services: {
                title: "What We Offer",
                intro: "End-to-end solutions for manufacturing and international trade.",
                card1: { title: "Manufacturing", desc: "Reliable production, quality control, and scalable supply—from prototype to full-scale delivery." },
                card2: { title: "Export & Logistics", desc: "Documentation, shipping, and customs support so your products reach global markets on time." },
                card3: { title: "Strategic Partnership", desc: "Long-term collaboration: we align with your goals and grow your business with dedicated support." }
            },
            contact: {
                title: "Get in Touch",
                intro: "Have a question or want to work together? Send us a message.",
                name: "Name",
                namePlaceholder: "Your name",
                email: "Email",
                message: "Message",
                messagePlaceholder: "Your message...",
                submit: "Send Message"
            },
            footer: { copyright: "Copyright © 2026 AntiCode All rights reserved." }
        },
        hu: {
            nav: { home: "Főoldal", about: "Rólunk", services: "Szolgáltatások", contact: "Kapcsolat" },
            hero: {
                tag: "Megbízható B2B partner",
                title: "Gyártásra és exportra építve",
                subtitle: "Stratégiától a megvalósításig—megbízható ellátási láncokat és minőségi megoldásokat nyújtunk, hogy üzleted globálisan nőjön.",
                cta: "Lépj velünk kapcsolatba"
            },
            about: {
                title: "Növekedésben partnerei",
                intro: "Professzionális B2B partner vagyunk a gyártás és export terén.",
                p1: "Nemzetközi kereskedelemben szerzett évek tapasztalatával segítünk vállalkozásoknak nőni megbízható ellátási láncokon, minőségi termékeken és stratégiai partnerségeken keresztül.",
                p2: "Csapatunk ipari szakértelmet párosít ügyfélközpontú megközelítéssel—eredményorientált megoldásokat nyújtunk, amelyek tartós kapcsolatokat építenek."
            },
            services: {
                title: "Szolgáltatásaink",
                intro: "Átfogó megoldások gyártáshoz és nemzetközi kereskedelemhez.",
                card1: { title: "Gyártás", desc: "Megbízható termelés, minőségbiztosítás és skálázható ellátás—prototípustól teljes volumenig." },
                card2: { title: "Export és logisztika", desc: "Dokumentáció, szállítás és vámügyintézés—termékeid időben elérik a globális piacokat." },
                card3: { title: "Stratégiai partnerség", desc: "Hosszú távú együttműködés: igazodunk céljaidhoz, és dedikált támogatással növeljük üzleted." }
            },
            contact: {
                title: "Lépj velünk kapcsolatba",
                intro: "Kérdésed van vagy együtt szeretnél dolgozni? Küldj üzenetet.",
                name: "Név",
                namePlaceholder: "A neved",
                email: "E-mail",
                message: "Üzenet",
                messagePlaceholder: "Üzeneted...",
                submit: "Üzenet küldése"
            },
            footer: { copyright: "Copyright © 2026 AntiCode Minden jog fenntartva." }
        }
    };

    const STORAGE_KEY = "project1-lang";

    function getLang() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === "hu" ? "hu" : "en";
    }

    function setLang(lang) {
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
        applyLang(lang);
        updateToggleButton(lang);
    }

    function getNested(obj, key) {
        return key.split(".").reduce((o, k) => (o && o[k] ? o[k] : null), obj);
    }

    function applyLang(lang) {
        const t = translations[lang];
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            const val = getNested(t, key);
            if (val) el.textContent = val;
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
            const key = el.getAttribute("data-i18n-placeholder");
            const val = getNested(t, key);
            if (val) el.placeholder = val;
        });
    }

    function updateToggleButton(lang) {
        const btn = document.querySelector(".lang-toggle");
        if (!btn) return;
        btn.querySelectorAll(".lang-option").forEach((el) => {
            el.classList.toggle("lang-active", el.getAttribute("data-lang") === lang);
        });
        btn.setAttribute("aria-label", lang === "en" ? "Angol aktív – váltás magyarra" : "Hungarian active – switch to English");
    }

    document.addEventListener("DOMContentLoaded", () => {
        const btn = document.querySelector(".lang-toggle");
        if (!btn) return;
        setLang(getLang());

        btn.addEventListener("click", (e) => {
            const target = e.target.closest(".lang-option");
            if (!target) return;
            const next = target.getAttribute("data-lang");
            if (next && next !== getLang()) setLang(next);
        });
    });
})();
