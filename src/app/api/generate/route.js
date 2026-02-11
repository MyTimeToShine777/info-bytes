import { NextResponse } from 'next/server';

// POST /api/generate — generation is now handled by the backend cron.
// This is a no-op placeholder.
export async function POST(request) {
  return NextResponse.json({ message: 'Blog generation is handled automatically by the backend. Posts appear every 6 hours.' });
}
