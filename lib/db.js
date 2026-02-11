const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'data', 'blog.db');

let db;

function getDb() {
  if (db) return db;

  const fs = require('fs');
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initTables(db);
  return db;
}

function initTables(db) {
  // Create base tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS niches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      avg_cpc REAL DEFAULT 0,
      keywords TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      niche_id TEXT,
      tags TEXT,
      image_url TEXT,
      image_alt TEXT,
      author TEXT DEFAULT 'Editorial Team',
      reading_time INTEGER DEFAULT 5,
      status TEXT DEFAULT 'published',
      meta_title TEXT,
      meta_description TEXT,
      views INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (niche_id) REFERENCES niches(id)
    );

    CREATE TABLE IF NOT EXISTS generation_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      niche_id TEXT,
      topic TEXT,
      status TEXT DEFAULT 'success',
      error TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Add new columns to existing tables (safe via try/catch)
  const addCol = (table, col, def) => {
    try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`); } catch (e) { /* already exists */ }
  };
  addCol('posts', 'market', "TEXT DEFAULT 'global'");
  addCol('posts', 'is_trending', 'INTEGER DEFAULT 0');
  addCol('posts', 'source_url', 'TEXT');
  addCol('niches', 'market', "TEXT DEFAULT 'global'");

  // Create indexes (after columns exist)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    CREATE INDEX IF NOT EXISTS idx_posts_niche ON posts(niche_id);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_market ON posts(market);
    CREATE INDEX IF NOT EXISTS idx_posts_trending ON posts(is_trending);
  `);
}

module.exports = { getDb };
