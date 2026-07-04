# Sahara Camp

Static single-page marketing and booking website for **Sahara Camp**, a desert glamping experience in Tembaine, Douz, Tunisia.

**Live site:** [https://saharacamp.netlify.app/](https://saharacamp.netlify.app/)

---

## Overview

Sahara Camp is a family-run desert camp offering traditional Berber tents and luxury glamping tents in the Sahara dunes near Douz, Tunisia. This repository contains the entire static website: a single-page experience with a hero section, camp story, accommodation cards, photo gallery, activities, booking form, location map, FAQ chatbot, and footer.

The site is fully static: no backend, no database, and no build step. Bookings are submitted via WhatsApp using a pre-filled message.

All content is available in **5 languages** (English, French, German, Russian, and Arabic) with client-side language switching and full RTL support for Arabic.

---

## Features

- **Responsive single-page layout** — hero, about, accommodation, gallery, activities, booking, map, and footer.
- **Multilingual support** — English, French, German, Russian, Arabic; language choice persists in `localStorage`.
- **RTL support** — Arabic layout switches to right-to-left automatically.
- **3-step booking flow** — tent selection, dates, guest details, and review; submitted via WhatsApp.
- **Inline calendar** — date range picker using Litepicker.
- **Photo gallery** — masonry grid with keyboard-navigable lightbox.
- **FAQ chatbot** — floating multilingual widget with quick replies and accordion questions.
- **SEO ready** — meta tags, Open Graph, Twitter Card, JSON-LD structured data, `sitemap.xml`, `robots.txt`, and custom `404.html`.
- **Accessible** — semantic HTML, ARIA attributes, focus management, and `prefers-reduced-motion` support.
- **Performance-oriented** — centralized image config, long-lived cache headers, and preloaded fonts.

---

## Tech Stack

| Layer       | Technology                                                   |
| ----------- | ------------------------------------------------------------ |
| Markup      | HTML5 (single `index.html`)                                  |
| Styling     | CSS3 with custom properties (design tokens)                  |
| Scripts     | Vanilla JavaScript (ES6+), no framework or bundler           |
| Calendar    | [Litepicker](https://litepicker.com/) via CDN                |
| Fonts       | Google Fonts: Playfair Display + Lato                        |
| Images      | Unsplash CDN URLs (centralized in `js/images.js`)            |
| Hosting     | Netlify (configured via `netlify.toml`)                      |
| Package mgr | None — no dependencies to install                            |

---

## Project Structure

```
├── index.html          — Full page markup
├── 404.html            — Custom 404 error page
├── css/
│   └── style.css       — All styles and design tokens
├── js/
│   ├── images.js       — Central image URL config (window.IMAGES)
│   ├── translations.js — i18n strings for 5 languages (window.TRANSLATIONS)
│   ├── main.js         — Navbar, mobile menu, gallery, scroll, language, lightbox
│   ├── booking.js      — 3-step booking flow and WhatsApp submit
│   └── chatbot.js      — Floating FAQ chatbot widget
├── fonts/              — Reserved for local font files (currently using CDN)
├── images/             — Reserved for local photos (currently using Unsplash)
├── netlify.toml        — Deploy config + security/cache headers
├── robots.txt          — SEO crawler directives
├── sitemap.xml         — SEO sitemap
├── AGENTS.md           — Concise agent guide (conventions + pitfalls)
└── Project.md          — Full project documentation
```

### Script Load Order

Scripts in `index.html` are loaded in this order:

1. `js/images.js` — populates `window.IMAGES`
2. `js/translations.js` — populates `window.TRANSLATIONS`
3. `js/main.js` — UI logic, language switching, gallery, lightbox
4. `js/booking.js` — declares `const WHATSAPP_NUMBER` (must load before chatbot)
5. `js/chatbot.js` — reads `WHATSAPP_NUMBER` via a `typeof` guard
6. Litepicker CDN script

---

## Getting Started

No build step or package manager is required.

### Option 1: Open directly

Open `index.html` in your browser.

### Option 2: Serve locally with Python

```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

### Option 3: Serve locally with Node

```bash
npx serve .
```

---

## Deployment

The site is configured for **Netlify**. The publish directory is the repository root (`netlify.toml` sets `publish = "."`).

1. Push changes to the connected Git branch.
2. Netlify auto-deploys the site.
3. No build command is needed.

`netlify.toml` also configures:

- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- Long-lived cache for `/css/*`, `/js/*`, and `/images/*`
- No-cache for `*.html` files

---

## Configuration

### Images

All image URLs are centralized in `js/images.js`.

- HTML elements reference images via `data-img-key="hero"` or `data-img-key="tents.traditional"`.
- The gallery grid is built dynamically from `window.IMAGES.gallery`.
- To swap an image, edit the URL in `js/images.js` — no HTML changes are needed.
- To use your own photos, place them in `images/` and reference them as `images/your-photo.jpg`.

Avoid hotlinked URLs from third-party sites (for example, Facebook CDN or camp-mars.com) because they can expire or break.

### Translations

All visible strings are stored in `js/translations.js` under `window.TRANSLATIONS[lang]`.

- HTML elements use `data-i18n="nav.about"` (dot-notation keys).
- Booking validation errors use the `terr(key, vars)` helper in `booking.js`.
- When adding a new language, add a full translation key to `window.TRANSLATIONS` and `CHATBOT_FAQS`, then add a `data-lang="xx"` button in the navbar and mobile menu.

### WhatsApp Number

The WhatsApp number used for booking and chatbot CTA is defined as the single source of truth in `js/booking.js`:

```js
const WHATSAPP_NUMBER = "21693290920";
```

To change the number:

1. Update `WHATSAPP_NUMBER` in `js/booking.js`.
2. Update the `href="https://wa.me/..."` attributes in `index.html` (footer and location section).
3. Update the fallback in `js/chatbot.js` (`CHATBOT_WHATSAPP`).

### Prices and Capacity

Prices and guest limits are defined in `js/booking.js`:

```js
const PRICES = { traditional: 45, glamping: 90 };
const MAX_GUESTS = { traditional: 2, glamping: 4 };
```

### Google Maps Embed

The map iframe is located in the location section of `index.html`. Default coordinates are **33.4547, 9.0160** (Tembaine, Douz, Tunisia). Update the `src` URL to change the location.

---

## Customization

### Change the hero or tent images

Edit the corresponding URLs in `js/images.js`:

```js
window.IMAGES = {
  hero: "https://images.unsplash.com/...",
  about: "https://images.unsplash.com/...",
  tents: {
    traditional: "https://images.unsplash.com/...",
    glamping: "https://images.unsplash.com/...",
  },
  gallery: [ /* ... */ ]
};
```

### Add a new language

1. Add a translation object to `window.TRANSLATIONS` in `js/translations.js`.
2. Add a chatbot FAQ object to `CHATBOT_FAQS` in `js/chatbot.js`.
3. Add a `<button data-lang="xx">` option in both the desktop language dropdown and the mobile language menu in `index.html`.
4. Add the corresponding RTL handling if the language is right-to-left.

---

## SEO & Accessibility

- Canonical URL, Open Graph, and Twitter Card meta tags are in `index.html`.
- JSON-LD `LodgingBusiness` structured data includes address, geo coordinates, phone, and price range.
- `hreflang="x-default"` is used because all languages share a single URL.
- `sitemap.xml` and `robots.txt` are at the site root.
- `prefers-reduced-motion` reduces animations for users who prefer less motion.
- The booking form and chatbot include ARIA labels and keyboard-friendly controls.

---

## License

This project is proprietary and operated by Sahara Camp. All rights reserved.

---

## Contact

- **Website:** [https://sahara-camp.com](https://sahara-camp.com)
- **WhatsApp:** [+216 93 290 920](https://wa.me/21693290920)
- **Location:** Tembaine Dunes, Douz, Kebili, Tunisia

For technical questions about this repository, please open an issue or reach out to the project maintainer.
