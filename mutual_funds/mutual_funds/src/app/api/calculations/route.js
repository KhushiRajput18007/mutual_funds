import { NextResponse } from 'next/server';
// import { ObjectId } from 'mongodb';
// import clientPromise from '@/lib/mongodb';
// import { COLLECTIONS } from '@/lib/models';

export async function GET(request) {
  try {
    return NextResponse.json({
      message: 'Calculations temporarily unavailable',
      calculations: []
    });
  } catch (error) {
    console.error('Error fetching calculations:', error);
    return NextResponse.json({ error: 'Failed to fetch calculations' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    return NextResponse.json({
      message: 'Calculation save temporarily unavailable',
      success: false
    });
  } catch (error) {
    console.error('Error saving calculation:', error);
    return NextResponse.json({ error: 'Failed to save calculation' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    return NextResponse.json({
      message: 'Calculation delete temporarily unavailable',
      success: false
    });
  } catch (error) {
    console.error('Error deleting calculation:', error);
    return NextResponse.json({ error: 'Failed to delete calculation' }, { status: 500 });
  }
}
