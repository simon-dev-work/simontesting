import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { practice_id } = params;
  
  try {
    // Fetch practice data from the API
    const response = await fetch(`https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`);
    
    if (!response.ok) {
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    const practiceInfo = await response.json();
    
    // Get the website URL from the practice info
    const websiteUrl = practiceInfo.website;
    
    // If website URL exists, redirect to it
    if (websiteUrl) {
      // Ensure the URL has a protocol
      const redirectUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
      return NextResponse.redirect(redirectUrl);
    } else {
      // If no website URL is found, redirect to a 404 page
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
  } catch (error) {
    console.error('Error in practice website redirect:', error);
    return NextResponse.redirect(new URL('/500', request.url));
  }
}
