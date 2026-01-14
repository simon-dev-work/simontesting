"use client";

import React, { Suspense } from "react";
import { use } from "react";
import dynamic from 'next/dynamic';
import Navbar from "../pages/Navbar"
import FooterPage from "../pages/FooterPage";
import { SiteSettingsProvider, useSiteSettings } from "../context/SiteSettingsContext";
import Loader from "../components/Loader";

// Wrapper component that will show loading state until site settings are loaded
function PageContent({ children, isCode }) {
  const { isLoading } = useSiteSettings();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <FooterPage />
    </div>
  );
}

// Dynamically import PracticePageClient with no SSR to ensure client-side only rendering
const PracticePageClient = dynamic(
  () => import('./PracticePageClient'),
  { ssr: false }
);

function isCustomerCode(identifier) {
  if (/^-.+-$/.test(identifier)) return true;

  if (/^[a-zA-Z0-9]+$/.test(identifier)) {
    if (/^\d+$/.test(identifier)) return false;
    return true;
  }

  return false;
}

function PracticePageContent({ identifier }) {
  const isCode = isCustomerCode(identifier);

  return (
    <SiteSettingsProvider
      initialPracticeId={isCode ? null : identifier}
      customerCode={isCode ? identifier : null}
    >
      <PageContent isCode={isCode}>
        <PracticePageClient isCustomerCode={isCode} />
      </PageContent>
    </SiteSettingsProvider>
  );
}

export default function PracticePage({ params }) {
  const { practiceId: identifier } = use(params);

  if (!identifier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Identifier</h2>
          <p className="text-gray-600">Please provide a valid practice identifier or customer code</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loader />}>
      <PracticePageContent identifier={identifier} />
    </Suspense>
  );
}
