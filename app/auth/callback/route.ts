import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  // Stub: simply redirect back to app without exchanging session
  // If auth is required later, integrate supabase-js or add helpers dependency.
  return NextResponse.redirect(requestUrl.origin);
}
