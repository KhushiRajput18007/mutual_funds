import { NextResponse } from 'next/server';
// import clientPromise from '@/lib/mongodb';
// import { COLLECTIONS } from '@/lib/models';

export async function GET(request) {
  try {
    // Temporary fallback - analytics disabled for build
    return NextResponse.json({
      message: 'Analytics temporarily unavailable',
      totalSchemes: 0,
      totalUsers: 0,
      totalPortfolios: 0
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
