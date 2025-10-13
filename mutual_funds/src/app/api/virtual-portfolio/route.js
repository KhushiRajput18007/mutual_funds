import { NextResponse } from 'next/server';
import getClientPromise from '../../../lib/mongodb';
import { COLLECTIONS } from '../../../lib/models';

function getUserId(request) {
  const headerId = request.headers.get('x-user-id');
  return headerId || 'demo-user';
}

export async function GET(request) {
  try {
    const userId = getUserId(request);
    const client = await getClientPromise;
    const db = client.db('mutual_funds');
    const docs = await db.collection(COLLECTIONS.VIRTUAL_PORTFOLIO).find({ userId }).project({ _id: 0 }).toArray();
    return NextResponse.json(docs);
  } catch (e) {
    console.error('virtual-portfolio GET error', e);
    return NextResponse.json({ error: 'Failed to load virtual portfolio' }, { status: 500 });
  }
}

// Create or update a virtual SIP position
export async function POST(request) {
  try {
    const userId = getUserId(request);
    const body = await request.json();
    const { schemeCode, schemeName, sipAmount, dayOfMonth } = body || {};
    if (!schemeCode || !schemeName || !sipAmount || !dayOfMonth) {
      return NextResponse.json({ error: 'schemeCode, schemeName, sipAmount, dayOfMonth required' }, { status: 400 });
    }

    const client = await getClientPromise;
    const db = client.db('mutual_funds');

    await db.collection(COLLECTIONS.VIRTUAL_PORTFOLIO).updateOne(
      { userId, schemeCode },
      { $set: { userId, schemeCode, schemeName, sipAmount: Number(sipAmount), dayOfMonth: Number(dayOfMonth), updatedAt: new Date() }, $setOnInsert: { createdAt: new Date(), history: [] } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('virtual-portfolio POST error', e);
    return NextResponse.json({ error: 'Failed to save virtual SIP' }, { status: 500 });
  }
}

// Remove a position
export async function DELETE(request) {
  try {
    const userId = getUserId(request);
    const body = await request.json();
    const { schemeCode } = body || {};
    if (!schemeCode) return NextResponse.json({ error: 'schemeCode required' }, { status: 400 });
    const client = await getClientPromise;
    const db = client.db('mutual_funds');
    await db.collection(COLLECTIONS.VIRTUAL_PORTFOLIO).deleteOne({ userId, schemeCode });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('virtual-portfolio DELETE error', e);
    return NextResponse.json({ error: 'Failed to remove SIP' }, { status: 500 });
  }
}
