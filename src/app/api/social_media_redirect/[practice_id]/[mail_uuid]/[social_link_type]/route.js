import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { practice_id, social_link_type } = params;
  
  try {
    // Fetch practice data from the API
    const response = await fetch(`https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`);
    
    if (!response.ok) {
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    const practiceInfo = await response.json();
    
    // Map social link types to their corresponding URL field in the API response
    const socialUrlMap = {
      facebook: practiceInfo.facebook_url,
      twitter: practiceInfo.twitter_url,
      linkedin: practiceInfo.linkedin_url,
      instagram: practiceInfo.instagram_url,
      pinterest: practiceInfo.pinterest_url,
      tiktok: practiceInfo.tiktok_url,
      google_business_profile: practiceInfo.google_business_profile_url
    };
    
    // Get the destination URL from the map
    const destinationUrl = socialUrlMap[social_link_type];
    
    // If the social URL exists, redirect to it
    if (destinationUrl) {
      return NextResponse.redirect(destinationUrl);
    } else {
      // If the social URL doesn't exist, redirect to the practice's website or 404
      return NextResponse.redirect(practiceInfo.website || new URL('/404', request.url));
    }
    
  } catch (error) {
    console.error('Error in social media redirect:', error);
    return NextResponse.redirect(new URL('/500', request.url));
  }
}
