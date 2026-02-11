import { getDb } from '../../../../lib/db';
import { AdUnit, InArticleAd } from '@/components/AdSense';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { remark } from 'remark';
import html from 'remark-html';

export const revalidate = 3600; // 1 hour — article content rarely changes

export async function generateStaticParams() {
  const db = getDb();
  const posts = db.prepare("SELECT slug FROM posts WHERE status='published' LIMIT 500").all();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const db = getDb();
  const post = db.prepare("SELECT * FROM posts WHERE slug=? AND status='published'").get(params.slug);
  if (!post) return {};
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: post.image_url ? [{ url: post.image_url, width: 1200, height: 630, alt: post.image_alt || post.title }] : [],
      type: 'article',
      publishedTime: post.created_at,
    },
  };
}

async function markdownToHtml(md) {
  const result = await remark().use(html, { sanitize: false }).process(md);
  return result.toString();
}

function insertAdsInContent(htmlContent) {
  // Insert an in-article ad placeholder after every 3rd paragraph
  const parts = htmlContent.split('</p>');
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    out.push(parts[i]);
    if (i < parts.length - 1) out.push('</p>');
    if ((i + 1) % 4 === 0 && i < parts.length - 2) {
      out.push('<div class="ad-inline-marker"></div>');
    }
  }
  return out.join('');
}

export default async function PostPage({ params }) {
  const db = getDb();
  const post = db.prepare("SELECT * FROM posts WHERE slug=? AND status='published'").get(params.slug);
  if (!post) notFound();

  // Bump view count (fire-and-forget)
  try { db.prepare("UPDATE posts SET views = views + 1 WHERE id=?").run(post.id); } catch {}

  const contentHtml = await markdownToHtml(post.content || '');
  const withAds = insertAdsInContent(contentHtml);

  // Related posts
  const related = db.prepare(
    "SELECT * FROM posts WHERE niche_id=? AND id!=? AND status='published' ORDER BY created_at DESC LIMIT 4"
  ).all(post.niche_id, post.id);

  const tags = post.tags ? post.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  return (
    <article className="container-blog py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <Link href={`/category/${post.niche_id}`} className="hover:text-brand-600 capitalize">{(post.niche_id || '').replace('-', ' ')}</Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-[200px]">{post.title}</span>
      </nav>

      {/* Ad before article */}
      <AdUnit slot="" className="mb-8" />

      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="badge badge-blue capitalize">{(post.niche_id || 'general').replace('-', ' ')}</span>
          <span className="text-sm text-gray-400">{post.reading_time || 5} min read</span>
          <span className="text-sm text-gray-400">{post.views || 0} views</span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-gray-500 leading-relaxed">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-4 mt-6 text-sm text-gray-400">
          <span className="font-medium text-gray-600">{post.author || 'Editorial Team'}</span>
          <time>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
        </div>
      </header>

      {/* Featured image */}
      {post.image_url && (
        <div className="max-w-4xl mx-auto mb-10 relative aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={post.image_url}
            alt={post.image_alt || post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      )}

      {/* Article body */}
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-10">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: withAds }}
          />
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="sticky top-20 space-y-6">
            <AdUnit slot="" />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-bold text-sm text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span key={t} className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200">{t}</span>
                  ))}
                </div>
              </div>
            )}

            <AdUnit slot="" />
          </div>
        </aside>
      </div>

      {/* Ad after article */}
      <div className="max-w-4xl mx-auto mt-10">
        <AdUnit slot="" />
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {related.map((r) => (
              <Link key={r.id} href={`/post/${r.slug}`} className="card p-5 group">
                <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">{r.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{r.excerpt}</p>
                <div className="mt-3 text-xs text-gray-400">{r.reading_time || 5} min read</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt || post.meta_description,
            image: post.image_url ? [post.image_url] : [],
            author: {
              '@type': 'Person',
              name: post.author || 'Editorial Team',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            },
            datePublished: new Date(post.created_at).toISOString(),
            dateModified: new Date(post.updated_at || post.created_at).toISOString(),
            publisher: {
              '@type': 'Organization',
              name: 'Info Bytes',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              logo: { '@type': 'ImageObject', url: '/icon.svg' },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${process.env.NEXT_PUBLIC_SITE_URL || ''}/post/${post.slug}`,
            },
            wordCount: (post.content || '').split(/\s+/).length,
            articleSection: (post.niche_id || '').replace(/-/g, ' '),
            keywords: post.tags || '',
            inLanguage: 'en',
          }),
        }}
      />

      {/* BreadcrumbList structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_SITE_URL || '/' },
              { '@type': 'ListItem', position: 2, name: (post.niche_id || 'general').replace(/-/g, ' '), item: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/category/${post.niche_id}` },
              { '@type': 'ListItem', position: 3, name: post.title },
            ],
          }),
        }}
      />
    </article>
  );
}
