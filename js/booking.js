"use strict";

/* =========================================
   Sahara Camp — Booking Flow
   ========================================= */

const supabase = window.supabase;

/* =========================================
   Pricing & Configuration
   ========================================= */

const PRICES = {
  traditional: 45, // EUR per night
  glamping: 90, // EUR per night
};

const MAX_GUESTS = {
  traditional: 2,
  glamping: 4,
};

const WHATSAPP_NUMBER = "21693290920"; // no + prefix for wa.me URL

// NOTE: Replace YOUR_PROJECT_REF with your actual Supabase project ref after setup
const CONFIRM_BASE_URL =
  "https://alumewtgdjdxsyfphfrm.supabase.co/functions/v1/confirm-booking";

/* =========================================
   DOM Element Cache
   ========================================= */

const els = {
  form: document.getElementById("booking-form"),
  tentType: document.getElementById("tent-type"),
  checkin: document.getElementById("checkin"),
  checkout: document.getElementById("checkout"),
  adults: document.getElementById("adults"),
  children: document.getElementById("children"),
  name: document.getElementById("guest-name"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  specialReq: document.getElementById("special-req"),
  submitBtn: document.getElementById("booking-submit"),
  success: document.getElementById("booking-success"),
  pricePreview: document.querySelector(".price-preview"),
  loadingOverlay: document.getElementById("booking-loading-overlay"),
};

let picker = null;

/* =========================================
   Utilities
   ========================================= */

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function calculateNights(checkIn, checkOut) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(
    0,
    Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay),
  );
}

function getTranslation(key, fallback) {
  const lang = window.currentLang || "en";
  const t = window.TRANSLATIONS && window.TRANSLATIONS[lang];
  if (!t) return fallback;
  // Support dot-notation keys like 'booking.form.nights'
  return (
    key
      .split(".")
      .reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : null), t) ||
    fallback
  );
}

function showFieldError(fieldName, message) {
  const el = document.querySelector(`.form-error[data-field="${fieldName}"]`);
  if (!el) return;
  el.textContent = message;
  el.classList.add("visible");
}

function clearFieldErrors() {
  document.querySelectorAll(".form-error.visible").forEach((el) => {
    el.textContent = "";
    el.classList.remove("visible");
  });
}

function showGlobalError(message) {
  const el = document.getElementById("booking-global-error");
  if (el) {
    el.textContent = message;
    el.classList.add("visible");
  }
}

function hideGlobalError() {
  const el = document.getElementById("booking-global-error");
  if (el) {
    el.textContent = "";
    el.classList.remove("visible");
  }
}

function setLoadingOverlay(show) {
  if (els.loadingOverlay) els.loadingOverlay.classList.toggle("visible", show);
}

function setSubmitLoading(loading, label) {
  if (!els.submitBtn) return;
  if (loading) {
    els.submitBtn.disabled = true;
    els.submitBtn.dataset.originalText = els.submitBtn.textContent;
    els.submitBtn.innerHTML = `<span class="spinner"></span> ${label || "Processing..."}`;
  } else {
    els.submitBtn.disabled = false;
    els.submitBtn.textContent =
      els.submitBtn.dataset.originalText || "Request Booking via WhatsApp";
  }
}

/* =========================================
   Step 1 — Fetch Booked Dates
   ========================================= */

async function fetchBookedDates(tentType = null) {
  if (!supabase) throw new Error("Supabase client is not available.");

  let query = supabase
    .from("bookings")
    .select("check_in, check_out, tent_type")
    .eq("status", "confirmed");

  if (tentType) query = query.eq("tent_type", tentType);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch booked dates: ${error.message}`);

  return (data || []).map((row) => ({
    checkIn: parseDate(row.check_in),
    checkOut: parseDate(row.check_out),
  }));
}

function expandDisabledDates(bookings) {
  const disabled = new Set();
  bookings.forEach(({ checkIn, checkOut }) => {
    const current = new Date(checkIn);
    const end = new Date(checkOut);
    while (current <= end) {
      disabled.add(formatDate(current));
      current.setDate(current.getDate() + 1);
    }
  });
  return Array.from(disabled);
}

/* =========================================
   Step 2 — Initialize Litepicker
   ========================================= */

function initCalendar(disabledDates) {
  if (!els.checkin || !els.checkout) return;

  const isMobile = window.innerWidth < 640;

  if (picker) {
    picker.destroy();
    picker = null;
  }

  picker = new window.Litepicker({
    element: els.checkin,
    elementEnd: els.checkout,
    singleMode: false,
    numberOfMonths: isMobile ? 1 : 2,
    numberOfColumns: isMobile ? 1 : 2,
    format: "YYYY-MM-DD",
    minDate: new Date(),
    disallowLockDaysInRange: true,
    lockDays: disabledDates,
    lockDaysFormat: "YYYY-MM-DD",
    onSelect(date1, date2) {
      if (!date1 || !date2) return;
      const checkIn = date1.toJSDate ? date1.toJSDate() : new Date(date1);
      const checkOut = date2.toJSDate ? date2.toJSDate() : new Date(date2);

      els.checkin.value = formatDate(checkIn);
      els.checkout.value = formatDate(checkOut);

      const nights = calculateNights(checkIn, checkOut);
      const tentType = els.tentType ? els.tentType.value : "";
      updatePricePreview(tentType, nights);

      const dateErr = document.querySelector('.form-error[data-field="dates"]');
      if (dateErr) {
        dateErr.textContent = "";
        dateErr.classList.remove("visible");
      }
    },
  });
}

/* =========================================
   Step 3 — Price Preview
   ========================================= */

function updatePricePreview(tentType, nights) {
  if (!els.pricePreview) return;

  if (!nights || nights < 1 || !tentType || !PRICES[tentType]) {
    els.pricePreview.classList.remove("visible");
    return;
  }

  const rate = PRICES[tentType];
  const total = rate * nights;
  const nightWord = getTranslation("booking.form.nights", "nights");

  els.pricePreview.classList.add("visible");
  els.pricePreview.innerHTML = `
    <div class="price-preview__row">
      <span>${nights} ${nightWord} × €${rate}/night</span>
    </div>
    <div class="price-preview__total">
      <span>${getTranslation("booking.form.price", "Estimated Total")}</span>
      <span>€${total}</span>
    </div>`;
}

/* =========================================
   Step 4 — Tent Type Change Handler
   ========================================= */

function getSelectedNights() {
  if (
    !els.checkin ||
    !els.checkout ||
    !els.checkin.value ||
    !els.checkout.value
  )
    return 0;
  return calculateNights(
    parseDate(els.checkin.value),
    parseDate(els.checkout.value),
  );
}

async function handleTentTypeChange() {
  const tentType = els.tentType ? els.tentType.value : "";
  if (!tentType) return;

  setLoadingOverlay(true);
  try {
    const bookings = await fetchBookedDates(tentType);
    const disabledDates = expandDisabledDates(bookings);
    initCalendar(disabledDates);
  } catch (err) {
    showGlobalError(err.message);
  } finally {
    setLoadingOverlay(false);
  }

  updatePricePreview(tentType, getSelectedNights());
}

/* =========================================
   Step 5 — Form Validation
   ========================================= */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
  const errors = {};
  const tentType = els.tentType ? els.tentType.value : "";
  const checkIn = els.checkin ? els.checkin.value : "";
  const checkOut = els.checkout ? els.checkout.value : "";
  const adults = els.adults ? Number(els.adults.value) : 0;
  const children = els.children ? Number(els.children.value) : 0;
  const name = els.name ? els.name.value.trim() : "";
  const email = els.email ? els.email.value.trim() : "";
  const phone = els.phone ? els.phone.value.trim() : "";

  if (!tentType) errors.tentType = "Please select a tent type.";

  if (!checkIn || !checkOut) {
    errors.dates = getTranslation(
      "booking.error.dates",
      "Please select check-in and check-out dates.",
    );
  } else if (parseDate(checkOut) <= parseDate(checkIn)) {
    errors.dates = "Check-out date must be after check-in date.";
  }

  if (!adults || adults < 1) errors.adults = "At least one adult is required.";

  if (
    tentType &&
    MAX_GUESTS[tentType] &&
    adults + children > MAX_GUESTS[tentType]
  ) {
    errors.guests = `Maximum ${MAX_GUESTS[tentType]} guests allowed for this tent.`;
  }

  if (!name) errors.name = "Please enter your full name.";
  if (!email) errors.email = "Please enter your email address.";
  else if (!isValidEmail(email))
    errors.email = "Please enter a valid email address.";
  if (!phone) errors.phone = "Please enter your phone number.";

  clearFieldErrors();
  Object.keys(errors).forEach((field) => showFieldError(field, errors[field]));

  return { valid: Object.keys(errors).length === 0, errors };
}

/* =========================================
   Step 6 — Conflict Check (race condition guard)
   ========================================= */

async function checkConflict(tentType, checkIn, checkOut) {
  if (!supabase) throw new Error("Supabase client is not available.");

  const { data, error } = await supabase
    .from("bookings")
    .select("check_in, check_out")
    .eq("status", "confirmed")
    .eq("tent_type", tentType);

  if (error) throw new Error(`Failed to check availability: ${error.message}`);

  return (data || []).some(
    (existing) => existing.check_in < checkOut && existing.check_out > checkIn,
  );
}

/* =========================================
   Step 7 — WhatsApp Message + Form Submit
   ========================================= */

function buildWhatsAppMessage(booking, nights, total) {
  const specialReq = booking.special_req || "None";
  const tentLabel =
    booking.tent_type === "traditional"
      ? "Traditional Berber Tent"
      : "Luxury Glamping Tent";

  return (
    `🏕️ New Booking Request – Sahara Camp\n\n` +
    `👤 Guest: ${booking.guest_name}\n` +
    `🏕️ Tent: ${tentLabel}\n` +
    `📅 Check-in: ${booking.check_in}\n` +
    `📅 Check-out: ${booking.check_out}\n` +
    `🌙 Nights: ${nights}\n` +
    `👥 Adults: ${booking.adults} | Children: ${booking.children}\n` +
    `📞 Phone: ${booking.phone}\n` +
    `📧 Email: ${booking.email}\n` +
    `💬 Requests: ${specialReq}\n` +
    `💰 Estimated: €${total}\n\n` +
    `🔑 Booking ID: ${booking.id}\n\n` +
    `✅ CONFIRM: ${CONFIRM_BASE_URL}?token=${booking.confirm_token}&action=confirm\n` +
    `❌ DENY: ${CONFIRM_BASE_URL}?token=${booking.confirm_token}&action=deny`
  );
}

async function handleFormSubmit(e) {
  e.preventDefault();
  hideGlobalError();

  const { valid } = validateForm();
  if (!valid) return;

  const tentType = els.tentType.value;
  const checkIn = els.checkin.value;
  const checkOut = els.checkout.value;
  const adults = Number(els.adults.value);
  const children = Number(els.children ? els.children.value : 0);
  const guestName = els.name.value.trim();
  const email = els.email.value.trim();
  const phone = els.phone.value.trim();
  const specialReq = els.specialReq ? els.specialReq.value.trim() : "";

  setSubmitLoading(
    true,
    getTranslation("booking.form.checking", "Checking availability..."),
  );

  try {
    const isConflict = await checkConflict(tentType, checkIn, checkOut);
    if (isConflict) {
      showFieldError(
        "dates",
        getTranslation(
          "booking.error.conflict",
          "These dates conflict with an existing booking.",
        ),
      );
      setSubmitLoading(false);
      return;
    }

    setSubmitLoading(
      true,
      getTranslation("booking.form.submitting", "Processing..."),
    );

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        tent_type: tentType,
        check_in: checkIn,
        check_out: checkOut,
        adults,
        children,
        guest_name: guestName,
        email,
        phone,
        special_req: specialReq,
        status: "pending",
      })
      .select();

    if (error) throw new Error(`Failed to submit booking: ${error.message}`);

    const booking = (data && data[0]) || {};
    if (!booking.id || !booking.confirm_token) {
      throw new Error(
        "Booking saved but confirmation token missing. Please contact us directly.",
      );
    }

    const nights = calculateNights(parseDate(checkIn), parseDate(checkOut));
    const total = PRICES[tentType] * nights;

    const message = buildWhatsAppMessage(booking, nights, total);
    const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(waURL, "_blank");

    if (els.success) els.success.classList.add("visible");
    if (els.form) els.form.classList.add("hidden");
  } catch (err) {
    showGlobalError(err.message);
  } finally {
    setSubmitLoading(false);
  }
}

/* =========================================
   Step 8 — Init
   ========================================= */

async function initBooking() {
  if (!window.supabase) {
    showGlobalError("Booking system unavailable. Please try again later.");
    return;
  }
  if (!window.Litepicker) {
    showGlobalError("Booking calendar unavailable. Please try again later.");
    return;
  }

  setLoadingOverlay(true);
  try {
    const bookings = await fetchBookedDates();
    const disabledDates = expandDisabledDates(bookings);
    initCalendar(disabledDates);
  } catch (err) {
    showGlobalError(err.message);
  } finally {
    setLoadingOverlay(false);
  }

  if (els.tentType)
    els.tentType.addEventListener("change", handleTentTypeChange);
  if (els.adults)
    els.adults.addEventListener("input", () =>
      updatePricePreview(els.tentType?.value, getSelectedNights()),
    );
  if (els.children)
    els.children.addEventListener("input", () =>
      updatePricePreview(els.tentType?.value, getSelectedNights()),
    );
  if (els.form) els.form.addEventListener("submit", handleFormSubmit);
}

document.addEventListener("DOMContentLoaded", initBooking);
