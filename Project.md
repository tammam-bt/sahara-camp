# Sahara Camp — Project Documentation

> Static single-page marketing and booking website for **Sahara Camp**, a desert camp in Tembaine, Douz, Tunisia.

- **Live site:** https://sahara-camp.com
- **Hosting:** Netlify (static, auto-deploy from Git)
- **Repo root:** `abdelmoula-camp/`

---

## 1. Overview

Sahara Camp is a desert glamping business offering traditional Berber tents and luxury glamping tents in the Sahara near Douz, Tunisia. This repository contains the entire website: a single-page site with a hero, about section, accommodation cards, gallery, activities, booking form, location map, FAQ chatbot, and footer.

The site is **fully static** — no backend, no database, no build step. Bookings are submitted via WhatsApp (pre-filled message opens `wa.me`). All content is available in **5 languages** (English, French, German, Russian, Arabic) with client-side language switching and RTL support for Arabic.

---

## 2. Tech Stack

| Layer       | Technology                                                        |
| ----------- | ---------------------------------------------------------------- |
| Markup      | HTML5 (single `index.html`)                                      |
| Styling     | CSS3 with custom properties (design tokens), single `style.css`  |
| Scripts     | Vanilla JavaScript (ES6+), no framework, no bundler              |
| Calendar    | [Litepicker](https://litepicker.com/) via CDN (inline mode)      |
| Fonts       | Google Fonts: Playfair Display (headings) + Lato (body)          |
| Images      | Unsplash CDN URLs (centralized in `js/images.js`)                |
| Hosting     | Netlify (static, configured via `netlify.toml`)                  |
| Package mgr | None — no `package.json`, no `node_modules`                      |

---

## 3. File Structure

```
abdelmoula-camp/
├── index.html          — full page markup (hero, about, accommodation,
│                         gallery, activities, booking, location, footer,
│                         chatbot widget)
├── 404.html            — custom 404 error page
├── css/
│   └── style.css       — all styles; design tokens in :root at top
├── js/
│   ├── images.js       — central image URL config (window.IMAGES)
│   ├── translations.js — i18n strings for 5 languages (window.TRANSLATIONS)
│   ├── main.js         — navbar, mobile menu, gallery, scroll, lang, lightbox
│   ├── booking.js      — 3-step booking flow → WhatsApp submit
│   └── chatbot.js      — floating FAQ chatbot widget (hybrid UI)
├── fonts/              — (reserved for local font files, currently CDN)
├── images/             — (reserved for local photos, currently Unsplash)
├── netlify.toml        — deploy config + security/cache headers
├── robots.txt          — SEO crawler directives
├── sitemap.xml         — SEO sitemap (single URL)
├── AGENTS.md           — concise agent guide (conventions + pitfalls)
├── Project.md          — this file (full project documentation)
└── .gitignore
```

### Script load order (in `index.html`)
1. `js/images.js`   — populates `window.IMAGES`
2. `js/translations.js` — populates `window.TRANSLATIONS`
3. `js/main.js`     — UI logic, language switching, gallery
4. `js/booking.js`  — declares `const WHATSAPP_NUMBER` (must load before chatbot.js)
5. `js/chatbot.js`  — reads `WHATSAPP_NUMBER` via `typeof` guard
6. Litepicker CDN script

---

## 4. Running Locally

No build step. Open `index.html` directly, or serve the folder:

```bash
# Option 1: Python
python3 -m http.server 8000
# visit http://localhost:8000

# Option 2: Node (if installed)
npx serve .

# Option 3: just double-click index.html
```

---

## 5. Deployment

The site deploys to **Netlify** automatically on push to the connected Git branch.

`netlify.toml` configures:
- **Publish directory:** `.` (repo root)
- **Security headers:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`
- **Caching:** `/css/*`, `/js/*`, `/images/*` → `max-age=31536000, immutable`; `*.html` → `no-cache`

No build command is needed.

---

## 6. Key Features

### 6.1 Internationalization (i18n)
- **5 languages:** `en`, `fr`, `de`, `ru`, `ar`
- All strings in `js/translations.js` under `window.TRANSLATIONS[lang]`
- HTML elements use `data-i18n="nav.about"` (dot-notation keys)
- Language switching via `Lang.set(lang)` in `main.js`; choice persists in `localStorage`
- Arabic (`ar`) triggers RTL: `document.documentElement.dir = 'rtl'`
- Booking validation errors use the `terr(key, vars)` helper in `booking.js`, reading from `window.TRANSLATIONS[lang].booking.error`. Supports `{placeholder}` interpolation (e.g. `{max}`).

### 6.2 Images
- All image URLs centralized in `js/images.js` under `window.IMAGES`
- HTML elements reference images via `data-img-key="hero"` or `data-img-key="tents.traditional"`
- Gallery is built dynamically by `main.js` from `window.IMAGES.gallery` (each entry has `thumb`, `full`, `alt`, `caption`)
- To swap an image: edit the URL in `js/images.js` — no HTML changes needed
- Currently uses **Unsplash URLs** (stable, no expiring tokens). To use local photos, drop files in `images/` and reference as `images/your-photo.jpg`
- **Never** use hotlinked URLs from `camp-mars.com` or Facebook CDN — they break

### 6.3 Booking Flow
- **3-step form:** (1) tent selection + dates → (2) guest details → (3) review + submit
- **No backend / no database.** Submit composes a WhatsApp message and opens `https://wa.me/21693290920` with pre-filled text
- Calendar uses **Litepicker** in inline mode (CDN)
- Prices: Traditional Berber Tent €45/night (max 2 guests), Luxury Glamping Tent €90/night (max 4 guests)
- Validation errors are translated in all 5 languages via `terr()`
- WhatsApp message is **plain ASCII** (no emojis — `encodeURIComponent` mangles them in some clients)

### 6.4 Chatbot
- Floating button at bottom-right (bottom-left in RTL)
- **Non-AI** FAQ widget with pre-written Q&A in all 5 languages
- **Hybrid UI:** home view with quick-reply buttons (Book / Contact / Questions) → accordion FAQ view with "← Back" button
- WhatsApp CTA always available at the bottom of the chat
- **DOM structure:** `#chatbot-widget` wraps `#chatbot-body` (the window) and `#chatbot-toggle` (the FAB). The toggle uses an inline `onclick` to toggle `.chatbot--open` — do not add a second JS handler
- **WhatsApp number:** `chatbot.js` reads `WHATSAPP_NUMBER` from `booking.js` via `CHATBOT_WHATSAPP` (with `typeof` guard + fallback `21693290920`). Never redeclare `WHATSAPP_NUMBER` in `chatbot.js`

### 6.5 CSS / Design System
- Design tokens (colors, fonts, radii, shadows, transitions) in `:root` at top of `style.css`
- Responsive breakpoints: 1024px (tablet), 640px (mobile), 480px (small mobile)
- `prefers-reduced-motion` support
- RTL support via `[dir="rtl"]` selectors

### 6.6 SEO
- Meta tags, Open Graph, Twitter Card in `index.html` `<head>`
- JSON-LD `LodgingBusiness` structured data (address, geo, phone, price range)
- `hreflang="x-default"` (single URL, client-side language switching — no per-language URLs)
- `sitemap.xml` and `robots.txt` at site root
- Custom `404.html` for broken links

---

## 7. Configuration Reference

### 7.1 WhatsApp Number
`+216 93 290 920` (international format: `21693290920`)

Used in: booking form submit, chatbot CTA, footer, location section.

**Single source of truth:** `const WHATSAPP_NUMBER = "21693290920"` in `js/booking.js`.

To change the number:
1. Update `WHATSAPP_NUMBER` in `js/booking.js`
2. Update the `href="https://wa.me/..."` attributes in `index.html` (footer + location section)
3. Update the fallback in `js/chatbot.js` (`CHATBOT_WHATSAPP`)

### 7.2 Google Maps Embed
- Coordinates: **33.4547, 9.0160** (Tembaine, Douz, Tunisia)
- Located in the iframe `src` in `index.html` location section
- To update: replace the iframe `src` URL

### 7.3 Domain
- Canonical: `https://sahara-camp.com`
- Referenced in: `index.html` (canonical, OG, JSON-LD), `sitemap.xml`, `robots.txt`

### 7.4 Prices & Capacity
Defined in `js/booking.js`:
```js
const PRICES = { traditional: 45, glamping: 90 };
const MAX_GUESTS = { traditional: 2, glamping: 4 };
```

---

## 8. Common Pitfalls

| Pitfall | Why it breaks | Fix |
| ------- | ------------- | --- |
| Declaring `const WHATSAPP_NUMBER` in `chatbot.js` | `SyntaxError` (duplicate `const`) — breaks all JS on the page | Keep it only in `booking.js`; `chatbot.js` reads via `typeof` guard |
| Adding JS `addEventListener` on `#chatbot-toggle` | Double-toggle (open→immediately close) | Use only the inline `onclick` handler |
| Hotlinked image URLs (camp-mars.com, FB CDN) | URLs expire / 403 / broken images | Use Unsplash URLs or local `/images/` files |
| Hardcoded English strings | Not translated for non-EN users | Add to `translations.js` for all 5 languages; use `terr()` for booking errors |
| Emojis in WhatsApp message | `encodeURIComponent` produces `?` in some clients | Keep message plain ASCII |
| Per-language `hreflang` URLs | Site has one URL (client-side switching) | Use `x-default` only |

---

## 9. Recent Changes (Changelog)

- **Images:** Replaced fragile hotlinked images (camp-mars.com, Facebook CDN) with stable Unsplash URLs in `js/images.js`.
- **i18n:** Translated all booking validation errors into 5 languages via `translations.js` + `terr()` helper in `booking.js`.
- **Chatbot fix:** Fixed chatbot not opening — restructured DOM (toggle button inside `#chatbot-widget`), removed conflicting JS toggle handler and `toggleHandled` guard, removed duplicate `const WHATSAPP_NUMBER`.
- **Chatbot redesign:** Reworked into hybrid UI (quick-reply home view + accordion FAQ view), fully translated across 5 languages.
- **Domain:** Updated canonical domain `sahara-camp-camp.com` → `sahara-camp.com` across `index.html`, `sitemap.xml`, JSON-LD.
- **hreflang:** Corrected to `x-default` (single URL, client-side language switching).
- **Maps:** Updated Google Maps embed to Tembaine, Douz coordinates (33.4547, 9.0160).
- **WhatsApp:** Removed emojis from booking message (encoding issues with `encodeURIComponent`).
- **Infrastructure:** Added custom `404.html`, `robots.txt`, `sitemap.xml`, `netlify.toml` (security + cache headers).

---

## 10. Future Considerations

- **Local photos:** Replace Unsplash URLs with real camp photos in `images/` folder for authenticity.
- **Real booking backend:** If a database-backed booking system is needed later, a Supabase edge function (`supabase/functions/confirm-booking/`) and schema (`supabase/schema.sql/`) were previously scaffolded but removed in favor of the WhatsApp-only flow. Re-introduce only if email confirmations / availability tracking are required.
- **Analytics:** Add Plausible or Google Analytics via `netlify.toml` or a `<script>` in `<head>`.
- **More languages:** Add a new language by adding a key to `window.TRANSLATIONS` and `CHATBOT_FAQS`, then adding a button with `data-lang="xx"` in the navbar.
