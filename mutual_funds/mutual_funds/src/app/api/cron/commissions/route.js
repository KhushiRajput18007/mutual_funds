import { NextResponse } from 'next/server';
import { triggerCommissionGenerationManually, triggerCommissionAvailabilityManually } from '../../../../lib/commissionCron';
import { Commission } from '../../../../models/Commission';
import { getCurrentPeriod } from '../../../../lib/commissionCalculator';
import mongoose from 'mongoose';

/**
 * POST endpoint to manually trigger commission cron jobs
 * Body: { action: "generate" | "mark_available" | "both" }
 */
export async function POST(request) {
  try {
    console.log('🔧 Manual commission cron trigger endpoint called');
    
    const body = await request.json();
    const { action = "both" } = body;
    
    let results = {};
    
    if (action === "generate" || action === "both") {
      console.log('🔄 Triggering commission generation...');
      results.generation = await triggerCommissionGenerationManually();
    }
    
    if (action === "mark_available" || action === "both") {
      console.log('🔄 Triggering commission availability update...');
      results.availability = await triggerCommissionAvailabilityManually();
    }
    
    return NextResponse.json({
      success: true,
      message: `Commission cron job(s) triggered successfully: ${action}`,
      data: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Manual commission cron trigger failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to trigger commission cron job',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * GET endpoint to check commission system status and statistics
 */
export async function GET() {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const currentPeriod = getCurrentPeriod();
    
    // Get current month statistics
    const currentMonthStats = await Commission.aggregate([
      {
        $match: {
          'period.month': currentPeriod.month,
          'period.year': currentPeriod.year
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalCommission' },
          totalPortfolioValue: { $sum: '$portfolioValue' }
        }
      }
    ]);

    // Get overall system statistics
    const overallStats = await Commission.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalCommissions: { $sum: '$totalCommission' },
          totalPortfolioValue: { $sum: '$portfolioValue' },
          statusBreakdown: {
            $push: {
              status: '$status',
              amount: '$totalCommission'
            }
          }
        }
      }
    ]);

    // Get recent activity (last 3 months)
    const recentActivity = await Commission.aggregate([
      {
        $match: {
          'period.year': { $gte: currentPeriod.year - 1 }
        }
      },
      {
        $group: {
          _id: {
            year: '$period.year',
            month: '$period.month'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalCommission' }
        }
      },
      {
        $sort: {
          '_id.year': -1,
          '_id.month': -1
        }
      },
      {
        $limit: 3
      }
    ]);

    // Available for withdrawal count
    const availableCount = await Commission.countDocuments({ status: 'available' });
    const availableAmount = await Commission.aggregate([
      {
        $match: { status: 'available' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalCommission' }
        }
      }
    ]);

    const statusSummary = {
      currentMonth: currentMonthStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          amount: Math.round(stat.totalAmount * 100) / 100,
          portfolioValue: Math.round(stat.totalPortfolioValue * 100) / 100
        };
        return acc;
      }, {}),
      overall: overallStats[0] ? {
        totalRecords: overallStats[0].totalRecords,
        totalCommissions: Math.round(overallStats[0].totalCommissions * 100) / 100,
        totalPortfolioValue: Math.round(overallStats[0].totalPortfolioValue * 100) / 100
      } : null,
      availableForWithdrawal: {
        count: availableCount,
        amount: availableAmount[0] ? Math.round(availableAmount[0].total * 100) / 100 : 0
      },
      recentActivity: recentActivity.map(activity => ({
        period: `${activity._id.month}/${activity._id.year}`,
        count: activity.count,
        amount: Math.round(activity.totalAmount * 100) / 100
      }))
    };

    return NextResponse.json({
      success: true,
      cronJobStatus: {
        generateCommissions: 'Scheduled: 1st of every month at 12:01 AM IST',
        markAvailable: 'Scheduled: 5th of every month at 9:00 AM IST'
      },
      currentPeriod,
      statistics: statusSummary,
      timestamp: new Date().toISOString(),
      endpoints: {
        triggerGenerate: 'POST /api/cron/commissions { "action": "generate" }',
        triggerAvailable: 'POST /api/cron/commissions { "action": "mark_available" }',
        triggerBoth: 'POST /api/cron/commissions { "action": "both" }',
        getMonthly: 'GET /api/commissions/monthly?role=seller&userId=...',
        getAvailable: 'GET /api/commissions/available?role=seller&userId=...',
        withdraw: 'POST /api/commissions/withdraw'
      }
    });
    
  } catch (error) {
    console.error('❌ Commission status check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check commission status',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}