'use client';

import { useState, useEffect } from 'react';
import { AdminShell } from '../page';

export default function AIGeneratePage() {
  const [niches, setNiches] = useState([]);
  const [mode, setMode] = useState('niche'); // niche | prompt
  const [market, setMarket] = useState('global');
  const [nicheId, setNicheId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [log, setLog] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch('/api/niches').then(r => r.json()).then(d => setNiches(d.niches || []));
    fetch('/api/stats').then(r => r.json()).then(d => setHistory(d.recent_logs || []));
  }, []);

  const filteredNiches = niches.filter(n => !market || n.market === market || n.market === 'global');

  const generate = async () => {
    setGenerating(true);
    setLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: '🚀 Starting AI generation...', type: 'info' }]);

    for (let i = 0; i < count; i++) {
      setLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `📝 Generating post ${i + 1} of ${count}...`, type: 'info' }]);

      try {
        const body = mode === 'niche'
          ? { niche_id: nicheId, market }
          : { prompt, market };

        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (res.ok) {
          setLog(prev => [...prev, {
            time: new Date().toLocaleTimeString(),
            msg: `✅ Created: "${data.post?.title}" (${data.post?.reading_time || '?'} min read)`,
            type: 'success',
            postId: data.post?.id
          }]);
        } else {
          setLog(prev => [...prev, {
            time: new Date().toLocaleTimeString(),
            msg: `❌ Error: ${data.error}`,
            type: 'error'
          }]);
        }
      } catch (e) {
        setLog(prev => [...prev, {
          time: new Date().toLocaleTimeString(),
          msg: `❌ Failed: ${e.message}`,
          type: 'error'
        }]);
      }

      // Small delay between generations
      if (i < count - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    setLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: '🏁 Generation complete!', type: 'info' }]);
    setGenerating(false);
  };

  return (
    <AdminShell active="ai-generate">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">⚡ AI Content Generator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generation Config */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-bold text-gray-900">Generation Mode</h3>

              <div className="flex gap-2">
                <button onClick={() => setMode('niche')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === 'niche' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  📂 By Niche
                </button>
                <button onClick={() => setMode('prompt')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === 'prompt' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${market === m.value ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'niche' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Select Niche</label>
                  <select value={nicheId} onChange={(e) => setNicheId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm">
                    <option value="">— Select niche —</option>
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
                    rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Number of Posts</label>
                <div className="flex items-center gap-3">
                  {[1, 3, 5, 10].map(n => (
                    <button key={n} onClick={() => setCount(n)}
                      className={`w-12 h-10 rounded-lg text-sm font-bold transition-colors ${count === n ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={generate}
                disabled={generating || (mode === 'niche' && !nicheId) || (mode === 'prompt' && !prompt)}
                className="w-full bg-gradient-to-r from-brand-600 to-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {generating ? '⏳ Generating...' : `⚡ Generate ${count} Post${count > 1 ? 's' : ''}`}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Posts are created as <strong>drafts</strong>. Review and publish from the Posts page.
              </p>
            </div>

            {/* Quick Templates */}
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
                    className="w-full text-left text-xs bg-gray-50 hover:bg-brand-50 text-gray-700 px-3 py-2 rounded-lg transition-colors">
                    <span className="mr-1">{t.m === 'india' ? '🇮🇳' : t.m === 'us' ? '🇺🇸' : '🌍'}</span>
                    {t.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Log */}
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
                        <a href={`/admin/posts/${entry.postId}`} className="ml-2 text-brand-400 hover:underline">Edit →</a>
                      )}
                    </div>
                  ))
                )}
                {generating && (
                  <div className="text-xs font-mono px-3 py-1.5 text-yellow-400 animate-pulse">▌</div>
                )}
              </div>
            </div>

            {/* Recent History */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Recent Generation History</h3>
              {history.length === 0 ? (
                <p className="text-gray-400 text-sm">No previous generations</p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 10).map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${h.status === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {h.status === 'success' ? '✅' : '❌'} {h.niche_name || 'Custom'}
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
