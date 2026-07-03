# Sahara Camp — Project Guide

## Overview
Static single-page marketing and booking website for Sahara Camp, a desert camp in Tembaine, Douz, Tunisia. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step, no backend. Deployed on Netlify.

**Domain:** https://sahara-camp.com

## Tech Stack
- HTML5, CSS3 (custom properties), vanilla JavaScript (ES6+)
- Litepicker (calendar library, loaded via CDN)
- Google Fonts: Playfair Display (headings) + Lato (body)
- No package manager, no bundler, no dependencies to install

## File Structure
```
abdelmoula-camp/
├── index.html          — full page markup
├── 404.html            — custom 404 page
├── css/style.css       — all styles (design tokens at top)
├── js/
│   ├── images.js       — central image URL config (window.IMAGES)
│   ├── translations.js — i18n strings for 5 languages (window.TRANSLATIONS)
│   ├── main.js         — navbar, mobile menu, gallery, scroll, lang, lightbox
│   ├── booking.js      — 3-step booking flow → WhatsApp submit
│   └── chatbot.js      — floating FAQ chatbot widget
├── netlify.toml        — deploy config + security/cache headers
├── robots.txt          — SEO
├── sitemap.xml         — SEO
└── .gitignore
```

## How to Run Locally
Open `index.html` directly in a browser, or serve the folder with any static server:
```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## How to Deploy
The site is configured for Netlify. The `netlify.toml` sets the publish directory to `.` (repo root). Push to the connected Git branch and Netlify auto-deploys.

## Key Conventions

### Images
- All image URLs are centralized in `js/images.js` under `window.IMAGES`.
- HTML elements use `data-img-key="hero"` or `data-img-key="tents.traditional"` to reference keys.
- The gallery is built dynamically by `main.js` from `window.IMAGES.gallery`.
- To swap an image, edit the URL in `js/images.js` — no HTML changes needed.
- Currently uses Unsplash URLs. To use local photos, create an `images/` folder and reference as `images/your-photo.jpg`.

### Internationalization (i18n)
- 5 languages: English (en), French (fr), German (de), Russian (ru), Arabic (ar).
- All strings live in `js/translations.js` under `window.TRANSLATIONS`.
- HTML elements use `data-i18n="nav.about"` to reference translation keys (dot notation).
- Language switching is client-side via `Lang.set()` in `main.js`. Choice persists in `localStorage`.
- Arabic triggers RTL: `document.documentElement.dir = 'rtl'`.
- Booking validation errors use the `terr(key, vars)` helper in `booking.js` which reads from `window.TRANSLATIONS[window.currentLang].booking.error`.

### Booking Flow
- 3-step form: (1) tent + dates → (2) guest details → (3) review + submit.
- No backend. Submit composes a WhatsApp message and opens `wa.me/21693290920` with pre-filled text.
- Calendar uses Litepicker in inline mode, loaded via CDN.
- Validation errors are translated in all 5 languages.

### Chatbot
- Floating button at bottom-right (bottom-left in RTL).
- Non-AI FAQ widget with pre-written questions and answers.
- Supports all 5 languages, switches automatically with site language.
- WhatsApp CTA always available at the bottom of the chat.

### CSS
- Design tokens (colors, fonts, radii, shadows, transitions) defined as CSS custom properties in `:root` at the top of `style.css`.
- Responsive breakpoints: 1024px (tablet), 640px (mobile), 480px (small mobile).
- `prefers-reduced-motion` support included.
- RTL support via `[dir="rtl"]` selectors.

### SEO
- Meta tags, Open Graph, Twitter Card in `index.html` `<head>`.
- JSON-LD `LodgingBusiness` structured data with address, geo, phone, price range.
- `hreflang="x-default"` (single URL, client-side language switching).
- `sitemap.xml` and `robots.txt` at site root.
- Custom `404.html` for broken links.

## WhatsApp Number
`+216 93 290 920` — used in booking form, chatbot, footer, and location section. The number is defined as `WHATSAPP_NUMBER` in `js/booking.js` (the single source of truth). `js/chatbot.js` reads this value via `CHATBOT_WHATSAPP` (with a hardcoded fallback). To change the number, update `WHATSAPP_NUMBER` in `js/booking.js` and the `href` attributes in `index.html`.

## Google Maps
Embed uses coordinates 33.4547, 9.0160 (Tembaine, Douz). To update, replace the iframe `src` in `index.html` location section.
