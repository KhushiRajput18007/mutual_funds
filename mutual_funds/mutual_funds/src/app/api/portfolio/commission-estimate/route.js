import { NextResponse } from 'next/server';
import { calculateMonthlyCommission, calculateAnnualProjection, getCurrentPeriod } from '../../../../lib/commissionCalculator';

/**
 * GET /api/portfolio/commission-estimate
 * Query params:
 * - role: 'seller' | 'admin' | 'company' | 'mutualFund' (defaults to 'seller')
 * - aum: number (current AUM / portfolio value). If omitted, returns zeroed estimate
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') || 'seller');
    const aumParam = searchParams.get('aum');

    const portfolioValue = aumParam ? parseFloat(aumParam) : 0;
    if (Number.isNaN(portfolioValue) || portfolioValue < 0) {
      return NextResponse.json({ error: 'Invalid aum' }, { status: 400 });
    }

    const period = getCurrentPeriod();
    const monthly = calculateMonthlyCommission(portfolioValue);

    const roleKey = role === 'mutualFund' ? 'mutualFund' : (role === 'company' ? 'company' : (role === 'admin' ? 'admin' : 'seller'));
    const monthlyShare = monthly.breakdown[roleKey] || 0;

    const response = {
      period,
      portfolioValue,
      annualRate: `${(monthly.annualRate * 100).toFixed(0)}%`,
      monthlyRate: `${(monthly.monthlyRate * 100).toFixed(4)}%`,
      totalMonthlyCommission: monthly.totalMonthly,
      sellerShare: roleKey === 'seller' ? monthlyShare : undefined,
      adminShare: roleKey === 'admin' ? monthlyShare : undefined,
      companyShare: roleKey === 'company' ? monthlyShare : undefined,
      mutualFundShare: roleKey === 'mutualFund' ? monthlyShare : undefined,
      status: 'projection',
      withdrawalDate: null,
      annualProjection: calculateAnnualProjection(portfolioValue, roleKey)
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Commission estimate API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
