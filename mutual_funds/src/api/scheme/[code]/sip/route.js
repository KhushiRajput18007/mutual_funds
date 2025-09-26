import { NextResponse } from 'next/server';

function calculateSIP(navData, amount, frequency, fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  
  let totalInvested = 0;
  let totalUnits = 0;
  const investments = [];
  
  // Generate SIP dates
  const sipDates = [];
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    sipDates.push(new Date(currentDate));
    
    if (frequency === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (frequency === 'quarterly') {
      currentDate.setMonth(currentDate.getMonth() + 3);
    } else if (frequency === 'yearly') {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
  }
  
  // Calculate units for each SIP date
  for (const sipDate of sipDates) {
    let navForDate = null;
    
    // Find NAV for SIP date or nearest earlier date
    for (const entry of navData) {
      const entryDate = new Date(entry.date);
      if (entryDate <= sipDate && parseFloat(entry.nav) > 0) {
        if (!navForDate || entryDate > new Date(navForDate.date)) {
          navForDate = entry;
        }
      }
    }
    
    if (navForDate) {
      const units = amount / parseFloat(navForDate.nav);
      totalUnits += units;
      totalInvested += amount;
      
      investments.push({
        date: sipDate.toISOString().split('T')[0],
        nav: parseFloat(navForDate.nav),
        amount: amount,
        units: units
      });
    }
  }
  
  // Get latest NAV for current value calculation
  let latestNAV = null;
  for (const entry of navData) {
    if (!latestNAV || new Date(entry.date) > new Date(latestNAV.date)) {
      latestNAV = entry;
    }
  }
  
  if (!latestNAV || totalInvested === 0) {
    return null;
  }
  
  const currentValue = totalUnits * parseFloat(latestNAV.nav);
  const absoluteReturn = ((currentValue - totalInvested) / totalInvested) * 100;
  
  // Calculate annualized return
  const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
  const annualizedReturn = years > 0 ? (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100 : 0;
  
  return {
    totalInvested: parseFloat(totalInvested.toFixed(2)),
    currentValue: parseFloat(currentValue.toFixed(2)),
    totalUnits: parseFloat(totalUnits.toFixed(4)),
    absoluteReturn: parseFloat(absoluteReturn.toFixed(2)),
    annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
    investments
  };
}

export async function POST(request, { params }) {
  try {
    const { code } = params;
    const body = await request.json();
    const { amount, frequency, from, to } = body;
    
    if (!amount || !frequency || !from || !to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get scheme data
    const schemeResponse = await fetch(`${request.nextUrl.origin}/api/scheme/${code}`);
    const schemeData = await schemeResponse.json();
    
    if (!schemeData.data) {
      return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    }
    
    const sipResult = calculateSIP(schemeData.data, amount, frequency, from, to);
    
    if (!sipResult) {
      return NextResponse.json({ error: 'Insufficient data for SIP calculation' }, { status: 400 });
    }
    
    return NextResponse.json(sipResult);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate SIP' }, { status: 500 });
  }
}