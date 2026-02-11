import { NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://trade-api-81q6.onrender.com/api/blog';

// GET /api/posts/[id] — proxy to backend
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, { next: { revalidate: 300 } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
  }
}
