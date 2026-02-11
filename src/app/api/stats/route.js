import { getDb } from '../../../../lib/db';
import { NextResponse } from 'next/server';

// GET /api/stats — dashboard stats
export async function GET() {
  const db = getDb();

  const totalPosts = db.prepare("SELECT COUNT(*) as c FROM posts").get().c;
  const publishedPosts = db.prepare("SELECT COUNT(*) as c FROM posts WHERE status='published'").get().c;
  const draftPosts = db.prepare("SELECT COUNT(*) as c FROM posts WHERE status='draft'").get().c;
  const totalViews = db.prepare("SELECT COALESCE(SUM(views),0) as v FROM posts").get().v;

  const marketBreakdown = db.prepare(`
    SELECT market, COUNT(*) as count, SUM(views) as views  
    FROM posts WHERE status='published' 
    GROUP BY market
  `).all();

  const nicheBreakdown = db.prepare(`
    SELECT n.id, n.name, n.market, n.avg_cpc, COUNT(p.id) as post_count, COALESCE(SUM(p.views),0) as total_views 
    FROM niches n LEFT JOIN posts p ON p.niche_id = n.id 
    GROUP BY n.id ORDER BY n.market, n.avg_cpc DESC
  `).all();

  const recentLogs = db.prepare("SELECT * FROM generation_log ORDER BY created_at DESC LIMIT 20").all();

  const todayPosts = db.prepare("SELECT COUNT(*) as c FROM posts WHERE date(created_at) = date('now')").get().c;

  const estimatedRPM = 12;
  const estimatedMonthlyPageviews = totalViews * 4;
  const estimatedRevenue = ((estimatedMonthlyPageviews / 1000) * estimatedRPM).toFixed(2);

  return NextResponse.json({
    totalPosts, publishedPosts, draftPosts, totalViews, todayPosts,
    estimatedRevenue, marketBreakdown, nicheBreakdown, recentLogs,
  });
}
