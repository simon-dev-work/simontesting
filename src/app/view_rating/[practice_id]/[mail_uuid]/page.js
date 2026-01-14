import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ViewRatingRedirect({ params }) {
  const { practice_id, mail_uuid } = await Promise.resolve(params);
  
  // Redirect to the external URL
  const externalUrl = `https://eyecareportal.herokuapp.com/view_rating/${practice_id}/${mail_uuid}`;
  
  // This will perform a server-side redirect
  redirect(externalUrl);
  
  // This return statement won't be reached due to the redirect
  return null;
}
