"use strict";

/* =========================================
   Supabase Client Initialization
   Replace SUPABASE_URL and SUPABASE_ANON_KEY
   with your actual project values from:
   https://supabase.com/dashboard → Project Settings → API
   ========================================= */

(function () {
  const SUPABASE_URL = "https://alumewtgdjdxsyfphfrm.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdW1ld3RnZGpkeHN5ZnBoZnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNzE4MjEsImV4cCI6MjA5ODY0NzgyMX0.cw9pPRRks6HYLB4w37npmKMeyqpl_s0IcZ8LDf4jei0";

  if (typeof window.supabase !== "undefined") return; // already initialized

  if (typeof window.supabaseJs === "undefined") {
    console.error(
      "Supabase JS library not loaded. Make sure the CDN script is included before supabase-client.js",
    );
    return;
  }

  window.supabase = window.supabaseJs.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
})();
