# pierre-jean-martin.ch

Personal website of Pierre-Jean Martin. Trilingual (FR/EN/DE), static, hosted on GitHub Pages.

Live at **[pierre-jean-martin.ch](https://pierre-jean-martin.ch)**.

## Stack

Vanilla HTML, CSS, and JavaScript. No framework, no bundler, no build step, no `package.json`. What you see in the repo is what gets served.

- Two Google Fonts only: `Space Grotesk` and `JetBrains Mono`.
- [GoatCounter](https://www.goatcounter.com/) for privacy-friendly, cookie-free analytics. No other third-party JS.
- Forms use `mailto:` only. No backend.
- The email address is never written as a literal string in HTML; it is assembled at runtime in `app.js` and injected into `[data-email]` elements.

## Layout

```
index.html          home
cours.html          B2C offer (private lessons, CHF 100/h)
entreprises.html    B2B offer (expert / consultant / trainer postures)
parcours.html       background, teaching, projects
style.css           design system, shared by all pages
app.js              i18n + helpers, shared by all pages
assets/             photos and logos
CNAME               GitHub Pages custom domain, do not edit
```

## Run locally

Open any `.html` file directly in a browser. Google Fonts and the language switch work fine over `file://`.

If you prefer a real HTTP origin (for clean relative paths or to test `localStorage` across pages), run any static server from the repo root, for example:

```
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

```
git push origin main
```

GitHub Pages picks it up and the site goes live at `https://pierre-jean-martin.ch` within about a minute. The `CNAME` file pins the custom domain and must not be touched.

## i18n without a framework

Most multilingual sites in 2026 reach for a lib (`react-i18next`, `vue-i18n`, Next.js i18n routing) or an SSG that generates one URL per language. This site does neither. The three translations live directly in the HTML as data-attributes, and a small IIFE in `app.js` swaps them at runtime:

```html
<h2 data-fr="Bonjour" data-en="Hello" data-de="Hallo">Bonjour</h2>
```

For localized HTML attributes (`title`, `aria-label`, `alt`), the pattern is `data-attr-{attr}-{lang}`:

```html
<button aria-label="Ouvrir le menu"
        data-attr-aria-label-fr="Ouvrir le menu"
        data-attr-aria-label-en="Open menu"
        data-attr-aria-label-de="Menü öffnen">…</button>
```

FR is the source of truth. The selected language is persisted in `localStorage` under `pjm.lang` and applied on the next page load.

Trade-offs, assumed:
- The HTML payload carries all three languages (~3× the text bytes). Acceptable here because the pages are small and text-light.
- No `/fr/`, `/en/`, `/de/` URLs, so search engines see one page per route. Acceptable for a personal site; would not be acceptable for a content-heavy product site.

## Conventions

- No em-dash (U+2014) anywhere in the codebase. Use a comma, a colon, or two sentences. Use `·` (middle dot) for label or brand separators.
- FR text uses non-breaking spaces before `:`, `;`, `?`, `!`.
- All design tokens are CSS variables in `:root` at the top of `style.css`. Never hard-code colors or fonts elsewhere.
- The `<nav>` and `<footer>` blocks are physically duplicated across the four HTML files. When one changes, change all four. The only structural difference is `class="active"` on the current page's nav link.
- Commit prefixes: `feat:`, `fix:`, `style:`, `content:`.

## Accessibility and performance

- Mobile-first CSS, breakpoint at 768px.
- Scroll-triggered fade-in via `IntersectionObserver` with a graceful no-op fallback (elements appear immediately if the API is missing).
- No tracking cookies, no consent banner needed.
- Email obfuscation: assembled from string fragments at runtime to keep it out of static HTML and out of scrapers.

## License

Source code is released under the [MIT License](LICENSE). Content (text, photos, and visual identity) is © Pierre-Jean Martin, all rights reserved.

## Contact

[LinkedIn](https://www.linkedin.com/in/pierre-jean-martin/) · [GitHub](https://github.com/GitHubPJ69) · email available on the [site](https://pierre-jean-martin.ch).
