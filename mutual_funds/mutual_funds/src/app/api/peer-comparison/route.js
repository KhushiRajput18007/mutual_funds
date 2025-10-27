import { NextResponse } from 'next/server';

const SAMPLE_SCHEMES = [
  '120503', '118989', '120716', '119226', '120716', '118989', '120503', '119226',
  '100016', '100032', '100048', '100064', '100080', '100096', '100112', '100128',
  '100144', '100160', '100176', '100192', '100208', '100224', '100240', '100256',
  '100272', '100288', '100304', '100320', '100336', '100352'
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    
    console.log(`Fast peer comparison with filter: ${filter}...`);

    const filteredSchemes = [];
    const promises = SAMPLE_SCHEMES.map(async (schemeCode) => {
      try {
        const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        if (!data.data || data.data.length < 100) return null;

        const latest = parseFloat(data.data[0].nav);
        const navData = data.data;
        
        // Calculate returns
        const returns1Y = navData.length > 250 ? 
          ((latest - parseFloat(navData[250].nav)) / parseFloat(navData[250].nav) * 100).toFixed(2) : 0;
        const returns3Y = navData.length > 750 ? 
          ((latest - parseFloat(navData[750].nav)) / parseFloat(navData[750].nav) * 100).toFixed(2) : 0;
        
        const schemeAge = Math.floor((new Date() - new Date(navData[navData.length - 1].date)) / (365.25 * 24 * 60 * 60 * 1000));
        
        const schemeInfo = {
          schemeCode,
          schemeName: data.meta?.scheme_name || 'Unknown',
          returns1Y: parseFloat(returns1Y),
          returns3Y: parseFloat(returns3Y),
          age: schemeAge,
          latestNAV: latest,
          category: data.meta?.scheme_category || 'Unknown',
          fundHouse: data.meta?.fund_house || 'Unknown'
        };

        // Apply filters
        switch(filter) {
          case 'high-returns':
            return parseFloat(returns1Y) > 8 ? schemeInfo : null;
          case '3-years':
            return schemeAge >= 3 && schemeAge <= 5 ? schemeInfo : null;
          case '10-years':
            return schemeAge >= 10 ? schemeInfo : null;
          case 'top-performers':
            return parseFloat(returns1Y) > 15 ? schemeInfo : null;
          default:
            return schemeInfo;
        }
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.all(promises);
    const validSchemes = results.filter(scheme => scheme !== null);
    
    // Sort by 1Y returns
    validSchemes.sort((a, b) => b.returns1Y - a.returns1Y);
    
    const result = {
      filter,
      count: validSchemes.length,
      schemes: validSchemes.slice(0, 25),
      processingTime: `${Date.now() - Date.now()} ms`
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in peer comparison:', error);
    return NextResponse.json({ error: 'Failed to fetch peer comparison data' }, { status: 500 });
  }
}