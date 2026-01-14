"use client";

import { useSiteSettings } from '../../context/SiteSettingsContext';
import FooterPage from '../../pages/FooterPage';
import Navbar from '../../pages/Navbar';

export default function ClientLayoutWrapper({ children }) {
  const { isLoading } = useSiteSettings();
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isLoading && <Navbar />}
      <main className="flex-grow bg-gray-100">
        {children}
      </main>
      {!isLoading && <FooterPage />}
    </div>
  );
}
