import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Map URL path segments to API field names
const SOCIAL_MEDIA_FIELDS = {
  facebook: 'facebook_url',
  instagram: 'instagram_url',
  twitter: 'twitter_url',
  linkedin: 'linkedin_url',
  youtube: 'youtube_url',
  tiktok: 'tiktok_url',
  google_business_profile: 'google_business_profile_url'
};

export default async function CampaignSocialMediaRedirect({ params }) {
  const { practice_id, campaign_uuid, patient_id, social_link_type } = params;
  
  try {
    // 1. Fetch practice data from Passport API
    const practiceResponse = await fetch(
      `https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`,
      { cache: 'no-store' }
    );

    if (!practiceResponse.ok) {
      throw new Error('Failed to fetch practice data');
    }

    const practiceData = await practiceResponse.json();
    
    const socialMediaField = SOCIAL_MEDIA_FIELDS[social_link_type.toLowerCase()];
    
    if (!socialMediaField) {
      throw new Error(`Unsupported social media type: ${social_link_type}`);
    }

    const socialMediaUrl = practiceData[socialMediaField];
    
    if (!socialMediaUrl) {
      throw new Error(`No ${social_link_type} URL found for this practice`);
    }

    return (
      <html>
        <head>
          <meta httpEquiv="refresh" content={`0;url=${socialMediaUrl}`} />
          <script dangerouslySetInnerHTML={{
            __html: `
              // Redirect immediately if possible
              window.location.href = "${socialMediaUrl}";
            `
          }} />
        </head>
        <body>
          <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Redirecting to {social_link_type}...</h1>
            <p>Please wait while we redirect you to our {social_link_type} page.</p>
            <p>If you are not redirected, <a href="${socialMediaUrl}">click here</a>.</p>
          </div>
        </body>
      </html>
    );
    
  } catch (error) {
    console.error('Error in social media redirect:', error);
    
    // Show error page with development details
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Unable to Redirect</h1>
        <p>We couldn&apos;t redirect you to our {social_link_type} page at this time.</p>
        
        {process.env.NODE_ENV === 'development' && (
          <pre style={{
            background: '#f5f5f5',
            padding: '10px',
            borderRadius: '5px',
            overflowX: 'auto',
            marginTop: '20px'
          }}>
            {error.message}
          </pre>
        )}
      </div>
    );
  }
}
