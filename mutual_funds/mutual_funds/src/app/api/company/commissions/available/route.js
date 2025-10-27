import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  const target = new URL(`${url.origin}/api/commissions/available`);
  target.searchParams.set('role', 'company');
  if (userId) target.searchParams.set('userId', userId);

  return NextResponse.redirect(target, 307);
}
