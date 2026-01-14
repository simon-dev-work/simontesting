import { redirect } from 'next/navigation';
import axios from 'axios';

export async function GET(request, { params }) {
  const { practice_id, mail_uuid } = params;
  
  try {
    // Fetch practice details to check if they have a website
    const response = await axios.get(`https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`);
    const practice = response.data;
    
    // Check if practice has a non-empty website field
    if (practice.website && practice.website.trim() !== '') {
      // Clean up the website URL and ensure it has a protocol
      let websiteUrl = practice.website.trim();
      if (!websiteUrl.startsWith('http')) {
        websiteUrl = `https://${websiteUrl}`;
      }
      // Remove any trailing slashes and add the practice_id to the path
      websiteUrl = websiteUrl.replace(/\/+$/, '');
      // Create the redirect URL with practice_id in the path and mail_uuid as query param
      const redirectUrl = `${websiteUrl}/new_booking${practice_id}?ref=${mail_uuid}`;
      return redirect(redirectUrl, 'replace');
    } else {
      // If no website, redirect to eyecareportal.com with practice_id in the path
      const redirectUrl = `https://eyecareportal.herokuapp.com/new_booking/${practice_id}?ref=${mail_uuid}`;
      return redirect(redirectUrl, 'replace');
    }
  } catch (error) {
    console.error('Error fetching practice details:', error);
    // Fallback to eyecareportal.com if there's an error
    const redirectUrl = `https://eyecareportal.herokuapp.com/new_booking/${practice_id}?ref=${mail_uuid}`;
    return redirect(redirectUrl, 'replace');
  }
}
