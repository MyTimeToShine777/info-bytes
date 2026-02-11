const path = require('path');
const { getDb } = require(path.join(__dirname, '..', 'lib', 'db'));
const db = getDb();

// Update posts market based on their niche
db.exec(`
  UPDATE posts SET market = (
    SELECT market FROM niches WHERE niches.id = posts.niche_id
  ) WHERE niche_id IS NOT NULL
`);

const results = db.prepare('SELECT market, COUNT(*) as c FROM posts GROUP BY market').all();
console.log('Posts by market:', results);

const total = db.prepare('SELECT COUNT(*) as c FROM posts').get();
console.log('Total posts:', total.c);
