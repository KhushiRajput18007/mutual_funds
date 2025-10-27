import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { getAuth, hashPassword } from '../../../../lib/auth';
import { User } from '../../../../models/User';

export async function POST(request) {
  try {
    const auth = getAuth(request);
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (!['seller', 'admin', 'companyHead'].includes(auth.role)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { email, password = 'Customer@123' } = await request.json();
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const exists = await User.findOne({ email }).lean();
    if (exists) return NextResponse.json({ error: 'email already exists' }, { status: 409 });

    const { salt, hash } = hashPassword(password);
    const parentId = auth.userId; // customer under current seller/admin/company
    const customer = await User.create({ email, passwordHash: hash, salt, role: 'customer', parentId });
    return NextResponse.json({ success: true, customer: { _id: customer._id, email: customer.email, role: customer.role } });
  } catch (e) {
    console.error('seller/customers POST error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
