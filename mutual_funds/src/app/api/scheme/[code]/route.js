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
      console.log(`Returning cached data for scheme ${code}`);
      return NextResponse.json(cached.data);
    }

    console.log(`Fetching scheme ${code} from MFAPI.in...`);
    const response = await fetch(`https://api.mfapi.in/mf/${code}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const schemeData = await response.json();
    console.log(`Fetched scheme data for ${schemeData.meta?.scheme_name || code}`);

    // Cache the data
    schemeCache.set(cacheKey, {
      data: schemeData,
      timestamp: Date.now()
    });

    return NextResponse.json(schemeData);
  } catch (error) {
    console.error(`Error fetching scheme ${params.code}:`, error);
    return NextResponse.json({ error: 'Failed to fetch scheme details from MFAPI.in' }, { status: 500 });
  }
}