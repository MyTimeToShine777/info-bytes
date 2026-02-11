'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuth } from './layout';

const MARKET_FLAGS = { india: '🇮🇳', us: '🇺🇸', global: '🌍' };
const MARKET_LABELS = { india: 'India', us: 'US', global: 'Global' };

export default function AdminDashboard() {
  const auth = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState('');

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(data => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function handleGenerate(count = 1) {
    setGenerating(true);
    setGenMsg(`Generating ${count} post(s)... This takes ~30-60s per post.`);
    try {
      const endpoint = count > 1 ? '/api/admin/generate-batch' : '/api/admin/generate';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: auth.password, count }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const n = data.posts ? data.posts.length : 1;
        setGenMsg(`✅ Generated ${n} post(s) successfully! Refresh to see them.`);
        setTimeout(() => { fetch('/api/stats').then(r => r.json()).then(d => setStats(d)); }, 2000);
      } else {
        setGenMsg(`❌ ${data.error || 'Generation failed'}`);
      }
    } catch (e) {
      setGenMsg(`❌ Error: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <AdminShell active="dashboard" onLogout={auth?.logout}><LoadingGrid /></AdminShell>;

  return (
    <AdminShell active="dashboard" onLogout={auth?.logout}>
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Posts', value: stats?.totalPosts || 0, icon: '📝', color: 'bg-blue-50 text-blue-700' },
            { label: 'Published', value: stats?.publishedPosts || 0, icon: '✅', color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Drafts', value: stats?.draftPosts || 0, icon: '📋', color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Total Views', value: (stats?.totalViews || 0).toLocaleString(), icon: '👁️', color: 'bg-purple-50 text-purple-700' },
            { label: 'Est. Revenue/mo', value: `$${stats?.estimatedRevenue || '0.00'}`, icon: '💰', color: 'bg-green-50 text-green-700' },
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
            const data = stats?.marketBreakdown?.find(x => x.market === m);
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

        {/* Quick Generate */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">🤖 AI Content Generation</h2>
          <p className="text-white/70 text-sm mb-4">Generate AI-powered blog posts instantly. Posts auto-generate every 6 hours via cron.</p>
          {genMsg && (
            <div className={`rounded-xl px-4 py-3 mb-4 text-sm font-medium ${genMsg.includes('✅') ? 'bg-green-500/20' : genMsg.includes('❌') ? 'bg-red-500/20' : 'bg-white/10'}`}>
              {genMsg}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => handleGenerate(1)} disabled={generating} className="bg-white/20 hover:bg-white/30 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {generating ? '⏳ Generating...' : '✨ Generate 1 Post'}
            </button>
            <button onClick={() => handleGenerate(3)} disabled={generating} className="bg-white/20 hover:bg-white/30 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              🚀 Generate 3 Posts
            </button>
            <button onClick={() => handleGenerate(5)} disabled={generating} className="bg-white/20 hover:bg-white/30 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              🔥 Generate 5 Posts
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/posts" className="bg-white border border-gray-200 hover:border-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 transition-colors">📄 Manage Posts</Link>
          <Link href="/admin/posts/new" className="bg-white border border-gray-200 hover:border-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 transition-colors">✏️ Write New Post</Link>
          <Link href="/admin/generate" className="bg-white border border-gray-200 hover:border-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 transition-colors">🤖 AI Generate</Link>
          <Link href="/admin/niches" className="bg-white border border-gray-200 hover:border-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 transition-colors">🏷️ View Niches</Link>
          <Link href="/" target="_blank" className="bg-white border border-gray-200 hover:border-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 transition-colors">🌐 View Blog</Link>
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
                {(stats?.nicheBreakdown || []).map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{MARKET_FLAGS[n.market] || '🌍'} {MARKET_LABELS[n.market] || 'Global'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{n.name}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-bold">${(n.avg_cpc || 0).toFixed(2)}</td>
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
            {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
              <p className="text-gray-400 text-center py-6">No generation logs yet — click "Generate" above!</p>
            )}
            {stats?.recentLogs?.slice(0, 10).map((l, i) => (
              <div key={l.id || i} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 text-sm">
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
export function AdminShell({ children, active, onLogout }) {
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
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-900">☰</button>
        <h1 className="font-bold text-gray-900">Admin</h1>
        <Link href="/" className="text-sm text-indigo-600">Blog →</Link>
      </div>
      <div className="flex">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 bg-white border-r border-gray-200 min-h-screen fixed lg:sticky top-0 z-40`}>
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-extrabold text-gray-900">Blog Admin</h1>
            <p className="text-xs text-gray-400 mt-1">Content Management</p>
          </div>
          <nav className="p-4 space-y-1">
            {nav.map(item => (
              <Link key={item.id} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 space-y-2">
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600">← View Blog</Link>
            {onLogout && <button onClick={onLogout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700">🔒 Logout</button>}
          </div>
        </aside>
        <main className="flex-1 p-6 lg:p-8 max-w-6xl">{children}</main>
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}

function LoadingGrid() {
  return <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{[1,2,3,4,5].map(i => <div key={i} className="bg-gray-100 rounded-2xl p-5 animate-pulse h-28" />)}</div>;
}
