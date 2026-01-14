const SOCIAL_MEDIA_MAP = {
  'facebook': 'facebook_url',
  'google_business_profile': 'google_business_profile_url',
  'instagram': 'instagram_url',
  'linkedin': 'linkedin_url',
  'twitter': 'twitter_url',
  'pinterest': 'pinterest_url',
  'tiktok': 'tiktok_url'
};

export async function GET(request, { params }) {
  try {
    const { practice_id, rating, appointment_uuid, rating_source } = params;
    
    if (!practice_id) {
      return new Response(JSON.stringify({ error: 'Missing practice_id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate rating_source
    if (!rating_source || !SOCIAL_MEDIA_MAP[rating_source]) {
      return new Response(JSON.stringify({ 
        error: 'Invalid rating source. Must be one of: ' + Object.keys(SOCIAL_MEDIA_MAP).join(', ')
      }), {
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
    const socialMediaField = SOCIAL_MEDIA_MAP[rating_source];
    const redirectUrl = practiceData[socialMediaField];
    
    if (!redirectUrl) {
      return new Response(JSON.stringify({ 
        error: `No ${rating_source} URL found for this practice`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Create URL object to handle query parameters
    const finalUrl = new URL(redirectUrl);
    
    // Add parameters as query parameters if they exist
    if (rating) finalUrl.searchParams.set('rating', rating);
    if (appointment_uuid) finalUrl.searchParams.set('appointment_uuid', appointment_uuid);
    
    // Return a 302 redirect response
    return new Response(null, {
      status: 302,
      headers: {
        Location: finalUrl.toString()
      }
    });
    
  } catch (error) {
    console.error('Error in social media redirection:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
