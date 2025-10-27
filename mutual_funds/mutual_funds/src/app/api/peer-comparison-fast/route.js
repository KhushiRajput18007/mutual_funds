import { NextResponse } from 'next/server';

const TOP_SCHEMES = [
  '120503', '118989', '120716', '119226', '100016', '100032', '100048', '100064',
  '100080', '100096', '100112', '100128', '100144', '100160', '100176', '100192',
  '100208', '100224', '100240', '100256', '100272', '100288', '100304', '100320',
  '100336', '100352', '119551', '119552', '119553', '119554', '119555', '119556',
  '119557', '119558', '119559', '119560', '119561', '119562', '119563', '119564'
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    
    console.log(`Ultra-fast peer comparison with filter: ${filter}...`);

    const promises = TOP_SCHEMES.slice(0, 20).map(async (schemeCode) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        if (!data.data || data.data.length < 50) return null;

        const latest = parseFloat(data.data[0].nav);
        const navData = data.data;
        
        const returns1Y = navData.length > 200 ? 
          ((latest - parseFloat(navData[200].nav)) / parseFloat(navData[200].nav) * 100) : 0;
        const returns3Y = navData.length > 600 ? 
          ((latest - parseFloat(navData[600].nav)) / parseFloat(navData[600].nav) * 100) : 0;
        
        const schemeAge = Math.floor((new Date() - new Date(navData[navData.length - 1].date)) / (365.25 * 24 * 60 * 60 * 1000));
        
        const schemeInfo = {
          schemeCode,
          schemeName: data.meta?.scheme_name || 'Unknown',
          returns1Y: parseFloat(returns1Y.toFixed(2)),
          returns3Y: parseFloat(returns3Y.toFixed(2)),
          age: schemeAge,
          latestNAV: latest,
          category: data.meta?.scheme_category || 'Unknown',
          fundHouse: data.meta?.fund_house || 'Unknown'
        };

        switch(filter) {
          case 'high-returns':
            return returns1Y > 8 ? schemeInfo : null;
          case '3-years':
            return (schemeAge >= 3 && schemeAge <= 5) ? schemeInfo : null;
          case '10-years':
            return schemeAge >= 10 ? schemeInfo : null;
          case 'top-performers':
            return returns1Y > 15 ? schemeInfo : null;
          default:
            return schemeInfo;
        }
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.allSettled(promises);
    const validSchemes = results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value)
      .sort((a, b) => b.returns1Y - a.returns1Y);
    
    return NextResponse.json({
      filter,
      count: validSchemes.length,
      schemes: validSchemes.slice(0, 25)
    });

  } catch (error) {
    console.error('Error in fast peer comparison:', error);
    return NextResponse.json({ error: 'Failed to fetch peer comparison data' }, { status: 500 });
  }
}