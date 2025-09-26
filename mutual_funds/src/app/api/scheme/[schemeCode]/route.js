export async function GET(request, { params }) {
  const { schemeCode } = await params;
  
  try {
    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching scheme details:', error);
    return Response.json({ error: 'Failed to fetch scheme details' }, { status: 500 });
  }
}