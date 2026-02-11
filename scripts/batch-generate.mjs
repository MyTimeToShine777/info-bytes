#!/usr/bin/env node

/**
 * Batch-generate multiple AI blog posts at once.
 *
 * Usage:
 *   node scripts/batch-generate.mjs           # default: 3 posts
 *   node scripts/batch-generate.mjs --count=5 # 5 posts
 */

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });

const countArg = process.argv.find((a) => a.startsWith('--count='));
const count = countArg ? parseInt(countArg.split('=')[1]) : parseInt(process.env.POSTS_PER_BATCH || '3');

console.log(`\n🚀 Batch generating ${count} posts...\n`);

for (let i = 1; i <= count; i++) {
  console.log(`━━━ Post ${i}/${count} ━━━`);
  try {
    execSync('node scripts/generate-post.mjs', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch (err) {
    console.error(`⚠️  Post ${i} failed, continuing...`);
  }

  // Small delay between posts to be respectful to APIs
  if (i < count) {
    console.log('  ⏳ Waiting 5s before next post...');
    await new Promise((r) => setTimeout(r, 5000));
  }
}

console.log(`\n✅ Batch complete! Generated up to ${count} posts.\n`);
