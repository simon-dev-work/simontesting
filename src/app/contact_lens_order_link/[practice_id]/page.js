import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ContactLensOrderRedirect({ params }) {
  const { practice_id } = params;
  
  // Redirect to the external URL
  const externalUrl = `https://eyecareportal.herokuapp.com/contact_lens_order_link/${practice_id}`;
  
  // This will perform a server-side redirect
  redirect(externalUrl);
  
  // This return statement won't be reached due to the redirect
  return null;
}
