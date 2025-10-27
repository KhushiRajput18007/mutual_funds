import { NextResponse } from 'next/server';
import getClientPromise from '../../../../lib/mongodb';
import { getAuth } from '../../../../lib/auth';
import { COLLECTIONS } from '../../../../lib/models';

export async function GET(request) {
  try {
    const auth = getAuth(request);
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (auth.role !== 'customer') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const client = await getClientPromise;
    const db = client.db('mutual_funds');
    const docs = await db.collection(COLLECTIONS.WATCHLIST)
      .find({ userId: String(auth.userId) })
      .project({ _id: 0 })
      .toArray();

    return NextResponse.json({ success: true, watchlist: docs });
  } catch (e) {
    console.error('customer/watchlist GET error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
