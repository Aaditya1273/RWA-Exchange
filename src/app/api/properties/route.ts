import { NextResponse } from 'next/server';
import { SuiClient } from '@mysten/sui/client';

const RPC_URL = process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://rpc-testnet.onelabs.cc:443';
const PACKAGE_ID = process.env.NEXT_PUBLIC_RWA_PACKAGE_ID || '';

export async function GET() {
  try {
    const client = new SuiClient({ url: RPC_URL });
    
    // Query all PropertyNFT objects
    const response = await client.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::property_nft::PropertyCreated`,
      },
      limit: 50,
    });

    // Fetch full details for each property
    const propertiesWithDetails = await Promise.all(
      response.data.map(async (event: any) => {
        const parsedJson = event.parsedJson;
        const propertyId = parsedJson.property_id;
        
        try {
          const object = await client.getObject({
            id: propertyId,
            options: { showContent: true },
          });

          if (object.data?.content && 'fields' in object.data.content) {
            const fields = object.data.content.fields as any;
            return {
              id: propertyId,
              title: fields.name,
              name: fields.name,
              description: fields.description,
              thumbnail: fields.image_url,
              imageUrl: fields.image_url,
              location: fields.location,
              type: fields.property_type,
              propertyType: fields.property_type,
              totalValue: fields.total_value,
              totalShares: fields.total_shares,
              availableShares: fields.available_shares,
              pricePerShare: fields.price_per_share,
              rentalYield: fields.rental_yield,
              isActive: fields.is_active,
              owner: fields.owner,
            };
          }
        } catch (error) {
          console.error('Error fetching property details:', error);
        }
        
        return null;
      })
    );

    const validProperties = propertiesWithDetails.filter(p => p !== null);
    
    return NextResponse.json({ properties: validProperties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ properties: [], error: 'Failed to fetch properties' }, { status: 500 });
  }
}
