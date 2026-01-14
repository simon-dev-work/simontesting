import { getSiteSettings } from "../../lib/getSiteSettings";
import { Metadata } from "next";
import { SiteSettingsProvider } from "../context/SiteSettingsContext";

export async function generateMetadata({ params }) {
  // Await params as required by Next.js 15+
  const { practiceId } = await params;

  // Fetch all settings server-side
  const siteSettings = await getSiteSettings(practiceId);

  const siteName = siteSettings?.practiceName || "Lumina Blue";
  const description = siteSettings?.aboutText;

  const ogImage = siteSettings?.bannerImage
    ? siteSettings.bannerImage
    : "/default-banner.jpg";

  return {
    title: `Home | ${siteName}`,
    description: description,
    openGraph: {
      title: `Home | ${siteName}`,
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

export default async function CustomerLayout({ children, params }) {
  const { practiceId } = await params;
  const siteSettings = await getSiteSettings(practiceId);
  const primaryColor = siteSettings?.primaryColor;

  return (
    <SiteSettingsProvider
      initialPracticeId={practiceId}
      initialPrimaryColor={primaryColor}
    >
      {children}
    </SiteSettingsProvider>
  );
}