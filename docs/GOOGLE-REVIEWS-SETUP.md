# LAWISA Thaï Massage — Google Reviews Setup Guide

This guide explains how to update the Google Reviews carousel manually right now, how to activate the direct **"Leave a Google Review"** popup link, and how to connect automatic Google Places API updates later.

---

## 1. Activate the Direct "Leave a Google Review" Window Link

Google requires either your **Google Business Profile Review Shortlink** or your **Google Place ID** to open the review-writing modal directly (instead of the general Google Maps page):

1. Open your **Google Business Profile Manager** for **LAWISA Thaï Massage** (`183 Rue du Faubourg Saint-Honoré, 75008 Paris`).
2. Click **"Ask for reviews"** (*Demander des avis*).
3. Copy the official link (looks like `https://g.page/r/XXXX/review`), **OR** copy your `place_id` (looks like `ChIJ...`).
4. Open [`js/reviews.js`](../js/reviews.js) and paste it at the top:
   ```js
   placeId: "ChIJ...", // OR:
   directWriteReviewUrl: "https://g.page/r/YOUR_CODE/review",
   ```
   Once pasted, clicking **LAISSER UN AVIS GOOGLE / LEAVE A GOOGLE REVIEW** immediately opens Google's review-writing popup window.

---

## 2. How to Add or Edit Reviews Manually (`js/reviews.js`)

Open [`js/reviews.js`](../js/reviews.js) and edit the `reviews` array inside `window.LAWISA_REVIEWS_CONFIG`:

```js
reviews: [
    {
        author: "Customer Name",
        rating: 5,
        date_fr: "il y a 1 semaine",
        date_en: "1 week ago",
        text_fr: "Exact French review text from Google...",
        text_en: "Exact English review text (or same as French)..."
    }
]
```

The marquee automatically duplicates and loops the cards smoothly from right to left and adds a **"Lire la suite / More"** toggle on longer reviews.

---

## 3. How to Connect Automatic Google Review Updates (Optional)

When deployed to Cloudflare Pages (or any serverless host), [`functions/api/reviews.js`](../functions/api/reviews.js) fetches live reviews from the official **Google Places API (New)** (`places.googleapis.com/v1/places/{PLACE_ID}`):

1. In Google Cloud Console, enable **Places API (New)** and create an API key (`GOOGLE_PLACES_API_KEY`).
2. Add two environment variables to your deployment:
   - `GOOGLE_PLACES_API_KEY`
   - `GOOGLE_PLACE_ID`
3. In [`js/reviews.js`](../js/reviews.js), set:
   ```js
   enableAutoFetch: true
   ```
