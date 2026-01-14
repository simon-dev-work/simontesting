import { redirect } from 'next/navigation';

export async function GET(request, { params }) {
  const { practice_id, appointment_uuid } = params;
  
  // Construct the external URL with the provided parameters
  const externalUrl = `https://eyecareportal.herokuapp.com/prebooked_appointment_confirm/${practice_id}/${appointment_uuid}`;
  
  // Redirect to the external URL
  return redirect(externalUrl, 'replace');
}
