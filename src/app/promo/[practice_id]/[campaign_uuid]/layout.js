import { getSiteSettings } from "../../../../lib/getSiteSettings";
import { SiteSettingsProvider } from "../../../context/SiteSettingsContext";

export default async function PromoLayout({ children, params }) {
  const resolvedParams = await params;
  const practice_id = resolvedParams?.practice_id;

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
