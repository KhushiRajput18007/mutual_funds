import { NextResponse } from 'next/server';
import { updateActiveFunds } from '../../../../lib/fundUpdater';

export async function POST() {
  try {
    const result = await updateActiveFunds(console);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error('admin refresh-active error', e);
    return NextResponse.json({ error: 'Failed to refresh' }, { status: 500 });
  }
}
