import { NextResponse } from 'next/server';
// import clientPromise from '@/lib/mongodb';
// import { COLLECTIONS } from '@/lib/models';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    // Return default user data
    return NextResponse.json({ 
      userId, 
      preferences: {},
      message: 'User data temporarily unavailable'
    });
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
    
    // Return success but don't actually save
    return NextResponse.json({
      userId,
      name,
      email,
      preferences,
      message: 'User save temporarily unavailable',
      success: true
    });
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
    
    // Return success but don't actually update
    return NextResponse.json({ 
      success: true, 
      modifiedCount: 0,
      message: 'User update temporarily unavailable'
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Failed to update user preferences' }, { status: 500 });
  }
}
