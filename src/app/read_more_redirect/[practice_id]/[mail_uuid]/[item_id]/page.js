export default async function ReadMoreRedirect({ params }) {
  const { practice_id, mail_uuid, item_id } = await Promise.resolve(params);
  
  const targetUrl = `/info_centre/view/${item_id}/${practice_id}`;
  
  const { redirect } = await import('next/navigation');
  redirect(targetUrl);
  
  return null;

  ///info_centre/view/#{params[:item_id]}/#{params[:practice_id]}
}
