import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // popular-schemes, top-performers, user-activity
    
    const client = await clientPromise;
    const db = client.db('mutualfunds');
    
    let result = {};
    
    switch (type) {
      case 'popular-schemes':
        // Most searched/viewed schemes
        const popularSchemes = await db.collection(COLLECTIONS.SCHEME_DATA)
          .find({})
          .sort({ timestamp: -1 })
          .limit(10)
          .toArray();
        result = { popularSchemes: popularSchemes.map(s => s.data?.meta) };
        break;
        
      case 'top-performers':
        // Schemes with best returns (would need calculation)
        const topPerformers = await db.collection(COLLECTIONS.SCHEMES)
          .find({ schemeCode: { $exists: true } })
          .limit(10)
          .toArray();
        result = { topPerformers };
        break;
        
      case 'user-activity':
        // User activity stats
        const totalUsers = await db.collection(COLLECTIONS.USERS).countDocuments();
        const totalPortfolios = await db.collection(COLLECTIONS.PORTFOLIOS).countDocuments();
        const totalCalculations = await db.collection(COLLECTIONS.CALCULATIONS).countDocuments();
        
        result = {
          totalUsers,
          totalPortfolios,
          totalCalculations,
          activeSchemes: await db.collection(COLLECTIONS.SCHEMES).countDocuments()
        };
        break;
        
      case 'portfolio-summary':
        // Portfolio analytics
        const portfolioStats = await db.collection(COLLECTIONS.PORTFOLIOS).aggregate([
          {
            $group: {
              _id: '$schemeCode',
              totalInvestment: { $sum: '$investedAmount' },
              totalUnits: { $sum: '$units' },
              userCount: { $sum: 1 }
            }
          },
          { $sort: { totalInvestment: -1 } },
          { $limit: 10 }
        ]).toArray();
        
        result = { portfolioStats };
        break;
        
      default:
        // General analytics
        result = {
          totalSchemes: await db.collection(COLLECTIONS.SCHEMES).countDocuments(),
          cachedSchemeData: await db.collection(COLLECTIONS.SCHEME_DATA).countDocuments(),
          navRecords: await db.collection(COLLECTIONS.NAV_HISTORY).countDocuments(),
          totalUsers: await db.collection(COLLECTIONS.USERS).countDocuments(),
          totalPortfolios: await db.collection(COLLECTIONS.PORTFOLIOS).countDocuments(),
          totalCalculations: await db.collection(COLLECTIONS.CALCULATIONS).countDocuments()
        };
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}