import { NextResponse } from 'next/server';

async function fetchWithTimeout(url, ms = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { 
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  try {
    console.log('🚀 Fetching working active funds...');
    
    // Get scheme list
    const listRes = await fetchWithTimeout('https://api.mfapi.in/mf', 15000);
    if (!listRes.ok) throw new Error(`MFAPI list failed: ${listRes.status}`);
    const list = await listRes.json();
    
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('MFAPI returned empty list');
    }
    
    console.log(`Got ${list.length} schemes from MFAPI`);
    
    // Process first 100 schemes with very permissive criteria
    const sampleSchemes = list.slice(0, 100);
    const activeFunds = [];
    let processed = 0;
    
    for (let i = 0; i < sampleSchemes.length; i++) {
      const scheme = sampleSchemes[i];
      try {
        console.log(`Processing ${i + 1}/${sampleSchemes.length}: ${scheme.schemeName}`);
        
        const detailRes = await fetchWithTimeout(`https://api.mfapi.in/mf/${scheme.schemeCode}`, 10000);
        if (!detailRes.ok) continue;
        
        const data = await detailRes.json();
        const meta = data?.meta || {};
        const navData = Array.isArray(data?.data) ? data.data : [];
        
        // Very permissive criteria: just needs NAV data and some metadata
        if (navData.length > 0) {
          const nav = parseFloat(navData[0].nav);
          if (nav && nav > 0) {
            
            // Include fund if it has:
            // 1. Valid NAV data
            // 2. At least scheme name (which it always has)
            // 3. Any additional metadata is a bonus
            
            const fund = {
              fundName: scheme.schemeName || `Fund ${scheme.schemeCode}`,
              nav: nav,
              navDate: navData[0].date,
              category: meta.scheme_category || meta.category || 'Mutual Fund',
              schemeCode: String(scheme.schemeCode),
              fundHouse: meta.fund_house || 'Various',
              schemeType: meta.scheme_type || 'Open Ended',
              // Include all ISIN fields for reference
              isinGrowth: meta.isin_growth || meta.isinGrowth || null,
              isinDiv: meta.isin_div || meta.isinDiv || null,
              // Add criteria info for debugging
              hasMetadata: Object.keys(meta).length > 0,
              metaFieldCount: Object.keys(meta).length,
              // Always mark as active since we're being permissive
              isActive: true,
              dataSource: 'MFAPI'
            };
            
            activeFunds.push(fund);
            processed++;
          }
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (e) {
        console.log(`Skip ${scheme.schemeCode}: ${e.message}`);
      }
    }
    
    console.log(`✅ Processed ${processed} active funds from ${sampleSchemes.length} schemes`);
    
    const result = {
      success: true,
      message: `Working active funds with permissive criteria`,
      count: activeFunds.length,
      processedSchemes: sampleSchemes.length,
      activeFunds: activeFunds,
      generatedAt: new Date().toISOString(),
      criteria: 'Permissive: Any fund with valid NAV data',
      note: 'This endpoint uses very permissive criteria to ensure data is shown'
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('🚨 Working active funds fetch failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      activeFunds: [],
      count: 0
    }, { status: 500 });
  }
}