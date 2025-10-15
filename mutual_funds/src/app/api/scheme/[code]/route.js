import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request, { params }) {
  try {
    const { code } = await params;
    console.log(`Fetching fresh data for scheme ${code} from MFAPI.in...`);
    
    const response = await axios.get(`https://api.mfapi.in/mf/${code}`, { headers: { Accept: 'application/json' } });
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const schemeData = response.data;
    console.log(`Fetched scheme data for ${schemeData.meta?.scheme_name || code}`);

    return NextResponse.json(schemeData);
  } catch (error) {
    console.error(`Error fetching scheme ${params.code}:`, error);
    return NextResponse.json({ error: 'Failed to fetch scheme details' }, { status: 500 });
  }
}