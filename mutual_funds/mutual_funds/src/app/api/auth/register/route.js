import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { User } from '../../../../models/User';
import { hashPassword, signToken } from '../../../../lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password, role = 'customer', parentId = null } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'email and password required' }, { status: 400 });
    }

    const exists = await User.findOne({ email }).lean();
    if (exists) return NextResponse.json({ error: 'email already registered' }, { status: 409 });

    const { salt, hash } = hashPassword(password);
    const user = await User.create({ email, passwordHash: hash, salt, role, parentId });

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const token = signToken({ sub: String(user._id), role: user.role }, jwtSecret, '7d');

    const res = NextResponse.json({ success: true, user: { _id: user._id, email: user.email, role: user.role } });
    res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 3600 });
    return res;
  } catch (e) {
    console.error('auth/register error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
