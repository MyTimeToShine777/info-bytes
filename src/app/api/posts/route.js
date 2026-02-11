import { getDb } from '../../../../lib/db';
import { NextResponse } from 'next/server';

// GET /api/posts — list posts with filters
export async function GET(request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  
  const status = searchParams.get('status');
  const market = searchParams.get('market');
  const niche = searchParams.get('niche');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let where = [];
  let params = [];

  if (status && status !== 'all') { where.push('p.status = ?'); params.push(status); }
  if (market && market !== 'all') { where.push('p.market = ?'); params.push(market); }
  if (niche && niche !== 'all') { where.push('p.niche_id = ?'); params.push(niche); }
  if (search) { where.push('(p.title LIKE ? OR p.content LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) as c FROM posts p ${whereClause}`).get(...params).c;
  const posts = db.prepare(`SELECT p.*, n.name as niche_name FROM posts p LEFT JOIN niches n ON p.niche_id = n.id ${whereClause} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

  return NextResponse.json({ posts, total, page, limit, pages: Math.ceil(total / limit) });
}

// POST /api/posts — create a new post
export async function POST(request) {
  const db = getDb();
  const body = await request.json();

  const { title, slug, excerpt, content, niche_id, tags, image_url, image_alt, author, status, market, is_trending, meta_title, meta_description } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }

  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const readingTime = Math.ceil(content.split(/\s+/).length / 200);

  try {
    const result = db.prepare(`
      INSERT INTO posts (slug, title, excerpt, content, niche_id, tags, image_url, image_alt, author, reading_time, status, market, is_trending, meta_title, meta_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      finalSlug, title, excerpt || '', content, niche_id || null,
      Array.isArray(tags) ? tags.join(',') : (tags || ''),
      image_url || '', image_alt || title,
      author || 'Editorial Team', readingTime,
      status || 'draft', market || 'global', is_trending ? 1 : 0,
      meta_title || title, meta_description || excerpt || ''
    );

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
