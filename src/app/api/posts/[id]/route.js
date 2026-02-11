import { getDb } from '../../../../../lib/db';
import { NextResponse } from 'next/server';

// GET /api/posts/[id] — get single post
export async function GET(request, { params }) {
  const db = getDb();
  const { id } = await params;
  const post = db.prepare('SELECT p.*, n.name as niche_name FROM posts p LEFT JOIN niches n ON p.niche_id = n.id WHERE p.id = ?').get(id);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  return NextResponse.json({ post });
}

// PUT /api/posts/[id] — update post
export async function PUT(request, { params }) {
  const db = getDb();
  const { id } = await params;
  const body = await request.json();

  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  if (!existing) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  const fields = ['title', 'slug', 'excerpt', 'content', 'niche_id', 'tags', 'image_url', 'image_alt', 'author', 'status', 'market', 'is_trending', 'meta_title', 'meta_description'];
  
  const updates = [];
  const values = [];
  
  for (const f of fields) {
    if (body[f] !== undefined) {
      let val = body[f];
      if (f === 'tags' && Array.isArray(val)) val = val.join(',');
      if (f === 'is_trending') val = val ? 1 : 0;
      updates.push(`${f} = ?`);
      values.push(val);
    }
  }

  if (body.content) {
    updates.push('reading_time = ?');
    values.push(Math.ceil(body.content.split(/\s+/).length / 200));
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  try {
    db.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    return NextResponse.json({ post });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/posts/[id] — delete post
export async function DELETE(request, { params }) {
  const db = getDb();
  const { id } = await params;
  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  if (!existing) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
