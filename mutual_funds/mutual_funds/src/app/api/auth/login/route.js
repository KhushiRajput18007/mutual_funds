import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { User } from '../../../../models/User';
import { verifyPassword, signToken } from '../../../../lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'email and password required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });

    const ok = verifyPassword(password, user.salt, user.passwordHash);
    if (!ok) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const token = signToken({ sub: String(user._id), role: user.role }, jwtSecret, '7d');

    const res = NextResponse.json({ success: true, user: { _id: user._id, email: user.email, role: user.role } });
    res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 3600 });
    return res;
  } catch (e) {
    console.error('auth/login error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
