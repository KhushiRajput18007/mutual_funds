import { NextResponse } from 'next/server';
import { Commission } from '../../../../models/Commission';
import { isWithdrawalAvailable } from '../../../../lib/commissionCalculator';
import mongoose from 'mongoose';

/**
 * GET /api/commissions/available
 * Get commissions available for withdrawal (status: 'available')
 * Only accessible after 5th of each month
 * Query params:
 * - role: 'seller' | 'admin' | 'company' 
 * - userId: ObjectId of the user
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

    if (!role || !userId) {
      return NextResponse.json(
        { error: 'role and userId are required' },
        { status: 400 }
      );
    }

    // Check if withdrawals are available (after 5th of month)
    if (!isWithdrawalAvailable()) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          message: 'Withdrawals are available from the 5th of each month',
          nextAvailableDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
          totalAvailable: 0,
          commissions: []
        }
      });
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

    // Get available commissions
    const availableCommissions = await Commission.find(query)
      .sort({ 'period.year': -1, 'period.month': -1 })
      .lean();

    // Calculate total available for withdrawal
    const totalAvailable = availableCommissions.reduce(
      (sum, c) => sum + (c.breakdown[role] || 0), 0
    );

    // Group by withdrawal date for better organization
    const groupedByWithdrawalDate = availableCommissions.reduce((acc, c) => {
      const dateKey = c.withdrawalDate?.toISOString().split('T')[0] || 'no-date';
      if (!acc[dateKey]) {
        acc[dateKey] = {
          withdrawalDate: c.withdrawalDate,
          commissions: [],
          totalAmount: 0
        };
      }
      acc[dateKey].commissions.push(c);
      acc[dateKey].totalAmount += c.breakdown[role] || 0;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        available: true,
        role,
        userId,
        totalAvailable: Math.round(totalAvailable * 100) / 100,
        recordCount: availableCommissions.length,
        commissions: availableCommissions,
        groupedByDate: Object.values(groupedByWithdrawalDate).sort(
          (a, b) => new Date(b.withdrawalDate) - new Date(a.withdrawalDate)
        )
      }
    });

  } catch (error) {
    console.error('Available commissions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}