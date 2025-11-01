import { NextResponse } from 'next/server';
import { investmentDB, transactionDB } from '@/services/database';
import { randomBytes } from 'crypto';

// POST transfer investment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Transfer investment to new owner
    investmentDB.transfer(body.investmentId, body.recipient);

    // Create transaction record
    const txId = '0x' + randomBytes(16).toString('hex');
    transactionDB.create({
      id: txId,
      type: 'transfer',
      fromAddress: body.sender,
      toAddress: body.recipient,
      propertyId: null,
      investmentId: body.investmentId,
      amount: 0,
      shares: body.shares,
    });

    return NextResponse.json({
      success: true,
      data: {
        transactionDigest: txId,
      },
    });
  } catch (error) {
    console.error('Error transferring investment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to transfer investment' },
      { status: 500 }
    );
  }
}
