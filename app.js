/* pierre-jean-martin.ch · shared behaviors
   i18n (FR/EN/DE) · footer year · email obfuscation · form → mailto · mobile nav */

(function(){
  "use strict";

  const LANGS = ["fr","en","de"];
  const STORAGE_KEY = "pjm.lang";

  // -------- i18n --------
  function detectLang(){
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGS.includes(stored)) return stored;
    const nav = (navigator.language || "fr").slice(0,2).toLowerCase();
    return LANGS.includes(nav) ? nav : "fr";
  }

  function applyLang(lang){
    if (!LANGS.includes(lang)) lang = "fr";
    document.documentElement.lang = lang;

    // Text content / placeholders / values
    document.querySelectorAll("[data-fr]").forEach(el => {
      const val = el.dataset[lang] || el.dataset.fr;
      if (val == null) return;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        if (el.hasAttribute("placeholder")) el.placeholder = val;
        else el.value = val;
      } else if (el.hasAttribute("data-html")) {
        // Opt-in: render the value as HTML (e.g. when the localized string
        // contains an inline <a> link). Author-controlled content only.
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });

    // Localized attributes (title, aria-label, alt, content)
    ["title","aria-label","alt","content"].forEach(attr => {
      document.querySelectorAll(`[data-attr-${attr}-fr]`).forEach(el => {
        const v = el.getAttribute(`data-attr-${attr}-${lang}`) || el.getAttribute(`data-attr-${attr}-fr`);
        if (v) el.setAttribute(attr, v);
      });
    });

    // <title> localized
    const t = document.querySelector("title");
    if (t && t.dataset[lang]) document.title = t.dataset[lang];

    // Lang-switch pressed state
    document.querySelectorAll(".lang-switch button[data-lang]").forEach(btn => {
      btn.setAttribute("aria-pressed", btn.dataset.lang === lang ? "true" : "false");
    });

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function bindLangSwitchers(){
    document.querySelectorAll(".lang-switch button[data-lang]").forEach(btn => {
      btn.addEventListener("click", () => applyLang(btn.dataset.lang));
    });
  }

  // -------- Year, email obfuscation --------
  function setYears(){
    const y = new Date().getFullYear();
    document.querySelectorAll("[data-year]").forEach(el => el.textContent = y);
  }

  function injectEmail(){
    const user = "contact";
    const domain = "pierre-jean-martin.ch";
    const email = [user, domain].join("@");
    document.querySelectorAll("[data-email]").forEach(el => {
      if (el.tagName === "A") {
        el.href = "mailto:" + email;
        if (!el.dataset.keepText) el.textContent = email;
      } else {
        el.textContent = email;
      }
    });
    return email;
  }

  function injectWhatsapp(){
    // International format, no '+', no leading zero. Assembled from fragments
    // so the literal doesn't appear in the HTML source for naive scrapers.
    const number = ["33","6","20","80","30","36"].join("");
    document.querySelectorAll("[data-whatsapp]").forEach(el => {
      const text = el.dataset.whatsapp || "";
      const url = "https://wa.me/" + number + (text ? "?text=" + encodeURIComponent(text) : "");
      if (el.tagName === "A") el.href = url;
    });
  }

  // -------- Form → mailto --------
  function bindMailtoForms(email){
    document.querySelectorAll("[data-form-mailto]").forEach(form => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const lang = document.documentElement.lang || "fr";
        const data = new FormData(form);
        const subject = form.dataset[`subject${lang.charAt(0).toUpperCase()+lang.slice(1)}`] || form.dataset.subjectFr || "Contact";
        const lines = [];
        for (const [key, value] of data.entries()){
          lines.push(`${key}: ${value}`);
        }
        const body = lines.join("\n");
        window.location.href =
          `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      });
    });
  }

  // -------- Scroll fade-up --------
  function bindFadeUp(){
    const els = document.querySelectorAll(".fade-up");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    els.forEach(el => io.observe(el));
  }

  // -------- Mobile nav toggle --------
  function bindMobileNav(){
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded","false");
    }));
  }

  // -------- Boot --------
  document.addEventListener("DOMContentLoaded", () => {
    const email = injectEmail();
    injectWhatsapp();
    setYears();
    bindLangSwitchers();
    bindMobileNav();
    bindFadeUp();
    bindMailtoForms(email);
    applyLang(detectLang());
  });
})();
