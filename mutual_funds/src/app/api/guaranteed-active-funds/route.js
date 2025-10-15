import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔥 GUARANTEED Active Funds - Fetching from MFAPI...');
    
    // Step 1: Get scheme list from MFAPI
    console.log('📡 Fetching scheme list...');
    const listResponse = await fetch('https://api.mfapi.in/mf', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      cache: 'no-store'
    });
    
    if (!listResponse.ok) {
      throw new Error(`MFAPI list request failed: ${listResponse.status} - ${listResponse.statusText}`);
    }
    
    const schemes = await listResponse.json();
    console.log(`✅ Got ${schemes.length} total schemes from MFAPI`);
    
    if (!Array.isArray(schemes) || schemes.length === 0) {
      throw new Error('No schemes returned from MFAPI');
    }
    
    // Step 2: Process first 20 schemes with ZERO filtering - just show what we get
    console.log('🔍 Processing first 20 schemes with NO filtering...');
    const testSchemes = schemes.slice(0, 20);
    const activeFunds = [];
    
    for (let i = 0; i < testSchemes.length; i++) {
      const scheme = testSchemes[i];
      console.log(`📊 ${i + 1}/20: Processing ${scheme.schemeName} (${scheme.schemeCode})`);
      
      try {
        const detailResponse = await fetch(`https://api.mfapi.in/mf/${scheme.schemeCode}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          cache: 'no-store'
        });
        
        if (!detailResponse.ok) {
          console.log(`   ❌ Detail request failed: ${detailResponse.status}`);
          continue;
        }
        
        const data = await detailResponse.json();
        const meta = data?.meta || {};
        const navData = Array.isArray(data?.data) ? data.data : [];
        
        console.log(`   📋 Meta fields: ${Object.keys(meta).length} fields`);
        console.log(`   💰 NAV entries: ${navData.length} entries`);
        
        // ZERO FILTERING - Include EVERY fund that has ANY NAV data
        if (navData.length > 0) {
          const latestNav = navData[0];
          const nav = parseFloat(latestNav.nav);
          
          if (nav && nav > 0) {
            const fund = {
              fundName: scheme.schemeName || `Scheme ${scheme.schemeCode}`,
              nav: nav,
              navDate: latestNav.date,
              category: meta.scheme_category || 'Mutual Fund',
              schemeCode: String(scheme.schemeCode),
              fundHouse: meta.fund_house || 'AMC',
              schemeType: meta.scheme_type || 'Open Ended',
              // Debug info
              metaFieldCount: Object.keys(meta).length,
              navEntryCount: navData.length,
              hasIsinGrowth: !!(meta.isin_growth || meta.isinGrowth),
              dataSource: 'MFAPI-Direct',
              processingTime: new Date().toISOString()
            };
            
            activeFunds.push(fund);
            console.log(`   ✅ Added: ${fund.fundName} - NAV: ₹${fund.nav}`);
          } else {
            console.log(`   ⚠️  Invalid NAV: ${latestNav.nav}`);
          }
        } else {
          console.log(`   ⚠️  No NAV data available`);
        }
        
        // Small delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 150));
        
      } catch (error) {
        console.log(`   ❌ Error processing ${scheme.schemeCode}: ${error.message}`);
      }
    }
    
    console.log(`\n🎯 FINAL RESULTS:`);
    console.log(`   Total schemes from MFAPI: ${schemes.length}`);
    console.log(`   Schemes processed: ${testSchemes.length}`);
    console.log(`   Active funds found: ${activeFunds.length}`);
    console.log(`   Success rate: ${testSchemes.length > 0 ? ((activeFunds.length / testSchemes.length) * 100).toFixed(1) : 0}%`);
    
    if (activeFunds.length === 0) {
      console.log(`\n🚨 ZERO FUNDS FOUND - This indicates a deeper issue!`);
    }
    
    // Return the results
    return NextResponse.json({
      success: true,
      message: 'Guaranteed active funds with zero filtering',
      totalSchemesFromAPI: schemes.length,
      schemesProcessed: testSchemes.length,
      activeFunds: activeFunds,
      count: activeFunds.length,
      generatedAt: new Date().toISOString(),
      debug: {
        firstScheme: schemes[0],
        testingCriteria: 'ZERO filtering - any fund with NAV data is included',
        processedSchemes: testSchemes.map(s => ({ code: s.schemeCode, name: s.schemeName }))
      }
    });
    
  } catch (error) {
    console.error('🚨 Guaranteed active funds failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      activeFunds: [],
      count: 0,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}