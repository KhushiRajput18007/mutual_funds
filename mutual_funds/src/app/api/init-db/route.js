import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { COLLECTIONS, createSchemeIndex, createNavHistoryIndex, createPortfolioIndex, createCalculationsIndex } from '@/lib/models';

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db('mutualfunds');
    
    console.log('Initializing database indexes...');
    
    // Create indexes for better performance
    await createSchemeIndex(db);
    await createNavHistoryIndex(db);
    await createPortfolioIndex(db);
    await createCalculationsIndex(db);
    
    // Create notifications index
    await db.collection(COLLECTIONS.NOTIFICATIONS).createIndex({ createdAt: -1 });
    await db.collection(COLLECTIONS.NOTIFICATIONS).createIndex({ type: 1 });
    
    // Create users index
    await db.collection(COLLECTIONS.USERS).createIndex({ userId: 1 }, { unique: true });
    
    console.log('Database initialization completed');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully',
      collections: Object.values(COLLECTIONS)
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}