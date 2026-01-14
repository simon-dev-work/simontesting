import { redirect } from 'next/navigation';

const EYECARE_PORTAL_BASE_URL = 'https://eyecareportal.herokuapp.com';

export default async function PromoRedirect({ params }) {
  const { practiceId, campaign_uuid } = await params;
  const targetUrl = `${EYECARE_PORTAL_BASE_URL}/promo/${practiceId}/${campaign_uuid}`;

  // Perform the redirect
  redirect(targetUrl);

  // This won't be rendered as we're redirecting
  return null;
}
