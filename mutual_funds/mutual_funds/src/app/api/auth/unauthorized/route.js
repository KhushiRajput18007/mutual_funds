import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}
