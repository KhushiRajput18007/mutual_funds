import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { code } = await params;
    const { amount, frequency, from, to, step_up_percentage } = await request.json();

    const response = await fetch(`https://api.mfapi.in/mf/${code}`);
    const schemeData = await response.json();

    if (!schemeData.data) {
      return NextResponse.json({ error: 'Scheme data not found' }, { status: 404 });
    }

    const navData = schemeData.data;
    const startDate = new Date(from);
    const endDate = new Date(to);
    
    let totalInvested = 0;
    let totalUnits = 0;
    let currentAmount = amount;
    let currentYear = startDate.getFullYear();
    
    const investmentDates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      investmentDates.push(new Date(currentDate));
      
      if (frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (frequency === 'quarterly') {
        currentDate.setMonth(currentDate.getMonth() + 3);
      } else if (frequency === 'yearly') {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }

    for (const investmentDate of investmentDates) {
      const year = investmentDate.getFullYear();
      if (year > currentYear) {
        currentAmount = currentAmount * (1 + step_up_percentage / 100);
        currentYear = year;
      }

      let navForDate = null;
      for (const entry of navData) {
        const entryDate = new Date(entry.date);
        if (entryDate <= investmentDate && parseFloat(entry.nav) > 0) {
          if (!navForDate || entryDate > new Date(navForDate.date)) {
            navForDate = entry;
          }
        }
      }

      if (navForDate) {
        const units = currentAmount / parseFloat(navForDate.nav);
        totalUnits += units;
        totalInvested += currentAmount;
      }
    }

    let latestNAV = null;
    for (const entry of navData) {
      if (!latestNAV || new Date(entry.date) > new Date(latestNAV.date)) {
        latestNAV = entry;
      }
    }

    const currentValue = totalUnits * parseFloat(latestNAV.nav);
    const absoluteReturn = ((currentValue - totalInvested) / totalInvested) * 100;
    
    const years = (endDate - startDate) / (365.25 * 24 * 60 * 60 * 1000);
    const annualizedReturn = years >= 1 ? (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100 : absoluteReturn;

    return NextResponse.json({
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      currentValue: parseFloat(currentValue.toFixed(2)),
      totalUnitsPurchased: parseFloat(totalUnits.toFixed(4)),
      absoluteReturn: parseFloat(absoluteReturn.toFixed(2)),
      annualizedReturn: parseFloat(annualizedReturn.toFixed(2))
    });

  } catch (error) {
    console.error('Error calculating step-up SIP:', error);
    return NextResponse.json({ error: 'Failed to calculate step-up SIP' }, { status: 500 });
  }
}