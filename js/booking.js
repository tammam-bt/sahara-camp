"use strict";

/* =========================================
   Sahara Camp — Booking Flow (3-step, WhatsApp-only)
   ========================================= */

/* =========================================
   Config
   ========================================= */
const PRICES = { traditional: 45, glamping: 90 };
const MAX_GUESTS = { traditional: 2, glamping: 4 };
const WHATSAPP_NUMBER = "21693290920";

// Intl locale per site language (dates, plural rules, calendar)
const LOCALES = {
  en: "en-GB",
  fr: "fr-FR",
  de: "de-DE",
  ru: "ru-RU",
  ar: "ar-TN",
};

/* =========================================
   State
   ========================================= */
let picker = null;
let pickerDummy = null;
let currentStep = 1;
let summaryShown = false;

/* =========================================
   DOM refs (resolved after DOMContentLoaded)
   ========================================= */
let els = {};

function resolveEls() {
  els = {
    form: document.getElementById("booking-form"),
    card: document.getElementById("booking-card"),
    success: document.getElementById("booking-success"),
    globalErr: document.getElementById("booking-global-error"),
    calContainer: document.getElementById("litepicker-container"),
    checkin: document.getElementById("checkin"),
    checkout: document.getElementById("checkout"),
    adults: document.getElementById("adults"),
    children: document.getElementById("children"),
    name: document.getElementById("guest-name"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    specialReq: document.getElementById("special-req"),
    submitBtn: document.getElementById("booking-submit"),
    // display
    checkinDisplay: document.getElementById("checkin-display"),
    checkoutDisplay: document.getElementById("checkout-display"),
    nightsDisplay: document.getElementById("display-nights"),
    // summary
    summaryTent: document.getElementById("summary-tent"),
    summaryCheckin: document.getElementById("summary-checkin"),
    summaryCheckout: document.getElementById("summary-checkout"),
    summaryGuests: document.getElementById("summary-guests"),
    summaryName: document.getElementById("summary-name"),
    summaryTotal: document.getElementById("summary-total"),
  };
}

/* =========================================
   Utilities
   ========================================= */
function fmt(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function parse(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function nights(a, b) {
  return Math.max(0, Math.round((parse(b) - parse(a)) / 86400000));
}
function getTentValue() {
  const r = document.querySelector('input[name="tent-type-radio"]:checked');
  return r ? r.value : "";
}
function pageLang() {
  const l = window.currentLang || "en";
  return LOCALES[l] ? l : "en";
}

/** Format a Date for display in the page language (empty value shows a dash). */
function formatDisplay(date) {
  if (!date) return "—";
  if (typeof date === "string") date = parse(date);
  return new Intl.DateTimeFormat(LOCALES[pageLang()], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Translation key for `base` and the plural category of n; falls back to `${base}.other`. */
function pluralKey(base, n) {
  const key = `${base}.${new Intl.PluralRules(LOCALES[pageLang()]).select(n)}`;
  return Lang.get(key) !== key ? key : `${base}.other`;
}

/** Translated "{n} night(s)"-style text for a count. */
function countText(base, n) {
  return Lang.get(pluralKey(base, n)).replace("{n}", n);
}

function tentLabelFor(tent) {
  if (tent === "traditional") return Lang.get("booking.form.traditional");
  if (tent === "glamping") return Lang.get("booking.form.glamping");
  return "—";
}

/** Read a translated booking error string for the current language. */
function terr(key, vars) {
  const lang = window.currentLang || "en";
  const t = window.TRANSLATIONS && window.TRANSLATIONS[lang];
  let str = t && t.booking && t.booking.error && t.booking.error[key];
  if (!str) {
    // Fallback to English
    const en = window.TRANSLATIONS && window.TRANSLATIONS.en;
    str =
      (en && en.booking && en.booking.error && en.booking.error[key]) || key;
  }
  if (vars) {
    Object.keys(vars).forEach((k) => {
      str = str.replace(`{${k}}`, vars[k]);
    });
  }
  return str;
}

/* =========================================
   Errors
   ========================================= */
function showFieldError(field, msg) {
  const el = document.querySelector(`.form-error[data-field="${field}"]`);
  if (!el) return;
  el.textContent = msg;
  el.classList.add("visible");
}
function clearErrors() {
  document.querySelectorAll(".form-error.visible").forEach((e) => {
    e.textContent = "";
    e.classList.remove("visible");
  });
}
function showGlobalError(msg) {
  if (!els.globalErr) return;
  els.globalErr.textContent = msg;
  els.globalErr.classList.add("visible");
}
function hideGlobalError() {
  if (!els.globalErr) return;
  els.globalErr.textContent = "";
  els.globalErr.classList.remove("visible");
}

/* =========================================
   Step navigation
   ========================================= */
function goToStep(n) {
  [1, 2, 3].forEach((i) => {
    const panel = document.getElementById(`step-panel-${i}`);
    const btn = document.getElementById(`step-btn-${i}`);
    if (!panel || !btn) return;
    panel.classList.toggle("hidden", i !== n);
    btn.classList.toggle("active", i === n);
    btn.classList.toggle("done", i < n);
    btn.setAttribute("aria-selected", i === n ? "true" : "false");
  });
  currentStep = n;
  clearErrors();
  hideGlobalError();
  const card = document.getElementById("booking-card");
  if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* =========================================
   Step 1 validation
   ========================================= */
function validateStep1() {
  const tent = getTentValue();
  const ci = els.checkin ? els.checkin.value : "";
  const co = els.checkout ? els.checkout.value : "";
  let ok = true;

  if (!tent) {
    showFieldError("tentType", terr("tentType"));
    ok = false;
  }
  if (!ci || !co) {
    showFieldError("dates", terr("dates"));
    ok = false;
  }
  return ok;
}

/* =========================================
   Step 2 validation
   ========================================= */
function validateStep2() {
  const tent = getTentValue();
  const adults = Number(els.adults?.value || 0);
  const children = Number(els.children?.value || 0);
  const name = els.name?.value.trim() || "";
  const email = els.email?.value.trim() || "";
  const phone = els.phone?.value.trim() || "";
  let ok = true;

  if (adults < 1) {
    showFieldError("adults", terr("adults"));
    ok = false;
  }
  if (tent && MAX_GUESTS[tent] && adults + children > MAX_GUESTS[tent]) {
    showFieldError("guests", terr("guests", { max: MAX_GUESTS[tent] }));
    ok = false;
  }
  if (!name) {
    showFieldError("name", terr("name"));
    ok = false;
  }
  if (!email) {
    showFieldError("email", terr("email"));
    ok = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError("email", terr("emailInvalid"));
    ok = false;
  }
  if (!phone) {
    showFieldError("phone", terr("phone"));
    ok = false;
  }
  return ok;
}

/* =========================================
   Populate summary (step 3)
   ========================================= */
function populateSummary() {
  const tent = getTentValue();
  const ci = els.checkin?.value || "";
  const co = els.checkout?.value || "";
  const adults = Number(els.adults?.value || 0);
  const children = Number(els.children?.value || 0);
  const name = els.name?.value.trim() || "";
  const n = ci && co ? nights(ci, co) : 0;
  const total = tent ? PRICES[tent] * n : 0;

  summaryShown = true;
  const tentLabel = tentLabelFor(tent);
  const adultsStr = countText("booking.adultsCount", adults);
  const guestStr =
    children > 0
      ? `${adultsStr}${Lang.get("booking.listSep")}${countText("booking.childrenCount", children)}`
      : adultsStr;

  if (els.summaryTent) els.summaryTent.textContent = tentLabel;
  if (els.summaryCheckin)
    els.summaryCheckin.textContent = ci ? formatDisplay(ci) : "—";
  if (els.summaryCheckout)
    els.summaryCheckout.textContent = co ? formatDisplay(co) : "—";
  if (els.summaryGuests) els.summaryGuests.textContent = guestStr;
  if (els.summaryName) els.summaryName.textContent = name || "—";
  if (els.summaryTotal)
    els.summaryTotal.textContent =
      total > 0 ? `€${total} (${countText("booking.form.nights", n)})` : "—";
}

/* =========================================
   Calendar — Litepicker inline
   ========================================= */

// Called by both onSelect and the 'selected' event — handles null d2 gracefully
function applyPickerDates(d1, d2) {
  const toJS = (d) =>
    d && (d.toJSDate ? d.toJSDate() : d instanceof Date ? d : new Date(d));
  const ci = toJS(d1);
  const co = toJS(d2);

  if (ci && !isNaN(ci)) {
    const ciStr = fmt(ci);
    if (els.checkin) els.checkin.value = ciStr;
    const ciEl = document.getElementById("checkin-display");
    if (ciEl) ciEl.textContent = formatDisplay(ci);
  }

  if (ci && co && !isNaN(ci) && !isNaN(co)) {
    const ciStr = fmt(ci);
    const coStr = fmt(co);
    if (els.checkout) els.checkout.value = coStr;
    const coEl = document.getElementById("checkout-display");
    if (coEl) coEl.textContent = formatDisplay(co);

    const n = nights(ciStr, coStr);
    const nightsEl = document.getElementById("display-nights");
    if (nightsEl) {
      nightsEl.textContent = n > 0 ? countText("booking.form.nights", n) : "";
      nightsEl.style.display = n > 0 ? "flex" : "none";
    }

    const errEl = document.querySelector('.form-error[data-field="dates"]');
    if (errEl) {
      errEl.textContent = "";
      errEl.classList.remove("visible");
    }
  }
}

/** Word-only night forms for Litepicker's tooltip (it prepends the number). */
function tooltipTexts() {
  const out = {};
  ["zero", "one", "two", "few", "many", "other"].forEach((cat) => {
    const key = `booking.form.nights.${cat}`;
    const v = Lang.get(key);
    if (v !== key) out[cat] = v.replace(/\{n\}\s*/, "");
  });
  return out;
}

function initCalendar() {
  if (!window.Litepicker || !els.calContainer) return;
  if (picker) {
    picker.destroy();
    picker = null;
  }

  if (pickerDummy) pickerDummy.remove();
  const dummy = document.createElement("input");
  dummy.type = "hidden";
  document.body.appendChild(dummy);
  pickerDummy = dummy;

  picker = new window.Litepicker({
    element: dummy,
    parentEl: els.calContainer,
    inlineMode: true,
    singleMode: false,
    numberOfMonths: window.innerWidth < 640 ? 1 : 2,
    numberOfColumns: window.innerWidth < 640 ? 1 : 2,
    format: "YYYY-MM-DD",
    lang: LOCALES[pageLang()],
    tooltipText: tooltipTexts(),
    minDate: new Date(),
    onSelect(d1, d2) {
      applyPickerDates(d1, d2);
    },
  });

  picker.on("selected", (d1, d2) => {
    applyPickerDates(d1, d2);
  });
}

/* =========================================
   Tent radio change — reload calendar
   ========================================= */
function onTentChange() {
  const tent = getTentValue();
  initCalendar();
  // Reset dates
  if (els.checkin) els.checkin.value = "";
  if (els.checkout) els.checkout.value = "";
  const ciEl = document.getElementById("checkin-display");
  const coEl = document.getElementById("checkout-display");
  const nightsEl = document.getElementById("display-nights");
  if (ciEl) ciEl.textContent = "—";
  if (coEl) coEl.textContent = "—";
  if (nightsEl) {
    nightsEl.textContent = "";
    nightsEl.style.display = "none";
  }
}

/* =========================================
   Counter buttons (+ / −)
   ========================================= */
function initCounters() {
  document.querySelectorAll(".counter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const min = Number(input.min ?? 0);
      const max = Number(input.max ?? 99);
      const delta = Number(btn.dataset.delta);
      const val = Math.min(max, Math.max(min, Number(input.value) + delta));
      input.value = val;
    });
  });
}

/* =========================================
   WhatsApp submit
   ========================================= */
function handleSubmit(e) {
  e.preventDefault();
  hideGlobalError();

  const tent = getTentValue();
  const ci = els.checkin?.value || "";
  const co = els.checkout?.value || "";
  const adults = Number(els.adults?.value || 0);
  const children = Number(els.children?.value || 0);
  const name = els.name?.value.trim() || "";
  const email = els.email?.value.trim() || "";
  const phone = els.phone?.value.trim() || "";
  const special = els.specialReq?.value.trim() || "";

  const n = nights(ci, co);
  const total = tent ? PRICES[tent] * n : 0;
  // The message goes to the camp owner, so it stays in English.
  const tentLabel =
    tent === "traditional" ? "Traditional Berber Tent" : "Luxury Glamping Tent";

  const msg =
    `New Booking Request - Sahara Camp\n\n` +
    `Guest: ${name}\n` +
    `Tent: ${tentLabel}\n` +
    `Check-in: ${ci}\n` +
    `Check-out: ${co}\n` +
    `Nights: ${n}\n` +
    `Adults: ${adults} | Children: ${children}\n` +
    `Phone: ${phone}\n` +
    `Email: ${email}\n` +
    `Requests: ${special || "None"}\n` +
    `Estimated: €${total}\n\n` +
    `Please reply to confirm or suggest alternative dates.`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
    "_blank",
  );

  const card = document.getElementById("booking-card");
  if (card) card.style.display = "none";
  if (els.success) els.success.classList.add("visible");
}

/* =========================================
   Language change — re-render everything that holds localised text
   ========================================= */
function onLangChange() {
  if (!els.checkin) return;
  const ci = els.checkin.value;
  const co = els.checkout.value;

  // Error messages were written in the old language: drop them
  clearErrors();
  hideGlobalError();

  // Rebuild the calendar in the new language, keeping the month being viewed
  const view =
    picker && picker.calendars && picker.calendars[0]
      ? picker.calendars[0].toJSDate()
      : null;
  initCalendar();
  if (picker && ci && co) {
    picker.setDateRange(parse(ci), parse(co));
  } else {
    // Only a check-in (or nothing) is selected: the rebuilt picker has no
    // selection, so clear the dependent state to stay consistent.
    if (els.checkin) els.checkin.value = "";
    if (els.checkout) els.checkout.value = "";
    if (picker && view) picker.gotoDate(view);
  }

  const ciEl = document.getElementById("checkin-display");
  const coEl = document.getElementById("checkout-display");
  const nightsEl = document.getElementById("display-nights");
  if (ci && co) {
    if (ciEl) ciEl.textContent = formatDisplay(ci);
    if (coEl) coEl.textContent = formatDisplay(co);
    if (nightsEl) {
      const n = nights(ci, co);
      nightsEl.textContent = n > 0 ? countText("booking.form.nights", n) : "";
    }
  } else {
    if (ciEl) ciEl.textContent = "—";
    if (coEl) coEl.textContent = "—";
    if (nightsEl) {
      nightsEl.textContent = "";
      nightsEl.style.display = "none";
    }
  }
  if (summaryShown) populateSummary();
}

/* =========================================
   Init
   ========================================= */
function initBooking() {
  resolveEls();
  initCalendar();

  // Tent radio change
  document.querySelectorAll('input[name="tent-type-radio"]').forEach((r) => {
    r.addEventListener("change", onTentChange);
  });

  // Counter buttons
  initCounters();

  // Step navigation
  document.getElementById("step1-next")?.addEventListener("click", () => {
    clearErrors();
    if (validateStep1()) goToStep(2);
  });
  document
    .getElementById("step2-back")
    ?.addEventListener("click", () => goToStep(1));
  document.getElementById("step2-next")?.addEventListener("click", () => {
    clearErrors();
    if (validateStep2()) {
      populateSummary();
      goToStep(3);
    }
  });
  document
    .getElementById("step3-back")
    ?.addEventListener("click", () => goToStep(2));

  // Form submit (step 3 button)
  els.form?.addEventListener("submit", handleSubmit);

  document.addEventListener("langchange", onLangChange);
}

document.addEventListener("DOMContentLoaded", initBooking);
