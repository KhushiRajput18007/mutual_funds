import { NextResponse } from 'next/server';

export async function GET() {
  // Hardcoded dummy active funds data for immediate testing
  const dummyActiveFunds = [
    {
      fundName: "SBI Bluechip Fund - Growth",
      nav: 85.45,
      navDate: "2024-01-13",
      category: "Large Cap Fund",
      schemeCode: "101206",
      fundHouse: "SBI Mutual Fund",
      isinGrowth: "INF200K01DM3",
      hasValidIsinGrowth: true,
      isActiveReason: "Has ISIN Growth"
    },
    {
      fundName: "HDFC Top 100 Fund - Growth",
      nav: 724.32,
      navDate: "2024-01-13", 
      category: "Large Cap Fund",
      schemeCode: "101308",
      fundHouse: "HDFC Mutual Fund",
      isinGrowth: "INF179K01AL7",
      hasValidIsinGrowth: true,
      isActiveReason: "Has ISIN Growth"
    },
    {
      fundName: "ICICI Prudential Technology Fund - Growth",
      nav: 145.67,
      navDate: "2024-01-13",
      category: "Sectoral/Thematic",
      schemeCode: "120503",
      fundHouse: "ICICI Prudential Mutual Fund",
      isinGrowth: "INF109K01LU6",
      hasValidIsinGrowth: true,
      isActiveReason: "Has ISIN Growth"
    },
    {
      fundName: "Axis Small Cap Fund - Growth",
      nav: 67.89,
      navDate: "2024-01-13",
      category: "Small Cap Fund",
      schemeCode: "120716",
      fundHouse: "Axis Mutual Fund",
      isinGrowth: "INF846K01EY0",
      hasValidIsinGrowth: true,
      isActiveReason: "Has ISIN Growth"
    },
    {
      fundName: "Mirae Asset Large Cap Fund - Growth", 
      nav: 98.12,
      navDate: "2024-01-13",
      category: "Large Cap Fund",
      schemeCode: "134506",
      fundHouse: "Mirae Asset Mutual Fund",
      isinGrowth: "INF769K01GL3",
      hasValidIsinGrowth: true,
      isActiveReason: "Has ISIN Growth"
    },
    {
      fundName: "Franklin India Prima Fund - Growth",
      nav: 1234.56,
      navDate: "2024-01-13",
      category: "Multi Cap Fund",
      schemeCode: "101762",
      fundHouse: "Franklin Templeton Mutual Fund",
      isinGrowth: "INF020K01DB9",
      hasValidIsinGrowth: true,
      isActiveReason: "Has ISIN Growth"
    },
    {
      fundName: "DSP BlackRock Micro Cap Fund - Growth",
      nav: 156.78,
      navDate: "2024-01-13",
      category: "Small Cap Fund", 
      schemeCode: "102885",
      fundHouse: "DSP BlackRock Mutual Fund",
      isinGrowth: "INF740K01EU5",
      hasValidIsinGrowth: true,
      isActiveReason: "Has ISIN Growth"
    },
    {
      fundName: "Kotak Standard Multicap Fund - Growth",
      nav: 56.43,
      navDate: "2024-01-13",
      category: "Multi Cap Fund",
      schemeCode: "101499",
      fundHouse: "Kotak Mahindra Mutual Fund",
      isinGrowth: "INF174K01LS2",
      hasValidIsinGrowth: true,
      isActiveReason: "Has ISIN Growth"
    },
    {
      fundName: "L&T India Value Fund - Growth",
      nav: 89.34,
      navDate: "2024-01-13",
      category: "Large & Mid Cap Fund",
      schemeCode: "125498",
      fundHouse: "L&T Mutual Fund",
      isinGrowth: "INF855K01AH8",
      hasValidIsinGrowth: true,
      isActiveReason: "Has ISIN Growth"
    },
    {
      fundName: "UTI Mastershare Unit Scheme - Growth",
      nav: 234.67,
      navDate: "2024-01-13",
      category: "Large Cap Fund",
      schemeCode: "101026",
      fundHouse: "UTI Mutual Fund", 
      isinGrowth: "INF789K01BR4",
      hasValidIsinGrowth: true,
      isActiveReason: "Has ISIN Growth"
    }
  ];

  console.log(`🎯 DUMMY DATA: Returning ${dummyActiveFunds.length} hardcoded active funds`);

  return NextResponse.json({
    success: true,
    message: "Using hardcoded dummy data for testing",
    activeFunds: dummyActiveFunds,
    count: dummyActiveFunds.length,
    generatedAt: new Date().toISOString(),
    isDummyData: true,
    note: "This is hardcoded test data. Replace with real MFAPI data once connectivity issues are resolved."
  });
}