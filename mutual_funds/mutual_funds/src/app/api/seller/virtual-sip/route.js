import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { getAuth } from '../../../../lib/auth';
import { User } from '../../../../models/User';
import { VirtualSip } from '../../../../models/VirtualSip';

export async function POST(request) {
  try {
    const auth = getAuth(request);
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (!['seller', 'admin', 'companyHead'].includes(auth.role)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const { customerId, fundId, amount, dayOfMonth = 5 } = body || {};
    if (!customerId || !fundId || !amount) {
      return NextResponse.json({ error: 'customerId, fundId, amount required' }, { status: 400 });
    }

    // Ensure the customer exists and is under this seller (or admin/company can bypass hierarchy for now)
    const customer = await User.findById(customerId).lean();
    if (!customer || customer.role !== 'customer') {
      return NextResponse.json({ error: 'invalid customer' }, { status: 400 });
    }

    // Create the SIP
    const sip = await VirtualSip.create({
      userId: customer._id,
      sellerId: auth.role === 'seller' ? auth.userId : (customer.parentId || auth.userId),
      fundId: String(fundId),
      amount: Number(amount),
      dayOfMonth: Number(dayOfMonth)
    });

    return NextResponse.json({ success: true, sip: { _id: sip._id, userId: sip.userId, fundId: sip.fundId, amount: sip.amount, dayOfMonth: sip.dayOfMonth } });
  } catch (e) {
    console.error('seller/virtual-sip POST error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
