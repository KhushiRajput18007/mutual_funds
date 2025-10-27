import { NextResponse } from 'next/server';
import { Commission } from '../../../../models/Commission';
import { isWithdrawalAvailable } from '../../../../lib/commissionCalculator';
import mongoose from 'mongoose';

/**
 * POST /api/commissions/withdraw
 * Simulate monthly withdrawal (Day 5+ only)
 * Body: 
 * - role: 'seller' | 'admin' | 'company'
 * - userId: ObjectId of the user
 * - commissionIds: Array of commission IDs to withdraw (optional, withdraws all available if not provided)
 */
export async function POST(request) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const body = await request.json();
    const { role, userId, commissionIds } = body;

    if (!role || !userId) {
      return NextResponse.json(
        { error: 'role and userId are required' },
        { status: 400 }
      );
    }

    // Check if withdrawals are available (after 5th of month)
    if (!isWithdrawalAvailable()) {
      return NextResponse.json(
        { 
          error: 'Withdrawals are only available from the 5th of each month',
          nextAvailableDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5)
        },
        { status: 400 }
      );
    }

    // Build query based on role
    let query = { status: 'available' };
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
      default:
        return NextResponse.json(
          { error: 'Invalid role. Customers cannot withdraw commissions.' },
          { status: 400 }
        );
    }

    // If specific commission IDs provided, filter by them
    if (commissionIds && commissionIds.length > 0) {
      query._id = { 
        $in: commissionIds.map(id => new mongoose.Types.ObjectId(id)) 
      };
    }

    // Get commissions to withdraw
    const commissionsToWithdraw = await Commission.find(query);

    if (commissionsToWithdraw.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No commissions available for withdrawal',
        data: {
          withdrawnAmount: 0,
          withdrawnCount: 0,
          transactionId: null
        }
      });
    }

    // Calculate total withdrawal amount
    const totalAmount = commissionsToWithdraw.reduce(
      (sum, c) => sum + (c.breakdown[role] || 0), 0
    );

    // Simulate the withdrawal by updating status to 'withdrawn'
    const updateResult = await Commission.updateMany(
      { _id: { $in: commissionsToWithdraw.map(c => c._id) } },
      {
        $set: {
          status: 'withdrawn',
          withdrawalDate: new Date()
        }
      }
    );

    // Generate a mock transaction ID for simulation
    const transactionId = `TXN_${Date.now()}_${userId.slice(-4)}`;

    // Create withdrawal summary
    const withdrawalSummary = {
      transactionId,
      role,
      userId,
      withdrawnAmount: Math.round(totalAmount * 100) / 100,
      withdrawnCount: commissionsToWithdraw.length,
      withdrawalDate: new Date(),
      commissionBreakdown: commissionsToWithdraw.map(c => ({
        _id: c._id,
        period: c.period,
        portfolioValue: c.portfolioValue,
        userShare: c.breakdown[role],
        customerId: c.customerId
      })),
      bankDetails: {
        // Mock bank details for simulation
        accountNumber: '**** **** **** 1234',
        ifscCode: 'MOCK0001234',
        accountHolder: `${role.toUpperCase()} USER`,
        transferMode: 'NEFT'
      },
      status: 'completed' // Simulated completion
    };

    return NextResponse.json({
      success: true,
      message: `Successfully withdrew ₹${withdrawalSummary.withdrawnAmount}`,
      data: withdrawalSummary
    });

  } catch (error) {
    console.error('Commission withdrawal API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/commissions/withdraw
 * Get withdrawal history for a user
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
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!role || !userId) {
      return NextResponse.json(
        { error: 'role and userId are required' },
        { status: 400 }
      );
    }

    // Build query for withdrawn commissions
    let query = { status: 'withdrawn' };
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
      default:
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        );
    }

    // Get withdrawal history
    const withdrawalHistory = await Commission.find(query)
      .sort({ withdrawalDate: -1 })
      .limit(limit)
      .lean();

    // Calculate totals
    const totalWithdrawn = withdrawalHistory.reduce(
      (sum, c) => sum + (c.breakdown[role] || 0), 0
    );

    // Group by month for summary
    const monthlyWithdrawals = withdrawalHistory.reduce((acc, c) => {
      const monthKey = `${c.period.year}-${String(c.period.month).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = {
          period: c.period,
          amount: 0,
          count: 0
        };
      }
      acc[monthKey].amount += c.breakdown[role] || 0;
      acc[monthKey].count += 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        role,
        userId,
        totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
        recordCount: withdrawalHistory.length,
        withdrawals: withdrawalHistory,
        monthlySummary: Object.values(monthlyWithdrawals).sort(
          (a, b) => b.period.year - a.period.year || b.period.month - a.period.month
        )
      }
    });

  } catch (error) {
    console.error('Withdrawal history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}