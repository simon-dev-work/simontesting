import { redirect } from 'next/navigation';

export async function GET(request, { params }) {
  const { practice_id, rating, appointment_uuid, rating_source } = params;
  
  // Construct the external URL with the provided parameters
  const externalUrl = `https://eyecareportal.herokuapp.com/practice_review_alt/${practice_id}/${rating}/${appointment_uuid}/${rating_source}`;
  
  // Redirect to the external URL
  return redirect(externalUrl, 'replace');
}
