import { getAllSlugs, getNiches } from '../../lib/api';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://info-bytes.vercel.app';

  // Get all post slugs
  let postUrls = [];
  try {
    const slugs = await getAllSlugs();
    postUrls = slugs.map(slug => ({
      url: `${baseUrl}/post/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (e) {
    console.error('Sitemap: failed to fetch slugs', e);
  }

  // Get all niche categories
  let categoryUrls = [];
  try {
    const niches = await getNiches();
    categoryUrls = (niches || []).map(n => ({
      url: `${baseUrl}/category/${n.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    }));
  } catch (e) {
    console.error('Sitemap: failed to fetch niches', e);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/category/trending`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categoryUrls,
    ...postUrls,
  ];
}
