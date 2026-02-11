import { NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://trade-api-81q6.onrender.com/api/blog';

export async function POST(request) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/admin/generate-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': body.adminPassword },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: 'Batch generation failed: ' + e.message }, { status: 500 });
  }
}
