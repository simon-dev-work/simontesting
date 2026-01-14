'use client';

import { useEffect, useState } from 'react';

export default function PrivacyPolicy() {
  const [privacyContent, setPrivacyContent] = useState('');

  useEffect(() => {
    // This code only runs on the client side
    const privacyPolicy = document.documentElement.getAttribute('data-privacy-policy');
    setPrivacyContent(privacyPolicy || '<p>Privacy policy not available for this practice.</p>');
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div 
        className="prose max-w-none" 
        dangerouslySetInnerHTML={{ __html: privacyContent }}
      />
    </div>
  );
}
