import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('mutualfunds');
    const collection = db.collection(COLLECTIONS.USERS);
    
    const user = await collection.findOne({ userId });
    return NextResponse.json(user || { userId, preferences: {} });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, name, email, preferences = {} } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('mutualfunds');
    const collection = db.collection(COLLECTIONS.USERS);
    
    const user = {
      userId,
      name,
      email,
      preferences,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.replaceOne(
      { userId },
      user,
      { upsert: true }
    );
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Failed to create/update user' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, preferences } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('mutualfunds');
    const collection = db.collection(COLLECTIONS.USERS);
    
    const result = await collection.updateOne(
      { userId },
      { 
        $set: { 
          preferences,
          updatedAt: new Date()
        }
      }
    );
    
    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Failed to update user preferences' }, { status: 500 });
  }
}