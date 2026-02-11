'use client';

import { useState, useEffect } from 'react';
import { AdminShell } from '../page';

export default function NichesPage() {
  const [niches, setNiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNiches = () => {
    setLoading(true);
    fetch('/api/niches')
      .then(r => r.json())
      .then(d => { setNiches(d.niches || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchNiches(); }, []);

  const toggleNiche = async (id) => {
    await fetch('/api/niches', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchNiches();
  };

  const grouped = {
    india: niches.filter(n => n.market === 'india'),
    us: niches.filter(n => n.market === 'us'),
    global: niches.filter(n => n.market === 'global'),
  };

  const filteredGroups = filter === 'all' ? grouped : { [filter]: grouped[filter] || [] };
  const totalPosts = niches.reduce((s, n) => s + (n.post_count || 0), 0);
  const activeNiches = niches.filter(n => n.is_active).length;
  const avgCpc = niches.length ? (niches.reduce((s, n) => s + parseFloat(n.avg_cpc || 0), 0) / niches.length).toFixed(2) : '0.00';

  const marketLabels = { india: '🇮🇳 Indian Market', us: '🇺🇸 US Market', global: '🌍 Global' };
  const marketColors = {
    india: 'from-orange-500 to-amber-500',
    us: 'from-blue-500 to-indigo-500',
    global: 'from-emerald-500 to-teal-500',
  };

  return (
    <AdminShell active="niches">
      <div className="max-w-5xl">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Niches & Categories</h1>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Niches', value: niches.length, icon: '📂' },
            { label: 'Active', value: activeNiches, icon: '✅' },
            { label: 'Total Posts', value: totalPosts, icon: '📝' },
            { label: 'Avg CPC', value: `$${avgCpc}`, icon: '💰' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-extrabold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Market Filter */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: '🌐 All Markets' },
            { value: 'india', label: '🇮🇳 India' },
            { value: 'us', label: '🇺🇸 US' },
            { value: 'global', label: '🌍 Global' },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f.value ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Niche Groups */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading niches...</div>
        ) : (
          Object.entries(filteredGroups).map(([market, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={market} className="mb-8">
                <div className={`bg-gradient-to-r ${marketColors[market]} text-white px-5 py-3 rounded-t-2xl font-bold text-sm`}>
                  {marketLabels[market]} ({items.length} niches)
                </div>
                <div className="bg-white rounded-b-2xl border border-gray-100 border-t-0 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                        <th className="px-5 py-3 font-medium">Niche</th>
                        <th className="px-5 py-3 font-medium">Slug</th>
                        <th className="px-5 py-3 font-medium text-center">Posts</th>
                        <th className="px-5 py-3 font-medium text-center">CPC</th>
                        <th className="px-5 py-3 font-medium text-center">Status</th>
                        <th className="px-5 py-3 font-medium text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.sort((a, b) => parseFloat(b.avg_cpc || 0) - parseFloat(a.avg_cpc || 0)).map(n => (
                        <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="font-medium text-gray-900 text-sm">{n.name}</div>
                            <div className="text-xs text-gray-400 line-clamp-1">{n.description || '—'}</div>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-500 font-mono">{n.slug}</td>
                          <td className="px-5 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                              {n.post_count || 0}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                              parseFloat(n.avg_cpc) >= 10 ? 'bg-emerald-100 text-emerald-700' :
                              parseFloat(n.avg_cpc) >= 7 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              ${n.avg_cpc}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                              n.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                            }`}>
                              {n.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <button onClick={() => toggleNiche(n.id)}
                              className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                                n.is_active
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}>
                              {n.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminShell>
  );
}
