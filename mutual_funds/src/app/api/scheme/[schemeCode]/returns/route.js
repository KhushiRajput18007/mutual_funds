export async function GET(request, { params }) {
  const { schemeCode } = await params;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '1y';
  
  try {
    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    const data = await response.json();
    
    if (!data || !data.data) {
      return Response.json({ error: 'Scheme not found' }, { status: 404 });
    }
    
    // Calculate returns based on period
    const nav = data.data;
    let startIndex = 0;
    
    switch(period) {
      case '1m': startIndex = Math.min(30, nav.length - 1); break;
      case '3m': startIndex = Math.min(90, nav.length - 1); break;
      case '6m': startIndex = Math.min(180, nav.length - 1); break;
      case '1y': startIndex = Math.min(365, nav.length - 1); break;
      default: startIndex = Math.min(365, nav.length - 1);
    }
    
    if (nav.length < 2) {
      return Response.json({ returns: 0, period });
    }
    
    const currentNav = parseFloat(nav[0].nav);
    const pastNav = parseFloat(nav[startIndex].nav);
    const returns = ((currentNav - pastNav) / pastNav * 100).toFixed(2);
    
    return Response.json({ 
      returns: parseFloat(returns), 
      period,
      currentNav,
      pastNav,
      currentDate: nav[0].date,
      pastDate: nav[startIndex].date
    });
  } catch (error) {
    console.error('Error fetching scheme returns:', error);
    return Response.json({ error: 'Failed to fetch returns' }, { status: 500 });
  }
}