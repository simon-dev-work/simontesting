'use client';

import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import Footer from '../../../app/components/Footer';

export default function CustomerLayout({ children }) {
  const { customerCode } = useParams();
  const [practiceId, setPracticeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  
  const { siteSettings } = useSiteSettings(practiceId);

  useEffect(() => {
    setIsClient(true);
    
    const fetchPracticeId = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/practice/by-code/${customerCode}`);
        if (!response.ok) {
          throw new Error('Failed to fetch practice ID');
        }
        const data = await response.json();
        setPracticeId(data.id);
      } catch (err) {
        console.error('Error fetching practice ID:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (customerCode) {
      fetchPracticeId();
    }
  }, [customerCode]);

  // Set the privacy policy in a data attribute when it's available
  useEffect(() => {
    if (isClient && siteSettings?.privacy_policy) {
      document.documentElement.setAttribute('data-privacy-policy', siteSettings.privacy_policy);
    }
  }, [siteSettings, isClient]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading site settings: {error}</div>;
  if (!practiceId) return <div>No practice found for this customer code</div>;
  if (!siteSettings) return <div>Loading site settings...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {children}
      </main>
      <Footer siteSettings={siteSettings} />
    </div>
  );
}
