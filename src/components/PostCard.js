import Image from 'next/image';
import Link from 'next/link';

export function PostCard({ post }) {
  const niche = post.niche_id || 'general';
  const nicheColors = {
    finance: 'badge-blue',
    insurance: 'badge-purple',
    technology: 'badge-green',
    health: 'badge-orange',
    'real-estate': 'badge-blue',
    education: 'badge-green',
    crypto: 'badge-purple',
    legal: 'badge-orange',
  };

  return (
    <Link href={`/post/${post.slug}`} className="card group flex flex-col">
      {/* Image */}
      <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.image_alt || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gradient-to-br from-brand-100 to-brand-200">
            📝
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className={`badge ${nicheColors[niche] || 'badge-blue'}`}>
            {niche.replace('-', ' ')}
          </span>
          <span className="text-xs text-gray-400">{post.reading_time || 5} min read</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
          {post.title}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-3 flex-1">{post.excerpt}</p>
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
          <span>{post.author || 'Editorial Team'}</span>
          <time>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedPostCard({ post }) {
  return (
    <Link href={`/post/${post.slug}`} className="card group md:flex">
      <div className="relative md:w-1/2 aspect-[16/9] md:aspect-auto bg-gray-100 overflow-hidden">
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.image_alt || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-br from-brand-100 to-brand-200">📝</div>
        )}
      </div>
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
        <span className="badge badge-blue w-fit mb-3">{(post.niche_id || 'general').replace('-', ' ')}</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-3">
          {post.title}
        </h2>
        <p className="text-gray-500 line-clamp-3 mb-4">{post.excerpt}</p>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{post.reading_time || 5} min read</span>
          <time>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
        </div>
      </div>
    </Link>
  );
}
