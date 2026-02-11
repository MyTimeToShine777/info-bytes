import { getPostsByCategory, getNiches } from '../../../../lib/api';
import { PostCard } from '@/components/PostCard';
import { AdUnit } from '@/components/AdSense';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 300;

export async function generateStaticParams() {
  const niches = await getNiches();
  return niches.filter(n => n.is_active).map((n) => ({ slug: n.id }));
}

export async function generateMetadata({ params }) {
  const data = await getPostsByCategory(params.slug);
  const niche = data?.niche;
  if (!niche) return {};
  return {
    title: `${niche.name} Articles`,
    description: niche.description || `Read expert ${niche.name} articles, guides, and insights.`,
  };
}

export default async function CategoryPage({ params }) {
  const data = await getPostsByCategory(params.slug);
  if (!data?.niche) notFound();

  const niche = data.niche;
  const posts = data.posts || [];

  return (
    <div className="container-blog py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{niche.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{niche.name}</h1>
        {niche.description && <p className="text-gray-500 text-lg max-w-3xl">{niche.description}</p>}
        {niche.avg_cpc > 0 && (
          <span className="inline-block mt-3 badge badge-green">High-value niche · Avg CPC ${niche.avg_cpc.toFixed(2)}</span>
        )}
      </div>

      <AdUnit slot="" className="mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, i) => (
          <div key={post.id}>
            <PostCard post={post} />
            {(i + 1) % 6 === 0 && <AdUnit slot="" className="mt-6" />}
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📂</p>
          <p className="text-lg">No articles in this category yet.</p>
        </div>
      )}
    </div>
  );
}
