#!/usr/bin/env node

/**
 * Auto-scheduler: runs as a background process and generates posts on a cron schedule.
 *
 * Usage:
 *   node scripts/auto-scheduler.mjs
 *
 * Configure in .env.local:
 *   AUTO_POST_CRON=0 * /6 * * *   (every 6 hours)
 *   POSTS_PER_BATCH=3
 */

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import cron from 'node-cron';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });

const schedule = process.env.AUTO_POST_CRON || '0 */6 * * *';
const count = parseInt(process.env.POSTS_PER_BATCH || '3');

console.log(`\n🤖 Auto-Blog Scheduler Started`);
console.log(`   Schedule: ${schedule}`);
console.log(`   Posts per batch: ${count}`);
console.log(`   Press Ctrl+C to stop\n`);

function runBatch() {
  console.log(`\n⏰ [${new Date().toISOString()}] Running batch generation...`);
  try {
    execSync(`node scripts/batch-generate.mjs --count=${count}`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch (err) {
    console.error('Batch failed:', err.message);
  }
}

// Validate cron expression
if (!cron.validate(schedule)) {
  console.error(`❌ Invalid cron expression: ${schedule}`);
  process.exit(1);
}

cron.schedule(schedule, runBatch);

console.log('✅ Scheduler is running. Waiting for next trigger...\n');

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n👋 Scheduler stopped.');
  process.exit(0);
});
