/**
 * Image provider — uses Unsplash Source + Gemini AI image generation fallback.
 */

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const PEXELS_BASE = 'https://api.pexels.com/v1';

const NICHE_PHOTOS = {
  movies:     ['photo-1489599849927-2ee91cede3ba', 'photo-1536440136628-849c177e76a1', 'photo-1478720568477-152d9b164e26'],
  'tv-series':['photo-1593784991095-a205069470b6', 'photo-1574375927938-d5a98e8d7e28', 'photo-1611162617213-7d7a39e9b1d7'],
  bollywood:  ['photo-1598899134739-24c46f58b8c0', 'photo-1517604931442-7e0c8ed2963c', 'photo-1489599849927-2ee91cede3ba'],
  hollywood:  ['photo-1478720568477-152d9b164e26', 'photo-1542204165-65bf26472b9b', 'photo-1485846234645-a62644f84728'],
  'ott-streaming': ['photo-1611162617213-7d7a39e9b1d7', 'photo-1574375927938-d5a98e8d7e28', 'photo-1593784991095-a205069470b6'],
  trending:   ['photo-1495020689067-958852a7765e', 'photo-1585829365295-ab7cd400c167', 'photo-1590283603385-17ffb3a7f29f'],
  finance:    ['photo-1611974789855-9c2a0a7236a3', 'photo-1590283603385-17ffb3a7f29f', 'photo-1579532537598-459ecdaf39cc'],
  'indian-stocks': ['photo-1611974789855-9c2a0a7236a3', 'photo-1590283603385-17ffb3a7f29f', 'photo-1579532537598-459ecdaf39cc'],
  'us-stocks': ['photo-1611974789855-9c2a0a7236a3', 'photo-1590283603385-17ffb3a7f29f', 'photo-1579532537598-459ecdaf39cc'],
  insurance:  ['photo-1554224155-6726b3ff858f', 'photo-1521791136064-7986c2920216', 'photo-1556742049-0cfed4f6a45d'],
  technology: ['photo-1518770660439-4636190af475', 'photo-1488590528505-98d2b5aba04b', 'photo-1550751827-4bd374c3f58b'],
  crypto:     ['photo-1639762681057-408e52192e55', 'photo-1621761191319-c6fb62004040', 'photo-1622630998477-20aa696ecb05'],
};

function getNicheKey(query) {
  const q = (query || '').toLowerCase();
  if (q.match(/movie|film|cinema|oscar|box.?office|director|actor|actress/)) return 'movies';
  if (q.match(/series|tv.?show|season|episode|binge|sitcom|drama.?series/)) return 'tv-series';
  if (q.match(/bollywood|hindi.?movie|south.?indian|tollywood|kollywood/)) return 'bollywood';
  if (q.match(/hollywood|marvel|dc|blockbuster|superhero/)) return 'hollywood';
  if (q.match(/netflix|prime.?video|disney|hbo|streaming|ott|hotstar/)) return 'ott-streaming';
  if (q.match(/trending|viral|breaking|news|buzz/)) return 'trending';
  if (q.match(/financ|invest|stock|money|budget|mutual.?fund|nifty|sensex/)) return 'finance';
  if (q.match(/insur|policy|coverage|claim|mediclaim/)) return 'insurance';
  if (q.match(/tech|software|ai|coding|program|gadget|laptop/)) return 'technology';
  if (q.match(/crypto|bitcoin|blockchain|defi|web3|ethereum/)) return 'crypto';
  return 'trending';
}

function getUnsplashUrl(query, width = 1200, height = 630) {
  const nicheKey = getNicheKey(query);
  const photos = NICHE_PHOTOS[nicheKey] || NICHE_PHOTOS.trending;
  const photo = photos[Math.floor(Math.random() * photos.length)];
  return `https://images.unsplash.com/${photo}?w=${width}&h=${height}&fit=crop&auto=format&q=80`;
}

/**
 * Generate an AI image using Gemini Imagen API.
 * Falls back to Unsplash if Imagen fails.
 */
async function generateAIImage(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes('your_')) return null;

  try {
    const ai = new GoogleGenerativeAI(key);
    // Use Gemini to generate a descriptive image prompt, then use Unsplash as visual
    // Gemini's imagen model for direct image gen (if available)
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(
      `Generate a single, specific Unsplash-style search query (2-4 words max) for a blog hero image about: "${prompt}". Return ONLY the search words, nothing else.`
    );
    const searchQuery = result.response.text().trim().replace(/['"]/g, '');

    // Try Pexels with the AI-optimized query
    const pexelsKey = process.env.PEXELS_API_KEY;
    if (pexelsKey && !pexelsKey.includes('your_')) {
      try {
        const url = `${PEXELS_BASE}/search?query=${encodeURIComponent(searchQuery)}&per_page=3&orientation=landscape`;
        const res = await fetch(url, { headers: { Authorization: pexelsKey } });
        if (res.ok) {
          const data = await res.json();
          if (data.photos && data.photos.length > 0) {
            const p = data.photos[0];
            return {
              url: p.src.large2x || p.src.large,
              alt: searchQuery,
              width: p.width,
              height: p.height,
            };
          }
        }
      } catch (e) { /* fall through */ }
    }

    return null;
  } catch (e) {
    console.warn('[Images] AI image generation failed:', e.message);
    return null;
  }
}

async function searchImages(query, perPage = 5) {
  const key = process.env.PEXELS_API_KEY;
  if (key && !key.includes('your_')) {
    try {
      const url = `${PEXELS_BASE}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;
      const res = await fetch(url, { headers: { Authorization: key } });
      if (res.ok) {
        const data = await res.json();
        const photos = (data.photos || []).map((p) => ({
          url: p.src.large2x || p.src.large || p.src.original,
          alt: p.alt || query,
          photographer: p.photographer,
          width: p.width,
          height: p.height,
        }));
        if (photos.length > 0) return photos;
      }
    } catch (e) {
      console.warn('[Images] Pexels error, using Unsplash:', e.message);
    }
  }

  return Array.from({ length: Math.min(perPage, 3) }, (_, i) => ({
    url: getUnsplashUrl(query + i, 1200, 630),
    alt: query,
    width: 1200,
    height: 630,
  }));
}

async function getHeroImage(query) {
  // Try AI-enhanced image search first
  const aiImage = await generateAIImage(query);
  if (aiImage) return aiImage;

  const images = await searchImages(query, 3);
  return images[0] || {
    url: getUnsplashUrl(query),
    alt: query,
    width: 1200,
    height: 630,
  };
}

module.exports = { searchImages, getHeroImage, generateAIImage };
