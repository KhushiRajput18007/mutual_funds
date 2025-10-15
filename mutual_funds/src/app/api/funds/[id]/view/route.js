import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../../lib/db';
import { Fund } from '../../../../../models/Fund';

export async function POST(_req, { params }) {
  try {
    const { id } = params;
    await dbConnect();
    const updated = await Fund.findByIdAndUpdate(
      id,
      { $inc: { userViews: 1 } },
      { new: true }
    ).lean();
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Failed to increment views' }, { status: 500 });
  }
}
