import { NextResponse } from 'next/server';

// NOTE: This API route is deprecated and not used
// The app now uses direct blockchain interactions via propertyContract.ts
// Keeping this file to avoid breaking changes, but it returns a deprecation notice

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Return deprecation notice
    return NextResponse.json(
      { 
        success: false, 
        error: 'This API endpoint is deprecated. Please use direct blockchain transactions via propertyContract service.',
        deprecated: true
      },
      { status: 410 } // 410 Gone
    );

  } catch (error) {
    console.error('Deprecated API route called:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'This API endpoint is deprecated.',
        deprecated: true
      },
      { status: 410 }
    );
  }
}
