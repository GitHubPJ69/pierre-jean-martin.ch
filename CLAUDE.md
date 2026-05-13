# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack & non-negotiables

Static personal site deployed via GitHub Pages on the custom domain `pierre-jean-martin.ch`. **Vanilla HTML / CSS / JS only**: no framework, no npm, no build step, no bundler, no test runner. Push to `main` is the deploy.

Hard rules:
- **Do not touch `CNAME`**: it pins the GitHub Pages custom domain.
- **Do not introduce a build step or `package.json`.** Every file must be runnable as-is by opening it in a browser.
- **Only two Google Fonts**: `Space Grotesk` and `JetBrains Mono`. Don't add Inter, Roboto, system-ui-only fallbacks for body, etc.
- **No backend, no analytics, no third-party JS.** Forms use `mailto:` only (see `app.js`).
- **Never put the email address as a literal string in HTML.** It's assembled at runtime in `app.js` (`['contact','pierre-jean-martin.ch'].join('@')`) and injected into `[data-email]` elements.

## File layout

```
index.html          ← accueil
cours.html          ← offre B2C (cours particuliers, 100 CHF/h)
entreprises.html    ← offre B2B (3 postures: expert / consultant / formateur)
style.css           ← design system, shared by all 3 pages
app.js              ← i18n + helpers, shared by all 3 pages
CNAME               ← GitHub Pages domain, DO NOT EDIT
README.md
```

No build artifacts, no `dist/`, no generated files. What you see is what's served.

## Architecture

### Shared header/footer = copy-paste, not templating

There is no templating layer. The `<nav>` block and `<footer>` block are **physically duplicated** across the 3 HTML files. When you change one, change all three. Keep the only structural difference being the `class="active"` on the current page's nav link.

### Trilingual i18n (FR / EN / DE)

All user-facing text is in the HTML three times via data-attributes, and JS swaps it at runtime. Two patterns:

1. **Text content / form placeholders / `<option>` labels**: add `data-fr`, `data-en`, `data-de` to the element:
   ```html
   <h2 data-fr="Bonjour" data-en="Hello" data-de="Hallo">Bonjour</h2>
   ```
   The initial inner text should match `data-fr` (FR is the source of truth). `app.js` writes `textContent` for most tags, `placeholder` for `<input>`/`<textarea>` that have one, and `textContent` for `<option>`.

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
6. `bindMailtoForms(email)`: wires `[data-form-mailto]` submit → builds `mailto:` with subject from `data-subject-{lang}` and body from `FormData` entries (one `key: value` per line).
7. `applyLang(detectLang())`: final pass that syncs everything to the persisted/detected language.

When you add new behavior, follow the same IIFE + binder pattern; don't add a second `<script>` tag or a module.

### `style.css` design system

All design tokens are CSS variables in `:root` at the top of `style.css` (`--bg`, `--surface`, `--accent: #a78bfa`, `--font-sans`, `--font-mono`, etc.). **Always use the variables**, never hard-code colors or fonts elsewhere in the file.

Layout primitives reused across pages: `.container`, `.grid.cols-2/3/4`, `.card`, `.btn` / `.btn.primary` / `.btn.ghost` / `.btn.wa`, `.section-eyebrow`, `.badge`, `.chip`, `.checklist`. Breakpoints are mobile-first: anything below 768px collapses grids to one column and switches `.menu` to a dropdown via `.nav-toggle`.

No inline styles in the HTML except for occasional one-off `style="padding:…"` / `margin-top:…` on layout containers. Don't add inline colors or fonts.

## Hard-coded values you'll edit by hand

- **WhatsApp number**: obfuscated in `app.js` inside `injectWhatsapp()`, assembled from string fragments to keep the literal out of HTML source. Format is international (no `+`, no leading `0`). HTML uses `[data-whatsapp]` on `<a>` tags with `href="#"`; `app.js` rewrites the `href` at runtime. To change the number, edit only the fragments array in `injectWhatsapp()`.
- **LinkedIn**: `https://www.linkedin.com/in/pierre-jean-martin/`, in all 3 footers.
- **GitHub**: `https://github.com/GitHubPJ69`, in all 3 footers.
- **Email**: never written literally; only changed inside `injectEmail()` in `app.js` (domain `.ch`).
- **TODO markers** that still need real content:
  - `<!-- TODO: remplacer par une vraie review d'élève -->` in `cours.html` (×4)
  - `<!-- TODO: remplacer par un vrai projet entreprise -->` in `entreprises.html` (×3)

When you replace a TODO, remove the comment.

## Style conventions

- No em-dashes (U+2014) anywhere in the codebase. Use comma, colon, or split into two sentences. Use `·` (middle dot) for label/brand separators.
- FR text uses non-breaking spaces before `:`, `;`, `?`, `!` where appropriate.

## Workflow

There are no commands to run: no build, no lint, no tests.

- **Local preview**: open any of the `.html` files directly in a browser (`file://`). Google Fonts and the i18n swap work fine over `file://`.
- **Responsive check**: DevTools at 375 / 768 / 1280.
- **Deploy**: `git push origin main`. GitHub Pages picks it up; live at `https://pierre-jean-martin.ch` within ~1 min.

Commit prefixes used in this repo: `feat:`, `fix:`, `style:`, `content:`. Local git identity is configured in `.git/config` (not global).
