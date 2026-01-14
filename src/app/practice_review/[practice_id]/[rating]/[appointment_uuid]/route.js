import { redirect } from 'next/navigation';

export async function GET(request, { params }) {
  try {
    const { practice_id, rating, appointment_uuid } = params;
    
    // Fetch practice data from the API
    const response = await fetch(
      `https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // Add cache control to prevent caching
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch practice data: ${response.status} ${response.statusText}`);
    }
    
    const practiceData = await response.json();
    const customRatingUrl = practiceData.custom_rating_url;
    
    if (!customRatingUrl) {
      console.error('No custom_rating_url found in practice data');
      return new Response(JSON.stringify({ error: 'No rating URL available' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // For external URLs, we need to return a proper redirect response
    if (customRatingUrl.startsWith('http')) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: customRatingUrl,
        },
      });
    }
    
    // For internal paths, use Next.js redirect
    return redirect(customRatingUrl);
    
  } catch (error) {
    console.error('Error in practice review redirection:', error);
    // Return a 500 error response
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
