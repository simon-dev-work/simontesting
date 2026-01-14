import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ContactLensOrderRedirectLink({ params }) {
  const { practice_id, mail_uuid } = await Promise.resolve(params);
  
  // Redirect to the external URL with the hash path
  const externalUrl = `https://eyecareportal.herokuapp.com/info_centre#/order_online/${practice_id}/${mail_uuid}`;
  
  // This will perform a server-side redirect
  redirect(externalUrl);
  
  // This return statement won't be reached due to the redirect
  return null;
}
