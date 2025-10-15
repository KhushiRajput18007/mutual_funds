import { NextResponse } from 'next/server';
// import clientPromise from '@/lib/mongodb';
// import { COLLECTIONS, createSchemeIndex, createNavHistoryIndex, createPortfolioIndex, createCalculationsIndex } from '@/lib/models';

export async function POST() {
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialization temporarily unavailable',
      collections: []
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}
