import { NextResponse } from 'next/server';

function calculateReturns(navData, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Find NAV closest to start date
  let startNAV = null;
  let endNAV = null;
  
  for (const entry of navData) {
    const entryDate = new Date(entry.date);
    if (entryDate <= start && (!startNAV || entryDate > new Date(startNAV.date))) {
      startNAV = entry;
    }
    if (entryDate <= end && (!endNAV || entryDate > new Date(endNAV.date))) {
      endNAV = entry;
    }
  }
  
  if (!startNAV || !endNAV) {
    return null;
  }
  
  const simpleReturn = ((parseFloat(endNAV.nav) - parseFloat(startNAV.nav)) / parseFloat(startNAV.nav)) * 100;
  
  // Calculate annualized return if duration >= 30 days
  const daysDiff = (end - new Date(startNAV.date)) / (1000 * 60 * 60 * 24);
  let annualizedReturn = null;
  
  if (daysDiff >= 30) {
    const years = daysDiff / 365.25;
    annualizedReturn = (Math.pow(parseFloat(endNAV.nav) / parseFloat(startNAV.nav), 1 / years) - 1) * 100;
  }
  
  return {
    startDate: startNAV.date,
    endDate: endNAV.date,
    startNAV: parseFloat(startNAV.nav),
    endNAV: parseFloat(endNAV.nav),
    simpleReturn: parseFloat(simpleReturn.toFixed(2)),
    annualizedReturn: annualizedReturn ? parseFloat(annualizedReturn.toFixed(2)) : null
  };
}

export async function GET(request, { params }) {
  try {
    const { code } = params;
    const { searchParams } = new URL(request.url);
    
    // Get scheme data
    const schemeResponse = await fetch(`${request.nextUrl.origin}/api/scheme/${code}`);
    const schemeData = await schemeResponse.json();
    
    if (!schemeData.data) {
      return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    }
    
    const period = searchParams.get('period');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    let startDate, endDate;
    
    if (period) {
      const now = new Date();
      endDate = now.toISOString().split('T')[0];
      
      switch (period) {
        case '1m':
          startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
          break;
        case '3m':
          startDate = new Date(now.setMonth(now.getMonth() - 3)).toISOString().split('T')[0];
          break;
        case '6m':
          startDate = new Date(now.setMonth(now.getMonth() - 6)).toISOString().split('T')[0];
          break;
        case '1y':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
          break;
        default:
          return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
      }
    } else if (from && to) {
      startDate = from;
      endDate = to;
    } else {
      return NextResponse.json({ error: 'Either period or from/to dates required' }, { status: 400 });
    }
    
    const returns = calculateReturns(schemeData.data, startDate, endDate);
    
    if (!returns) {
      return NextResponse.json({ error: 'Insufficient data for calculation' }, { status: 400 });
    }
    
    return NextResponse.json(returns);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate returns' }, { status: 500 });
  }
}