import { getSiteSettings } from "../../../lib/getSiteSettings";
import { SiteSettingsProvider } from '../../context/SiteSettingsContext';
import FooterPage from '../../pages/FooterPage';
import Navbar from '../../pages/Navbar';
import ClientLayoutWrapper from './ClientLayoutWrapper';

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
    title: `Info Centre | ${siteName}`,
    description: description,
    openGraph: {
      title: `Info Centre | ${siteName}`,
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

export default async function InfoCentreLayout({ children, params }) {
  // Await params as required by Next.js 15+
  const { practiceId } = await params;
  
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
