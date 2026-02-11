#!/usr/bin/env node

/**
 * Seed high-paying AdSense niches into the database.
 *
 * These are the top niches ranked by average Google Ads CPC.
 * More posts in these niches = higher ad revenue per click.
 */

import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });

const { getDb } = await import(pathToFileURL(path.join(__dirname, '..', 'lib', 'db.js')).href);
const db = getDb();

const niches = [
  // === MOVIES & ENTERTAINMENT ===
  {
    id: 'movies',
    name: 'Movies',
    description: 'Latest movie reviews, box office updates, upcoming releases, and film analysis.',
    avg_cpc: 3.50,
    market: 'global',
    keywords: 'new movie releases 2026, best movies 2026, movie reviews, box office collection, upcoming movies, hollywood movies, bollywood movies, movie ratings, oscar nominations, best sci-fi movies',
  },
  {
    id: 'tv-series',
    name: 'TV Series',
    description: 'Latest TV show reviews, streaming series, season updates, and binge-worthy recommendations.',
    avg_cpc: 3.00,
    market: 'global',
    keywords: 'best tv series 2026, netflix new shows, amazon prime series, hbo max shows, disney plus series, best thriller series, top 10 tv shows, season premiere dates, tv show reviews, streaming recommendations',
  },
  {
    id: 'bollywood',
    name: 'Bollywood & Indian Cinema',
    description: 'Bollywood movies, south Indian films, OTT releases, and Indian entertainment news.',
    avg_cpc: 2.50,
    market: 'india',
    keywords: 'bollywood new movies 2026, south indian movies, ott release this week, bollywood box office, upcoming bollywood movies, netflix india movies, tamil movies 2026, telugu movies latest, web series hindi, jio cinema movies',
  },
  {
    id: 'hollywood',
    name: 'Hollywood & Global Cinema',
    description: 'Hollywood blockbusters, Marvel/DC updates, Oscar contenders, and international films.',
    avg_cpc: 4.00,
    market: 'us',
    keywords: 'hollywood movies 2026, marvel phase 6, dc universe movies, oscar predictions 2026, best action movies, horror movies 2026, sci-fi movies upcoming, movie trailers latest, imdb top rated, rotten tomatoes scores',
  },
  {
    id: 'ott-streaming',
    name: 'OTT & Streaming',
    description: 'Netflix, Amazon Prime, Disney+, HBO Max — new releases, comparisons, and reviews.',
    avg_cpc: 3.50,
    market: 'global',
    keywords: 'netflix new releases this week, amazon prime best movies, disney plus upcoming, hbo max shows 2026, best streaming service comparison, apple tv plus series, peacock originals, crunchyroll anime, ott subscription plans, free streaming movies',
  },
  {
    id: 'trending',
    name: 'Trending News',
    description: 'Today\'s trending topics, viral stories, breaking news, and what\'s buzzing on the internet.',
    avg_cpc: 2.00,
    market: 'global',
    keywords: 'trending news today, viral stories, breaking news, google trending searches, twitter trending, what happened today, latest news updates, trending topics, popular news today, current events',
  },

  // === INDIAN MARKET ===
  {
    id: 'indian-stocks',
    name: 'Indian Stock Market',
    description: 'NSE, BSE, Nifty 50, Sensex, IPOs, SEBI regulations, FII/DII flows, and Indian equity analysis.',
    avg_cpc: 6.00,
    market: 'india',
    keywords: 'nifty 50 analysis today, best stocks to buy india, ipo listing today, sensex prediction, midcap stocks india, sebi new rules, fii dii data, indian stock market crash, penny stocks india, nse bse live',
  },
  {
    id: 'mutual-funds',
    name: 'Mutual Funds India',
    description: 'SIP plans, ELSS, debt funds, hybrid funds, AMC comparisons, and mutual fund taxation in India.',
    avg_cpc: 7.50,
    market: 'india',
    keywords: 'best sip plans 2026, elss tax saving mutual funds, mutual fund returns comparison, sbi mutual fund, hdfc mutual fund, axis mutual fund, flexi cap fund, index fund india, mutual fund taxation, lumpsum vs sip',
  },
  {
    id: 'tax-planning',
    name: 'Tax Planning India',
    description: 'Income tax saving, ITR filing, Section 80C/80D, GST, HRA exemption, and Indian tax strategies.',
    avg_cpc: 8.00,
    market: 'india',
    keywords: 'income tax saving tips, section 80c deductions, itr filing online, new tax regime vs old, hra exemption calculation, capital gains tax india, gst latest news, tax saving fd, nps tax benefit, ltcg stcg tax',
  },
  {
    id: 'indian-insurance',
    name: 'Insurance India',
    description: 'LIC plans, health insurance, term insurance, motor insurance, IRDAI regulations in India.',
    avg_cpc: 10.00,
    market: 'india',
    keywords: 'best term insurance plan india, lic new plan, health insurance family floater, star health insurance, car insurance renewal online, irdai new rules, mediclaim policy comparison, critical illness cover india, group health insurance, insurance claim process',
  },

  // === US MARKET ===
  {
    id: 'us-stocks',
    name: 'US Stock Market',
    description: 'S&P 500, NASDAQ, Dow Jones, US IPOs, SEC filings, earnings reports, and American equity analysis.',
    avg_cpc: 9.00,
    market: 'us',
    keywords: 'best stocks to buy now, s&p 500 forecast, nasdaq today, dow jones prediction, us stock market crash, tech stocks to buy, dividend stocks, growth stocks 2026, pre market movers, after hours trading',
  },
  {
    id: 'us-insurance',
    name: 'Insurance US',
    description: 'Health insurance, Medicare, auto insurance, life insurance, and ACA marketplace in the US.',
    avg_cpc: 14.00,
    market: 'us',
    keywords: 'best health insurance plans, medicare enrollment, car insurance comparison, term life insurance quotes, home insurance, aca marketplace, dental insurance, disability insurance, umbrella insurance, insurance deductible explained',
  },

  // === GLOBAL ===
  {
    id: 'finance',
    name: 'Finance & Investing',
    description: 'Personal finance, stock market investing, mutual funds, tax planning, and wealth building strategies.',
    avg_cpc: 8.50,
    market: 'global',
    keywords: 'best investment plans, how to invest money, stock market for beginners, portfolio management, compound interest calculator, index funds vs mutual funds, financial planning tips, passive income ideas, wealth building strategies, retirement planning',
  },
  {
    id: 'technology',
    name: 'Technology & AI',
    description: 'AI tools, software reviews, gadgets, cybersecurity, and tech news.',
    avg_cpc: 6.50,
    market: 'global',
    keywords: 'best ai tools 2026, chatgpt alternatives, cybersecurity tips, cloud hosting comparison, vpn comparison, ai image generator, best laptops 2026, smartphone reviews, tech news today, ai trends 2026',
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency & Blockchain',
    description: 'Bitcoin, Ethereum, DeFi, NFTs, crypto trading, and blockchain technology explained.',
    avg_cpc: 7.00,
    market: 'global',
    keywords: 'bitcoin price prediction, best crypto exchange, ethereum staking guide, defi explained, crypto tax guide, bitcoin vs ethereum, blockchain technology uses, crypto wallet security, altcoin investing strategy, web3 trends',
  },
];

console.log('🌱 Seeding niches...\n');

const stmt = db.prepare(`
  INSERT OR REPLACE INTO niches (id, name, description, avg_cpc, keywords, market, is_active)
  VALUES (?, ?, ?, ?, ?, ?, 1)
`);

for (const n of niches) {
  stmt.run(n.id, n.name, n.description, n.avg_cpc, n.keywords, n.market || 'global');
  const flag = n.market === 'india' ? '🇮🇳' : n.market === 'us' ? '🇺🇸' : '🌍';
  console.log(`  ✅ ${flag} ${n.name} (Avg CPC: $${n.avg_cpc.toFixed(2)})`);
}

console.log(`\n🎯 ${niches.length} niches seeded.`);
console.log('   Run: npm run generate   — to create your first AI post.\n');
