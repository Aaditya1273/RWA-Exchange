import { NextResponse } from 'next/server';
import { propertyDB, investmentDB, transactionDB } from '@/services/database';
import { randomBytes } from 'crypto';

// POST invest in property
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const property = propertyDB.getById(body.propertyId);
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    if (property.available_shares < body.sharesToBuy) {
      return NextResponse.json(
        { success: false, error: 'Insufficient shares available' },
        { status: 400 }
      );
    }

    const investmentId = '0x' + randomBytes(16).toString('hex');
    const totalCost = body.sharesToBuy * property.price_per_share;

    // Create investment record
    investmentDB.create({
      id: investmentId,
      propertyId: body.propertyId,
      investor: body.investor,
      sharesOwned: body.sharesToBuy,
      investmentAmount: totalCost,
    });

    // Update available shares
    propertyDB.updateAvailableShares(body.propertyId, body.sharesToBuy);

    // Create transaction record
    const txId = '0x' + randomBytes(16).toString('hex');
    transactionDB.create({
      id: txId,
      type: 'investment',
      fromAddress: body.investor,
      toAddress: property.owner,
      propertyId: body.propertyId,
      investmentId: investmentId,
      amount: totalCost,
      shares: body.sharesToBuy,
    });

    return NextResponse.json({
      success: true,
      data: {
        investmentId,
        transactionDigest: txId,
        sharesPurchased: body.sharesToBuy,
      },
    });
  } catch (error) {
    console.error('Error investing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to invest' },
      { status: 500 }
    );
  }
}
