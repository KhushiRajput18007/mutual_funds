import { NextResponse } from 'next/server';
import { triggerActiveFundsCronManually } from '../../../../lib/activeFundsCron.js';

/**
 * POST endpoint to manually trigger the active funds cron job
 * Useful for testing and immediate cache updates
 */
export async function POST() {
  try {
    console.log('🔧 Manual cron trigger endpoint called');
    
    const result = await triggerActiveFundsCronManually();
    
    return NextResponse.json({
      success: true,
      message: 'Active funds cron job triggered successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Manual cron trigger failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to trigger active funds cron job',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * GET endpoint to check the status of the cron job and cache
 */
export async function GET() {
  try {
    const { promises: fs } = require('fs');
    const path = require('path');
    
    const CACHE_FILE_PATH = path.join(process.cwd(), 'data', 'activeFunds.json');
    
    let cacheInfo = null;
    try {
      const cacheData = await fs.readFile(CACHE_FILE_PATH, 'utf8');
      const parsedData = JSON.parse(cacheData);
      
      cacheInfo = {
        exists: true,
        count: parsedData.count,
        lastUpdated: parsedData.lastUpdated,
        source: parsedData.source,
        nextUpdateScheduled: parsedData.nextUpdateScheduled,
        ageMinutes: Math.round((Date.now() - new Date(parsedData.lastUpdated).getTime()) / (1000 * 60))
      };
    } catch (cacheError) {
      cacheInfo = {
        exists: false,
        error: cacheError.code === 'ENOENT' ? 'Cache file not found' : 'Cache file corrupted'
      };
    }
    
    return NextResponse.json({
      success: true,
      cronJobStatus: 'Active (scheduled every 12 hours)',
      cache: cacheInfo,
      timestamp: new Date().toISOString(),
      endpoints: {
        triggerCron: 'POST /api/cron/trigger-active-funds',
        getActiveFunds: 'GET /api/activeFunds',
        refreshActiveFunds: 'GET /api/activeFunds?refresh=true'
      }
    });
    
  } catch (error) {
    console.error('❌ Cron status check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check cron status',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}