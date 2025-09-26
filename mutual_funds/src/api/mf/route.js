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

    const response = await fetch('https://api.mfapi.in/mf');
    const schemes = await response.json();

    // Cache the data
    cachedSchemes = schemes;
    cacheTimestamp = Date.now();

    return NextResponse.json(schemes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schemes' }, { status: 500 });
  }
}