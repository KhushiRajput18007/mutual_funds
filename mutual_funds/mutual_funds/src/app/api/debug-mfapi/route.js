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
    console.log('🔍 Debugging MFAPI response structure...');
    
    // Get scheme list
    const listRes = await fetchWithTimeout('https://api.mfapi.in/mf', 8000);
    if (!listRes.ok) throw new Error(`MFAPI list failed: ${listRes.status}`);
    const list = await listRes.json();
    
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('MFAPI returned empty list');
    }
    
    console.log(`Got ${list.length} schemes from MFAPI`);
    
    // Debug first 3 schemes in detail
    const sampleSchemes = list.slice(0, 3);
    const debugInfo = [];
    
    for (let i = 0; i < sampleSchemes.length; i++) {
      const scheme = sampleSchemes[i];
      try {
        console.log(`\n🔍 Debugging scheme ${i + 1}: ${scheme.schemeName} (${scheme.schemeCode})`);
        
        const detailRes = await fetchWithTimeout(`https://api.mfapi.in/mf/${scheme.schemeCode}`, 10000);
        if (!detailRes.ok) {
          console.log(`❌ Failed to fetch details: ${detailRes.status}`);
          continue;
        }
        
        const data = await detailRes.json();
        console.log(`✅ Successfully fetched data for scheme ${scheme.schemeCode}`);
        
        // Log the entire meta object to see structure
        const meta = data?.meta || {};
        console.log('📋 Meta object keys:', Object.keys(meta));
        console.log('📋 Full meta object:', JSON.stringify(meta, null, 2));
        
        // Check all possible ISIN field variations
        const isinFields = {
          isin_growth: meta.isin_growth,
          isinGrowth: meta.isinGrowth,
          isin_div: meta.isin_div,
          isinDiv: meta.isinDiv,
          isin: meta.isin,
          ISIN_Growth: meta.ISIN_Growth,
          ISIN_Div: meta.ISIN_Div
        };
        
        console.log('🏷️  ISIN Fields:', JSON.stringify(isinFields, null, 2));
        
        debugInfo.push({
          schemeCode: scheme.schemeCode,
          schemeName: scheme.schemeName,
          metaKeys: Object.keys(meta),
          fullMeta: meta,
          isinFields: isinFields,
          hasNavData: Array.isArray(data?.data) && data.data.length > 0,
          navCount: Array.isArray(data?.data) ? data.data.length : 0,
          firstNavEntry: Array.isArray(data?.data) && data.data.length > 0 ? data.data[0] : null
        });
        
      } catch (e) {
        console.log(`❌ Error processing scheme ${scheme.schemeCode}:`, e.message);
        debugInfo.push({
          schemeCode: scheme.schemeCode,
          schemeName: scheme.schemeName,
          error: e.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'MFAPI Debug Information',
      totalSchemesAvailable: list.length,
      debugInfo: debugInfo,
      recommendations: [
        'Check the debugInfo array to see actual field names in meta objects',
        'Look for ISIN fields that might have different naming conventions',
        'Verify which schemes have ISIN data vs which don\'t'
      ]
    });
    
  } catch (error) {
    console.error('🚨 MFAPI debug failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      recommendation: 'Check network connectivity to api.mfapi.in'
    }, { status: 500 });
  }
}