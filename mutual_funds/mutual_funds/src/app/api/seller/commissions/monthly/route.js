import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const month = url.searchParams.get('month');
  const year = url.searchParams.get('year');
  const limit = url.searchParams.get('limit');

  const target = new URL(`${url.origin}/api/commissions/monthly`);
  target.searchParams.set('role', 'seller');
  if (userId) target.searchParams.set('userId', userId);
  if (month) target.searchParams.set('month', month);
  if (year) target.searchParams.set('year', year);
  if (limit) target.searchParams.set('limit', limit);

  return NextResponse.redirect(target, 307);
}
