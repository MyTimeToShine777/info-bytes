'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const MARKET_FLAGS = { india: '🇮🇳', us: '🇺🇸', global: '🌍' };
const MARKET_LABELS = { india: 'India', us: 'US', global: 'Global' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(data => { setStats(data); setLoading(false); });
  }, []);

  if (loading) return <AdminShell active="dashboard"><LoadingGrid /></AdminShell>;

  return (
    <AdminShell active="dashboard">
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Posts', value: stats.totalPosts, icon: '📝', color: 'bg-blue-50 text-blue-700' },
            { label: 'Published', value: stats.publishedPosts, icon: '✅', color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Drafts', value: stats.draftPosts, icon: '📋', color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Total Views', value: (stats.totalViews || 0).toLocaleString(), icon: '👁️', color: 'bg-purple-50 text-purple-700' },
            { label: 'Est. Revenue/mo', value: `$${stats.estimatedRevenue}`, icon: '💰', color: 'bg-green-50 text-green-700' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-sm opacity-75">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Market Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['india', 'us', 'global'].map(m => {
            const data = stats.marketBreakdown?.find(x => x.market === m);
            return (
              <div key={m} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{MARKET_FLAGS[m]}</span>
                  <h3 className="font-bold text-gray-900">{MARKET_LABELS[m]} Market</h3>
                </div>
                <div className="text-3xl font-extrabold text-gray-900">{data?.count || 0}</div>
                <div className="text-sm text-gray-500">published posts · {(data?.views || 0).toLocaleString()} views</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/posts/new" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              ✏️ Write New Post
            </Link>
            <Link href="/admin/generate" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              🤖 AI Generate Post
            </Link>
            <Link href="/admin/posts" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              📄 Manage Posts
            </Link>
            <Link href="/admin/niches" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              🏷️ Manage Niches
            </Link>
          </div>
        </div>

        {/* Niches Table */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Niches by Market & CPC</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Market</th>
                  <th className="text-left px-4 py-3">Niche</th>
                  <th className="text-right px-4 py-3">Avg CPC</th>
                  <th className="text-right px-4 py-3">Posts</th>
                  <th className="text-right px-4 py-3">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.nicheBreakdown?.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{MARKET_FLAGS[n.market] || '🌍'} {MARKET_LABELS[n.market] || 'Global'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{n.name}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-bold">${n.avg_cpc?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{n.post_count}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{(n.total_views || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generation Log */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Generation Log</h2>
          <div className="space-y-2">
            {stats.recentLogs?.length === 0 && (
              <p className="text-gray-400 text-center py-6">No generation logs yet</p>
            )}
            {stats.recentLogs?.slice(0, 10).map((l) => (
              <div key={l.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 text-sm">
                <span>{l.status === 'success' ? '✅' : '❌'}</span>
                <span className="text-gray-700 flex-1 truncate">{l.topic || '(unknown)'}</span>
                <span className="text-xs text-gray-400 capitalize">{l.niche_id}</span>
                <time className="text-xs text-gray-400">{new Date(l.created_at).toLocaleString()}</time>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

/* ─── Admin Shell with Sidebar ─── */
export function AdminShell({ children, active }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/admin' },
    { id: 'posts', label: 'All Posts', icon: '📄', href: '/admin/posts' },
    { id: 'new-post', label: 'Write Post', icon: '✏️', href: '/admin/posts/new' },
    { id: 'generate', label: 'AI Generate', icon: '🤖', href: '/admin/generate' },
    { id: 'niches', label: 'Niches', icon: '🏷️', href: '/admin/niches' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-900">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        <h1 className="font-bold text-gray-900">Admin Panel</h1>
        <Link href="/" className="text-sm text-brand-600">View Blog →</Link>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 bg-white border-r border-gray-200 min-h-screen fixed lg:sticky top-0 z-40`}>
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-extrabold text-gray-900">Blog Admin</h1>
            <p className="text-xs text-gray-400 mt-1">Content Management System</p>
          </div>
          <nav className="p-4 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active === item.id
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600">
              ← View Live Blog
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 max-w-6xl">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="bg-gray-100 rounded-2xl p-5 animate-pulse h-28" />
      ))}
    </div>
  );
}
