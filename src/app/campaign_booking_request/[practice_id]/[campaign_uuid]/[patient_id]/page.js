// This is a Server Component - no 'use client' directive
import { redirect } from 'next/navigation';

export default async function CampaignBookingRequest({ params }) {
  const { practice_id, campaign_uuid, patient_id } = params;
  
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

    // 2. Check for custom_booking_url first
    if (practiceData.custom_booking_url) {
      // For external URLs, we need to use a client-side redirect
      return (
        <ClientRedirect url={practiceData.custom_booking_url} />
      );
    }

    // 3. If no custom_booking_url, check UseLuminaWebsite setting
    const settingsResponse = await fetch(
      `https://www.ocumail.com/api/settings?setting_object_id=${practice_id}&setting_object_type=Practice`,
      { cache: 'no-store' }
    );

    if (!settingsResponse.ok) {
      throw new Error('Failed to fetch practice settings');
    }

    const settings = await settingsResponse.json();
    const useLuminaWebsite = settings.some(
      (setting) =>
        setting.setting_name === 'UseLuminaWebsite' &&
        setting.setting_value === 't'
    );

    if (useLuminaWebsite && practiceData.website) {
      // Ensure the website URL has a protocol and doesn't end with a slash
      const baseUrl = practiceData.website.replace(/\/+$/, '');
      const destinationUrl = `${baseUrl}/new_booking`;
      return <ClientRedirect url={destinationUrl} />;
    }

    // 4. If we get here, no valid URL was found
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Booking Not Available</h1>
        <p>The booking link could not be found.</p>
      </div>
    );

  } catch (error) {
    console.error('Error in campaign booking request:', error);
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Error</h1>
        <p>An error occurred while processing your request.</p>
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

// Client component for handling redirects
function ClientRedirect({ url }) {
  // This component will be rendered on the client side
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content={`0;url=${url}`} />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Redirect immediately if possible
            window.location.href = "${url}";
          `
        }} />
      </head>
      <body>
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h1>Redirecting...</h1>
          <p>Please wait while we redirect you to the booking page.</p>
          <p>If you are not redirected, <a href={url}>click here</a>.</p>
        </div>
      </body>
    </html>
  );
}
