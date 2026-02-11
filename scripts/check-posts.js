const { getDb } = require('../lib/db.js');
const db = getDb();
const posts = db.prepare('SELECT id, title, niche_id, created_at FROM posts ORDER BY id').all();
console.log(`\nTotal posts: ${posts.length}\n`);
posts.forEach(p => console.log(`  [${p.id}] ${p.niche_id} — ${p.title}`));
console.log('\nNiches with post counts:');
const niches = db.prepare('SELECT n.id, n.name, COUNT(p.id) as cnt FROM niches n LEFT JOIN posts p ON p.niche_id=n.id GROUP BY n.id ORDER BY cnt DESC').all();
niches.forEach(n => console.log(`  ${n.id}: ${n.cnt} posts (${n.name})`));
