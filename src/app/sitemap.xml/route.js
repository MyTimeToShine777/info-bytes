import { getDb } from '../../../lib/db';

export const revalidate = 3600; // 1 hour

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function GET() {
  const db = getDb();
  const posts = db.prepare("SELECT slug, updated_at, niche_id FROM posts WHERE status='published' ORDER BY created_at DESC LIMIT 1000").all();
  const niches = db.prepare("SELECT id FROM niches WHERE is_active=1").all();

  const urls = [
    // Homepage (highest priority)
    `  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,

    // Category pages
    ...niches.map((n) => `  <url>
    <loc>${SITE_URL}/category/${n.id}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`),

    // Post pages
    ...posts.map((p) => `  <url>
    <loc>${SITE_URL}/post/${p.slug}</loc>
    <lastmod>${new Date(p.updated_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
