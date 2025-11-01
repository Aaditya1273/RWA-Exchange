import { NextResponse } from 'next/server';
import { investmentDB } from '@/services/database';

// GET investments by investor address
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const investor = searchParams.get('investor');

    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor address required' },
        { status: 400 }
      );
    }

    const investments = investmentDB.getByInvestor(investor);
    return NextResponse.json({ success: true, data: investments });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}
