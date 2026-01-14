import { getSiteSettings } from "../../../lib/getSiteSettings";
import { SiteSettingsProvider } from '../../context/SiteSettingsContext';

export async function generateMetadata({ params }) {
  // Await params as required by Next.js 15+
  const { practice_id } = await params;
  
  // Fetch all settings server-side
  const siteSettings = await getSiteSettings(practice_id);

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
  const { practice_id } = await params;
  
  return (
    <SiteSettingsProvider initialPracticeId={practice_id}>
      {children}
    </SiteSettingsProvider>
  );
}
