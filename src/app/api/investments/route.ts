import { NextResponse } from 'next/server';

// NOTE: This API route is deprecated
// Use propertyContractService.getUserInvestments() for real blockchain data

export async function GET(request: Request) {
  try {
    return NextResponse.json(
      { 
        success: false, 
        error: 'This API endpoint is deprecated. Use propertyContractService.getUserInvestments() for blockchain data.',
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
