import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { getAuth, hashPassword } from '../../../../lib/auth';
import { User } from '../../../../models/User';

export async function POST(request) {
  try {
    const auth = getAuth(request);
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (auth.role !== 'companyHead') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    await dbConnect();
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 });

    const exists = await User.findOne({ email }).lean();
    if (exists) return NextResponse.json({ error: 'email already exists' }, { status: 409 });

    const { salt, hash } = hashPassword(password);
    const admin = await User.create({ email, passwordHash: hash, salt, role: 'admin', parentId: auth.userId });
    return NextResponse.json({ success: true, admin: { _id: admin._id, email: admin.email, role: admin.role } });
  } catch (e) {
    console.error('company/admins POST error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
