'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminShell } from '../page';

const MARKET_FLAGS = { india: '🇮🇳', us: '🇺🇸', global: '🌍' };

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ status: 'all', market: 'all', niche: 'all', search: '' });
  const [niches, setNiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '15' });
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.market !== 'all') params.set('market', filters.market);
    if (filters.niche !== 'all') params.set('niche', filters.niche);
    if (filters.search) params.set('search', filters.search);

    const res = await fetch(`/api/posts?${params}`);
    const data = await res.json();
    setPosts(data.posts || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, [page, filters]);

  useEffect(() => {
    fetch('/api/niches').then(r => r.json()).then(d => setNiches(d.niches || []));
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const updateStatus = async (id, status) => {
    setActionLoading(id);
    await fetch(`/api/posts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    await fetchPosts();
    setActionLoading(null);
  };

  const deletePost = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setActionLoading(id);
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    await fetchPosts();
    setActionLoading(null);
  };

  const toggleTrending = async (id, current) => {
    await fetch(`/api/posts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_trending: !current }) });
    await fetchPosts();
  };

  return (
    <AdminShell active="posts">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">All Posts</h1>
            <p className="text-sm text-gray-500">{total} posts total</p>
          </div>
          <Link href="/admin/posts/new" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
            + New Post
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search posts..."
              value={filters.search}
              onChange={(e) => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
              className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <select value={filters.status} onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select value={filters.market} onChange={(e) => { setFilters(f => ({ ...f, market: e.target.value })); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="all">All Markets</option>
              <option value="india">🇮🇳 India</option>
              <option value="us">🇺🇸 US</option>
              <option value="global">🌍 Global</option>
            </select>
            <select value={filters.niche} onChange={(e) => { setFilters(f => ({ ...f, niche: e.target.value })); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="all">All Niches</option>
              {niches.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-gray-500 font-medium">No posts found</p>
              <Link href="/admin/posts/new" className="text-sm text-brand-600 hover:underline mt-2 block">Create your first post</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 w-8">#</th>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Market</th>
                  <th className="text-left px-4 py-3">Niche</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Views</th>
                  <th className="text-right px-4 py-3">Date</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-400">{p.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.is_trending ? <span title="Trending">🔥</span> : null}
                        <Link href={`/admin/posts/${p.id}`} className="font-medium text-gray-900 hover:text-brand-600 line-clamp-1">
                          {p.title}
                        </Link>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.reading_time}m read · /{p.slug}</div>
                    </td>
                    <td className="px-4 py-3">{MARKET_FLAGS[p.market] || '🌍'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{p.niche_name || p.niche_id || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{(p.views || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/posts/${p.id}`} className="text-gray-400 hover:text-brand-600 p-1" title="Edit">✏️</Link>
                        <button onClick={() => toggleTrending(p.id, p.is_trending)} className="text-gray-400 hover:text-orange-500 p-1" title="Toggle Trending">
                          {p.is_trending ? '🔥' : '⭐'}
                        </button>
                        {p.status === 'draft' ? (
                          <button onClick={() => updateStatus(p.id, 'published')} disabled={actionLoading === p.id}
                            className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-100 disabled:opacity-50">
                            Publish
                          </button>
                        ) : (
                          <button onClick={() => updateStatus(p.id, 'draft')} disabled={actionLoading === p.id}
                            className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-100 disabled:opacity-50">
                            Unpublish
                          </button>
                        )}
                        <button onClick={() => deletePost(p.id, p.title)} disabled={actionLoading === p.id}
                          className="text-gray-400 hover:text-red-500 p-1 disabled:opacity-50" title="Delete">🗑️</button>
                        <Link href={`/post/${p.slug}`} target="_blank" className="text-gray-400 hover:text-brand-600 p-1" title="View">👁️</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              ← Prev
            </button>
            <span className="text-sm text-gray-500">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Next →
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
