/**
 * Cloudflare Pages Function — Authorized Google Places API (New) Reviews Endpoint
 * Endpoint: GET /api/reviews
 *
 * Environment Variables required in Cloudflare Pages / Server:
 * - GOOGLE_PLACES_API_KEY : Your Google Cloud API key with "Places API (New)" enabled
 * - GOOGLE_PLACE_ID       : LAWISA's Google Place ID (e.g. "ChIJ...")
 */
export async function onRequestGet(context) {
    const env = context.env || {};
    const apiKey = env.GOOGLE_PLACES_API_KEY;
    const placeId = env.GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) {
        return new Response(
            JSON.stringify({
                ok: false,
                error: "Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID environment variables."
            }),
            {
                status: 503,
                headers: { "Content-Type": "application/json; charset=utf-8" }
            }
        );
    }

    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=fr`;
    const response = await fetch(url, {
        headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "id,rating,userRatingCount,googleMapsLinks.writeAReviewUri,reviews"
        }
    });

    if (!response.ok) {
        return new Response(
            JSON.stringify({ ok: false, status: response.status }),
            {
                status: response.status,
                headers: { "Content-Type": "application/json; charset=utf-8" }
            }
        );
    }

    const data = await response.json();
    const reviews = Array.isArray(data.reviews)
        ? data.reviews.map(r => ({
              author: (r.authorAttribution && r.authorAttribution.displayName) || "Client Google",
              rating: r.rating || 5,
              date_fr: r.relativePublishTimeDescription || "",
              date_en: r.relativePublishTimeDescription || "",
              text_fr: (r.text && r.text.text) || "",
              text_en: (r.originalText && r.originalText.text) || (r.text && r.text.text) || ""
          }))
        : [];

    return new Response(
        JSON.stringify({
            ok: true,
            placeId: data.id || placeId,
            rating: data.rating || 5.0,
            userRatingCount: data.userRatingCount || 222,
            writeReviewUri:
                (data.googleMapsLinks && data.googleMapsLinks.writeAReviewUri) ||
                `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`,
            reviews
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "public, max-age=3600"
            }
        }
    );
}
