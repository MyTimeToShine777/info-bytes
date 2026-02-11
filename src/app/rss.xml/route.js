import { getDb } from '../../../lib/db';
import { Feed } from 'feed';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'SmartFinance Blog';

export async function GET() {
  const db = getDb();
  const posts = db.prepare("SELECT * FROM posts WHERE status='published' ORDER BY created_at DESC LIMIT 50").all();

  const feed = new Feed({
    title: SITE_NAME,
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Expert insights on high-value topics',
    id: SITE_URL,
    link: SITE_URL,
    language: 'en',
    copyright: `© ${new Date().getFullYear()} ${SITE_NAME}`,
    generator: 'Next.js + Auto-Blog',
    feedLinks: {
      rss2: `${SITE_URL}/rss.xml`,
    },
  });

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/post/${post.slug}`,
      link: `${SITE_URL}/post/${post.slug}`,
      description: post.excerpt || '',
      date: new Date(post.created_at),
      image: post.image_url || undefined,
      author: [{ name: post.author || 'Editorial Team' }],
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
