import { NextResponse } from 'next/server';

// NOTE: These API routes are deprecated
// Use propertyContractService for real blockchain interactions

// GET all properties
export async function GET() {
  try {
    return NextResponse.json(
      { 
        success: false, 
        error: 'This API endpoint is deprecated. Use propertyContractService.getAllProperties() for blockchain data.',
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

// POST create new property
export async function POST(request: Request) {
  try {
    return NextResponse.json(
      { 
        success: false, 
        error: 'This API endpoint is deprecated. Use propertyContractService.createProperty() for blockchain transactions.',
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
