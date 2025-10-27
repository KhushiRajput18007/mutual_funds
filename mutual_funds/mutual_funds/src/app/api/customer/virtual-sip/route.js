import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { getAuth } from '../../../../lib/auth';
import { User } from '../../../../models/User';
import { VirtualSip } from '../../../../models/VirtualSip';

export async function POST(request) {
  try {
    const auth = getAuth(request);
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (auth.role !== 'customer') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    await dbConnect();
    const body = await request.json();
    const { fundId, amount, dayOfMonth = 5 } = body || {};
    if (!fundId || !amount) {
      return NextResponse.json({ error: 'fundId and amount required' }, { status: 400 });
    }

    // Find this customer and their seller
    const customer = await User.findById(auth.userId).lean();
    if (!customer || customer.role !== 'customer') {
      return NextResponse.json({ error: 'invalid customer' }, { status: 400 });
    }

    const sellerId = customer.parentId || auth.userId; // fallback if hierarchy not set yet

    const sip = await VirtualSip.create({
      userId: customer._id,
      sellerId,
      fundId: String(fundId),
      amount: Number(amount),
      dayOfMonth: Number(dayOfMonth)
    });

    return NextResponse.json({ success: true, sip: { _id: sip._id, userId: sip.userId, fundId: sip.fundId, amount: sip.amount, dayOfMonth: sip.dayOfMonth } });
  } catch (e) {
    console.error('customer/virtual-sip POST error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
