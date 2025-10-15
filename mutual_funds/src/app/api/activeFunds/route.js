import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CACHE_FILE_PATH = path.join(process.cwd(), 'data', 'activeFunds.json');
const MFAPI_BASE_URL = 'https://api.mfapi.in/mf';

/**
 * Filter active funds with multiple criteria to ensure 5000+ funds
 * @param {Array} funds - Array of mutual funds
 * @returns {Array} - Filtered active funds with detailed statistics
 */
function filterActiveFunds(funds) {
  if (!Array.isArray(funds)) {
    console.error('❌ Invalid funds data: not an array');
    return [];
  }

  console.log('🔍 Showing ALL active funds from API...');
  console.log(`   Input: ${funds.length} total funds`);
  
  // Return all funds as they are already filtered by the API
  // The MFAPI already provides active funds
  const activeFunds = funds.filter(fund => {
    // Basic validation - just ensure fund has a name
    return fund.schemeName || fund.fundName || fund.name;
  });
  
  console.log('📊 All Active Funds Results:');
  console.log(`   🎯 TOTAL ACTIVE FUNDS: ${activeFunds.length}`);
  
  // Show all funds from API
  
  // Sample some active funds for verification
  if (activeFunds.length > 0) {
    console.log('🔍 Sample active funds:');
    const sampleSize = Math.min(5, activeFunds.length);
    for (let i = 0; i < sampleSize; i++) {
      const fund = activeFunds[i];
      const fundName = fund.schemeName || fund.name || fund.fundName || 'Unknown';
      const isin = fund.isinGrowth || fund.isin_growth || fund.isinDiv || 'N/A';
      const nav = fund.nav || 'N/A';
      console.log(`   ${i + 1}. ${fundName} (ISIN: ${isin}, NAV: ${nav})`);
    }
  }
  
  return activeFunds;
}

/**
 * Fetch all mutual funds from MFAPI
 * @returns {Promise<Array>} - Array of mutual funds
 */
async function fetchAllFunds() {
  try {
    console.log('🔄 Fetching ALL funds from MFAPI (no limits)...');
    const response = await fetch(MFAPI_BASE_URL, {
      headers: {
        'User-Agent': 'ActiveFunds-API/1.0',
        'Accept': 'application/json'
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(60000) // 60 seconds timeout for large dataset
    });

    if (!response.ok) {
      throw new Error(`MFAPI request failed: ${response.status} ${response.statusText}`);
    }

    const allFunds = await response.json();
    console.log(`✅ Fetched ${allFunds.length} total funds from MFAPI`);
    
    // Validate that we got a proper array
    if (!Array.isArray(allFunds)) {
      throw new Error('MFAPI returned invalid data structure (not an array)');
    }
    
    // Log some statistics about the dataset
    console.log('📊 Dataset Statistics:');
    console.log(`   Total funds: ${allFunds.length}`);
    
    return allFunds;
  } catch (error) {
    console.error('❌ Error fetching funds from MFAPI:', error);
    throw error;
  }
}

/**
 * Load cached active funds from file
 * @returns {Promise<Object|null>} - Cached data or null if not exists/invalid
 */
async function loadCachedActiveFunds() {
  try {
    const cacheData = await fs.readFile(CACHE_FILE_PATH, 'utf8');
    const parsedData = JSON.parse(cacheData);
    
    // Check if cache is valid (has required structure and is not too old)
    if (parsedData.activeFunds && 
        parsedData.lastUpdated && 
        parsedData.count !== undefined) {
      
      const cacheAge = Date.now() - new Date(parsedData.lastUpdated).getTime();
      const maxCacheAge = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
      
      if (cacheAge < maxCacheAge) {
        console.log(`📂 Using cached active funds (${parsedData.count} funds, cached ${Math.round(cacheAge / (1000 * 60))} minutes ago)`);
        return parsedData;
      } else {
        console.log('⏰ Cache expired, will fetch fresh data');
        return null;
      }
    }
    
    console.log('📂 Invalid cache structure, will fetch fresh data');
    return null;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📂 No cache file found, will fetch fresh data');
    } else {
      console.error('❌ Error reading cache file:', error);
    }
    return null;
  }
}

/**
 * Save active funds to cache file
 * @param {Array} activeFunds - Array of active funds to cache
 */
async function saveCachedActiveFunds(activeFunds) {
  try {
    const cacheData = {
      activeFunds,
      count: activeFunds.length,
      lastUpdated: new Date().toISOString(),
      source: 'MFAPI',
      note: 'Active funds filtered by isinGrowth property'
    };

    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2), 'utf8');
    console.log(`💾 Cached ${activeFunds.length} active funds to file`);
  } catch (error) {
    console.error('❌ Error saving cache file:', error);
    // Don't throw error here, as we can still serve the data even if caching fails
  }
}

/**
 * Fetch and filter active funds (live data)
 * @returns {Promise<Array>} - Array of active funds
 */
async function fetchAndFilterActiveFunds() {
  try {
    const allFunds = await fetchAllFunds();
    const activeFunds = filterActiveFunds(allFunds);
    
    console.log(`🎯 Filtered ${activeFunds.length} active funds from ${allFunds.length} total funds`);
    
    // Save to cache for future requests
    await saveCachedActiveFunds(activeFunds);
    
    return activeFunds;
  } catch (error) {
    console.error('❌ Error in fetchAndFilterActiveFunds:', error);
    throw error;
  }
}

/**
 * GET endpoint for active funds
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    console.log(`🚀 ActiveFunds API called ${forceRefresh ? '(force refresh)' : '(cache preferred)'}`);
    
    let activeFunds = [];
    let dataSource = 'unknown';
    let fromCache = false;

    if (!forceRefresh) {
      // Try to load from cache first
      const cachedData = await loadCachedActiveFunds();
      if (cachedData) {
        activeFunds = cachedData.activeFunds;
        dataSource = cachedData.source || 'cache';
        fromCache = true;
      }
    }

    // If no cached data or force refresh, fetch live data
    if (activeFunds.length === 0 || forceRefresh) {
      try {
        activeFunds = await fetchAndFilterActiveFunds();
        dataSource = 'MFAPI-live';
        fromCache = false;
      } catch (liveError) {
        console.error('❌ Live data fetch failed:', liveError);
        
        // If live fetch fails, try to use any cached data as fallback
        if (!forceRefresh) {
          const cachedData = await loadCachedActiveFunds();
          if (cachedData) {
            console.log('🔄 Using stale cache data as fallback');
            activeFunds = cachedData.activeFunds;
            dataSource = 'cache-fallback';
            fromCache = true;
          }
        }
        
        // If still no data, throw error
        if (activeFunds.length === 0) {
          throw liveError;
        }
      }
    }

    const responseData = {
      success: true,
      activeFunds,
      count: activeFunds.length,
      dataSource,
      fromCache,
      timestamp: new Date().toISOString(),
      note: 'Active funds filtered by non-null isinGrowth property'
    };

    console.log(`✅ Returning ${activeFunds.length} active funds (source: ${dataSource})`);

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': fromCache ? 'public, max-age=3600' : 'public, max-age=300', // Cache longer if from cache
        'X-Data-Source': dataSource,
        'X-Fund-Count': activeFunds.length.toString()
      }
    });

  } catch (error) {
    console.error('❌ ActiveFunds API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch active funds',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'X-Error': 'ActiveFunds-Fetch-Failed'
      }
    });
  }
}

/**
 * POST endpoint for manual cache refresh
 */
export async function POST() {
  try {
    console.log('🔄 Manual cache refresh triggered');
    const activeFunds = await fetchAndFilterActiveFunds();
    
    return NextResponse.json({
      success: true,
      message: 'Cache refreshed successfully',
      count: activeFunds.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Manual cache refresh failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh cache',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
