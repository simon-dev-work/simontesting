'use client';

import { useEffect, useState } from 'react';

// Mapping of social_link_type to their corresponding URL field in the API response
const SOCIAL_MEDIA_MAP = {
  'facebook': 'facebook_url',
  'google_business_profile': 'google_business_profile_url',
  'instagram': 'instagram_url',
  'linkedin': 'linkedin_url',
  'twitter': 'twitter_url',
  'pinterest': 'pinterest_url',
  'tiktok': 'tiktok_url'
};

export default function SocialMediaRedirect({ params }) {
  const { practice_id, mail_uuid, social_link_type } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const redirectToSocialMedia = async () => {
      try {
        // Validate social_link_type
        if (!SOCIAL_MEDIA_MAP[social_link_type]) {
          throw new Error(`Invalid social link type. Must be one of: ${Object.keys(SOCIAL_MEDIA_MAP).join(', ')}`);
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
          throw new Error('Failed to fetch practice data');
        }
        
        const practiceData = await response.json();
        const socialMediaField = SOCIAL_MEDIA_MAP[social_link_type];
        const socialMediaUrl = practiceData[socialMediaField];
        
        if (!socialMediaUrl) {
          throw new Error(`No ${social_link_type} URL found for this practice`);
        }
        
        // Add mail_uuid as a query parameter
        const finalUrl = new URL(socialMediaUrl);
        finalUrl.searchParams.set('mail_uuid', mail_uuid);
        
        // Redirect to the social media URL
        window.location.href = finalUrl.toString();
        
      } catch (err) {
        console.error('Error in social media redirection:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    redirectToSocialMedia();
  }, [practice_id, mail_uuid, social_link_type]);
  
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>Redirecting to social media...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <p>Please contact support if this issue persists.</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <p>Loading...</p>
    </div>
  );
}
