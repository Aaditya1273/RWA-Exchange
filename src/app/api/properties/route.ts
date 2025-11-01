import { NextResponse } from 'next/server';
import { propertyDB, transactionDB } from '@/services/database';
import { randomBytes } from 'crypto';

// GET all properties
export async function GET() {
  try {
    const properties = propertyDB.getAll();
    return NextResponse.json({ success: true, data: properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST create new property
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const propertyId = '0x' + randomBytes(16).toString('hex');
    
    const property = {
      id: propertyId,
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      location: body.location,
      propertyType: body.propertyType,
      totalValue: body.totalValue,
      totalShares: body.totalShares,
      pricePerShare: body.pricePerShare,
      rentalYield: body.rentalYield,
      owner: body.owner,
    };

    propertyDB.create(property);

    // Create transaction record
    const txId = '0x' + randomBytes(16).toString('hex');
    transactionDB.create({
      id: txId,
      type: 'property_created',
      fromAddress: null,
      toAddress: body.owner,
      propertyId: propertyId,
      investmentId: null,
      amount: body.totalValue,
      shares: body.totalShares,
    });

    return NextResponse.json({
      success: true,
      data: {
        propertyId,
        transactionDigest: txId,
      },
    });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
