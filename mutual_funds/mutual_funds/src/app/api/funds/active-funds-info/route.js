import { NextResponse } from 'next/server';

// Cache for storing statistics and active funds data
let CACHE = { 
  data: null, 
  stats: null,
  lastUpdated: null,
  ttl: 5 * 60 * 1000 // 5 minutes
};

async function fetchWithTimeout(url, timeoutMs = 45000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal, 
      cache: 'no-store' 
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function getActiveFundsWithStats(sampleSize = 100) {
  try {
    // Fetch all schemes from MFAPI
    const listResponse = await fetchWithTimeout('https://api.mfapi.in/mf');
    const allSchemes = await listResponse.json();
    
    if (!Array.isArray(allSchemes) || allSchemes.length === 0) {
      throw new Error('No schemes found from MFAPI');
    }

    // Take a sample for demonstration (to avoid overwhelming the API)
    const sample = allSchemes.slice(0, sampleSize);
    
    const stats = {
      totalSchemes: allSchemes.length,
      processedSchemes: 0,
      activeFunds: 0,
      inactiveFunds: 0,
      errorCount: 0
    };
    
    const activeFunds = [];
    const concurrency = 8;
    let index = 0;

    async function processScheme() {
      while (index < sample.length) {
        const currentIndex = index++;
        const scheme = sample[currentIndex];
        
        try {
          const detailResponse = await fetchWithTimeout(
            `https://api.mfapi.in/mf/${scheme.schemeCode}`,
            30000
          );
          const detailData = await detailResponse.json();
          
          stats.processedSchemes++;
          
          // Extract isinGrowth from either meta.isin_growth or meta.isinGrowth
          const meta = detailData?.meta || {};
          const isinGrowth = meta.isin_growth || meta.isinGrowth || null;
          
          if (isinGrowth && isinGrowth.trim() !== '') {
            // This fund is ACTIVE (has valid isinGrowth)
            stats.activeFunds++;
            
            const navData = Array.isArray(detailData?.data) ? detailData.data : [];
            const latestNav = navData.length > 0 ? navData[0] : null;
            
            activeFunds.push({
              schemeCode: scheme.schemeCode,
              schemeName: scheme.schemeName,
              isinGrowth: isinGrowth,
              isinDivReinvestment: meta.isin_div_reinvestment || meta.isinDivReinvestment || null,
              category: meta.scheme_category || meta.category || 'Unknown',
              nav: latestNav ? parseFloat(latestNav.nav) : null,
              navDate: latestNav ? latestNav.date : null,
              fundHouse: meta.fund_house || 'Unknown',
              schemeType: meta.scheme_type || 'Unknown'
            });
          } else {
            // This fund is INACTIVE (null or empty isinGrowth)
            stats.inactiveFunds++;
          }
        } catch (error) {
          stats.errorCount++;
          console.log(`Error processing scheme ${scheme.schemeCode}:`, error.message);
        }
      }
    }

    // Run concurrent workers
    const workers = Array.from({ length: concurrency }, () => processScheme());
    await Promise.all(workers);

    return { activeFunds, stats };
    
  } catch (error) {
    console.error('Error fetching active funds:', error);
    throw error;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sampleSize = parseInt(searchParams.get('sample') || '100', 10);
  const forceRefresh = searchParams.get('refresh') === 'true';

  // Check cache
  if (!forceRefresh && CACHE.data && CACHE.lastUpdated && 
      (Date.now() - CACHE.lastUpdated < CACHE.ttl)) {
    return NextResponse.json({
      fromCache: true,
      lastUpdated: CACHE.lastUpdated,
      data: CACHE.data,
      stats: CACHE.stats
    });
  }

  try {
    const result = await getActiveFundsWithStats(sampleSize);
    
    // Update cache
    CACHE = {
      data: result.activeFunds,
      stats: result.stats,
      lastUpdated: Date.now(),
      ttl: 5 * 60 * 1000
    };

    return NextResponse.json({
      fromCache: false,
      lastUpdated: CACHE.lastUpdated,
      message: `Found ${result.stats.activeFunds} active funds out of ${result.stats.processedSchemes} processed schemes`,
      explanation: "Active funds are identified by having a non-null 'isinGrowth' value from MFAPI",
      data: result.activeFunds,
      stats: result.stats
    });

  } catch (error) {
    console.error('Active funds API error:', error);
    
    return NextResponse.json({
      error: true,
      message: error.message || 'Failed to fetch active funds',
      data: [],
      stats: {
        totalSchemes: 0,
        processedSchemes: 0,
        activeFunds: 0,
        inactiveFunds: 0,
        errorCount: 0
      }
    }, { status: 500 });
  }
}

export async function POST() {
  // Force refresh the cache
  try {
    const result = await getActiveFundsWithStats(200); // Larger sample for manual refresh
    
    CACHE = {
      data: result.activeFunds,
      stats: result.stats,
      lastUpdated: Date.now(),
      ttl: 5 * 60 * 1000
    };

    return NextResponse.json({
      success: true,
      message: 'Active funds cache refreshed successfully',
      data: result.activeFunds,
      stats: result.stats
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to refresh cache'
    }, { status: 500 });
  }
}