import { NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://trade-api-81q6.onrender.com/api/blog';

// GET — get single post for editing
export async function GET(request, { params }) {
  try {
    const pw = request.headers.get('x-admin-password') || '';
    const res = await fetch(`${API_BASE}/admin/posts/${params.id}`, {
      headers: { 'x-admin-password': pw },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT — update post
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/admin/posts/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': body.adminPassword },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE — delete post
export async function DELETE(request, { params }) {
  try {
    const pw = request.headers.get('x-admin-password') || '';
    const res = await fetch(`${API_BASE}/admin/posts/${params.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
      body: JSON.stringify({ adminPassword: pw }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
