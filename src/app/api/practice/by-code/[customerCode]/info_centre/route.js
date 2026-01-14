import { NextResponse } from 'next/server';
import { getPracticeByCode } from '../../../../../../lib/api-utils';

// Backend API base URL - should be moved to environment variables in production
const BACKEND_API_URL = 'https://passport.nevadacloud.com';

// Helper function to fetch practice data
async function getPracticeData(practiceId) {
  try {
    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/public/practices/${practiceId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching practice data:', error);
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    // First, resolve customer code to practice ID
    const practice = await getPracticeByCode(params.customerCode);
    
    if (!practice || !practice.id) {
      return NextResponse.json(
        { error: 'Practice not found' },
        { status: 404 }
      );
    }
    
    // Get practice data to ensure we have the latest info
    const practiceData = await getPracticeData(practice.id);
    if (!practiceData) {
      return NextResponse.json(
        { error: 'Failed to load practice data' },
        { status: 500 }
      );
    }

    // Now fetch info centre data using the resolved practice ID
    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/public/practices/${practice.id}/info_centre`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.message || 'Failed to fetch info centre data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in info_centre API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Prevent caching of this route
export const dynamic = 'force-dynamic';
