import { getDb } from '../../../../lib/db';
import { NextResponse } from 'next/server';

// POST /api/generate — generate an AI post from admin
export async function POST(request) {
  const body = await request.json();
  const { niche_id, market, prompt: userPrompt } = body;

  const db = getDb();

  try {
    // Dynamic import to avoid bundling issues
    const { generateTopic, generateContent, generateFromPrompt } = require('../../../../lib/ai-generator');
    const { getHeroImage } = require('../../../../lib/images');

    let post;

    if (userPrompt) {
      // Generate from user prompt
      const generated = await generateFromPrompt(userPrompt, market || 'global');
      const image = await getHeroImage(generated.imageQuery || generated.title);
      const readingTime = Math.ceil(generated.content.split(/\s+/).length / 200);

      const result = db.prepare(`
        INSERT INTO posts (slug, title, excerpt, content, niche_id, tags, image_url, image_alt, author, reading_time, status, market)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Editorial Team', ?, 'draft', ?)
      `).run(
        generated.slug, generated.title, generated.excerpt, generated.content,
        generated.niche_id || niche_id || null,
        Array.isArray(generated.tags) ? generated.tags.join(',') : '',
        image.url, image.alt || generated.title,
        readingTime, market || 'global'
      );

      post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);

      db.prepare('INSERT INTO generation_log (niche_id, topic, status) VALUES (?, ?, ?)').run(
        generated.niche_id || niche_id, generated.title, 'success'
      );
    } else {
      // Generate from niche
      let niche;
      if (niche_id) {
        niche = db.prepare('SELECT * FROM niches WHERE id = ?').get(niche_id);
      } else {
        // Pick random active niche matching market
        const q = market && market !== 'all'
          ? "SELECT * FROM niches WHERE is_active=1 AND market=? ORDER BY RANDOM() LIMIT 1"
          : "SELECT * FROM niches WHERE is_active=1 ORDER BY RANDOM() LIMIT 1";
        niche = market && market !== 'all' ? db.prepare(q).get(market) : db.prepare(q).get();
      }

      if (!niche) return NextResponse.json({ error: 'No active niche found' }, { status: 400 });

      const existingTitles = db.prepare("SELECT title FROM posts WHERE niche_id = ?").all(niche.id).map(p => p.title);
      const topic = await generateTopic(niche, existingTitles, { market: market || niche.market });
      const image = await getHeroImage(topic.imageQuery || topic.title);
      const content = await generateContent(topic, niche, { market: market || niche.market });
      const readingTime = Math.ceil(content.split(/\s+/).length / 200);

      const result = db.prepare(`
        INSERT INTO posts (slug, title, excerpt, content, niche_id, tags, image_url, image_alt, author, reading_time, status, market)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Editorial Team', ?, 'draft', ?)
      `).run(
        topic.slug, topic.title, topic.excerpt, content,
        niche.id, Array.isArray(topic.tags) ? topic.tags.join(',') : '',
        image.url, image.alt || topic.title,
        readingTime, market || niche.market || 'global'
      );

      post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);

      db.prepare('INSERT INTO generation_log (niche_id, topic, status) VALUES (?, ?, ?)').run(
        niche.id, topic.title, 'success'
      );
    }

    return NextResponse.json({ post, message: 'Post generated as draft. Review and publish from the posts list.' });
  } catch (e) {
    console.error('[Generate API]', e);
    db.prepare('INSERT INTO generation_log (niche_id, topic, status, error) VALUES (?, ?, ?, ?)').run(
      niche_id || null, userPrompt || 'auto', 'error', e.message
    );
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
