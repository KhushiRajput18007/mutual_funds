import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { getAuth } from '../../../../lib/auth';
import { Commission } from '../../../../models/Commission';

export async function GET(request) {
  try {
    const auth = getAuth(request);
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (auth.role !== 'companyHead') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    await dbConnect();

    // Totals across company
    const totals = await Commission.aggregate([
      { $group: {
        _id: null,
        totalCommissions: { $sum: '$totalCommission' },
        totalPortfolioValue: { $sum: '$portfolioValue' },
        records: { $sum: 1 }
      }}
    ]);

    const now = new Date();
    const period = { month: now.getMonth() + 1, year: now.getFullYear() };
    const currentMonth = await Commission.aggregate([
      { $match: { 'period.month': period.month, 'period.year': period.year } },
      { $group: {
        _id: '$status',
        amount: { $sum: '$totalCommission' },
        count: { $sum: 1 }
      }}
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totals: totals[0] || { totalCommissions: 0, totalPortfolioValue: 0, records: 0 },
        currentMonth,
        period
      }
    });
  } catch (e) {
    console.error('company/dashboard GET error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
