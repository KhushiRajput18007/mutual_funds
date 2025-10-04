import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { MongoClient } = await import('mongodb');
    const uri = 'mongodb+srv://mutualFunds:mutualFunds161992@cluster0.xfx6oyr.mongodb.net/';
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('mutualfunds');
    const result = await db.admin().ping();
    
    await client.close();
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection successful',
      ping: result 
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json({ 
      error: 'MongoDB connection failed',
      details: error.message 
    }, { status: 500 });
  }
}