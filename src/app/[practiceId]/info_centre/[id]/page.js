import { redirect } from 'next/navigation';

export default function OldInfoCentreRedirect({ params }) {
  // Redirect to the new URL pattern
  redirect(`/info_centre/list/${params.id}`);
}
