import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request, context) {
  try {
    // Get the parameters from the context
    const { params } = context;
    const practice_id = params.practice_id;
    const mail_uuid = params.mail_uuid;
    
    if (!practice_id || !mail_uuid) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // First, fetch practice details
    const practiceResponse = await axios.get(`https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`);
    const practice = practiceResponse.data;
    
    // Check for custom booking URL first
    if (practice.custom_booking_url) {
      return NextResponse.redirect(practice.custom_booking_url, 307);
    }
    
    // Then check the settings API for UseLuminaWebsite
    const settingsResponse = await axios.get(`https://www.ocumail.com/api/settings?setting_object_id=${practice_id}&setting_object_type=Practice`);
    const settings = settingsResponse.data;
    
    // Find the UseLuminaWebsite setting and check if it's 't' (true)
    const useLuminaWebsiteSetting = settings.find(setting => 
      setting.setting_name === 'UseLuminaWebsite' && 
      setting.setting_object_id === parseInt(practice_id) &&
      setting.setting_object_type === 'Practice'
    );
    
    const useLuminaWebsite = useLuminaWebsiteSetting?.setting_value === 't';
    
    if (useLuminaWebsite) {
      if (!practice.website) {
        throw new Error('Practice website not found');
      }
      let websiteUrl = practice.website.trim();
      if (!websiteUrl.startsWith('http')) {
        websiteUrl = `https://${websiteUrl}`;
      }
      websiteUrl = websiteUrl.replace(/\/+$/, '');
      return NextResponse.redirect(`${websiteUrl}/new_booking?ref=${mail_uuid}`, 307);
    }
    
    // If we get here, no valid redirect was found
    return new NextResponse('Link not found', { status: 404 });
    
  } catch (error) {
    console.error('Error processing appointment link:', error);
    return new NextResponse('Link not found', { status: 404 });
  }
}
