import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get the practice ID from query parameters
    const { searchParams } = new URL(request.url);
    const practiceId = searchParams.get('id');

    if (!practiceId) {
      return NextResponse.json(
        { success: false, message: 'Practice ID is required' },
        { status: 400 }
      );
    }

    // Make the API call to the external service
    const response = await fetch(`https://passport.nevadacloud.com/api/v1/practice/${practiceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add any required authentication headers here
        // 'Authorization': 'Bearer YOUR_TOKEN'
      }
    });

    const data = await response.json();
    
    // Check if we got a successful response
    if (response.ok && data && data.address_1) {
      return NextResponse.json({
        success: true,
        data: {
          address_1: data.address_1,
        }
      });
    } else {
      console.error('External API Error:', data);
      return NextResponse.json(
        { 
          success: false,
          message: data.message || 'Failed to fetch practice data'
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal Server Error'
      },
      { status: 500 }
    );
  }
}
