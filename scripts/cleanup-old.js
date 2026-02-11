const { getDb } = require('../lib/db.js');
const db = getDb();

// Delete posts from removed/irrelevant niches and old 2024/2025 content
const toDelete = [1, 2, 3, 4, 5]; // insurance(old), health(removed), education x2(removed), finance(2024 guide)
console.log('\n🗑️  Deleting old/irrelevant posts...');
for (const id of toDelete) {
  const post = db.prepare('SELECT id, title FROM posts WHERE id=?').get(id);
  if (post) {
    db.prepare('DELETE FROM posts WHERE id=?').run(id);
    console.log(`  ❌ Deleted [${id}]: ${post.title}`);
  }
}

// Also clean up old niches that no longer exist in seed
const oldNiches = ['insurance', 'health', 'education', 'banking', 'indian-real-estate', 'real-estate', 'legal', 'personal-finance', 'us-tax'];
console.log('\n🧹 Deactivating old niches...');
for (const id of oldNiches) {
  const result = db.prepare('UPDATE niches SET is_active=0 WHERE id=?').run(id);
  if (result.changes > 0) console.log(`  🚫 Deactivated: ${id}`);
}

// Verify remaining
const remaining = db.prepare('SELECT id, title, niche_id FROM posts ORDER BY id').all();
console.log(`\n✅ Remaining posts: ${remaining.length}`);
remaining.forEach(p => console.log(`  [${p.id}] ${p.niche_id} — ${p.title}`));

const activeNiches = db.prepare('SELECT id, name FROM niches WHERE is_active=1 ORDER BY id').all();
console.log(`\n✅ Active niches: ${activeNiches.length}`);
activeNiches.forEach(n => console.log(`  ${n.id}: ${n.name}`));
