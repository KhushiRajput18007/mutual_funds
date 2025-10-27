import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { getAuth } from '../../../../lib/auth';
import { User } from '../../../../models/User';
import { Commission } from '../../../../models/Commission';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    const auth = getAuth(request);
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (!['admin', 'companyHead'].includes(auth.role)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    await dbConnect();

    // Sellers under this admin (or all if companyHead)
    const sellerQuery = auth.role === 'admin' ? { role: 'seller', parentId: new mongoose.Types.ObjectId(auth.userId) } : { role: 'seller' };
    const sellers = await User.find(sellerQuery, { email: 1 }).lean();

    const sellerIds = sellers.map(s => s._id);
    let kpis = { sellerCount: sellers.length, aum: 0, commissions: 0 };

    if (sellerIds.length > 0) {
      const agg = await Commission.aggregate([
        { $match: { sellerId: { $in: sellerIds } } },
        { $group: { _id: null, aum: { $sum: '$portfolioValue' }, commissions: { $sum: '$totalCommission' } } }
      ]);
      if (agg[0]) {
        kpis.aum = Math.round(agg[0].aum * 100) / 100;
        kpis.commissions = Math.round(agg[0].commissions * 100) / 100;
      }
    }

    return NextResponse.json({ success: true, data: { sellers, kpis } });
  } catch (e) {
    console.error('admin/team GET error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
