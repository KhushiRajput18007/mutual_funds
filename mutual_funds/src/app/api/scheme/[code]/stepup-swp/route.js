import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { code } = await params;
    const { initialInvestment, withdrawalAmount, frequency, from, to, step_up_percentage } = await request.json();

    const response = await fetch(`https://api.mfapi.in/mf/${code}`);
    const schemeData = await response.json();

    if (!schemeData.data) {
      return NextResponse.json({ error: 'Scheme data not found' }, { status: 404 });
    }

    const navData = schemeData.data;
    const startDate = new Date(from);
    const endDate = new Date(to);
    
    let initialNAV = null;
    for (const entry of navData) {
      const entryDate = new Date(entry.date);
      if (entryDate <= startDate && (!initialNAV || entryDate > new Date(initialNAV.date))) {
        initialNAV = entry;
      }
    }

    if (!initialNAV) {
      return NextResponse.json({ error: 'No NAV data available for start date' }, { status: 400 });
    }

    let remainingUnits = initialInvestment / parseFloat(initialNAV.nav);
    let totalWithdrawn = 0;
    let currentWithdrawal = withdrawalAmount;
    let currentYear = startDate.getFullYear();

    const withdrawalDates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      withdrawalDates.push(new Date(currentDate));
      
      if (frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (frequency === 'quarterly') {
        currentDate.setMonth(currentDate.getMonth() + 3);
      } else if (frequency === 'yearly') {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }

    for (const withdrawalDate of withdrawalDates) {
      if (remainingUnits <= 0) break;

      const year = withdrawalDate.getFullYear();
      if (year > currentYear) {
        currentWithdrawal = currentWithdrawal * (1 + step_up_percentage / 100);
        currentYear = year;
      }

      let navForDate = null;
      for (const entry of navData) {
        const entryDate = new Date(entry.date);
        if (entryDate <= withdrawalDate && parseFloat(entry.nav) > 0) {
          if (!navForDate || entryDate > new Date(navForDate.date)) {
            navForDate = entry;
          }
        }
      }

      if (navForDate) {
        const unitsToRedeem = currentWithdrawal / parseFloat(navForDate.nav);
        const actualUnitsRedeemed = Math.min(unitsToRedeem, remainingUnits);
        const actualWithdrawal = actualUnitsRedeemed * parseFloat(navForDate.nav);
        
        remainingUnits -= actualUnitsRedeemed;
        totalWithdrawn += actualWithdrawal;
      }
    }

    let finalNAV = null;
    for (const entry of navData) {
      if (!finalNAV || new Date(entry.date) > new Date(finalNAV.date)) {
        finalNAV = entry;
      }
    }

    const remainingValue = remainingUnits * parseFloat(finalNAV.nav);
    const totalValue = totalWithdrawn + remainingValue;

    return NextResponse.json({
      initialInvestment,
      totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      remainingValue: parseFloat(remainingValue.toFixed(2)),
      remainingUnits: parseFloat(remainingUnits.toFixed(4)),
      totalValue: parseFloat(totalValue.toFixed(2))
    });

  } catch (error) {
    console.error('Error calculating step-up SWP:', error);
    return NextResponse.json({ error: 'Failed to calculate step-up SWP' }, { status: 500 });
  }
}