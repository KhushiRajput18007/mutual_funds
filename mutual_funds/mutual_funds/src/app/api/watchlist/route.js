import { NextResponse } from 'next/server';
import getClientPromise from '../../../lib/mongodb';
import { COLLECTIONS } from '../../../lib/models';

function getUserId(request) {
  // Simple user identification. Replace with real auth when available.
  const headerId = request.headers.get('x-user-id');
  return headerId || 'demo-user';
}

function mem() {
  if (!global.__watchlistMem) global.__watchlistMem = new Map();
  return global.__watchlistMem;
}

export async function GET(request) {
  try {
    const userId = getUserId(request);
    const client = await getClientPromise;
    const db = client.db('mutual_funds');
    const docs = await db.collection(COLLECTIONS.WATCHLIST).find({ userId }).project({ _id: 0 }).toArray();
    return NextResponse.json(docs);
  } catch (e) {
    const userId = getUserId(request);
    const store = mem();
    const list = store.get(userId) || [];
    return NextResponse.json(list);
  }
}

export async function POST(request) {
  const userId = getUserId(request);
  let body;
  try {
    body = await request.json();
  } catch (_) {
    body = null;
  }
  const { schemeCode, schemeName } = body || {};
  if (!schemeCode || !schemeName) {
    return NextResponse.json({ error: 'schemeCode and schemeName required' }, { status: 400 });
  }

  try {
    const client = await getClientPromise;
    const db = client.db('mutual_funds');
    await db.collection(COLLECTIONS.WATCHLIST).updateOne(
      { userId, schemeCode },
      { $set: { userId, schemeCode, schemeName, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    const store = mem();
    const list = store.get(userId) || [];
    const idx = list.findIndex((x) => x.schemeCode === schemeCode);
    const item = { userId, schemeCode, schemeName };
    if (idx >= 0) list[idx] = item; else list.push(item);
    store.set(userId, list);
    return NextResponse.json({ ok: true });
  }
}

export async function DELETE(request) {
  const userId = getUserId(request);
  let body;
  try {
    body = await request.json();
  } catch (_) {
    body = null;
  }
  const { schemeCode } = body || {};
  if (!schemeCode) {
    return NextResponse.json({ error: 'schemeCode required' }, { status: 400 });
  }

  try {
    const client = await getClientPromise;
    const db = client.db('mutual_funds');
    await db.collection(COLLECTIONS.WATCHLIST).deleteOne({ userId, schemeCode });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const store = mem();
    const list = store.get(userId) || [];
    const next = list.filter((x) => x.schemeCode !== schemeCode);
    store.set(userId, next);
    return NextResponse.json({ ok: true });
  }
}
