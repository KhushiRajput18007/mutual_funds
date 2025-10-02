import { NextResponse } from 'next/server';

let cachedSchemes = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  try {
    // Check cache
    if (cachedSchemes && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      return NextResponse.json(cachedSchemes);
    }

    console.log('Fetching schemes from MFAPI.in...');
    const response = await fetch('https://api.mfapi.in/mf');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const schemes = await response.json();
    console.log(`Fetched ${schemes.length} schemes`);

    // Cache the data
    cachedSchemes = schemes;
    cacheTimestamp = Date.now();

    return NextResponse.json(schemes);
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return NextResponse.json({ error: 'Failed to fetch schemes from MFAPI.in' }, { status: 500 });
  }
}