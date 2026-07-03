'use strict';

/* ============================================================
   Sahara Camp — Main JS
   Handles: language switching, navbar, mobile menu,
            smooth scroll, parallax, scroll animations,
            gallery lightbox, scroll spy, tent CTA buttons.
   No external dependencies.
   ============================================================ */

/* ============================================================
   Language Module
   ============================================================ */
const Lang = {
  current: 'en',

  /** Resolve a dot-notation key like "nav.about" into the translation string. */
  get(key) {
    const t = window.TRANSLATIONS && window.TRANSLATIONS[this.current];
    if (!t) return key;
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : null), t) || key;
  },

  /** Apply translations to all [data-i18n] elements on the page. */
  applyAll() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.get(key);
      if (val && val !== key) el.textContent = val;
    });

    // Also handle placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = this.get(key);
      if (val && val !== key) el.setAttribute('placeholder', val);
    });
  },

  /** Set the active language, persist it, and re-render. */
  set(lang) {
    if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) return;
    this.current = lang;
    localStorage.setItem('lang', lang);

    // Document language + direction
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';

    // Update switcher button label
    const btn = document.getElementById('lang-current');
    if (btn) btn.textContent = lang.toUpperCase();

    this.applyAll();
    window.currentLang = lang;
  },

  init() {
    const saved = localStorage.getItem('lang') || 'en';
    this.set(saved);

    // Desktop language switcher
    const switcher = document.getElementById('lang-switcher');
    const btn      = document.getElementById('lang-btn');
    const dropdown = document.getElementById('lang-dropdown');

    if (btn && dropdown) {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const open = switcher.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
      });

      dropdown.querySelectorAll('[data-lang]').forEach(opt => {
        opt.addEventListener('click', () => {
          this.set(opt.dataset.lang);
          switcher.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('click', () => {
        switcher.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    }

    // Mobile language buttons
    document.querySelectorAll('.navbar__mobile-lang [data-lang]').forEach(btn => {
      btn.addEventListener('click', () => this.set(btn.dataset.lang));
    });
  }
};

/* ============================================================
   Navbar Scroll Behaviour
   ============================================================ */
const Navbar = {
  el: null,

  init() {
    this.el = document.getElementById('navbar');
    if (!this.el) return;

    this.onScroll();
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
  },

  onScroll() {
    if (!this.el) return;
    this.el.classList.toggle('scrolled', window.scrollY > 60);
  }
};

/* ============================================================
   Mobile Menu
   ============================================================ */
const MobileMenu = {
  hamburger: null,
  menu:      null,
  close:     null,

  init() {
    this.hamburger = document.getElementById('hamburger');
    this.menu      = document.getElementById('mobile-menu');
    this.close     = document.getElementById('mobile-close');

    if (!this.hamburger || !this.menu) return;

    this.hamburger.addEventListener('click', () => this.open());
    if (this.close) this.close.addEventListener('click', () => this.closeMenu());

    // Close on nav link click
    this.menu.querySelectorAll('.navbar__mobile-link').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeMenu();
    });
  },

  open() {
    if (!this.menu) return;
    this.menu.classList.add('open');
    this.hamburger.classList.add('open');
    this.hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  },

  closeMenu() {
    if (!this.menu) return;
    this.menu.classList.remove('open');
    if (this.hamburger) {
      this.hamburger.classList.remove('open');
      this.hamburger.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }
};

/* ============================================================
   Smooth Scroll
   ============================================================ */
const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }
};

/* ============================================================
   Parallax Hero
   ============================================================ */
const Parallax = {
  bg:  null,
  ticking: false,

  init() {
    this.bg = document.getElementById('hero-bg');
    if (!this.bg) return;
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
  },

  onScroll() {
    if (this.ticking) return;
    requestAnimationFrame(() => {
      if (this.bg) {
        this.bg.style.transform = `translateY(${window.scrollY * 0.35}px)`;
      }
      this.ticking = false;
    });
    this.ticking = true;
  }
};

/* ============================================================
   Scroll Animations (Intersection Observer)
   ============================================================ */
const ScrollAnimations = {
  init() {
    const els = document.querySelectorAll('.animate-on-scroll');
    if (!els.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold:  0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    els.forEach(el => observer.observe(el));
  }
};

/* ============================================================
   Gallery Lightbox
   ============================================================ */
const Lightbox = {
  overlay:  null,
  img:      null,
  counter:  null,
  items:    [],
  current:  0,

  init() {
    this.overlay = document.getElementById('lightbox');
    this.img     = document.getElementById('lightbox-img');
    this.counter = document.getElementById('lightbox-counter');

    if (!this.overlay || !this.img) return;

    this.items = Array.from(document.querySelectorAll('.gallery-item img'));

    // Open on click
    document.querySelectorAll('.gallery-item').forEach((item, i) => {
      item.addEventListener('click', () => this.open(i));
    });

    // Close button
    const closeBtn = document.getElementById('lightbox-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    // Overlay click (outside image)
    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close();
    });

    // Prev / Next
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    if (prevBtn) prevBtn.addEventListener('click', () => this.navigate(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => this.navigate(1));

    // Keyboard
    document.addEventListener('keydown', e => {
      if (!this.overlay.classList.contains('lightbox--open')) return;
      if (e.key === 'Escape')     this.close();
      if (e.key === 'ArrowLeft')  this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
    });
  },

  open(index) {
    if (!this.overlay || !this.img) return;
    this.current = index;
    this.show();
    this.overlay.classList.add('lightbox--open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove('lightbox--open');
    document.body.style.overflow = '';
  },

  navigate(dir) {
    this.current = (this.current + dir + this.items.length) % this.items.length;
    this.show();
  },

  show() {
    const imgEl = this.items[this.current];
    if (!imgEl || !this.img) return;
    const src = imgEl.getAttribute('data-full') || imgEl.src;
    this.img.src = src;
    this.img.alt = imgEl.alt || '';
    if (this.counter) {
      this.counter.textContent = `${this.current + 1} / ${this.items.length}`;
    }
  }
};

/* ============================================================
   Scroll Spy (active nav link)
   ============================================================ */
const ScrollSpy = {
  init() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        document.querySelectorAll(`.navbar__link[href="#${id}"], .navbar__mobile-link[href="#${id}"]`).forEach(link => {
          document.querySelectorAll('.navbar__link, .navbar__mobile-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        });
      });
    }, { threshold: 0.5 });

    sections.forEach(s => observer.observe(s));
  }
};

/* ============================================================
   Tent Card CTA → scroll to booking + prefill tent select
   ============================================================ */
const TentCTA = {
  init() {
    document.querySelectorAll('.tent-card__cta-btn[data-tent]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tentType = btn.dataset.tent;
        const radio    = document.querySelector(`input[name="tent-type-radio"][value="${tentType}"]`);
        const section  = document.getElementById('booking');

        if (radio && tentType) {
          radio.checked = true;
          // Fire change so booking.js can refresh the calendar
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
};

/* ============================================================
   Image Loader
   Reads window.IMAGES (from js/images.js) and applies URLs
   to all elements with data-img-key attributes, then builds
   the gallery grid dynamically.
   ============================================================ */
const Images = {
  /** Resolve a dot-notation key like "tents.traditional" into the URL string. */
  get(key) {
    const imgs = window.IMAGES;
    if (!imgs) return '';
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : ''), imgs) || '';
  },

  /** Apply URLs to <img src> and background-image on elements with data-img-key. */
  applyStatic() {
    document.querySelectorAll('[data-img-key]').forEach(el => {
      const key = el.getAttribute('data-img-key');
      const url = this.get(key);
      if (!url) return;
      if (el.tagName === 'IMG') {
        el.src = url;
      } else {
        el.style.backgroundImage = `url('${url}')`;
      }
    });
  },

  /** Build gallery grid from window.IMAGES.gallery array. */
  buildGallery() {
    const grid = document.getElementById('gallery-grid');
    const imgs = window.IMAGES && window.IMAGES.gallery;
    if (!grid || !imgs || !imgs.length) return;

    grid.innerHTML = imgs.map(item => `
      <figure class="gallery-item animate-on-scroll" role="listitem">
        <img
          src="${item.thumb}"
          data-full="${item.full}"
          alt="${item.alt}"
          loading="lazy"
          width="600"
        />
        <div class="gallery-item__overlay">
          <span class="gallery-item__caption">${item.caption}</span>
        </div>
      </figure>`).join('');
  },

  init() {
    this.applyStatic();
    this.buildGallery();
  }
};

/* ============================================================
   Init
   ============================================================ */
function init() {
  Images.init();      // must run before Lightbox (gallery items must exist)
  Lang.init();
  Navbar.init();
  MobileMenu.init();
  SmoothScroll.init();
  Parallax.init();
  ScrollAnimations.init();
  Lightbox.init();    // re-indexes gallery items after Images.buildGallery()
  ScrollSpy.init();
  TentCTA.init();

  // Expose current language globally for booking.js
  window.currentLang = Lang.current;
}

document.addEventListener('DOMContentLoaded', init);
