import { NextResponse } from 'next/server';

export async function GET() {
  // Emergency hardcoded data that mirrors real MFAPI structure
  // This ensures your UI works while we debug the API connection
  const emergencyActiveFunds = [
    {
      fundName: "Aditya Birla Sun Life Top 100 Fund - Growth",
      nav: 734.67,
      navDate: "14-01-2024",
      category: "Large Cap Fund",
      schemeCode: "101206",
      fundHouse: "Aditya Birla Sun Life Mutual Fund",
      schemeType: "Open Ended",
      metaFieldCount: 8,
      navEntryCount: 150,
      hasIsinGrowth: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "HDFC Equity Fund - Growth",
      nav: 899.45,
      navDate: "14-01-2024",
      category: "Large Cap Fund",
      schemeCode: "101308",
      fundHouse: "HDFC Mutual Fund",
      schemeType: "Open Ended",
      metaFieldCount: 9,
      navEntryCount: 200,
      hasIsinGrowth: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "ICICI Prudential Bluechip Fund - Growth",
      nav: 67.89,
      navDate: "14-01-2024",
      category: "Large Cap Fund",
      schemeCode: "120503",
      fundHouse: "ICICI Prudential Mutual Fund",
      schemeType: "Open Ended",
      metaFieldCount: 7,
      navEntryCount: 180,
      hasIsinGrowth: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "SBI Small Cap Fund - Growth",
      nav: 156.23,
      navDate: "14-01-2024",
      category: "Small Cap Fund",
      schemeCode: "120716",
      fundHouse: "SBI Mutual Fund",
      schemeType: "Open Ended",
      metaFieldCount: 6,
      navEntryCount: 120,
      hasIsinGrowth: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Axis Midcap Fund - Growth",
      nav: 89.56,
      navDate: "14-01-2024",
      category: "Mid Cap Fund",
      schemeCode: "134506",
      fundHouse: "Axis Mutual Fund",
      schemeType: "Open Ended",
      metaFieldCount: 8,
      navEntryCount: 140,
      hasIsinGrowth: false,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Franklin India Prima Plus - Growth",
      nav: 1234.78,
      navDate: "14-01-2024",
      category: "Multi Cap Fund",
      schemeCode: "101762",
      fundHouse: "Franklin Templeton Mutual Fund",
      schemeType: "Open Ended",
      metaFieldCount: 10,
      navEntryCount: 220,
      hasIsinGrowth: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "DSP BlackRock Tax Saver Fund - Growth",
      nav: 78.45,
      navDate: "14-01-2024",
      category: "ELSS",
      schemeCode: "102885",
      fundHouse: "DSP BlackRock Investment Managers",
      schemeType: "Open Ended",
      metaFieldCount: 8,
      navEntryCount: 160,
      hasIsinGrowth: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Kotak Standard Multicap Fund - Growth",
      nav: 45.67,
      navDate: "14-01-2024",
      category: "Multi Cap Fund",
      schemeCode: "101499",
      fundHouse: "Kotak Mahindra Mutual Fund",
      schemeType: "Open Ended",
      metaFieldCount: 7,
      navEntryCount: 130,
      hasIsinGrowth: false,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "L&T India Value Fund - Growth",
      nav: 234.89,
      navDate: "14-01-2024",
      category: "Large & Mid Cap Fund",
      schemeCode: "125498",
      fundHouse: "L&T Investment Management",
      schemeType: "Open Ended",
      metaFieldCount: 9,
      navEntryCount: 190,
      hasIsinGrowth: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "UTI Mastershare Unit Scheme - Growth",
      nav: 167.34,
      navDate: "14-01-2024",
      category: "Large Cap Fund",
      schemeCode: "101026",
      fundHouse: "UTI Mutual Fund",
      schemeType: "Open Ended",
      metaFieldCount: 8,
      navEntryCount: 170,
      hasIsinGrowth: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Reliance Large Cap Fund - Growth",
      nav: 56.78,
      navDate: "14-01-2024",
      category: "Large Cap Fund",
      schemeCode: "103456",
      fundHouse: "Reliance Mutual Fund",
      schemeType: "Open Ended",
      metaFieldCount: 7,
      navEntryCount: 155,
      hasIsinGrowth: false,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Tata Digital India Fund - Growth",
      nav: 89.12,
      navDate: "14-01-2024",
      category: "Sectoral/Thematic",
      schemeCode: "104567",
      fundHouse: "Tata Mutual Fund",
      schemeType: "Open Ended",
      metaFieldCount: 6,
      navEntryCount: 110,
      hasIsinGrowth: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Mirae Asset Large Cap Fund - Growth",
      nav: 123.45,
      navDate: "14-01-2024",
      category: "Large Cap Fund",
      schemeCode: "105678",
      fundHouse: "Mirae Asset Mutual Fund",
      schemeType: "Open Ended",
      metaFieldCount: 8,
      navEntryCount: 175,
      hasIsinGrowth: true,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Invesco India Contra Fund - Growth",
      nav: 67.23,
      navDate: "14-01-2024",
      category: "Large & Mid Cap Fund",
      schemeCode: "106789",
      fundHouse: "Invesco Mutual Fund",
      schemeType: "Open Ended",
      metaFieldCount: 7,
      navEntryCount: 145,
      hasIsinGrowth: false,
      dataSource: "Emergency-Fallback"
    },
    {
      fundName: "Nippon India Small Cap Fund - Growth",
      nav: 198.76,
      navDate: "14-01-2024",
      category: "Small Cap Fund",
      schemeCode: "107890",
      fundHouse: "Nippon India Mutual Fund",
      schemeType: "Open Ended",
      metaFieldCount: 9,
      navEntryCount: 165,
      hasIsinGrowth: true,
      dataSource: "Emergency-Fallback"
    }
  ];

  console.log(`🚨 EMERGENCY FALLBACK: Serving ${emergencyActiveFunds.length} hardcoded funds`);
  console.log(`💡 This ensures your UI works while we debug the MFAPI connection issue`);

  return NextResponse.json({
    success: true,
    message: 'Emergency fallback active funds - hardcoded realistic data',
    activeFunds: emergencyActiveFunds,
    count: emergencyActiveFunds.length,
    generatedAt: new Date().toISOString(),
    isEmergencyFallback: true,
    note: 'This is hardcoded data to ensure UI functionality while debugging MFAPI connection'
  });
}