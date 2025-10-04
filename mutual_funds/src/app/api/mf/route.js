import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching fresh schemes from MFAPI.in...');
    const response = await fetch('https://api.mfapi.in/mf');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const schemes = await response.json();
    console.log(`Fetched ${schemes.length} schemes`);

    return NextResponse.json(schemes);
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return NextResponse.json({ error: 'Failed to fetch schemes' }, { status: 500 });
  }
}