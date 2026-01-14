import "./globals.css";
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import LayoutClient from './LayoutClient';
import { resolvePracticeIdFromHost } from "../lib/resolvePractice";
import { getSiteSettings } from "../lib/getSiteSettings";
import { headers } from "next/headers";

export async function generateMetadata() {
  const headersList = await headers();
  const host = headersList.get('host');
  const practiceId = await resolvePracticeIdFromHost(host);
  const siteSettings = practiceId ? await getSiteSettings(practiceId) : null;

  const siteName = siteSettings?.practiceName || "Lumina Blue";
  const description = siteSettings?.aboutText;

  return {
    title: siteName,
    description: description,
  };
}

function isCustomerCode(identifier) {
  if (!identifier) return false;
  if (/^-.+-$/.test(identifier)) return true;
  if (/^[a-zA-Z0-9_]+$/.test(identifier)) {
    if (/^\d+$/.test(identifier)) return false;
    const RESERVED = ['blog', 'info_centre', 'new_booking', 'api', 'paia', 'privacy', 'settings', 'promo'];
    if (RESERVED.includes(identifier)) return false;
    return true;
  }
  return false;
}

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const host = headersList.get('host');

  // Try to resolve practice from host (domain-based)
  let practiceId = await resolvePracticeIdFromHost(host);
  let customerCode = null;

  // If we couldn't resolve from host, it might be in the URL path
  // But root layout doesn't easily get the path segments in server mode without headers
  // However, the middleware rewrites should handle most cases.

  const siteSettings = practiceId ? await getSiteSettings(practiceId) : null;
  const primaryColor = siteSettings?.primaryColor;

  return (
    <SiteSettingsProvider
      initialPracticeId={practiceId}
      customerCode={customerCode}
      initialPrimaryColor={primaryColor}
    >
      <ErrorBoundary>
        <LayoutClient>{children}</LayoutClient>
      </ErrorBoundary>
    </SiteSettingsProvider>
  );
}
