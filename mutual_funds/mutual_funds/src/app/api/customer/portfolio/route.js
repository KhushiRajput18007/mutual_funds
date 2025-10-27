import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { getAuth } from '../../../../lib/auth';
import { VirtualPortfolio } from '../../../../models/VirtualPortfolio';

export async function GET(request) {
  try {
    const auth = getAuth(request);
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (auth.role !== 'customer') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    await dbConnect();
    const vp = await VirtualPortfolio.findOne({ userId: auth.userId }).lean();
    return NextResponse.json({ success: true, portfolio: vp || { userId: auth.userId, holdings: [] } });
  } catch (e) {
    console.error('customer/portfolio GET error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
