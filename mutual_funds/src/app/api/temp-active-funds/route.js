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
    console.log('🔍 Fetching funds for debugging (showing all funds with ISIN status)...');
    
    // Get scheme list
    const listRes = await fetchWithTimeout('https://api.mfapi.in/mf', 8000);
    if (!listRes.ok) throw new Error(`MFAPI list failed: ${listRes.status}`);
    const list = await listRes.json();
    
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('MFAPI returned empty list');
    }
    
    console.log(`Got ${list.length} schemes from MFAPI`);
    
    // Process first 200 schemes to find more active funds
    const sampleSchemes = list.slice(0, 200);
    const allFunds = [];
    const activeFunds = [];
    let processedCount = 0;
    
    for (let i = 0; i < sampleSchemes.length; i++) {
      const scheme = sampleSchemes[i];
      try {
        const detailRes = await fetchWithTimeout(`https://api.mfapi.in/mf/${scheme.schemeCode}`, 8000);
        if (!detailRes.ok) continue;
        
        const data = await detailRes.json();
        const meta = data?.meta || {};
        const navData = Array.isArray(data?.data) ? data.data : [];
        
        if (navData.length > 0) {
          const nav = parseFloat(navData[0].nav);
          if (nav && nav > 0) {
            // Check all possible ISIN field variations and meta structure
            console.log(`Processing ${scheme.schemeName} - Meta keys:`, Object.keys(meta));
            
            const isinGrowth = meta.isin_growth || meta.isinGrowth || meta.ISIN_Growth || meta['ISIN Growth'] || null;
            const isinDiv = meta.isin_div || meta.isinDiv || meta.ISIN_Div || meta['ISIN Div'] || null;
            const isin = meta.isin || null;
            
            // More flexible ISIN detection
            const hasIsinGrowth = isinGrowth && 
                                 String(isinGrowth).trim() !== '' && 
                                 String(isinGrowth).trim().toLowerCase() !== 'null' &&
                                 String(isinGrowth).trim() !== 'undefined';
                                 
            const hasIsinDiv = isinDiv && 
                              String(isinDiv).trim() !== '' && 
                              String(isinDiv).trim().toLowerCase() !== 'null' &&
                              String(isinDiv).trim() !== 'undefined';
                              
            const hasIsin = isin && 
                           String(isin).trim() !== '' && 
                           String(isin).trim().toLowerCase() !== 'null' &&
                           String(isin).trim() !== 'undefined';
            
            // Multiple criteria for determining active status:
            // 1. Has valid ISIN Growth (primary)
            // 2. Has valid ISIN Div (secondary)
            // 3. Has substantial metadata (fallback)
            const hasSubstantialMeta = Object.keys(meta).length >= 5 && 
                                      (meta.scheme_category || meta.fund_house) &&
                                      (meta.scheme_type);
            
            const isActive = hasIsinGrowth || hasIsinDiv || (!hasIsinGrowth && !hasIsinDiv && hasSubstantialMeta);
            
            console.log(`${scheme.schemeName}: hasIsinGrowth=${hasIsinGrowth}, hasIsinDiv=${hasIsinDiv}, hasSubstantialMeta=${hasSubstantialMeta}, isActive=${isActive}`);
            processedCount++;
            
            const fund = {
              fundName: scheme.schemeName,
              nav: nav,
              navDate: navData[0].date,
              category: meta.scheme_category || meta.category || 'Mutual Fund',
              schemeCode: String(scheme.schemeCode),
              fundHouse: meta.fund_house || 'Unknown',
              isinGrowth: isinGrowth,
              isinDiv: isinDiv,
              isin: isin,
              hasIsinGrowth: hasIsinGrowth,
              hasIsinDiv: hasIsinDiv,
              hasIsin: hasIsin,
              isActive: isActive,
              activeReason: hasIsinGrowth ? 'Has ISIN Growth' : 'No ISIN Growth'
            };
            
            allFunds.push(fund);
            
            if (isActive) {
              activeFunds.push(fund);
            }
          }
        }
      } catch (e) {
        console.log(`Skip ${scheme.schemeCode}: ${e.message}`);
      }
      
      // Progress logging
      if ((i + 1) % 10 === 0) {
        console.log(`Processed ${i + 1}/${sampleSchemes.length} schemes - Active: ${activeFunds.length}, Total: ${allFunds.length}`);
      }
    }
    
    console.log(`\n✅ Processing complete:`);
    console.log(`📊 Total processed: ${allFunds.length}`);
    console.log(`✅ Active funds (with ISIN Growth): ${activeFunds.length}`);
    console.log(`❌ Inactive funds: ${allFunds.length - activeFunds.length}`);
    
    return NextResponse.json({
      success: true,
      message: 'Temporary debug data - showing all funds with ISIN status',
      summary: {
        totalProcessed: allFunds.length,
        activeFunds: activeFunds.length,
        inactiveFunds: allFunds.length - activeFunds.length,
        schemesChecked: sampleSchemes.length
      },
      activeFunds: activeFunds,
      allFunds: allFunds.slice(0, 20), // Show first 20 for debugging
      filteringLogic: {
        criteria: 'Fund is active if isinGrowth has valid non-null value',
        fieldsChecked: ['isin_growth', 'isinGrowth', 'ISIN_Growth']
      }
    });
    
  } catch (error) {
    console.error('🚨 Temp active funds fetch failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
