import { redirect } from 'next/navigation';

const EYECARE_PORTAL_BASE_URL = 'https://eyecareportal.herokuapp.com';

export default function RescheduleAppointmentRedirect({ params }) {
  const { practice_id, appointment_uuid } = params;
  const targetUrl = `${EYECARE_PORTAL_BASE_URL}/reschedule_appointment/${practice_id}/${appointment_uuid}`;
  
  // Perform the redirect
  redirect(targetUrl);
  
  // This won't be rendered as we're redirecting
  return null;
}
