const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const revalidate = 3600; // 1 hour

export async function GET() {
  const robots = `# Info Bytes robots.txt
# ${SITE_URL}

User-agent: *
Allow: /

# Block non-public areas
Disallow: /admin
Disallow: /api

# Allow essential Next.js assets
Allow: /_next/static/
Allow: /_next/image

# Sitemap + host
Sitemap: ${SITE_URL}/sitemap.xml
Host: ${SITE_URL}
`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
