'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthCtx = createContext(null);
export function useAdminAuth() { return useContext(AuthCtx); }

export default function AdminLayout({ children }) {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('blog_admin_pw') : null;
    if (saved) { setPassword(saved); setAuthed(true); }
    setChecking(false);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: input }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('blog_admin_pw', input);
        setPassword(input);
        setAuthed(true);
      } else {
        setError(data.error || 'Wrong password');
      }
    } catch {
      setError('Connection failed');
    }
  }

  function logout() {
    sessionStorage.removeItem('blog_admin_pw');
    setPassword('');
    setAuthed(false);
    setInput('');
  }

  if (checking) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-gray-400">Loading…</div></div>;

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-2xl font-extrabold text-gray-900">Blog Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your admin password to continue</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-3"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Log In →
            </button>
          </form>
          <a href="/" className="block text-center text-sm text-gray-400 hover:text-indigo-600 mt-4">← Back to blog</a>
        </div>
      </div>
    );
  }

  return (
    <AuthCtx.Provider value={{ password, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
