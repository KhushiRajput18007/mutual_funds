import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    const client = await clientPromise;
    const db = client.db('mutualfunds');
    const collection = db.collection(COLLECTIONS.PORTFOLIOS);
    
    const portfolios = await collection.find({ userId }).toArray();
    return NextResponse.json(portfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId = 'default', schemeCode, schemeName, units, avgPrice, investedAmount } = body;
    
    if (!schemeCode || !units || !avgPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('mutualfunds');
    const collection = db.collection(COLLECTIONS.PORTFOLIOS);
    
    const portfolio = {
      userId,
      schemeCode,
      schemeName,
      units: parseFloat(units),
      avgPrice: parseFloat(avgPrice),
      investedAmount: parseFloat(investedAmount),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(portfolio);
    return NextResponse.json({ ...portfolio, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { _id, units, avgPrice, investedAmount } = body;
    
    if (!_id) {
      return NextResponse.json({ error: 'Portfolio ID required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('mutualfunds');
    const collection = db.collection(COLLECTIONS.PORTFOLIOS);
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (units !== undefined) updateData.units = parseFloat(units);
    if (avgPrice !== undefined) updateData.avgPrice = parseFloat(avgPrice);
    if (investedAmount !== undefined) updateData.investedAmount = parseFloat(investedAmount);
    
    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    
    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Portfolio ID required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('mutualfunds');
    const collection = db.collection(COLLECTIONS.PORTFOLIOS);
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 });
  }
}