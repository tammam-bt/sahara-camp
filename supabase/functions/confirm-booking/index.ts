// Supabase Edge Function — confirm-booking
// Deno / TypeScript runtime
//
// Called by the camp owner via a magic link (GET request) to confirm or deny
// a pending booking.
//
// Query parameters:
//   token  – UUID stored as confirm_token on the bookings row
//   action – "confirm" | "deny"
//
// Environment variables (set in Supabase Dashboard → Edge Functions → Secrets):
//   SUPABASE_URL              – e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY – service-role JWT (bypasses RLS)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const VALID_ACTIONS = new Set(['confirm', 'deny']);

// Sahara palette
const COLORS = {
  bg:       '#1A1209',
  surface:  '#2A1F0E',
  border:   '#3D2E14',
  text:     '#FAF3E0',
  muted:    '#C8A96E',
  accent:   '#C8A96E',
  success:  '#4CAF50',
  error:    '#E53935',
  errorBg:  '#3B1010',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Rough UUID v4 validation – 8-4-4-4-12 hex groups. */
function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/** Format a date string (YYYY-MM-DD) to a human-readable form. */
function formatDate(iso: string): string {
  // iso may be "2025-07-15" or a full ISO timestamp; we only need the date part.
  const datePart = iso.slice(0, 10);
  const [year, month, day] = datePart.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// HTML builders
// ---------------------------------------------------------------------------

interface BookingRow {
  id: string;
  guest_name: string;
  tent_type: 'traditional' | 'glamping';
  check_in: string;
  check_out: string;
  phone: string;
  email: string;
  adults: number;
  children: number;
  special_req: string | null;
}

function buildPage(title: string, body: string): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} – Sahara Camp</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', serif;
      background-color: ${COLORS.bg};
      color: ${COLORS.text};
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .card {
      background: ${COLORS.surface};
      border: 1px solid ${COLORS.border};
      border-radius: 12px;
      max-width: 640px;
      width: 100%;
      padding: 2.5rem 2rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    }
    .brand {
      font-size: 0.85rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: ${COLORS.accent};
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .icon {
      font-size: 3.5rem;
      text-align: center;
      line-height: 1;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.75rem;
      text-align: center;
      margin-bottom: 1.75rem;
      color: ${COLORS.text};
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
      margin-bottom: 1.75rem;
    }
    .details-table tr { border-bottom: 1px solid ${COLORS.border}; }
    .details-table tr:last-child { border-bottom: none; }
    .details-table th {
      text-align: left;
      padding: 0.6rem 0.5rem 0.6rem 0;
      color: ${COLORS.accent};
      font-weight: normal;
      font-style: italic;
      width: 38%;
      vertical-align: top;
    }
    .details-table td {
      padding: 0.6rem 0 0.6rem 0.5rem;
      color: ${COLORS.text};
      vertical-align: top;
    }
    .note {
      font-size: 0.85rem;
      color: ${COLORS.muted};
      text-align: center;
      border-top: 1px solid ${COLORS.border};
      padding-top: 1.25rem;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="card">
    <p class="brand">Sahara Camp &nbsp;·&nbsp; Owner Portal</p>
    ${body}
    <p class="note">The guest has been informed. No further action needed.</p>
  </div>
</body>
</html>`;
}

function buildConfirmPage(booking: BookingRow): string {
  const tentLabel = booking.tent_type === 'glamping' ? 'Glamping' : 'Traditional';
  const guestCount = booking.children > 0
    ? `${booking.adults} adult${booking.adults !== 1 ? 's' : ''}, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}`
    : `${booking.adults} adult${booking.adults !== 1 ? 's' : ''}`;

  const body = /* html */ `
    <div class="icon">&#10004;</div>
    <h1 style="color:${COLORS.success};">Booking Confirmed!</h1>
    <table class="details-table">
      <tr><th>Guest Name</th>    <td>${escapeHtml(booking.guest_name)}</td></tr>
      <tr><th>Tent Type</th>     <td>${tentLabel}</td></tr>
      <tr><th>Check-In</th>      <td>${formatDate(booking.check_in)}</td></tr>
      <tr><th>Check-Out</th>     <td>${formatDate(booking.check_out)}</td></tr>
      <tr><th>Guests</th>        <td>${guestCount}</td></tr>
      <tr><th>Phone</th>         <td>${escapeHtml(booking.phone)}</td></tr>
      <tr><th>Email</th>         <td>${escapeHtml(booking.email)}</td></tr>
      ${booking.special_req ? `<tr><th>Special Requests</th><td>${escapeHtml(booking.special_req)}</td></tr>` : ''}
    </table>`;

  return buildPage('Booking Confirmed', body);
}

function buildDenyPage(booking: BookingRow): string {
  const tentLabel = booking.tent_type === 'glamping' ? 'Glamping' : 'Traditional';
  const guestCount = booking.children > 0
    ? `${booking.adults} adult${booking.adults !== 1 ? 's' : ''}, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}`
    : `${booking.adults} adult${booking.adults !== 1 ? 's' : ''}`;

  const body = /* html */ `
    <div class="icon" style="color:${COLORS.error};">&#10008;</div>
    <h1 style="color:${COLORS.error};">Booking Denied.</h1>
    <table class="details-table">
      <tr><th>Guest Name</th>    <td>${escapeHtml(booking.guest_name)}</td></tr>
      <tr><th>Tent Type</th>     <td>${tentLabel}</td></tr>
      <tr><th>Check-In</th>      <td>${formatDate(booking.check_in)}</td></tr>
      <tr><th>Check-Out</th>     <td>${formatDate(booking.check_out)}</td></tr>
      <tr><th>Guests</th>        <td>${guestCount}</td></tr>
      <tr><th>Phone</th>         <td>${escapeHtml(booking.phone)}</td></tr>
      <tr><th>Email</th>         <td>${escapeHtml(booking.email)}</td></tr>
      ${booking.special_req ? `<tr><th>Special Requests</th><td>${escapeHtml(booking.special_req)}</td></tr>` : ''}
    </table>`;

  return buildPage('Booking Denied', body);
}

function buildAlreadyUsedPage(): string {
  const body = /* html */ `
    <div class="icon" style="color:${COLORS.muted};">&#8987;</div>
    <h1 style="color:${COLORS.muted};">Link Already Used</h1>
    <p style="text-align:center; color:${COLORS.muted}; margin-bottom:1.75rem; line-height:1.7;">
      This booking link has already been used or is invalid.<br/>
      If you believe this is an error, please check the bookings dashboard directly.
    </p>`;

  return buildPage('Link Invalid', body);
}

function buildErrorPage(message: string): string {
  const body = /* html */ `
    <div class="icon" style="color:${COLORS.error};">&#9888;</div>
    <h1 style="color:${COLORS.error};">Something Went Wrong</h1>
    <p style="text-align:center; color:${COLORS.muted}; margin-bottom:1.75rem; line-height:1.7;">
      ${escapeHtml(message)}
    </p>`;

  return buildPage('Error', body);
}

/** Minimal HTML entity escaping to prevent XSS from DB values. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
  // ── CORS preflight ──────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // ── Only GET is supported ───────────────────────────────────────────────
  if (req.method !== 'GET') {
    return new Response(
      buildErrorPage('Method not allowed. Only GET requests are accepted.'),
      { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  const url    = new URL(req.url);
  const token  = url.searchParams.get('token')?.trim() ?? '';
  const action = url.searchParams.get('action')?.trim().toLowerCase() ?? '';

  // ── Validate token ──────────────────────────────────────────────────────
  if (!token || !isValidUUID(token)) {
    return new Response(
      buildErrorPage('Missing or invalid token parameter. Please use the link sent to your email.'),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  // ── Validate action ─────────────────────────────────────────────────────
  if (!action || !VALID_ACTIONS.has(action)) {
    return new Response(
      buildErrorPage('Invalid action parameter. Expected "confirm" or "deny".'),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  // ── Resolve environment variables ────────────────────────────────────────
  const supabaseUrl     = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('confirm-booking: missing required environment variables.');
    return new Response(
      buildErrorPage('Server configuration error. Please contact the administrator.'),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  // ── Initialise Supabase admin client (bypasses RLS) ─────────────────────
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── Look up the pending booking by confirm_token ─────────────────────────
  const { data: booking, error: fetchError } = await adminClient
    .from('bookings')
    .select('id, guest_name, tent_type, check_in, check_out, adults, children, phone, email, special_req')
    .eq('confirm_token', token)
    .eq('status', 'pending')
    .maybeSingle();

  if (fetchError) {
    console.error('confirm-booking: fetch error:', fetchError.message);
    return new Response(
      buildErrorPage('A database error occurred while looking up the booking. Please try again later.'),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  // ── Booking not found or already processed ───────────────────────────────
  if (!booking) {
    return new Response(
      buildAlreadyUsedPage(),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  // ── Update booking status ────────────────────────────────────────────────
  const newStatus = action === 'confirm' ? 'confirmed' : 'denied';

  const { error: updateError } = await adminClient
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', booking.id)
    .eq('status', 'pending'); // extra guard against a race condition

  if (updateError) {
    console.error('confirm-booking: update error:', updateError.message);
    return new Response(
      buildErrorPage('A database error occurred while updating the booking status. Please try again later.'),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  // ── Return styled confirmation page ─────────────────────────────────────
  const html = action === 'confirm'
    ? buildConfirmPage(booking as BookingRow)
    : buildDenyPage(booking as BookingRow);

  return new Response(html, {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'text/html; charset=utf-8' },
  });
});
