# AGENTS.md

Single source of truth for all coding agents working in this repository (Claude Code, Codex, Cursor, Aider, etc.). Agent-specific files like `CLAUDE.md` import this one via a one-line directive, so there is exactly one file to keep in sync.

When you (the agent) learn something durable about this codebase, propose an edit to **this file** rather than to any agent-specific stub.

## Stack & non-negotiables

Static personal site deployed via GitHub Pages on the custom domain `pierre-jean-martin.ch`. **Vanilla HTML / CSS / JS only**: no framework, no npm, no build step, no bundler, no test runner. Push to `main` is the deploy.

Hard rules:
- **Do not touch `CNAME`**: it pins the GitHub Pages custom domain.
- **Do not introduce a build step or `package.json`.** Every file must be runnable as-is by opening it in a browser.
- **Only two Google Fonts**: `Space Grotesk` and `JetBrains Mono`. Don't add Inter, Roboto, system-ui-only fallbacks for body, etc.
- **No backend, no third-party JS except GoatCounter for privacy-friendly, cookie-free analytics.** Forms use `mailto:` only (see `app.js`).
- **Never put the email address as a literal string in HTML.** It's assembled at runtime in `app.js` (`['contact','pierre-jean-martin.ch'].join('@')`) and injected into `[data-email]` elements.

## File layout

```
index.html          ← accueil
cours.html          ← offre B2C (cours particuliers, 100 CHF/h)
entreprises.html    ← offre B2B (3 postures: expert / consultant / formateur)
parcours.html       ← vitrine humaine (parcours, enseignement, projets)
style.css           ← design system, shared by all 4 pages
app.js              ← i18n + helpers, shared by all 4 pages
assets/             ← placeholder SVGs to be replaced by real photos (.webp / .jpg)
CNAME               ← GitHub Pages domain, DO NOT EDIT
README.md
```

No build artifacts, no `dist/`, no generated files. What you see is what's served.

`assets/` currently holds:
- `pj-portrait.jpg` — real portrait photo wired into the `index.html` hero.
- `pj-logo.png` — stylized PJ avatar on violet background, 256×256. Used as the round brand badge (`.brand-logo` in every header/footer). Already round-ready, so `.brand-logo` just clips it with `border-radius:50%` + `object-fit:cover`.
- `pj-favicon.png` — same image downscaled to 96×96 for use as the browser favicon (`<link rel="icon">` in all 4 HTML files). Kept separate from `pj-logo.png` so the favicon stays under ~25 KB.
- `4l-trophy.jpg` — real photo of the orange 4L crossing the Moroccan desert, 1820×1365 (4:3, cropped to match the desktop `.parcours-media` frame exactly). Wired into the "4L Trophy" timeline card in the Projets section of `parcours.html`.
- `pj-parachute.jpg` — real photo of a freefall skydive (1331×676, ratio ~2:1, JPG q85). Wired into the "Parachutisme" timeline card in the Parcours section of `parcours.html`. Wider than 4:3, so `object-fit:cover` crops the sides on desktop — the skydiver is centered so the crop stays safe.
- `pj-pompier-paysage.jpg` — real photo of PJ in turnout gear at the SDIS Chamberonne locker room (1500×1125, exact 4:3, JPG). Wired into the "Pompier volontaire" card in `parcours.html`. Already matches the desktop frame ratio so `object-fit:cover` does no cropping on desktop.
- `pj-diplome.jpg` — real photo of PJ holding his EPFL Master's diploma in front of the iconic red EPFL campus sculpture (1354×922, ratio ~1.47, JPG). Wired into the "Ingénieur EPFL, robotique" card at the top of the Parcours section of `parcours.html`. Wider than 4:3, so `object-fit:cover` crops ~5% on each side.
- `epfl-secouriste.png` — EPFL Secouriste First Aid logo (217×233, ~7 KB). Wired into the "Secouriste" card in the Parcours section of `parcours.html`. Square logo on white background, displayed via the `.parcours-media.logo` variant (white bg + `object-fit:contain`).
- `epfl-logo.png` — official EPFL logo (1280×372, ~5 KB), red on white, panoramic. Wired into the "Assistant étudiant EPFL" card in the Enseignement section. Uses `.parcours-media.logo` (logo displayed in full via `object-fit:contain`, not cropped).
- `gymnase-etoy-logo.png` — Gymnase d'Étoy logo (788×230, ~53 KB), black wordmark on transparent background. Wired into the "Professeur Gymnase d'Étoy" card. Uses `.parcours-media.logo` (white bg + contain) so the black wordmark is readable.
- `cours-maths-physique-prog.jpg` — photo-like illustration of math/physics/programming icons on dark blue background (1200×614, ~54 KB JPG q85). Wired into the "Cours particuliers" card in the Enseignement section. Wider than 4:3 so cropped ~15% on each side via `object-fit:cover` — central icons stay visible.
- Placeholder SVG with a "TODO" label baked into the image: `travel.svg`. Still used in 3 Projets cards (Inde Vigyan Ashram, Vietnam Hô Chi Minh, Europe 20 pays) awaiting real photos. Dark-themed by design.

## Architecture

### Shared header/footer = copy-paste, not templating

There is no templating layer. The `<nav>` block and `<footer>` block are **physically duplicated** across the 4 HTML files. When you change one, change all four. Keep the only structural difference being the `class="active"` on the current page's nav link.

### Trilingual i18n (FR / EN / DE)

All user-facing text is in the HTML three times via data-attributes, and JS swaps it at runtime. Two patterns:

1. **Text content / form placeholders / `<option>` labels**: add `data-fr`, `data-en`, `data-de` to the element:
   ```html
   <h2 data-fr="Bonjour" data-en="Hello" data-de="Hallo">Bonjour</h2>
   ```
   The initial inner text should match `data-fr` (FR is the source of truth). `app.js` writes `textContent` for most tags, `placeholder` for `<input>`/`<textarea>` that have one, and `textContent` for `<option>`.

   **Opt-in HTML rendering**: when a localized string needs an inline `<a>` link, add the `data-html` attribute on the element. `app.js` then assigns via `innerHTML` instead of `textContent`. Use single quotes inside the data-attribute to avoid escaping headaches:
   ```html
   <p data-html
      data-fr="Six mois chez <a href='https://...'>Vigyan Ashram</a>."
      data-en="Six months at <a href='https://...'>Vigyan Ashram</a>."
      data-de="Sechs Monate bei <a href='https://...'>Vigyan Ashram</a>.">
     Six mois chez <a href="https://...">Vigyan Ashram</a>.
   </p>
   ```
   Author-controlled content only (no user input ever reaches these attributes).

2. **Localized HTML attributes** (`title`, `aria-label`, `alt`, `content`): use the `data-attr-{attr}-{lang}` pattern AND set the initial attribute:
   ```html
   <button aria-label="Ouvrir le menu"
           data-attr-aria-label-fr="Ouvrir le menu"
           data-attr-aria-label-en="Open menu"
           data-attr-aria-label-de="Menü öffnen">…</button>
   ```

The `<title>` element uses `data-fr` / `data-en` / `data-de` like normal text. `app.js` reads it specially and assigns to `document.title`.

Selected language is persisted under `localStorage['pjm.lang']` and applied on next page load by `app.js` before paint-relevant work. Both lang-switchers (header + footer) are wired to the same handler and stay in sync. Whenever you add a new text element, **always provide the three translations**. Missing translations fall back to FR but break trilingual completeness.

### `app.js` boot order (single IIFE)

On `DOMContentLoaded`:
1. `injectEmail()`: assembles email and fills `[data-email]` (sets `href="mailto:…"` on `<a>` tags; if `data-keep-text` is set the text isn't overwritten).
2. `injectWhatsapp()`: assembles the WhatsApp number from string fragments, rewrites `href` on `[data-whatsapp]` to `https://wa.me/<number>`. Optional `data-whatsapp="message"` adds `?text=…`.
3. `setYears()`: fills `[data-year]` with current year.
4. `bindLangSwitchers()`: wires `.lang-switch button[data-lang]` clicks.
5. `bindMobileNav()`: wires `.nav-toggle` to toggle `.menu.open` under 768px.
6. `bindFadeUp()`: IntersectionObserver that adds `.in-view` to any `.fade-up` element when it enters the viewport. Gracefully no-ops if IntersectionObserver is missing (adds `.in-view` immediately). Pair with the `.fade-up` CSS rule and the `:nth-child` stagger to get a scroll fade-in. Currently used by the "Mes cours" cards in `cours.html`.
7. `bindMailtoForms(email)`: wires `[data-form-mailto]` submit → builds `mailto:` with subject from `data-subject-{lang}` and body from `FormData` entries (one `key: value` per line).
8. `applyLang(detectLang())`: final pass that syncs everything to the persisted/detected language.

When you add new behavior, follow the same IIFE + binder pattern; don't add a second `<script>` tag or a module.

### `style.css` design system

All design tokens are CSS variables in `:root` at the top of `style.css` (`--bg`, `--surface`, `--accent: #a78bfa`, `--font-sans`, `--font-mono`, etc.). **Always use the variables**, never hard-code colors or fonts elsewhere in the file.

Layout primitives reused across pages: `.container`, `.grid.cols-2/3/4`, `.card`, `.btn` / `.btn.primary` / `.btn.ghost` / `.btn.wa`, `.section-eyebrow`, `.badge`, `.chip`, `.checklist`. Breakpoints are mobile-first: anything below 768px collapses grids to one column and switches `.menu` to a dropdown via `.nav-toggle`.

Page-scoped modules (defined in `style.css` but only used on the page in their name):
- `.parcours-item` / `.parcours-media` / `.parcours-content` / `.parcours-date` (parcours.html — media-left timeline cards). For logo images that shouldn't be cropped, add the `logo` modifier on the media wrapper (`<div class="parcours-media logo">`): switches to white bg + `object-fit:contain` + padding, so panoramic logos like EPFL display in full instead of being chopped by `cover`.
- `.course-card` / `.course-icon` / `.course-pitch` / `.course-target` / `.course-footnote` (cours.html "Mes cours" section).
- `.review` / `.review-source` / `.reviews-platforms` / `.avatar.c1..c6` (cours.html reviews block).
- `.posture` / `.posture-icon` (entreprises.html).
- `.fade-up` (scroll-triggered animation, driven by `bindFadeUp` in `app.js`; `nth-child` staggers handled by CSS so you can apply `.fade-up` to siblings without writing any JS).

No inline styles in the HTML except for occasional one-off `style="padding:…"` / `margin-top:…` on layout containers. Don't add inline colors or fonts.

## Hard-coded values you'll edit by hand

- **WhatsApp number**: obfuscated in `app.js` inside `injectWhatsapp()`, assembled from string fragments to keep the literal out of HTML source. Format is international (no `+`, no leading `0`). HTML uses `[data-whatsapp]` on `<a>` tags with `href="#"`; `app.js` rewrites the `href` at runtime. To change the number, edit only the fragments array in `injectWhatsapp()`.
- **LinkedIn**: `https://www.linkedin.com/in/pierre-jean-martin/`, in all 4 footers.
- **GitHub**: `https://github.com/GitHubPJ69`, in all 4 footers.
- **Email**: never written literally; only changed inside `injectEmail()` in `app.js` (domain `.ch`).
- **Superprof**: `https://www.superprof.ch/ingenieur-robotique-epfl-python-experience-eleves-methodo-algorithmique-gymnase.html`. Used as `via Superprof` attribution under each Superprof review in `cours.html` and as the global "Voir mes avis" button. 5 occurrences total in `cours.html`.
- **Apprentus**: `https://www.apprentus.ch/in/pierre-jean.m`. Same pattern: per-review attribution + global button. 2 occurrences in `cours.html`.
- **Portrait photo**: `assets/pj-portrait.jpg` (used in `index.html` hero). Real photos and logos wired in `parcours.html`: `pj-diplome.jpg` (Ingénieur EPFL), `pj-pompier-paysage.jpg` (Pompier), `epfl-secouriste.png` (Secouriste), `pj-parachute.jpg` (Parachutisme), `epfl-logo.png` (Assistant EPFL), `cours-maths-physique-prog.jpg` (Cours particuliers), `gymnase-etoy-logo.png` (Gymnase Étoy), `4l-trophy.jpg` (4L Trophy). Only `travel.svg` placeholder remains, in 3 Projets cards.
- **TODO markers** that still need real content:
  - `<!-- TODO: remplacer par un vrai projet entreprise -->` in `entreprises.html` (×3)
  - `<!-- TODO: ... -->` in `parcours.html`: Europe trip period date.
  - `travel.svg` placeholder in 3 Projets cards (Inde, Vietnam, Europe) to swap for real photos.

When you replace a TODO, remove the comment.

## Style conventions

- No em-dashes (U+2014) anywhere in the codebase. Use comma, colon, or split into two sentences. Use `·` (middle dot) for label/brand separators.
- FR text uses non-breaking spaces before `:`, `;`, `?`, `!` where appropriate.
- **Asset filenames in `assets/` are kebab-case lowercase.** Use `.jpg`, never `.jpeg`. PJ-owned assets use the `pj-` prefix (e.g. `pj-portrait.jpg`, `pj-logo.png`, `pj-diplome.jpg`). Third-party institution assets use the institution slug as prefix (`epfl-logo.png`, `epfl-secouriste.png`, `gymnase-etoy-logo.png`). One word per dash; never mix underscores and dashes.

## Workflow

There are no commands to run: no build, no lint, no tests.

- **Local preview**: open any of the `.html` files directly in a browser (`file://`). Google Fonts and the i18n swap work fine over `file://`.
- **Responsive check**: DevTools at 375 / 768 / 1280.
- **Deploy**: `git push origin main`. GitHub Pages picks it up; live at `https://pierre-jean-martin.ch` within ~1 min.

### PR-first workflow

Non-trivial changes go through a pull request, not a direct push to `main`. "Non-trivial" means: new features, refactors, new assets, anything touching multiple files, anything that could break the live site, anything worth a written changelog entry. One-line typo fixes can still be pushed directly.

Conventions:
- Branch prefix matches the commit prefix: `feat/issue-<n>-<slug>`, `chore/...`, `fix/...`, `docs/...`.
- PRs are squash-merged with `--delete-branch` (one clean commit per PR on `main`).
- Reference `Closes #<n>` in the PR body when it fully resolves an issue.
- Commits carry a `Co-Authored-By:` trailer whenever an AI coding agent participates (Claude Code, Codex, etc.), both for traceability and to farm GitHub's Pair Extraordinaire achievement tiers.

Commit prefixes used in this repo: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `content:`. Local git identity is configured in `.git/config` (not global).

## Monitoring and analytics dashboards

External dashboards to check periodically. Bookmarks are nice in the browser; this section is the canonical reference so future sessions know where to look.

- **GoatCounter** (privacy-friendly, cookie-free traffic analytics): https://pierrejeanmartin.goatcounter.com/ — daily/weekly visits, top pages, referrers, countries. Public-readable by default. Tracking script is wired in the footer of all 4 pages.
- **Google Search Console** (SEO, indexing, sitemap): https://search.google.com/search-console — property `https://pierre-jean-martin.ch/` (URL prefix). Ownership verified via the `google77d53b16f40f54d2.html` file at the repo root, which must stay in place to remain verified. Sitemap `sitemap.xml` is submitted. Useful tabs: Performance (queries, clicks, impressions), Pages (indexing status), Sitemaps, URL inspection.

Cadence: GoatCounter is interesting weekly. GSC has very little signal in the first 30 days and is most useful monthly thereafter.
