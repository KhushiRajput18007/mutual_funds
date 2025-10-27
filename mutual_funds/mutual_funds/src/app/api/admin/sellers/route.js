import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { getAuth, hashPassword } from '../../../../lib/auth';
import { User } from '../../../../models/User';

export async function POST(request) {
  try {
    const auth = getAuth(request);
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (!['admin', 'companyHead'].includes(auth.role)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    await dbConnect();
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 });

    const exists = await User.findOne({ email }).lean();
    if (exists) return NextResponse.json({ error: 'email already exists' }, { status: 409 });

    const { salt, hash } = hashPassword(password);
    const parentId = auth.userId; // seller reports to this admin (or company head creating sellers directly)
    const seller = await User.create({ email, passwordHash: hash, salt, role: 'seller', parentId });
    return NextResponse.json({ success: true, seller: { _id: seller._id, email: seller.email, role: seller.role } });
  } catch (e) {
    console.error('admin/sellers POST error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
