import { Commission } from '../models/Commission';
import { calculateMonthlyCommission, getCurrentPeriod, getWithdrawalDate } from './commissionCalculator';
import mongoose from 'mongoose';
import cron from 'node-cron';
import getClientPromise from './mongodb';
import { COLLECTIONS } from './models';

/**
 * Commission Cron Jobs
 * 1st of Month (12:01 AM): Generate monthly commissions for all active portfolios
 * 5th of Month (9:00 AM): Mark previous month commissions as available for withdrawal
 */

/**
 * Generate monthly commissions for all active portfolios
 * Runs on 1st of every month at 12:01 AM
 */
async function fetchAggregatedPortfolios() {
  // Aggregates current AUM per customerId from portfolios * latest NAV
  const client = await getClientPromise;
  const db = client.db('mutual_funds');

  // Aggregate by userId across holdings
  // Assumed schema: portfolios: { userId, schemeCode, units }
  // NAV source: nav_history: { schemeCode, date, nav }
  const pipeline = [
    { $match: { units: { $gt: 0 } } },
    { $lookup: {
        from: COLLECTIONS.NAV_HISTORY,
        let: { sc: '$schemeCode' },
        pipeline: [
          { $match: { $expr: { $eq: ['$schemeCode', '$$sc'] } } },
          { $sort: { date: -1 } },
          { $limit: 1 },
          { $project: { nav: 1 } }
        ],
        as: 'latestNav'
    } },
    { $addFields: { latestNav: { $ifNull: [{ $arrayElemAt: ['$latestNav.nav', 0] }, 0] } } },
    { $addFields: { positionValue: { $multiply: ['$units', '$latestNav'] } } },
    { $group: { _id: '$userId', portfolioValue: { $sum: '$positionValue' } } },
    { $project: { _id: 0, customerId: '$_id', portfolioValue: { $round: ['$portfolioValue', 2] } } }
  ];

  const results = await db.collection(COLLECTIONS.PORTFOLIOS).aggregate(pipeline).toArray();
  return results;
}

async function getRoleMappingForUser(db, customerId) {
  // Try to map from USERS collection; fallback to env-provided ObjectIds
  try {
    const userDoc = await db.collection(COLLECTIONS.USERS).findOne({ userId: customerId });
    if (userDoc && userDoc.sellerId && userDoc.adminId && userDoc.companyId) {
      return {
        sellerId: new mongoose.Types.ObjectId(String(userDoc.sellerId)),
        adminId: new mongoose.Types.ObjectId(String(userDoc.adminId)),
        companyId: new mongoose.Types.ObjectId(String(userDoc.companyId))
      };
    }
  } catch (_) { /* ignore */ }

  const { SELLER_ID, ADMIN_ID, COMPANY_ID } = process.env;
  if (SELLER_ID && ADMIN_ID && COMPANY_ID) {
    return {
      sellerId: new mongoose.Types.ObjectId(SELLER_ID),
      adminId: new mongoose.Types.ObjectId(ADMIN_ID),
      companyId: new mongoose.Types.ObjectId(COMPANY_ID)
    };
  }
  return null; // signal to skip if mapping unavailable
}

async function generateMonthlyCommissions() {
  try {
    console.log('🔄 Starting monthly commission generation...');
    
    // Connect to MongoDB if needed
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const currentPeriod = getCurrentPeriod();
    console.log(`📅 Generating commissions for ${currentPeriod.month}/${currentPeriod.year}`);

    // Real AUM aggregation
    const client = await getClientPromise;
    const db = client.db('mutual_funds');
    const portfolios = await fetchAggregatedPortfolios();

    const commissionRecords = [];

    // Generate commission records for each portfolio
    for (const p of portfolios) {
      if (!p?.customerId || !p?.portfolioValue) continue;
      const mapping = await getRoleMappingForUser(db, p.customerId);
      if (!mapping) {
        console.warn(`Skipping customer ${p.customerId}: role mapping unavailable (set SELLER_ID/ADMIN_ID/COMPANY_ID env or populate USERS).`);
        continue;
      }

      // Check if commission already exists for this period
      const existingCommission = await Commission.findOne({
        customerId: new mongoose.Types.ObjectId(String(p.customerId)),
        'period.month': currentPeriod.month,
        'period.year': currentPeriod.year
      });

      if (existingCommission) {
        console.log(`⚠️ Commission already exists for customer ${p.customerId}`);
        continue;
      }

      const commissionCalc = calculateMonthlyCommission(p.portfolioValue);
      const withdrawalDate = getWithdrawalDate();

      const commissionRecord = new Commission({
        period: currentPeriod,
        customerId: new mongoose.Types.ObjectId(String(p.customerId)),
        sellerId: mapping.sellerId,
        adminId: mapping.adminId,
        companyId: mapping.companyId,
        portfolioValue: p.portfolioValue,
        annualRate: commissionCalc.annualRate,
        monthlyRate: commissionCalc.monthlyRate,
        totalCommission: commissionCalc.totalMonthly,
        breakdown: commissionCalc.breakdown,
        status: 'accrued',
        withdrawalDate: withdrawalDate,
        generatedAt: new Date()
      });

      commissionRecords.push(commissionRecord);
    }

    // Bulk insert commission records
    if (commissionRecords.length > 0) {
      const insertResult = await Commission.insertMany(commissionRecords);
      console.log(`✅ Generated ${insertResult.length} commission records`);
      
      // Calculate totals for reporting
      const totalCommissions = commissionRecords.reduce((sum, c) => sum + c.totalCommission, 0);
      const totalPortfolioValue = commissionRecords.reduce((sum, c) => sum + c.portfolioValue, 0);
      
      console.log(`💰 Total commissions generated: ₹${totalCommissions.toFixed(2)}`);
      console.log(`📊 Total portfolio value: ₹${totalPortfolioValue.toFixed(2)}`);
      
      return {
        success: true,
        recordsGenerated: insertResult.length,
        totalCommissions: Math.round(totalCommissions * 100) / 100,
        totalPortfolioValue: Math.round(totalPortfolioValue * 100) / 100,
        period: currentPeriod
      };
    } else {
      console.log('ℹ️ No new commission records to generate');
      return {
        success: true,
        recordsGenerated: 0,
        message: 'No new commission records needed'
      };
    }

  } catch (error) {
    console.error('❌ Monthly commission generation failed:', error);
    throw error;
  }
}

/**
 * Mark previous month's commissions as available for withdrawal
 * Runs on 5th of every month at 9:00 AM
 */
async function markCommissionsAvailable() {
  try {
    console.log('🔄 Marking commissions as available for withdrawal...');
    
    // Connect to MongoDB if needed
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Calculate previous month period
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const period = {
      month: previousMonth.getMonth() + 1,
      year: previousMonth.getFullYear()
    };

    console.log(`📅 Marking commissions available for ${period.month}/${period.year}`);

    // Update commissions from 'accrued' to 'available'
    const updateResult = await Commission.updateMany(
      {
        'period.month': period.month,
        'period.year': period.year,
        status: 'accrued'
      },
      {
        $set: {
          status: 'available',
          withdrawalDate: new Date() // Update to actual withdrawal date
        }
      }
    );

    console.log(`✅ Marked ${updateResult.modifiedCount} commissions as available`);

    // Get summary of available commissions
    const availableCommissions = await Commission.aggregate([
      {
        $match: {
          'period.month': period.month,
          'period.year': period.year,
          status: 'available'
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalAmount: { $sum: '$totalCommission' },
          totalPortfolioValue: { $sum: '$portfolioValue' },
          sellerTotal: { $sum: '$breakdown.seller' },
          adminTotal: { $sum: '$breakdown.admin' },
          companyTotal: { $sum: '$breakdown.company' }
        }
      }
    ]);

    const summary = availableCommissions[0] || {
      totalRecords: 0,
      totalAmount: 0,
      sellerTotal: 0,
      adminTotal: 0,
      companyTotal: 0
    };

    console.log(`💰 Total available for withdrawal: ₹${summary.totalAmount.toFixed(2)}`);
    console.log(`👥 Sellers: ₹${summary.sellerTotal.toFixed(2)}`);
    console.log(`🛠️ Admins: ₹${summary.adminTotal.toFixed(2)}`);
    console.log(`🏢 Company: ₹${summary.companyTotal.toFixed(2)}`);

    // Optional: simulate statement generation and email notifications
    const statements = availableCommissions.map((doc) => ({
      commissionId: doc._id,
      customerId: doc.customerId,
      period: doc.period,
      amount: doc.totalCommission,
      generatedAt: new Date()
    }));
    console.log(`📄 Generated ${statements.length} statements (simulated)`);
    console.log('✉️ Email notifications sent (simulated)');

    return {
      success: true,
      recordsUpdated: updateResult.modifiedCount,
      period,
      summary: {
        totalRecords: summary.totalRecords,
        totalAmount: Math.round(summary.totalAmount * 100) / 100,
        breakdown: {
          seller: Math.round(summary.sellerTotal * 100) / 100,
          admin: Math.round(summary.adminTotal * 100) / 100,
          company: Math.round(summary.companyTotal * 100) / 100
        }
      },
      statements: statements.slice(0, 10) // return a sample
    };

  } catch (error) {
    console.error('❌ Commission availability update failed:', error);
    throw error;
  }
}

/**
 * Manual trigger functions for testing
 */
export async function triggerCommissionGenerationManually() {
  console.log('🔧 Manual commission generation triggered');
  return await generateMonthlyCommissions();
}

export async function triggerCommissionAvailabilityManually() {
  console.log('🔧 Manual commission availability update triggered');
  return await markCommissionsAvailable();
}

/**
 * Initialize cron jobs
 * Call this function in your app startup (e.g., in instrumentation.js or a startup script)
 */
export function initializeCommissionCronJobs() {
  console.log('🚀 Initializing commission cron jobs...');
  
  // Generate commissions on 1st of every month at 12:01 AM
  cron.schedule('1 0 1 * *', async () => {
    console.log('⏰ Cron: Monthly commission generation started');
    try {
      await generateMonthlyCommissions();
    } catch (error) {
      console.error('⏰ Cron: Monthly commission generation failed:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  // Mark commissions available on 5th of every month at 9:00 AM
  cron.schedule('0 9 5 * *', async () => {
    console.log('⏰ Cron: Commission availability update started');
    try {
      await markCommissionsAvailable();
    } catch (error) {
      console.error('⏰ Cron: Commission availability update failed:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('✅ Commission cron jobs initialized');
  console.log('📅 Schedule: 1st at 12:01 AM - Generate commissions');
  console.log('📅 Schedule: 5th at 9:00 AM - Mark available for withdrawal');
}