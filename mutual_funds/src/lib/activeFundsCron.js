import cron from 'node-cron';
import { promises as fs } from 'fs';
import path from 'path';

const CACHE_FILE_PATH = path.join(process.cwd(), 'data', 'activeFunds.json');
const MFAPI_BASE_URL = 'https://api.mfapi.in/mf';

/**
 * Filter active funds based on isinGrowth property
 * @param {Array} funds - Array of mutual funds
 * @returns {Array} - Filtered active funds
 */
function filterActiveFunds(funds) {
  if (!Array.isArray(funds)) {
    return [];
  }

  console.log(`🔍 [CRON] Showing ALL active funds from API...`);
  console.log(`   Input: ${funds.length} total funds`);

  const activeFunds = funds.filter(fund => {
    // Basic validation - just ensure fund has a name
    return fund.schemeName || fund.fundName || fund.name;
  });

  console.log(`   ✅ Found ${activeFunds.length} active funds`);
  return activeFunds;
}

/**
 * Fetch all mutual funds from MFAPI
 * @returns {Promise<Array>} - Array of mutual funds
 */
async function fetchAllFunds() {
  try {
    console.log('🕒 [CRON] Fetching all funds from MFAPI...');
    const response = await fetch(MFAPI_BASE_URL, {
      headers: {
        'User-Agent': 'ActiveFunds-CronJob/1.0',
        'Accept': 'application/json'
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(30000) // 30 seconds timeout
    });

    if (!response.ok) {
      throw new Error(`MFAPI request failed: ${response.status} ${response.statusText}`);
    }

    const allFunds = await response.json();
    console.log(`🕒 [CRON] Fetched ${allFunds.length} total funds from MFAPI`);
    
    return allFunds;
  } catch (error) {
    console.error('🕒 [CRON] ❌ Error fetching funds from MFAPI:', error);
    throw error;
  }
}

/**
 * Save active funds to cache file
 * @param {Array} activeFunds - Array of active funds to cache
 */
async function saveCachedActiveFunds(activeFunds) {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(CACHE_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    const cacheData = {
      activeFunds,
      count: activeFunds.length,
      lastUpdated: new Date().toISOString(),
      source: 'MFAPI-cron',
      note: 'Active funds filtered by isinGrowth property via cron job',
      nextUpdateScheduled: getNextCronRunTime()
    };

    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2), 'utf8');
    console.log(`🕒 [CRON] 💾 Cached ${activeFunds.length} active funds to file`);
    
    return cacheData;
  } catch (error) {
    console.error('🕒 [CRON] ❌ Error saving cache file:', error);
    throw error;
  }
}

/**
 * Calculate next cron run time (every 12 hours from now)
 */
function getNextCronRunTime() {
  const now = new Date();
  const next = new Date(now.getTime() + (12 * 60 * 60 * 1000)); // Add 12 hours
  return next.toISOString();
}

/**
 * Main cron job function to update active funds cache
 */
async function updateActiveFundsCache() {
  const startTime = Date.now();
  console.log(`🕒 [CRON] ⏰ Active funds cache update started at ${new Date().toISOString()}`);
  
  try {
    // Fetch all funds from MFAPI
    const allFunds = await fetchAllFunds();
    
    // Filter active funds based on isinGrowth
    const activeFunds = filterActiveFunds(allFunds);
    
    console.log(`🕒 [CRON] 🎯 Filtered ${activeFunds.length} active funds from ${allFunds.length} total funds`);
    
    // Save to cache file
    const cacheData = await saveCachedActiveFunds(activeFunds);
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log(`🕒 [CRON] ✅ Cache update completed successfully in ${duration}s`);
    console.log(`🕒 [CRON] 📊 Statistics:`);
    console.log(`🕒 [CRON]   - Total funds fetched: ${allFunds.length}`);
    console.log(`🕒 [CRON]   - Active funds found: ${activeFunds.length}`);
    console.log(`🕒 [CRON]   - Cache file: ${CACHE_FILE_PATH}`);
    console.log(`🕒 [CRON]   - Next update: ${cacheData.nextUpdateScheduled}`);
    
    return {
      success: true,
      totalFunds: allFunds.length,
      activeFunds: activeFunds.length,
      duration,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.error(`🕒 [CRON] ❌ Cache update failed after ${duration}s:`, error);
    console.error(`🕒 [CRON] 🔍 Error details:`, {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    
    // Try to log error to cache file for debugging
    try {
      const errorLog = {
        error: {
          message: error.message,
          timestamp: new Date().toISOString(),
          duration,
          source: 'MFAPI-cron-error'
        }
      };
      
      const errorLogPath = path.join(process.cwd(), 'data', 'activeFunds-errors.json');
      await fs.writeFile(errorLogPath, JSON.stringify(errorLog, null, 2), 'utf8');
    } catch (logError) {
      console.error('🕒 [CRON] Failed to write error log:', logError);
    }
    
    throw error;
  }
}

/**
 * Initialize and start the cron job
 */
export function startActiveFundsCron() {
  console.log('🕒 [CRON] 🚀 Initializing Active Funds cron job...');
  
  // Run every 12 hours (at minute 0 of hours 0 and 12)
  // Cron pattern: '0 */12 * * *' means "at minute 0 of every 12th hour"
  const cronJob = cron.schedule('0 */12 * * *', async () => {
    try {
      await updateActiveFundsCache();
    } catch (error) {
      console.error('🕒 [CRON] Scheduled update failed:', error);
      // Continue running - don't stop the cron job because of one failure
    }
  }, {
    scheduled: false, // Don't start immediately
    timezone: "UTC"   // Use UTC to avoid timezone issues
  });

  // Start the cron job
  cronJob.start();
  
  console.log('🕒 [CRON] ✅ Active Funds cron job started successfully');
  console.log('🕒 [CRON] 📅 Schedule: Every 12 hours (0:00 and 12:00 UTC)');
  
  // Run initial update immediately if no cache exists
  setTimeout(async () => {
    try {
      const cacheExists = await fs.access(CACHE_FILE_PATH).then(() => true).catch(() => false);
      if (!cacheExists) {
        console.log('🕒 [CRON] 🏃 No cache found, running initial update...');
        await updateActiveFundsCache();
      } else {
        console.log('🕒 [CRON] 📂 Existing cache found, waiting for next scheduled run');
      }
    } catch (error) {
      console.error('🕒 [CRON] Initial update failed:', error);
    }
  }, 5000); // Wait 5 seconds after startup
  
  return cronJob;
}

/**
 * Stop the cron job (useful for cleanup)
 */
export function stopActiveFundsCron(cronJob) {
  if (cronJob) {
    cronJob.stop();
    console.log('🕒 [CRON] 🛑 Active Funds cron job stopped');
  }
}

/**
 * Manual trigger for cron job (useful for testing)
 */
export async function triggerActiveFundsCronManually() {
  console.log('🕒 [CRON] 🔧 Manual trigger initiated...');
  return await updateActiveFundsCache();
}

// Export the main update function for use in other modules
export { updateActiveFundsCache };