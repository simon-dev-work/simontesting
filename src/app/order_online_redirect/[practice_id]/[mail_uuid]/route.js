import { notFound } from 'next/navigation';
import axios from 'axios';

export async function GET(request, { params }) {
  const { practice_id, mail_uuid } = params;
  
  try {
    // Fetch practice details to check for custom_order_url
    const response = await axios.get(`https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`);
    const practiceData = response.data;
    
    // If custom_order_url exists and has a value, redirect to it
    if (practiceData?.custom_order_url?.trim()) {
      // Ensure the URL has a protocol and clean it up
      let redirectUrl = practiceData.custom_order_url.trim();
      if (!redirectUrl.startsWith('http')) {
        redirectUrl = `https://${redirectUrl}`;
      }
      
      // Add mail_uuid as a query parameter if it's provided
      const url = new URL(redirectUrl);
      if (mail_uuid) {
        url.searchParams.append('ref', mail_uuid);
      }
      
      return Response.redirect(url.toString(), 302);
    }
  } catch (error) {
    console.error('Error fetching practice data:', error);
  }
  
  // If no custom_order_url or if there was an error, return 404
  return notFound();
}
