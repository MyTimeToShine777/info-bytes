/**
 * Backend API client for the auto-blog frontend.
 * Replaces direct SQLite access with fetch calls to the trading backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://trade-api-81q6.onrender.com/api/blog';

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    next: { revalidate: options.revalidate ?? 300 },
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    console.error(`[API] ${res.status} ${res.statusText} — ${url}`);
    return null;
  }
  return res.json();
}

// ── Post queries ──

export async function getFeaturedPost() {
  const data = await apiFetch('/posts/featured');
  return data?.post || null;
}

export async function getRecentPosts(limit = 13) {
  const data = await apiFetch(`/posts/recent?limit=${limit}`);
  return data?.posts || [];
}

export async function getPostBySlug(slug) {
  const data = await apiFetch(`/posts/${slug}`, { revalidate: 3600 });
  return data || null;
}

export async function getPostsByCategory(nicheId, page = 1) {
  const data = await apiFetch(`/posts/by-category/${nicheId}?page=${page}`);
  return data || { niche: null, posts: [], total: 0, page: 1, pages: 0 };
}

export async function getAllSlugs() {
  const data = await apiFetch('/posts/all-slugs');
  return data?.slugs || [];
}

export async function searchPosts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await apiFetch(`/posts?${query}`);
  return data || { posts: [], total: 0, page: 1, pages: 0 };
}

// ── Niche queries ──

export async function getNiches() {
  const data = await apiFetch('/niches');
  return data?.niches || [];
}

// ── Stats ──

export async function getStats() {
  const data = await apiFetch('/stats');
  return data || {};
}
