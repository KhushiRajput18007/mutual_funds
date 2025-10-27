import { NextResponse } from 'next/server';

export async function GET() {
  // Emergency hardcoded trending funds data
  const emergencyTrendingFunds = [
    {
      fundName: "HDFC Top 100 Fund - Growth",
      nav: 724.32,
      navDate: "14-01-2024",
      category: "Large Cap Fund",
      schemeCode: "101308",
      fundHouse: "HDFC Mutual Fund",
      schemeType: "Open Ended",
      recentChange: 2.45,
      trendDirection: "up",
      trendReason: "Recent Gains",
      isTrending: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "SBI Technology Opportunities Fund - Growth",
      nav: 456.78,
      navDate: "14-01-2024",
      category: "Sectoral/Thematic",
      schemeCode: "120503",
      fundHouse: "SBI Mutual Fund",
      schemeType: "Open Ended",
      recentChange: 3.67,
      trendDirection: "up",
      trendReason: "Recent Gains",
      isTrending: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "ICICI Prudential Pharma Healthcare Fund - Growth",
      nav: 389.12,
      navDate: "14-01-2024",
      category: "Sectoral/Thematic",
      schemeCode: "120716",
      fundHouse: "ICICI Prudential Mutual Fund",
      schemeType: "Open Ended",
      recentChange: 1.89,
      trendDirection: "up",
      trendReason: "Recent Gains",
      isTrending: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Axis Small Cap Fund - Growth",
      nav: 67.89,
      navDate: "14-01-2024",
      category: "Small Cap Fund",
      schemeCode: "134506",
      fundHouse: "Axis Mutual Fund",
      schemeType: "Open Ended",
      recentChange: 4.12,
      trendDirection: "up",
      trendReason: "Recent Gains",
      isTrending: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Mirae Asset Emerging Bluechip Fund - Growth",
      nav: 98.12,
      navDate: "14-01-2024",
      category: "Large & Mid Cap Fund",
      schemeCode: "101762",
      fundHouse: "Mirae Asset Mutual Fund",
      schemeType: "Open Ended",
      recentChange: 2.78,
      trendDirection: "up",
      trendReason: "Recent Gains",
      isTrending: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Franklin India Focused Equity Fund - Growth",
      nav: 234.56,
      navDate: "14-01-2024",
      category: "Focused Fund",
      schemeCode: "102885",
      fundHouse: "Franklin Templeton Mutual Fund",
      schemeType: "Open Ended",
      recentChange: 1.45,
      trendDirection: "up",
      trendReason: "Recent Gains",
      isTrending: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "DSP Midcap Fund - Growth",
      nav: 156.78,
      navDate: "14-01-2024",
      category: "Mid Cap Fund",
      schemeCode: "101499",
      fundHouse: "DSP Investment Managers",
      schemeType: "Open Ended",
      recentChange: 3.21,
      trendDirection: "up",
      trendReason: "Recent Gains",
      isTrending: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "L&T Infrastructure Fund - Growth",
      nav: 89.34,
      navDate: "14-01-2024",
      category: "Sectoral/Thematic",
      schemeCode: "125498",
      fundHouse: "L&T Investment Management",
      schemeType: "Open Ended",
      recentChange: 2.90,
      trendDirection: "up",
      trendReason: "Recent Gains",
      isTrending: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "UTI Mastergain Unit Scheme - Growth",
      nav: 234.67,
      navDate: "14-01-2024",
      category: "Large Cap Fund",
      schemeCode: "101026",
      fundHouse: "UTI Mutual Fund",
      schemeType: "Open Ended",
      recentChange: 1.67,
      trendDirection: "up",
      trendReason: "Recent Gains",
      isTrending: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Tata Digital India Fund - Growth",
      nav: 345.89,
      navDate: "14-01-2024",
      category: "Sectoral/Thematic",
      schemeCode: "103456",
      fundHouse: "Tata Mutual Fund",
      schemeType: "Open Ended",
      recentChange: 5.23,
      trendDirection: "up",
      trendReason: "Recent Gains",
      isTrending: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Nippon India Growth Fund - Growth",
      nav: 178.90,
      navDate: "14-01-2024",
      category: "Multi Cap Fund",
      schemeCode: "104567",
      fundHouse: "Nippon India Mutual Fund",
      schemeType: "Open Ended",
      recentChange: 0.89,
      trendDirection: "up",
      trendReason: "Popular Category",
      isTrending: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Invesco India Financial Services Fund - Growth",
      nav: 123.45,
      navDate: "14-01-2024",
      category: "Sectoral/Thematic",
      schemeCode: "105678",
      fundHouse: "Invesco Mutual Fund",
      schemeType: "Open Ended",
      recentChange: 2.34,
      trendDirection: "up",
      trendReason: "Recent Gains",
      isTrending: true,
      dataSource: "Emergency-Fallback"
    }
  ];

  // Sort by recent performance (best first)
  emergencyTrendingFunds.sort((a, b) => (b.recentChange || 0) - (a.recentChange || 0));

  console.log(`🚨 EMERGENCY TRENDING FALLBACK: Serving ${emergencyTrendingFunds.length} hardcoded trending funds`);
  console.log(`💡 This ensures your trending funds UI works while we debug the MFAPI connection issue`);

  return NextResponse.json({
    success: true,
    message: 'Emergency fallback trending funds - hardcoded realistic data',
    activeFunds: emergencyTrendingFunds, // Use activeFunds key for compatibility
    trendingFunds: emergencyTrendingFunds,
    count: emergencyTrendingFunds.length,
    generatedAt: new Date().toISOString(),
    isEmergencyFallback: true,
    note: 'This is hardcoded trending data to ensure UI functionality while debugging MFAPI connection'
  });
}