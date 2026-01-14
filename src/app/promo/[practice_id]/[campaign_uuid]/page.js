"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import components that might be using browser APIs
const Navbar = dynamic(() => import('../../../pages/Navbar'), { ssr: false });
const FooterPage = dynamic(() => import('../../../pages/FooterPage'), { ssr: false });
const SinglePageNavbar = dynamic(() => import('../../../components/SinglePageNavbar'), { ssr: false });

import { SiteSettingsProvider, useSiteSettings } from '../../../context/SiteSettingsContext';
import { isLuminaPractice, getPracticeSettings, getPracticeLogo } from '../../../../utils/practiceUtils';
import SinglePageFooter from '../../../components/SinglePageFooter';
import Loader from '../../../components/Loader';

// Default practice ID to use when none is provided in the URL
const DEFAULT_PRACTICE_ID = '67';

const PromoPageContent = () => {
  const params = useParams();
  const practiceId = params?.practice_id || DEFAULT_PRACTICE_ID;
  const campaign_uuid = params?.campaign_uuid;
  const { siteSettings } = useSiteSettings();

  const [templateHtml, setTemplateHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLuminaSite, setHasLuminaSite] = useState(false);
  const [logoLight, setLogoLight] = useState(null);
  const [logoDark, setLogoDark] = useState(null);
  const [practiceSettings, setPracticeSettings] = useState(null);
  const [bannerUrl, setBannerUrl] = useState('');
  const [isPortal, setIsPortal] = useState(true);
  const iframeRef = useRef(null);

  const adjustIframeHeight = useCallback(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      if (iframe.contentWindow) {
        try {
          const height = iframe.contentWindow.document.documentElement.scrollHeight;
          if (height > 0) {
            iframe.style.height = `${height}px`;
          }
        } catch (e) {
          console.error('Error adjusting iframe height:', e);
        }
      }
    }
  }, []);

  const handleIframeLoad = useCallback(() => {
    adjustIframeHeight();
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.addEventListener('resize', adjustIframeHeight);
    }
  }, [adjustIframeHeight]);

  useEffect(() => {
    const loadPracticeDetails = async () => {
      try {
        // Check if this practice has a Lumina Blue site
        try {
          const response = await fetch(`https://eyecareportal.herokuapp.com/api/website/${practiceId}/0`);
          if (response.ok) {
            const data = await response.json();
            if (data && Object.keys(data).length > 0) {
              setHasLuminaSite(true);
              // Store both light and dark logos from Lumina site data
              if (data.about?.logo_light || data.about?.logo_dark) {
                setLogoLight(data.about.logo_light || data.about.logo_dark);
                setLogoDark(data.about.logo_dark || data.about.logo_light);
              }
            }
          }
        } catch (error) {
          console.error('Error checking Lumina site status:', error);
          setHasLuminaSite(false);
        }

        // Check if this is a Lumina practice
        const isLumina = await isLuminaPractice(practiceId);

        // If not a Lumina practice, fetch practice settings to get the logo and banner
        if (!isLumina) {
          const settings = await getPracticeSettings(practiceId);
          setPracticeSettings(settings);
          if (settings) {
            const logoUrl = getPracticeLogo(settings);
            if (logoUrl) {
              // For non-Lumina practices, use the same logo for both light and dark
              setLogoLight(logoUrl);
              setLogoDark(logoUrl);
            }
            // Set banner URL from practice settings if available
            if (settings.banner_url) {
              setBannerUrl(settings.banner_url);
            }
          }
        }
      } catch (error) {
        console.error('Error loading practice details:', error);
      }
    };

    const fetchTemplate = async () => {
      if (!practiceId || !campaign_uuid) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        const apiKey = require('crypto').createHash('md5').update(today).digest('hex');
        const response = await fetch(
          `https://www.ocumail.com/api/marketing_campaign/lumina_render/${campaign_uuid}?api_key=${apiKey}&practice_id=${practiceId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch template');
        }

        const data = await response.json();
        setTemplateHtml(data.campaign.mail_template_html);
      } catch (err) {
        console.error('Error fetching template:', err);
        setError('Failed to load email template');
      } finally {
        setIsLoading(false);
      }
    };

    loadPracticeDetails();
    fetchTemplate();

    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setIsPortal(hostname.includes('eyecareportal.com') || hostname.includes('localhost') || hostname.includes('herokuapp.com'));
    }

    // Store the current ref in a variable for cleanup
    const currentIframe = iframeRef.current;
    const currentWindow = currentIframe?.contentWindow;

    if (currentWindow) {
      currentWindow.addEventListener('resize', adjustIframeHeight);
    }

    return () => {
      if (currentWindow) {
        currentWindow.removeEventListener('resize', adjustIframeHeight);
      }
    };
  }, [practiceId, campaign_uuid, handleIframeLoad, adjustIframeHeight, iframeRef]);

  useEffect(() => {
    if (templateHtml && iframeRef.current) {
      const timer = setTimeout(adjustIframeHeight, 100);
      return () => clearTimeout(timer);
    }
  }, [templateHtml, adjustIframeHeight]);

  if (isLoading) {
    return <Loader />;
  }

  // Get banner URL from practice settings or use a default
  const bannerUrlToUse = bannerUrl || (practiceSettings?.banner_url || '/images/InfoCentre/InfoCentreBannerGeneric.jpg');

  return (
    <div className="min-h-screen flex flex-col">
      {isPortal ? (
        <SinglePageNavbar
          practiceId={practiceId}
          logoLight={logoLight}
          logoDark={logoDark}
        />
      ) : (
        <Navbar
          logoLight={logoLight}
          logoDark={logoDark}
          primaryColor={siteSettings?.primaryColor}
        />
      )}
      <main className="flex-grow">
        {/* Hero Section with dark overlay */}
        <div className="w-full h-[300px] md:h-[400px] bg-cover bg-center text-white"
          style={{
            backgroundImage: `url(${bannerUrlToUse})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
          <div className="h-full bg-black bg-opacity-50 flex items-center justify-center">
          </div>
        </div>
        {error ? (
          <div className="p-8 text-center">
            <div className="text-red-500 text-lg">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto p-4">
            <iframe
              ref={iframeRef}
              srcDoc={`
                <!DOCTYPE html>
                <html style="height: auto;">
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                      body { 
                        margin: 0; 
                        padding: 0; 
                        font-family: Arial, sans-serif;
                        background: white;
                        color: #333;
                      }
                      .banner-container {
                        width: 100%;
                        max-width: 100%;
                        overflow: hidden;
                        margin-bottom: 30px;
                      }
                      .banner-image {
                        width: 100%;
                        height: auto;
                        display: block;
                      }
                      img { 
                        max-width: 100% !important; 
                        height: auto !important; 
                      }
                      a { 
                        text-decoration: none;
                      }
                      table, tr, td {
                        border-collapse: collapse !important;
                        mso-table-lspace: 0pt !important;
                        mso-table-rspace: 0pt !important;
                      }
                      * {
                        box-sizing: border-box;
                      }
                    </style>
                  </head>
                  <body>

                    <div class="content">
                    <script>
                      function notifyResize() {
                        window.parent.postMessage({
                          type: 'resize',
                          height: document.documentElement.scrollHeight
                        }, '*');
                      }
                      window.addEventListener('load', notifyResize);
                      window.addEventListener('resize', notifyResize);
                      const observer = new MutationObserver(notifyResize);
                      observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        characterData: true
                      });
                    </script>
                    ${templateHtml}
                    </div>
                  </body>
                </html>
              `}
              className="w-full border-0"
              onLoad={handleIframeLoad}
              title="Email Template"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              scrolling="no"
            />
          </div>
        )}
      </main>
      {isPortal ? (
        <SinglePageFooter
          practiceId={practiceId}
          logoLight={logoLight}
          logoDark={logoDark}
          primaryColor={siteSettings?.primaryColor}
          className="mt-auto"
        />
      ) : (
        <FooterPage
          primaryColor={siteSettings?.primaryColor}
        />
      )}
    </div>
  );
};

// Client component that handles the params Promise
const PromoPageClient = ({ params }) => {
  return <PromoPageContent />;
};

// Main page component
export default function PromoPage({ params }) {
  return <PromoPageClient params={params} />;
}
