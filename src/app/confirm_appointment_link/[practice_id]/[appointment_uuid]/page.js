import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ConfirmAppointmentLink({ params }) {
  const { practice_id, appointment_uuid } = await Promise.resolve(params);
  
  // Redirect to the external URL
  const externalUrl = `https://eyecareportal.herokuapp.com/confirm_appointment_link/${practice_id}/${appointment_uuid}`;
  
  // This will perform a server-side redirect
  redirect(externalUrl);
  
  // This return statement won't be reached due to the redirect
  return null;
}
