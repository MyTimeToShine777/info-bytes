import { getDb } from '../../../../lib/db';
import { NextResponse } from 'next/server';

// GET /api/niches
export async function GET() {
  const db = getDb();
  const niches = db.prepare(`
    SELECT n.*, COUNT(p.id) as post_count 
    FROM niches n LEFT JOIN posts p ON p.niche_id = n.id 
    GROUP BY n.id ORDER BY n.market, n.avg_cpc DESC
  `).all();
  return NextResponse.json({ niches });
}

// PUT /api/niches — update niche active status
export async function PUT(request) {
  const db = getDb();
  const body = await request.json();
  const { id, is_active } = body;
  if (!id) return NextResponse.json({ error: 'Niche ID required' }, { status: 400 });
  db.prepare('UPDATE niches SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, id);
  return NextResponse.json({ success: true });
}
