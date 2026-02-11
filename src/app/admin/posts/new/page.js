'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '../../page';

export default function NewPostPage() {
  return <PostEditor />;
}

export function PostEditor({ postId }) {
  const router = useRouter();
  const isEdit = !!postId;
  const [niches, setNiches] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(false);

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', niche_id: '', tags: '',
    image_url: '', image_alt: '', author: 'Editorial Team',
    status: 'draft', market: 'global', is_trending: false,
    meta_title: '', meta_description: '',
  });

  useEffect(() => {
    fetch('/api/niches').then(r => r.json()).then(d => setNiches(d.niches || []));
    if (isEdit) {
      fetch(`/api/posts/${postId}`).then(r => r.json()).then(d => {
        if (d.post) {
          setForm({
            ...d.post,
            tags: d.post.tags || '',
            is_trending: !!d.post.is_trending,
          });
        }
      });
    }
  }, [isEdit, postId]);

  const updateField = (field, value) => {
    setForm(f => {
      const updated = { ...f, [field]: value };
      // Auto-generate slug from title
      if (field === 'title' && !isEdit) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      if (field === 'title') {
        updated.meta_title = updated.meta_title || value;
      }
      if (field === 'excerpt') {
        updated.meta_description = updated.meta_description || value;
      }
      return updated;
    });
  };

  const save = async (publishStatus) => {
    setSaving(true);
    setError('');
    setSuccess('');

    const body = { ...form, status: publishStatus || form.status };
    if (body.tags && typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    try {
      const url = isEdit ? `/api/posts/${postId}` : '/api/posts';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save post');
      } else {
        setSuccess(isEdit ? 'Post updated!' : 'Post created!');
        if (!isEdit && data.post?.id) {
          setTimeout(() => router.push(`/admin/posts/${data.post.id}`), 1000);
        }
      }
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const wordCount = form.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <AdminShell active="new-post">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">{isEdit ? 'Edit Post' : 'Write New Post'}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setPreview(!preview)} className="text-sm text-gray-500 hover:text-brand-600 px-3 py-1.5 border border-gray-200 rounded-lg">
              {preview ? '✏️ Editor' : '👁️ Preview'}
            </button>
            <button onClick={() => save('draft')} disabled={saving || !form.title || !form.content}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => save('published')} disabled={saving || !form.title || !form.content}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors">
              {saving ? 'Publishing...' : '🚀 Publish'}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
        {success && <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm">{success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)}
                placeholder="Write a compelling title..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <span>/post/</span>
                <input type="text" value={form.slug} onChange={(e) => updateField('slug', e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt / Meta Description</label>
              <textarea value={form.excerpt} onChange={(e) => updateField('excerpt', e.target.value)}
                placeholder="Brief description for SEO and social sharing..."
                rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              <div className="text-xs text-gray-400 mt-1">{(form.excerpt || '').length}/155 characters</div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Content (Markdown)</label>
                <span className="text-xs text-gray-400">{wordCount} words · {readingTime} min read</span>
              </div>
              {preview ? (
                <div className="prose prose-sm max-w-none bg-white border border-gray-200 rounded-xl p-6 min-h-[400px]"
                  dangerouslySetInnerHTML={{ __html: simpleMarkdown(form.content) }} />
              ) : (
                <textarea value={form.content} onChange={(e) => updateField('content', e.target.value)}
                  placeholder="Write your article in Markdown...\n\n## Introduction\n\nStart with a strong opening...\n\n## Main Section\n\nDetailed content..."
                  rows={20} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y" />
              )}
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">Post Settings</h3>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Market</label>
                <select value={form.market} onChange={(e) => updateField('market', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="india">🇮🇳 India</option>
                  <option value="us">🇺🇸 United States</option>
                  <option value="global">🌍 Global</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Niche / Category</label>
                <select value={form.niche_id} onChange={(e) => updateField('niche_id', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">— Select niche —</option>
                  {niches.filter(n => form.market === 'all' || !form.market || n.market === form.market || n.market === 'global').map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                  {/* Also show all niches as fallback */}
                  <optgroup label="All niches">
                    {niches.map(n => <option key={`all-${n.id}`} value={n.id}>{n.name}</option>)}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Author</label>
                <input type="text" value={form.author} onChange={(e) => updateField('author', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma-separated)</label>
                <input type="text" value={form.tags} onChange={(e) => updateField('tags', e.target.value)}
                  placeholder="investing, stocks, tips"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="trending" checked={form.is_trending}
                  onChange={(e) => updateField('is_trending', e.target.checked)}
                  className="rounded border-gray-300" />
                <label htmlFor="trending" className="text-sm text-gray-700">🔥 Mark as Trending</label>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">Featured Image</h3>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
                <input type="url" value={form.image_url} onChange={(e) => updateField('image_url', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              {form.image_url && (
                <img src={form.image_url} alt={form.image_alt || 'Preview'} className="w-full h-32 object-cover rounded-lg" />
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Image Alt Text</label>
                <input type="text" value={form.image_alt} onChange={(e) => updateField('image_alt', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">SEO</h3>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Meta Title</label>
                <input type="text" value={form.meta_title} onChange={(e) => updateField('meta_title', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <div className="text-xs text-gray-400 mt-1">{(form.meta_title || '').length}/60 characters</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                <textarea value={form.meta_description} onChange={(e) => updateField('meta_description', e.target.value)}
                  rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                <div className="text-xs text-gray-400 mt-1">{(form.meta_description || '').length}/155 characters</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

// Simple markdown to HTML for preview (basic)
function simpleMarkdown(md) {
  if (!md) return '<p class="text-gray-400">Start writing to see preview...</p>';
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}
