import { redirect } from 'next/navigation';

async function getPracticeData(practiceId) {
  try {
    const response = await fetch(`https://passport.nevadacloud.com/api/v1/public/practices/${practiceId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching practice data:', error);
    throw error;
  }
}

export async function GET(request, { params }) {
  try {
    const { practice_id, rating, appointment_uuid } = params;
    
    if (!practice_id) {
      return new Response(JSON.stringify({ error: 'Missing practice_id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch practice data from the API
    const response = await fetch(
      `https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch practice data' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const practiceData = await response.json();
    const customRatingUrl = practiceData.custom_rating_url;
    
    if (!customRatingUrl) {
      return new Response(
        JSON.stringify({ error: 'No rating URL available for this practice' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create URL object to handle query parameters
    const redirectUrl = new URL(customRatingUrl);
    if (rating) redirectUrl.searchParams.set('rating', rating);
    if (appointment_uuid) redirectUrl.searchParams.set('appointment_uuid', appointment_uuid);
    
    // Return a 302 redirect response
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString()
      }
    });
    
  } catch (error) {
    console.error('Error in practice review redirection:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
