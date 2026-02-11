import { getDb } from '../../lib/db';
import { PostCard, FeaturedPostCard } from '@/components/PostCard';
import { AdUnit } from '@/components/AdSense';
import Link from 'next/link';

export const revalidate = 300; // ISR: revalidate every 5 min

function getPosts() {
  const db = getDb();
  const featured = db.prepare("SELECT * FROM posts WHERE status='published' ORDER BY views DESC, created_at DESC LIMIT 1").get();
  const recent = db.prepare("SELECT * FROM posts WHERE status='published' ORDER BY created_at DESC LIMIT 13").all();
  const niches = db.prepare("SELECT * FROM niches WHERE is_active=1 ORDER BY avg_cpc DESC").all();
  return { featured, recent, niches };
}

export default function HomePage() {
  const { featured, recent, niches } = getPosts();

  // Exclude featured from grid
  const grid = recent.filter((p) => !featured || p.id !== featured.id).slice(0, 12);

  return (
    <div className="container-blog py-8">
      {/* Hero */}
      <section className="mb-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            ⚡ {process.env.NEXT_PUBLIC_SITE_NAME || 'Info Bytes'}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Trending news, movie reviews, finance updates & bite-sized insights — updated daily.
          </p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {niches.map((n) => (
            <Link key={n.id} href={`/category/${n.id}`}
              className="badge badge-blue hover:bg-brand-100 transition-colors">
              {n.name}
            </Link>
          ))}
        </div>

        {/* Featured post */}
        {featured && <FeaturedPostCard post={featured} />}
      </section>

      {/* Ad after hero */}
      <AdUnit slot="" className="mb-10" />

      {/* Post grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grid.map((post, i) => (
            <div key={post.id}>
              <PostCard post={post} />
              {/* Insert ad every 6 posts */}
              {(i + 1) % 6 === 0 && <AdUnit slot="" className="mt-6" />}
            </div>
          ))}
        </div>

        {grid.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-lg font-medium">No posts yet!</p>
            <p className="text-sm mt-2">Run <code className="bg-gray-100 px-2 py-1 rounded">npm run generate</code> to create your first AI-generated post.</p>
          </div>
        )}
      </section>
    </div>
  );
}
