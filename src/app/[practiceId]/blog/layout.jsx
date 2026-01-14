import { getSiteSettings } from "../../../lib/getSiteSettings";
import { SiteSettingsProvider } from '../../context/SiteSettingsContext';
import Navbar from '../../pages/Navbar';
import FooterPage from '../../pages/FooterPage';
import ClientLayoutWrapper from '../info_centre/ClientLayoutWrapper';

export async function generateMetadata({ params }) {
  // Await params as required by Next.js 15+
  const { practiceId } = await params;
  
  // Check if practiceId is actually a customer code
  const isCustomerCode = /[a-zA-Z]/.test(practiceId);
  
  // Fetch all settings server-side
  let siteSettings = null;
  let siteName = "Lumina Blue";
  
  if (!isCustomerCode) {
    // For numeric practice IDs, fetch settings directly
    siteSettings = await getSiteSettings(practiceId);
    siteName = siteSettings?.practiceName || "Lumina Blue";
  } else {
    // For customer codes, we need to resolve them to practice settings
    // This is more complex and might need API call to resolve customer code
    siteName = "Lumina Blue"; // Default for customer codes
  }

  const description = siteSettings?.aboutText || "News Feed and updates";

  const ogImage = siteSettings?.bannerImage || "/default-banner.jpg";

  return {
    title: `News Feed | ${siteName}`,
    description: description,
    openGraph: {
      title: `News Feed | ${siteName}`,
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

export default async function BlogLayout({ children, params }) {
  // Await params as required by Next.js 15+
  const { practiceId } = await params;
  
  // Check if practiceId is actually a customer code
  const isCustomerCode = /[a-zA-Z]/.test(practiceId);
  
  return (
    <SiteSettingsProvider 
      initialPracticeId={isCustomerCode ? null : practiceId}
      customerCode={isCustomerCode ? practiceId : null}
    >
      <ClientLayoutWrapper>
        {children}
      </ClientLayoutWrapper>
    </SiteSettingsProvider>
  );
}
