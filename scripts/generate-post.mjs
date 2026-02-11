#!/usr/bin/env node

/**
 * Generate a single AI blog post.
 *
 * Usage:
 *   node scripts/generate-post.mjs                   # random niche
 *   node scripts/generate-post.mjs --niche=finance   # specific niche
 */

import 'dotenv/config';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Load .env.local
import { config } from 'dotenv';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });

const { getDb } = await import(pathToFileURL(path.join(__dirname, '..', 'lib', 'db.js')).href);
const { generateTopic, generateContent } = await import(pathToFileURL(path.join(__dirname, '..', 'lib', 'ai-generator.js')).href);
const { getHeroImage } = await import(pathToFileURL(path.join(__dirname, '..', 'lib', 'images.js')).href);

const db = getDb();

// Parse --niche arg
const nicheArg = process.argv.find((a) => a.startsWith('--niche='));
const nicheId = nicheArg ? nicheArg.split('=')[1] : null;

async function run() {
  // Pick a niche
  let niche;
  if (nicheId) {
    niche = db.prepare('SELECT * FROM niches WHERE id=? AND is_active=1').get(nicheId);
    if (!niche) { console.error(`Niche "${nicheId}" not found.`); process.exit(1); }
  } else {
    // Weighted-random: prefer niches with fewer posts
    const niches = db.prepare('SELECT * FROM niches WHERE is_active=1').all();
    if (niches.length === 0) { console.error('No niches found. Run: npm run seed'); process.exit(1); }

    const counts = {};
    for (const n of niches) {
      const c = db.prepare('SELECT COUNT(*) as cnt FROM posts WHERE niche_id=?').get(n.id);
      counts[n.id] = c.cnt;
    }
    // Prefer niches with fewer posts (inverse weight)
    const maxCount = Math.max(...Object.values(counts), 1);
    const weighted = niches.map((n) => ({ ...n, weight: maxCount - counts[n.id] + 1 }));
    const totalWeight = weighted.reduce((s, n) => s + n.weight, 0);
    let r = Math.random() * totalWeight;
    for (const n of weighted) {
      r -= n.weight;
      if (r <= 0) { niche = n; break; }
    }
    if (!niche) niche = niches[0];
  }

  console.log(`\n📝 Generating post for niche: ${niche.name}`);

  // Get existing titles to avoid duplicates
  const existing = db.prepare('SELECT title FROM posts WHERE niche_id=? ORDER BY created_at DESC LIMIT 30').all(niche.id);
  const existingTitles = existing.map((e) => e.title);

  // Step 1: Generate topic
  console.log('  🎯 Generating topic...');
  const topic = await generateTopic(niche, existingTitles);
  console.log(`  📌 Title: ${topic.title}`);

  // Step 2: Fetch hero image
  console.log('  🖼️  Fetching image...');
  const image = await getHeroImage(topic.imageQuery || topic.keyword);

  // Step 3: Generate full content
  console.log('  ✍️  Writing article (this takes ~30s)...');
  const content = await generateContent(topic, niche);
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.max(3, Math.ceil(wordCount / 250));

  // Step 4: Check slug uniqueness
  let slug = topic.slug.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 120);
  const existingSlug = db.prepare('SELECT id FROM posts WHERE slug=?').get(slug);
  if (existingSlug) slug = slug + '-' + Date.now().toString(36);

  // Step 5: Save to DB
  db.prepare(`
    INSERT INTO posts (slug, title, excerpt, content, niche_id, tags, image_url, image_alt, reading_time, meta_title, meta_description, market, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
  `).run(
    slug,
    topic.title,
    topic.excerpt,
    content,
    niche.id,
    (topic.tags || []).join(', '),
    image.url,
    image.alt || topic.title,
    readingTime,
    topic.title,
    topic.excerpt || topic.title,
    niche.market || 'global',
  );

  // Log
  db.prepare('INSERT INTO generation_log (niche_id, topic, status) VALUES (?, ?, ?)').run(niche.id, topic.title, 'success');

  console.log(`  ✅ Published: /post/${slug}`);
  console.log(`     ${wordCount} words · ${readingTime} min read · Image: ${image.url ? '✓' : '✗'}`);
  console.log('');
}

try {
  await run();
} catch (err) {
  console.error('❌ Generation failed:', err.message);
  try {
    db.prepare('INSERT INTO generation_log (topic, status, error) VALUES (?, ?, ?)').run('unknown', 'failed', err.message);
  } catch {}
  process.exit(1);
}
