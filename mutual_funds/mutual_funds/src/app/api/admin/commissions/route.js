import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { getAuth } from '../../../../lib/auth';
import { Commission } from '../../../../models/Commission';
import { User } from '../../../../models/User';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    const auth = getAuth(request);
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (!['admin', 'companyHead'].includes(auth.role)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    await dbConnect();

    // Find sellers under this admin (or all if companyHead)
    const sellerQuery = auth.role === 'admin' ? { role: 'seller', parentId: new mongoose.Types.ObjectId(auth.userId) } : { role: 'seller' };
    const sellers = await User.find(sellerQuery, { _id: 1 }).lean();
    const sellerIds = sellers.map(s => s._id);

    let summary = { total: 0, available: 0, accrued: 0, withdrawn: 0 };
    let monthly = [];

    if (sellerIds.length > 0) {
      const pipeline = [
        { $match: { sellerId: { $in: sellerIds } } },
        { $group: {
          _id: { year: '$period.year', month: '$period.month', status: '$status' },
          amount: { $sum: '$totalCommission' }
        } }
      ];
      const rows = await Commission.aggregate(pipeline);

      const map = {};
      for (const r of rows) {
        const key = `${r._id.year}-${String(r._id.month).padStart(2,'0')}`;
        if (!map[key]) map[key] = { period: { year: r._id.year, month: r._id.month }, accrued: 0, available: 0, withdrawn: 0 };
        map[key][r._id.status] = Math.round(r.amount * 100) / 100;
        summary[r._id.status] += Math.round(r.amount * 100) / 100;
        summary.total += Math.round(r.amount * 100) / 100;
      }
      monthly = Object.values(map).sort((a,b)=> (b.period.year-a.period.year)|| (b.period.month-a.period.month));
    }

    return NextResponse.json({ success: true, data: { summary, monthly } });
  } catch (e) {
    console.error('admin/commissions GET error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
