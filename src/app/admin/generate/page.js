'use client';

import { useState, useEffect } from 'react';
import { AdminShell } from '../page';
import { useAdminAuth } from '../layout';

export default function AIGeneratePage() {
  const auth = useAdminAuth();
  const [niches, setNiches] = useState([]);
  const [mode, setMode] = useState('niche');
  const [market, setMarket] = useState('global');
  const [nicheId, setNicheId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [log, setLog] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch('/api/niches').then(r => r.json()).then(d => setNiches(d.niches || []));
    fetch('/api/stats').then(r => r.json()).then(d => setHistory(d.recentLogs || d.recent_logs || []));
  }, []);

  const filteredNiches = niches.filter(n => !market || n.market === market || n.market === 'global');

  const generate = async () => {
    setGenerating(true);
    setLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: '🚀 Starting AI generation...', type: 'info' }]);

    for (let i = 0; i < count; i++) {
      setLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `📝 Generating post ${i + 1} of ${count}...`, type: 'info' }]);

      try {
        const endpoint = count > 1 && mode === 'niche' && !nicheId
          ? '/api/admin/generate-batch'
          : '/api/admin/generate';

        const body = { adminPassword: auth?.password };
        if (mode === 'niche' && nicheId) body.nicheId = nicheId;
        if (mode === 'prompt') body.prompt = prompt;
        body.market = market;
        if (endpoint.includes('batch')) body.count = count;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': auth?.password || '',
          },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          if (data.posts) {
            data.posts.forEach(p => {
              setLog(prev => [...prev, {
                time: new Date().toLocaleTimeString(),
                msg: `✅ Created: "${p.title}" (${p.reading_time || '?'} min read)`,
                type: 'success',
                postId: p.id,
              }]);
            });
            // batch already generated all, break
            setLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: '🏁 Batch generation complete!', type: 'info' }]);
            setGenerating(false);
            return;
          } else if (data.post) {
            setLog(prev => [...prev, {
              time: new Date().toLocaleTimeString(),
              msg: `✅ Created: "${data.post.title}" (${data.post.reading_time || '?'} min read)`,
              type: 'success',
              postId: data.post.id,
            }]);
          }
        } else {
          setLog(prev => [...prev, {
            time: new Date().toLocaleTimeString(),
            msg: `❌ Error: ${data.error || 'Generation failed'}`,
            type: 'error',
          }]);
        }
      } catch (e) {
        setLog(prev => [...prev, {
          time: new Date().toLocaleTimeString(),
          msg: `❌ Failed: ${e.message}`,
          type: 'error',
        }]);
      }

      if (i < count - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    setLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: '🏁 Generation complete!', type: 'info' }]);
    setGenerating(false);
  };

  return (
    <AdminShell active="ai-generate" onLogout={auth?.logout}>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">⚡ AI Content Generator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-bold text-gray-900">Generation Mode</h3>

              <div className="flex gap-2">
                <button onClick={() => setMode('niche')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === 'niche' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  📂 By Niche
                </button>
                <button onClick={() => setMode('prompt')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === 'prompt' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  ✨ Custom Prompt
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Target Market</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'india', label: '🇮🇳 India' },
                    { value: 'us', label: '🇺🇸 US' },
                    { value: 'global', label: '🌍 Global' },
                  ].map(m => (
                    <button key={m.value} onClick={() => setMarket(m.value)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${market === m.value ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'niche' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Select Niche (leave blank for random)</label>
                  <select value={nicheId} onChange={(e) => setNicheId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm">
                    <option value="">— Random niche —</option>
                    {filteredNiches.map(n => (
                      <option key={n.id} value={n.id}>{n.name} (${n.avg_cpc} CPC)</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Custom Prompt</label>
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Write about the top 5 ELSS funds in India for tax saving in 2025..."
                    rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Number of Posts</label>
                <div className="flex items-center gap-3">
                  {[1, 3, 5, 10].map(n => (
                    <button key={n} onClick={() => setCount(n)}
                      className={`w-12 h-10 rounded-lg text-sm font-bold transition-colors ${count === n ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={generate}
                disabled={generating || (mode === 'prompt' && !prompt)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {generating ? '⏳ Generating...' : `⚡ Generate ${count} Post${count > 1 ? 's' : ''}`}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Posts are created as <strong>published</strong> by AI. Review from the Posts page.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Quick Templates</h3>
              <div className="space-y-2">
                {[
                  { text: 'Best tax-saving investments in India 2025', m: 'india' },
                  { text: 'Top 10 high-dividend stocks for 2025', m: 'us' },
                  { text: 'Complete guide to Roth IRA vs Traditional IRA', m: 'us' },
                  { text: 'SIP vs Lumpsum investment analysis 2025', m: 'india' },
                  { text: 'Best health insurance plans comparison', m: 'global' },
                  { text: 'Cryptocurrency regulation updates 2025', m: 'global' },
                ].map((t, i) => (
                  <button key={i} onClick={() => { setMode('prompt'); setPrompt(t.text); setMarket(t.m); }}
                    className="w-full text-left text-xs bg-gray-50 hover:bg-indigo-50 text-gray-700 px-3 py-2 rounded-lg transition-colors">
                    <span className="mr-1">{t.m === 'india' ? '🇮🇳' : t.m === 'us' ? '🇺🇸' : '🌍'}</span>
                    {t.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl p-5 min-h-[400px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-300">Live Generation Log</h3>
                {log.length > 0 && (
                  <button onClick={() => setLog([])} className="text-xs text-gray-500 hover:text-gray-400">Clear</button>
                )}
              </div>

              <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                {log.length === 0 ? (
                  <p className="text-gray-500 text-sm">Configure settings and click Generate to start...</p>
                ) : (
                  log.map((entry, i) => (
                    <div key={i} className={`text-xs font-mono px-3 py-1.5 rounded-lg ${
                      entry.type === 'error' ? 'bg-red-900/30 text-red-400' :
                      entry.type === 'success' ? 'bg-emerald-900/30 text-emerald-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      <span className="text-gray-600 mr-2">[{entry.time}]</span>
                      {entry.msg}
                      {entry.postId && (
                        <a href={`/admin/posts/${entry.postId}`} className="ml-2 text-indigo-400 hover:underline">Edit →</a>
                      )}
                    </div>
                  ))
                )}
                {generating && (
                  <div className="text-xs font-mono px-3 py-1.5 text-yellow-400 animate-pulse">▌</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Recent Generation History</h3>
              {history.length === 0 ? (
                <p className="text-gray-400 text-sm">No previous generations</p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 10).map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${h.status === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {h.status === 'success' ? '✅' : '❌'} {h.niche_name || h.topic || 'Custom'}
                      </span>
                      <span className="text-gray-400">
                        {new Date(h.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
