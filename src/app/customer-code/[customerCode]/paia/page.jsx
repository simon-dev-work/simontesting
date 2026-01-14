'use client';

import { usePathname } from 'next/navigation';
import { useSiteSettings } from '../../../context/SiteSettingsContext';

export default function PAIA() {
  const pathname = usePathname();
  const { siteSettings, isLoading, error } = useSiteSettings();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Promotion of Access to Information Act (PAIA) Manual</h1>
      
      <div className="prose max-w-none">
        {siteSettings?.paia_manual ? (
          <div dangerouslySetInnerHTML={{ __html: siteSettings.paia_manual }} />
        ) : (
          <p>PAIA manual not available for this practice.</p>
        )}
      </div>
    </div>
  );
}
