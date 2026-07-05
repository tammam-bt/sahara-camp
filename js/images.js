"use strict";

/* ============================================================
   Sahara Camp — Image Configuration
   ============================================================
   Replace any URL below with your own photo to update that
   image across the entire website. No HTML editing needed.

   For your own photos:
   - Upload them to the /images/ folder
   - Replace the URL with: 'images/your-photo.jpg'

   Unsplash URL format:
   - Change w=800 to control download size (w=400 / w=800 / w=1600)
   - Change q=80 to control quality (1–100)
   ============================================================ */

window.IMAGES = {
  /* ----------------------------------------------------------
     HERO — full-screen background (use a wide, landscape photo)
     Recommended: at least 1920px wide
  ---------------------------------------------------------- */
  hero: "https://images.unsplash.com/photo-1613169620329-6785c004d900?q=85&w=1920&auto=format&fit=crop",

  /* ----------------------------------------------------------
     ABOUT — photo next to the camp story text
     Recommended: portrait or square orientation
  ---------------------------------------------------------- */
  about:
    "https://cf.bstatic.com/xdata/images/hotel/max1024x768/183625147.jpg?k=a263e5056bd633c32dfad2876a49a8e5db835c165d0a6226e6687273ba524035&o=",

  /* ----------------------------------------------------------
     ACCOMMODATION — tent card photos
  ---------------------------------------------------------- */
  tents: {
    traditional:
      "https://images.unsplash.com/photo-1677959587685-6b43720d3c5d?q=90&w=1600&auto=format&fit=crop",
    glamping:
      "https://images.unsplash.com/photo-1757438059221-5f2dede2c318?q=80&w=800&auto=format&fit=crop",
  },

  /* ----------------------------------------------------------
     GALLERY — 8 photos shown in the masonry grid
     'thumb' is shown in the grid, 'full' opens in the lightbox.
     To add more photos, duplicate any entry block.
  ---------------------------------------------------------- */
  gallery: [
    {
      // Desert camp at dusk with tents and lanterns
      thumb: "https://images.unsplash.com/photo-1761888351161-c3beb14e9377?",
      full: "https://images.unsplash.com/photo-1761888351161-c3beb14e9377?q=90&w=1600&auto=format&fit=crop",
      alt: "Sahara Camp — desert camp at dusk with tents and lanterns",
      caption: "Our Camp in the Desert",
    },
    {
      // Camel caravan at golden hour
      thumb:
        "https://images.unsplash.com/photo-1535191198992-fe460a2d0af1?q=80&w=800&auto=format&fit=crop",
      full: "https://images.unsplash.com/photo-1535191198992-fe460a2d0af1?q=90&w=1600&auto=format&fit=crop",
      alt: "Camel caravan crossing the Sahara at golden hour",
      caption: "Camel Trekking Adventure",
    },
    {
      // Camel trekking at sunset
      thumb:
        "https://plus.unsplash.com/premium_photo-1661962542692-4fe7a4ad6b54?q=80&w=800&auto=format&fit=crop",
      full: "https://plus.unsplash.com/premium_photo-1661962542692-4fe7a4ad6b54?q=90&w=1600&auto=format&fit=crop",
      alt: "Camel trekking through the Sahara desert at sunset",
      caption: "Camel riding at sunset",
    },
    {
      // Vast desert dunes
      thumb:
        "https://images.unsplash.com/photo-1622489968558-9bf6f30dcb2a?q=80&w=800&auto=format&fit=crop",
      full: "https://images.unsplash.com/photo-1622489968558-9bf6f30dcb2a?q=90&w=1600&auto=format&fit=crop",
      alt: "Vast Sahara desert dunes stretching to the horizon",
      caption: "Endless Dunes",
    },
    {
      // Sahara dune scene
      thumb:
        "https://images.unsplash.com/photo-1708007004190-2c1286bd392e?q=80&w=800&auto=format&fit=crop",
      full: "https://images.unsplash.com/photo-1708007004190-2c1286bd392e?q=90&w=1600&auto=format&fit=crop",
      alt: "Chatt Jerid scenery",
      caption: "Chatt Jerid",
    },
    {
      // Campfire under the stars
      thumb:
        "https://images.unsplash.com/photo-1613169660691-f0e9603b74d0?q=80&w=800&auto=format&fit=crop",
      full: "https://images.unsplash.com/photo-1613169660691-f0e9603b74d0?q=90&w=1600&auto=format&fit=crop",
      alt: "Dinner around a campfire under the starry desert sky",
      caption: "Campfires & Stars",
    },
    {
      // Oasis with desert tents
      thumb:
        "https://images.unsplash.com/photo-1527736848781-72dc3b2ee00f?q=80&w=800&auto=format&fit=crop",
      full: "https://images.unsplash.com/photo-1527736848781-72dc3b2ee00f?q=90&w=1600&auto=format&fit=crop",
      alt: "Oasis scenery with desert tents and palm trees",
      caption: "Oasis scenes",
    },
  ],
};
