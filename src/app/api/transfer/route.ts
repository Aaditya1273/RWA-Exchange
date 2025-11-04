import { NextResponse } from 'next/server';

// NOTE: This API route is deprecated
// Use propertyContractService.transferInvestment() for real blockchain transactions

// POST transfer investment
export async function POST(request: Request) {
  try {
    return NextResponse.json(
      { 
        success: false, 
        error: 'This API endpoint is deprecated. Use propertyContractService.transferInvestment() for blockchain transactions.',
        deprecated: true
      },
      { status: 410 }
    );
  } catch (error) {
    console.error('Deprecated API route called:', error);
    return NextResponse.json(
      { success: false, error: 'This API endpoint is deprecated.', deprecated: true },
      { status: 410 }
    );
  }
}
