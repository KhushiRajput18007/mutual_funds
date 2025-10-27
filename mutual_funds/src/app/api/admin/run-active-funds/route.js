import { NextResponse } from 'next/server';
import { updateActiveFunds } from '../../../../lib/fundUpdater';

// POST or GET to trigger the active funds updater immediately.
// Optional simple guard via env ADMIN_KEY: send header x-admin-key to match.
async function run(request) {
  const adminKey = process.env.ADMIN_KEY;
  if (adminKey) {
    const provided = request.headers.get('x-admin-key');
    if (provided !== adminKey) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }
  try {
    const result = await updateActiveFunds(console);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}

export async function POST(request) {
  return run(request);
}

export async function GET(request) {
  return run(request);
}
