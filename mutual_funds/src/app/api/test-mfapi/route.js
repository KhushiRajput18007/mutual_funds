import { NextResponse } from 'next/server';

async function fetchWithTimeout(url, ms = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  try {
    console.log('Testing MFAPI connectivity...');
    
    // Test 1: Fetch scheme list (limited to 10)
    const listRes = await fetchWithTimeout('https://api.mfapi.in/mf', 8000);
    if (!listRes.ok) throw new Error(`MFAPI list failed: ${listRes.status}`);
    const list = await listRes.json();
    
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('MFAPI returned empty list');
    }
    
    console.log(`Got ${list.length} schemes from MFAPI`);
    
    // Test 2: Fetch details for first 10 schemes and filter for active funds
    const sampleSchemes = list.slice(0, 10);
    const testFunds = [];
    const inactiveFunds = [];
    
    for (const scheme of sampleSchemes) {
      try {
        const detailRes = await fetchWithTimeout(`https://api.mfapi.in/mf/${scheme.schemeCode}`, 8000);
        if (!detailRes.ok) continue;
        
        const data = await detailRes.json();
        const meta = data?.meta || {};
        const navData = Array.isArray(data?.data) ? data.data : [];
        
        // Check if fund is active (has valid isinGrowth)
        const isinGrowth = meta.isin_growth || meta.isinGrowth || null;
        const isActive = isinGrowth && isinGrowth.trim() !== '';
        
        if (navData.length > 0) {
          const nav = parseFloat(navData[0].nav);
          if (nav && nav > 0) {
            const fundData = {
              fundName: scheme.schemeName,
              nav: nav,
              navDate: navData[0].date,
              category: meta.scheme_category || meta.category || 'Mutual Fund',
              schemeCode: String(scheme.schemeCode),
              fundHouse: meta.fund_house || 'Unknown',
              isinGrowth: isinGrowth,
              isActive: isActive
            };
            
            if (isActive) {
              testFunds.push(fundData);
            } else {
              inactiveFunds.push(fundData);
            }
          }
        }
      } catch (e) {
        console.log(`Skip ${scheme.schemeCode}: ${e.message}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'MFAPI is working correctly',
      totalSchemesAvailable: list.length,
      activeFunds: testFunds,
      inactiveFunds: inactiveFunds,
      filteringLogic: {
        rule: 'A fund is ACTIVE only if isinGrowth has a valid value (not null/empty)',
        activeCount: testFunds.length,
        inactiveCount: inactiveFunds.length
      },
      testResults: {
        apiConnectivity: 'OK',
        dataFormat: 'OK',
        totalProcessed: testFunds.length + inactiveFunds.length,
        activeFundsFound: testFunds.length
      }
    });
    
  } catch (error) {
    console.error('MFAPI test failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      testResults: {
        apiConnectivity: 'FAILED',
        dataFormat: 'UNKNOWN'
      }
    }, { status: 500 });
  }
}