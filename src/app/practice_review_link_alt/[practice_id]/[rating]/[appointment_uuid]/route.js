import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    // Get practice_id from URL parameters
    const { practice_id } = params;
    
    if (!practice_id) {
      return NextResponse.json(
        { error: 'Practice ID is required' },
        { status: 400 }
      );
    }

    // Fetch practice details from NevadaCloud API
    const response = await fetch(
      `https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch practice details: ${response.statusText}`);
    }
    
    const practice = await response.json();
    
    // Check if alt_custom_rating_url exists
    if (!practice.alt_custom_rating_url || practice.alt_custom_rating_url.trim() === '') {
      return NextResponse.redirect(new URL('/not-found', request.url));
    }
    
    // Ensure the URL has a protocol
    let redirectUrl = practice.alt_custom_rating_url.trim();
    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      redirectUrl = 'https://' + redirectUrl;
    }
    
    // Redirect to the external URL
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Error in practice review link:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}
