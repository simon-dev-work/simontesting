import { redirect } from 'next/navigation';
import axios from 'axios';

export async function GET(request, { params }) {
  const { practice_id, rating, appointment_uuid, rating_source } = params;
  
  try {
    // Fetch practice details to check for custom_rating_url
    const response = await axios.get(`https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`);
    const practiceData = response.data;
    
    // If custom_rating_url exists and has a value, redirect to it
    if (practiceData?.custom_rating_url?.trim()) {
      // Ensure the URL has a protocol and clean it up
      let redirectUrl = practiceData.custom_rating_url.trim();
      if (!redirectUrl.startsWith('http')) {
        redirectUrl = `https://${redirectUrl}`;
      }
      
      // Add rating_source as a query parameter if it's provided
      const url = new URL(redirectUrl);
      if (rating_source) {
        url.searchParams.append('source', rating_source);
      }
      
      return Response.redirect(url.toString(), 302);
    }
  } catch (error) {
    console.error('Error fetching practice data:', error);
    // Continue to fallback URL if there's an error
  }
  
  // Fallback redirect if no custom_rating_url or if there was an error
  const fallbackUrl = `https://eyecareportal.herokuapp.com/practice_review/${practice_id}/${rating}/${appointment_uuid}/${rating_source}`;
  return redirect(fallbackUrl, 'replace');
}
