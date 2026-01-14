'use client';

import { useParams } from 'next/navigation';
import { SiteSettingsProvider } from '../../context/SiteSettingsContext';
import PaiaManualPage from '../../pages/PaiaManualPage';

// Function to check if the identifier is a customer code
function isCustomerCode(identifier) {
  // Check if it's in the format -DEMO- (starts and ends with a dash)
  if (/^-.+-$/.test(identifier)) return true;
  
  // Check if it's alphanumeric (letters and numbers only, no spaces or special chars)
  if (/^[a-zA-Z0-9]+$/.test(identifier)) {
    // If it's all digits, it's more likely a practice ID
    if (/^\d+$/.test(identifier)) return false;
    // Otherwise, treat it as a customer code
    return true;
  }
  
  return false;
}

export default function PaiaPage() {
  const {practiceId: identifier } = useParams();
  const isCode = isCustomerCode(identifier);

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
    <SiteSettingsProvider 
      initialPracticeId={isCode ? null : identifier}
      customerCode={isCode ? identifier : null}
    >
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <PaiaManualPage />
        </main>
      </div>
    </SiteSettingsProvider>
  );
}
