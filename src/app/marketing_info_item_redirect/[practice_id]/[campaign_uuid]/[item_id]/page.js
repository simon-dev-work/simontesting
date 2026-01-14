export default async function MarketingInfoItemRedirect({ params }) {
  // Destructure params after awaiting them
  const { practice_id, campaign_uuid, item_id } = await Promise.resolve(params);
  
  // Construct the target URL
  const targetUrl = `/info_centre/view/${item_id}/${practice_id}`;
  
  // Redirect using Next.js server-side redirect
  const { redirect } = await import('next/navigation');
  redirect(targetUrl);
  
  // This return won't be reached due to the redirect
  return null;
}
 