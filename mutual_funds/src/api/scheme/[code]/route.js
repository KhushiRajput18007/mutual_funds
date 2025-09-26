import { NextResponse } from 'next/server';

let schemeCache = new Map();
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

export async function GET(request, { params }) {
  try {
    const { code } = params;
    const cacheKey = code;
    
    // Check cache
    const cached = schemeCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return NextResponse.json(cached.data);
    }

    const response = await fetch(`https://api.mfapi.in/mf/${code}`);
    const schemeData = await response.json();

    // Cache the data
    schemeCache.set(cacheKey, {
      data: schemeData,
      timestamp: Date.now()
    });

    return NextResponse.json(schemeData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch scheme details' }, { status: 500 });
  }
}