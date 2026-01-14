import { NextResponse } from 'next/server';

async function fetchPracticeInfo(practiceId) {
  const response = await fetch(`https://passport.nevadacloud.com/api/v1/public/practices/${practiceId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch practice info: ${response.statusText}`);
  }
  return response.json();
}

async function fetchPracticeSettings(practiceId) {
  const response = await fetch(`https://www.ocumail.com/api/settings?setting_object_id=${practiceId}&setting_object_type=Practice`);
  if (!response.ok) {
    throw new Error(`Failed to fetch practice settings: ${response.statusText}`);
  }
  const settings = await response.json();
  // Find the UseLuminaWebsite setting
  const useLuminaWebsiteSetting = settings.find(s => s.setting_name === 'UseLuminaWebsite');
  return {
    useLuminaWebsite: useLuminaWebsiteSetting?.setting_value === 't'
  };
}

export async function GET(request, context) {
  try {
    const { params } = context;
    const practice_id = params.practice_id;
    const appointment_uuid = params.appointment_uuid;

    if (!practice_id || !appointment_uuid) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Fetch practice information and settings in parallel
    const [practiceInfo, settings] = await Promise.all([
      fetchPracticeInfo(practice_id),
      fetchPracticeSettings(practice_id)
    ]);

    let redirectUrl;

    // 1. Check for custom booking URL first
    if (practiceInfo.custom_booking_url) {
      redirectUrl = practiceInfo.custom_booking_url;
    } 
    // 2. Check if using Lumina website
    else if (settings.useLuminaWebsite && practiceInfo.website) {
      const baseUrl = practiceInfo.website.endsWith('/') 
        ? practiceInfo.website.slice(0, -1) 
        : practiceInfo.website;
      redirectUrl = `${baseUrl}/reschedule_appointment/${practice_id}/${appointment_uuid}`;
    } else {
      // If neither custom booking URL nor Lumina website is enabled, redirect to the appointment request page
      redirectUrl = `/appointment_request_reschedule/${practice_id}/${appointment_uuid}`;
      
      // Return the message with the practice's telephone number
      const tel = practiceInfo.tel || 'your practice';
      const message = `Thank you for your response. Please contact us on ${tel} to update your appointment date and time at your soonest convenience.\n\n${practiceInfo.name || 'Image Eyecare'}\n${tel}`;
      
      return new NextResponse(message, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting...</title>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          <script>window.location.href = '${redirectUrl}';</script>
        </head>
        <body>
          <p>If you are not redirected automatically, <a href="${redirectUrl}">click here</a>.</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error in appointment reschedule link:', error);
    return new NextResponse(`Error processing request: ${error.message}`, { status: 500 });
  }
}
