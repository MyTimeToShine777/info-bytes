/**
 * AI Content Generator — uses Google Gemini to produce full blog posts.
 * Supports movies, series, trending news, finance, and more.
 * Always generates CURRENT, date-aware content (2026 only).
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL = 'gemini-2.0-flash';

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes('your_')) throw new Error('GEMINI_API_KEY not set in .env.local');
  return new GoogleGenerativeAI(key);
}

function getCurrentDate() {
  const d = new Date();
  return {
    full: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    month: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    year: d.getFullYear(),
    yesterday: new Date(d - 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  };
}

const NICHE_PROMPTS = {
  movies: `You are a professional movie critic and film journalist. Cover latest movie releases, reviews, box office analysis, trailers, casting news. Include IMDb/Rotten Tomatoes-style ratings where appropriate. Reference specific actors, directors, studios, release dates.`,
  'tv-series': `You are a TV series reviewer. Cover latest streaming shows, season reviews, episode guides, casting news, show comparisons. Reference specific streaming platforms (Netflix, Prime, HBO, Disney+, Apple TV+).`,
  bollywood: `You are a Bollywood entertainment journalist. Cover latest Hindi/regional Indian films, OTT releases on JioCinema/Hotstar/Netflix India, box office collection in crores (₹), Bollywood gossip and upcoming releases. Use Indian context.`,
  hollywood: `You are a Hollywood entertainment journalist. Cover Marvel/DC movies, Oscar predictions, big-budget blockbusters, director spotlights, and industry trends. Use US box office numbers in USD.`,
  'ott-streaming': `You are a streaming platform expert. Compare shows across Netflix, Amazon Prime, Disney+, HBO Max, Apple TV+. Cover new releases this week, hidden gems, subscription deals, and "what to watch" guides.`,
  trending: `You are a news journalist covering today's trending topics. Write about viral stories, breaking developments, Google Trends topics, social media buzz, and current events from the last 24-48 hours. Be timely and factual.`,
};

/**
 * Generate a blog topic + outline for a given niche.
 */
async function generateTopic(niche, existingTitles = [], options = {}) {
  const client = getClient();
  const model = client.getGenerativeModel({ model: MODEL });
  const date = getCurrentDate();
  const market = options.market || niche.market || 'global';

  const avoidList = existingTitles.slice(0, 30).map((t) => `- ${t}`).join('\n');

  const nichePrompt = NICHE_PROMPTS[niche.id] || '';

  const marketContext = {
    india: `Target audience: Indian readers. Use Indian context — INR (₹) currency, Indian references, Bollywood, Indian streaming platforms (JioCinema, Hotstar, SonyLIV), SEBI, RBI, Indian tax laws where relevant.`,
    us: `Target audience: American readers. Use US context — USD ($) currency, Hollywood, US streaming platforms, SEC, IRS where relevant.`,
    global: `Target audience: Global readers. Keep content internationally relevant.`,
  };

  const prompt = `${nichePrompt}

You are a content strategist for "Info Bytes" — a trending news and entertainment blog.
CURRENT DATE: ${date.full} (YESTERDAY: ${date.yesterday})
CURRENT YEAR: ${date.year}

${marketContext[market] || marketContext.global}

Goal: Generate a blog post topic that:
1. Is EXTREMELY CURRENT — reference things happening THIS WEEK or YESTERDAY
2. Would rank well in Google search TODAY and attract clicks
3. Has high search volume potential
4. MUST be about ${date.year} content ONLY — NEVER reference 2025 or older content as current

NICHE: ${niche.name}
${niche.keywords ? `Seed keywords: ${niche.keywords}` : ''}

${avoidList ? `ALREADY PUBLISHED (do NOT repeat):\n${avoidList}\n` : ''}

Return ONLY a JSON object (no markdown, no backticks):
{
  "title": "Compelling, click-worthy title with ${date.year} reference (50-65 chars ideal)",
  "slug": "url-friendly-slug-with-dashes",
  "keyword": "primary target keyword phrase",
  "excerpt": "Compelling 1-2 sentence meta description (120-155 chars)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "imageQuery": "2-3 word search query for hero image",
  "market": "${market}"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json?\s*/gi, '').replace(/```/g, '').trim();
  return JSON.parse(text);
}

/**
 * Generate the full blog post content in Markdown.
 */
async function generateContent(topic, niche, options = {}) {
  const client = getClient();
  const model = client.getGenerativeModel({ model: MODEL });
  const date = getCurrentDate();
  const market = options.market || topic.market || niche.market || 'global';

  const nichePrompt = NICHE_PROMPTS[niche.id] || '';

  const marketContext = {
    india: `Write for an INDIAN audience. Use INR (₹) for currency. Reference Indian context.`,
    us: `Write for an AMERICAN audience. Use USD ($) for currency. Reference US context.`,
    global: `Write for a GLOBAL audience.`,
  };

  const isEntertainment = ['movies', 'tv-series', 'bollywood', 'hollywood', 'ott-streaming'].includes(niche.id);

  const prompt = `${nichePrompt}

Write a comprehensive blog article for "Info Bytes" blog.
CURRENT DATE: ${date.full}
YESTERDAY: ${date.yesterday}

TOPIC: ${topic.title}
PRIMARY KEYWORD: ${topic.keyword}
TARGET: People searching Google for this topic TODAY in ${date.month}.

${marketContext[market] || marketContext.global}

STRICT RULES:
1. Write 1800–2500 words of HIGH-QUALITY, original, CURRENT content
2. ALL information must be CURRENT as of ${date.month} ${date.year} — NEVER write about 2025 events as current
3. Use Markdown formatting:
   - Start with a strong intro paragraph (NO H1)
   - Use ## for main sections (4-6 sections)
   - Use ### for sub-sections where needed
   - Use bullet/numbered lists where appropriate
   - Bold **key terms** naturally
4. SEO OPTIMIZATION:
   - Include the primary keyword in the first paragraph
   - Use the keyword in at least 2 H2 headings naturally
   - Include 3-5 related/LSI keywords throughout
   - End with a "Key Takeaways" or "The Bottom Line" section
5. TONE: ${isEntertainment ? 'Engaging, passionate, opinionated but balanced. Include personal-style recommendations.' : 'Authoritative, helpful, clear. Write like a senior expert.'}
6. ${isEntertainment ? 'Include specific ratings (out of 10), streaming platform availability, cast/director names, and release dates.' : 'Include specific numbers, current data points, and statistics.'}
7. DO NOT reference 2025, 2024, or earlier as current. Everything must be framed for ${date.year}.
8. DO NOT start with "In today's world" or similar clichés.
9. Reference that this content is updated for ${date.month} where natural.

Return ONLY the markdown content, nothing else.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

/**
 * Generate a post from a custom prompt (for admin manual creation with AI assist).
 */
async function generateFromPrompt(userPrompt, market = 'global') {
  const client = getClient();
  const model = client.getGenerativeModel({ model: MODEL });
  const date = getCurrentDate();

  const prompt = `You are an expert blog content writer for "Info Bytes". Current date: ${date.full}.

USER REQUEST: ${userPrompt}

Generate a complete blog post based on the user's request.
IMPORTANT: Content MUST be about ${date.year} — NEVER reference 2025 or earlier as current.
Market: ${market === 'india' ? 'Indian audience (use ₹, Indian context)' : market === 'us' ? 'US audience (use $, US context)' : 'Global audience'}

Return ONLY a JSON object (no markdown, no backticks):
{
  "title": "SEO-optimized title",
  "slug": "url-friendly-slug",
  "excerpt": "Meta description (120-155 chars)",
  "content": "Full markdown article (1800-2500 words, well-structured with ## headings, lists, bold terms)",
  "tags": ["tag1", "tag2", "tag3"],
  "niche_id": "best matching niche id from: movies, tv-series, bollywood, hollywood, ott-streaming, trending, indian-stocks, mutual-funds, tax-planning, indian-insurance, us-stocks, us-insurance, finance, technology, crypto",
  "imageQuery": "2-3 word image search query"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json?\s*/gi, '').replace(/```/g, '').trim();
  return JSON.parse(text);
}

module.exports = { generateTopic, generateContent, generateFromPrompt };
