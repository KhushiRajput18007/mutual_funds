import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const schemeCode = searchParams.get('schemeCode');
    const type = searchParams.get('type'); // sip, lumpsum, swp, stepup-sip, stepup-swp
    const userId = searchParams.get('userId') || 'default';
    
    const client = await clientPromise;
    const db = client.db('mutualfunds');
    const collection = db.collection(COLLECTIONS.CALCULATIONS);
    
    const filter = { userId };
    if (schemeCode) filter.schemeCode = schemeCode;
    if (type) filter.type = type;
    
    const calculations = await collection.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
      
    return NextResponse.json(calculations);
  } catch (error) {
    console.error('Error fetching calculations:', error);
    return NextResponse.json({ error: 'Failed to fetch calculations' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      userId = 'default', 
      schemeCode, 
      schemeName, 
      type, 
      parameters, 
      results 
    } = body;
    
    if (!schemeCode || !type || !parameters || !results) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('mutualfunds');
    const collection = db.collection(COLLECTIONS.CALCULATIONS);
    
    const calculation = {
      userId,
      schemeCode,
      schemeName,
      type,
      parameters,
      results,
      createdAt: new Date()
    };
    
    const result = await collection.insertOne(calculation);
    return NextResponse.json({ ...calculation, _id: result.insertedId });
  } catch (error) {
    console.error('Error saving calculation:', error);
    return NextResponse.json({ error: 'Failed to save calculation' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || 'default';
    
    if (!id) {
      return NextResponse.json({ error: 'Calculation ID required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('mutualfunds');
    const collection = db.collection(COLLECTIONS.CALCULATIONS);
    
    const result = await collection.deleteOne({ 
      _id: new ObjectId(id),
      userId 
    });
    
    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting calculation:', error);
    return NextResponse.json({ error: 'Failed to delete calculation' }, { status: 500 });
  }
}