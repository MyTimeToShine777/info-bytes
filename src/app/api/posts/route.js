import { NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://trade-api-81q6.onrender.com/api/blog';

// GET /api/posts — proxy to backend
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  try {
    const res = await fetch(`${API_BASE}/posts${query ? '?' + query : ''}`, { next: { revalidate: 300 } });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ posts: [], total: 0 }, { status: 500 });
  }
}
