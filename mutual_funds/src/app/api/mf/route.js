export async function GET() {
  try {
    const response = await fetch('https://api.mfapi.in/mf');
    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching mutual funds data:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}