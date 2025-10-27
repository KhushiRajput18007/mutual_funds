import { NextResponse } from 'next/server';
import { Commission } from '../../../../models/Commission';
import { getCurrentPeriod } from '../../../../lib/commissionCalculator';
import mongoose from 'mongoose';

/**
 * GET /api/commissions/monthly
 * Get monthly commission data for current and historical months
 * Query params: 
 * - role: 'seller' | 'admin' | 'company' | 'customer'
 * - userId: ObjectId of the user
 * - month: optional month (1-12)
 * - year: optional year
 * - limit: optional limit (default 12)
 */
export async function GET(request) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '12');

    if (!role || !userId) {
      return NextResponse.json(
        { error: 'role and userId are required' },
        { status: 400 }
      );
    }

    // Build query based on role
    let query = {};
    switch (role) {
      case 'seller':
        query.sellerId = new mongoose.Types.ObjectId(userId);
        break;
      case 'admin':
        query.adminId = new mongoose.Types.ObjectId(userId);
        break;
      case 'company':
        query.companyId = new mongoose.Types.ObjectId(userId);
        break;
      case 'customer':
        query.customerId = new mongoose.Types.ObjectId(userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        );
    }

    // Add period filter if specified
    if (month && year) {
      query['period.month'] = parseInt(month);
      query['period.year'] = parseInt(year);
    }

    // Get commissions with aggregation for summary data
    const commissions = await Commission.find(query)
      .sort({ 'period.year': -1, 'period.month': -1 })
      .limit(limit)
      .lean();

    // Calculate totals and aggregations
    const currentPeriod = getCurrentPeriod();
    const currentMonthCommissions = commissions.filter(
      c => c.period.month === currentPeriod.month && 
           c.period.year === currentPeriod.year
    );

    const totalCurrentMonth = currentMonthCommissions.reduce(
      (sum, c) => sum + (c.breakdown[role] || 0), 0
    );

    const totalHistorical = commissions.reduce(
      (sum, c) => sum + (c.breakdown[role] || 0), 0
    );

    // Group by period for trend analysis
    const monthlyTrends = commissions.reduce((acc, c) => {
      const periodKey = `${c.period.year}-${String(c.period.month).padStart(2, '0')}`;
      if (!acc[periodKey]) {
        acc[periodKey] = {
          period: c.period,
          totalCommission: 0,
          userShare: 0,
          portfolioValue: 0,
          customerCount: 0
        };
      }
      acc[periodKey].totalCommission += c.totalCommission;
      acc[periodKey].userShare += c.breakdown[role] || 0;
      acc[periodKey].portfolioValue += c.portfolioValue;
      acc[periodKey].customerCount += 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        role,
        userId,
        currentPeriod,
        summary: {
          currentMonth: Math.round(totalCurrentMonth * 100) / 100,
          totalHistorical: Math.round(totalHistorical * 100) / 100,
          recordCount: commissions.length
        },
        commissions,
        trends: Object.values(monthlyTrends).sort(
          (a, b) => b.period.year - a.period.year || b.period.month - a.period.month
        )
      }
    });

  } catch (error) {
    console.error('Monthly commissions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}