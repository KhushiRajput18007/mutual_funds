import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Quick test starting...');
    
    // Test 1: Basic connectivity
    const testUrl = 'https://api.mfapi.in/mf';
    console.log('Testing MFAPI connectivity...');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(testUrl, { 
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Got ${data.length} schemes from MFAPI`);
      
      // Get first scheme for detailed test
      const firstScheme = data[0];
      console.log('First scheme:', firstScheme);
      
      // Test detailed fetch
      const detailUrl = `https://api.mfapi.in/mf/${firstScheme.schemeCode}`;
      console.log('Testing scheme detail fetch:', detailUrl);
      
      const detailTimeout = setTimeout(() => controller.abort(), 8000);
      const detailResponse = await fetch(detailUrl, {
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(detailTimeout);
      
      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        console.log('✅ Got scheme detail data');
        
        return NextResponse.json({
          success: true,
          message: 'MFAPI is working',
          totalSchemes: data.length,
          testScheme: {
            code: firstScheme.schemeCode,
            name: firstScheme.schemeName,
            hasDetailData: !!detailData,
            metaKeys: Object.keys(detailData?.meta || {}),
            hasNavData: Array.isArray(detailData?.data) && detailData.data.length > 0,
            navCount: Array.isArray(detailData?.data) ? detailData.data.length : 0,
            sampleMeta: detailData?.meta || {},
            firstNav: detailData?.data?.[0] || null
          }
        });
      } else {
        throw new Error(`Detail fetch failed: ${detailResponse.status}`);
      }
      
    } catch (fetchError) {
      clearTimeout(timeout);
      throw fetchError;
    }
    
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      step: error.message.includes('aborted') ? 'timeout' : 'network'
    });
  }
}