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
    console.log('🔥 Fetching working trending funds...');
    
    // Get scheme list
    const listRes = await fetchWithTimeout('https://api.mfapi.in/mf', 15000);
    if (!listRes.ok) throw new Error(`MFAPI list failed: ${listRes.status}`);
    const list = await listRes.json();
    
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('MFAPI returned empty list');
    }
    
    console.log(`Got ${list.length} schemes from MFAPI`);
    
    // For trending funds, let's take a different slice (middle portion) to get variety
    // and simulate "trending" by selecting funds with good performance potential
    const startIndex = Math.floor(list.length * 0.1); // Start from 10% into the list
    const sampleSchemes = list.slice(startIndex, startIndex + 50);
    const trendingFunds = [];
    let processed = 0;
    
    for (let i = 0; i < sampleSchemes.length; i++) {
      const scheme = sampleSchemes[i];
      try {
        console.log(`Processing trending ${i + 1}/${sampleSchemes.length}: ${scheme.schemeName}`);
        
        const detailRes = await fetchWithTimeout(`https://api.mfapi.in/mf/${scheme.schemeCode}`, 10000);
        if (!detailRes.ok) continue;
        
        const data = await detailRes.json();
        const meta = data?.meta || {};
        const navData = Array.isArray(data?.data) ? data.data : [];
        
        // Criteria for trending: NAV data + try to simulate trending behavior
        if (navData.length >= 5) { // At least 5 NAV entries for trend analysis
          const nav = parseFloat(navData[0].nav);
          if (nav && nav > 0) {
            
            // Simulate trending by checking recent performance
            const recentNav = parseFloat(navData[0].nav);
            const olderNav = parseFloat(navData[4].nav); // 5 days ago
            const recentChange = ((recentNav - olderNav) / olderNav) * 100;
            
            // Consider it "trending" if it has any upward movement or good metadata
            const isTrending = recentChange > -5; // Allow slight declines as still "trending"
            const hasGoodCategory = meta.scheme_category && !meta.scheme_category.toLowerCase().includes('debt');
            
            if (isTrending || hasGoodCategory) {
              const fund = {
                fundName: scheme.schemeName || `Fund ${scheme.schemeCode}`,
                nav: nav,
                navDate: navData[0].date,
                category: meta.scheme_category || meta.category || 'Trending Fund',
                schemeCode: String(scheme.schemeCode),
                fundHouse: meta.fund_house || 'Various',
                schemeType: meta.scheme_type || 'Open Ended',
                // Add trending-specific fields
                recentChange: recentChange,
                trendDirection: recentChange >= 0 ? 'up' : 'down',
                trendReason: recentChange > 0 ? 'Recent Gains' : hasGoodCategory ? 'Popular Category' : 'Market Interest',
                // Include ISIN fields for reference
                isinGrowth: meta.isin_growth || meta.isinGrowth || null,
                isinDiv: meta.isin_div || meta.isinDiv || null,
                // Always mark as trending since we're being permissive
                isTrending: true,
                dataSource: 'MFAPI'
              };
              
              trendingFunds.push(fund);
              processed++;
            }
          }
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (e) {
        console.log(`Skip ${scheme.schemeCode}: ${e.message}`);
      }
    }
    
    // Sort by recent performance (best first)
    trendingFunds.sort((a, b) => (b.recentChange || 0) - (a.recentChange || 0));
    
    console.log(`✅ Processed ${processed} trending funds from ${sampleSchemes.length} schemes`);
    
    const result = {
      success: true,
      message: `Working trending funds with performance criteria`,
      count: trendingFunds.length,
      processedSchemes: sampleSchemes.length,
      activeFunds: trendingFunds, // Use activeFunds key for compatibility
      trendingFunds: trendingFunds,
      generatedAt: new Date().toISOString(),
      criteria: 'Trending: Recent performance and popular categories',
      note: 'This endpoint simulates trending based on recent NAV changes and category popularity'
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('🚨 Working trending funds fetch failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      activeFunds: [],
      trendingFunds: [],
      count: 0
    }, { status: 500 });
  }
}