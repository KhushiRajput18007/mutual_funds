import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const url = 'https://api.mfapi.in/mf';
  const maxRetries = 2;
  const timeoutMs = 12000; // 12s
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetching fresh schemes from MFAPI.in... (attempt ${attempt + 1})`);
      const response = await axios.get(url, { timeout: timeoutMs, headers: { Accept: 'application/json' } });

      if (response.status < 200 || response.status >= 300) {
        console.warn('MFAPI.in non-OK status:', response.status);
        // If retry remains, continue; else fall through to return []
        if (attempt < maxRetries) continue;
        return NextResponse.json([], { status: 200 });
      }

      const schemes = response.data;
      console.log(`Fetched ${Array.isArray(schemes) ? schemes.length : 0} schemes`);
      return NextResponse.json(Array.isArray(schemes) ? schemes : []);
    } catch (error) {
      console.warn('Error fetching schemes attempt', attempt + 1, error?.code || '', error?.message || '');
      if (attempt === maxRetries) {
        // Final fallback: avoid breaking client, return empty list with 200
        return NextResponse.json([], { status: 200 });
      }
    }
  }
  // Should not reach here, but return empty list defensively
  return NextResponse.json([], { status: 200 });
}