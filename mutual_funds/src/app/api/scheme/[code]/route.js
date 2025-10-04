import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { code } = await params;
    console.log(`Fetching fresh data for scheme ${code} from MFAPI.in...`);
    
    const response = await fetch(`https://api.mfapi.in/mf/${code}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const schemeData = await response.json();
    console.log(`Fetched scheme data for ${schemeData.meta?.scheme_name || code}`);

    return NextResponse.json(schemeData);
  } catch (error) {
    console.error(`Error fetching scheme ${params.code}:`, error);
    return NextResponse.json({ error: 'Failed to fetch scheme details' }, { status: 500 });
  }
}