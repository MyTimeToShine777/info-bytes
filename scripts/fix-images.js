const { getDb } = require('../lib/db.js');
const db = getDb();

// Find posts with broken image URLs
const posts = db.prepare('SELECT id, title, image_url FROM posts WHERE image_url LIKE ?').all('%photo-1504711434969%');
console.log(`Found ${posts.length} posts with broken image URL`);

// Also check for other broken ones
const allPosts = db.prepare('SELECT id, title, image_url FROM posts').all();

const brokenIds = [
  'photo-1504711434969-e33886168d5c',
  'photo-1440404653325-ab127d49abc1',
  'photo-1522869635100-9f4c5e86aa37',
  'photo-1626070131568-b8f3de9b3093',
  'photo-1450101499163-c8848e968456',
];

// Replace broken IDs with valid ones
const replacement = 'photo-1495020689067-958852a7765e'; // valid trending image

for (const post of allPosts) {
  if (!post.image_url) continue;
  let needsUpdate = false;
  let newUrl = post.image_url;
  for (const broken of brokenIds) {
    if (post.image_url.includes(broken)) {
      newUrl = post.image_url.replace(broken, replacement);
      needsUpdate = true;
      break;
    }
  }
  if (needsUpdate) {
    db.prepare('UPDATE posts SET image_url=? WHERE id=?').run(newUrl, post.id);
    console.log(`  Fixed image for post [${post.id}]: ${post.title}`);
  }
}

console.log('\nAll post images:');
db.prepare('SELECT id, title, image_url FROM posts').all().forEach(p => {
  console.log(`  [${p.id}] ${p.image_url ? p.image_url.substring(0, 80) : 'NO IMAGE'}`);
});
