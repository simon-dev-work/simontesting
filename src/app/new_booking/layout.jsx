import { getSiteSettings } from "../../lib/getSiteSettings";
import { SiteSettingsProvider } from '../context/SiteSettingsContext';
import { resolvePracticeIdFromHost } from "../../lib/resolvePractice";
import { headers } from "next/headers";

export async function generateMetadata({ params }) {
  // Await params as required by Next.js 15+
  const resolvedParams = await params;
  let practice_id = resolvedParams?.practice_id;

  if (!practice_id) {
    const headersList = await headers();
    const host = headersList.get('host');
    practice_id = await resolvePracticeIdFromHost(host);
  }

  // Fetch all settings server-side if practice_id is available
  const siteSettings = practice_id ? await getSiteSettings(practice_id) : null;

  const siteName = siteSettings?.practiceName || "Lumina Blue";
  const description = siteSettings?.aboutText;

  const ogImage = siteSettings?.bannerImage
    ? siteSettings.bannerImage
    : "/default-banner.jpg";

  return {
    title: `Online Booking Page | ${siteName}`,
    description: description,
    openGraph: {
      title: `Online Booking Page | ${siteName}`,
      description: description,
      images: [
        {
          url: ogImage,
          width: 1920,
          height: 600,
        },
      ],
      type: 'website',
    },
  };
}

export default async function BookingLayout({ children, params }) {
  // Await params as required by Next.js 15+
  const resolvedParams = await params;
  let practice_id = resolvedParams?.practice_id;

  if (!practice_id) {
    const headersList = await headers();
    const host = headersList.get('host');
    practice_id = await resolvePracticeIdFromHost(host);
  }

  const siteSettings = practice_id ? await getSiteSettings(practice_id) : null;
  const primaryColor = siteSettings?.primaryColor;

  return (
    <SiteSettingsProvider
      initialPracticeId={practice_id}
      initialPrimaryColor={primaryColor}
    >
      {children}
    </SiteSettingsProvider>
  );
}
