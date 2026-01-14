"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SiteSettingsProvider } from '../../context/SiteSettingsContext';
import InfoCentreHomePage from '../../pages/InfoCentreHomePage';
import { isLuminaPractice, getPracticeSettings, getPracticeLogo } from '../../../utils/practiceUtils';
import SinglePageNavbar from '../../components/SinglePageNavbar';
import SinglePageFooter from '../../components/SinglePageFooter';

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

export default function InfoCentrePage() {
  const { practice_id: identifier } = useParams();
  const isCode = isCustomerCode(identifier);
  const [practiceLogo, setPracticeLogo] = useState({ light: null, dark: null });
  const [hasLuminaSite, setHasLuminaSite] = useState(false);
  const [isLumina, setIsLumina] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get the actual practice ID (either directly or from the code)
  const practiceId = isCode ? null : identifier;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if this practice has a Lumina Blue site and get settings
        if (practiceId) {
          try {
            const response = await fetch(`https://eyecareportal.herokuapp.com/api/website/${practiceId}/0`);
            if (response.ok) {
              const data = await response.json();

              const hasData = Array.isArray(data)
                ? data.length > 0
                : data && Object.keys(data).length > 0;
              setHasLuminaSite(Boolean(hasData));

              let logoLight = null;
              let logoDark = null;

              if (data?.about) {
                logoLight = data.about.logo_light || data.about.logo_dark || null;
                logoDark = data.about.logo_dark || data.about.logo_light || null;
              } else if (Array.isArray(data)) {
                logoLight = data.find(s => s.setting_name === 'PracticeLogoURL')?.setting_value || null;
                logoDark = data.find(s => s.setting_name === 'PracticeLogoDarkURL')?.setting_value || null;
              } else if (data && typeof data === 'object') {
                logoLight = data.logo_light || data.PracticeLogoURL || data.practice_logo_url || null;
                logoDark = data.logo_dark || data.PracticeLogoDarkURL || data.practice_logo_dark_url || null;
              }

              if (logoLight || logoDark) {
                setPracticeLogo({
                  light: logoLight || logoDark,
                  dark: logoDark || logoLight
                });
              }
            }
          } catch (error) {
            console.error('Error checking Lumina site status:', error);
            setHasLuminaSite(false);
          }
        }

        // Check if this is a Lumina practice and get logo if not
        const luminaCheck = await isLuminaPractice(practiceId || identifier);
        setIsLumina(luminaCheck);

        if (!luminaCheck && practiceId) {
          try {
            const settings = await getPracticeSettings(practiceId);
            const logoUrl = getPracticeLogo(settings);
            if (logoUrl) {
              setPracticeLogo({
                light: logoUrl,
                dark: logoUrl
              });
            }
          } catch (error) {
            console.error('Error fetching practice settings:', error);
          }
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [practiceId, identifier]);

  if (!identifier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Practice ID Required</h2>
          <p className="text-gray-600">Please provide a valid practice identifier</p>
        </div>
      </div>
    );
  }



  const siteSettingsProps = {
    initialPracticeId: practiceId || null,
    customerCode: isCode ? identifier : null
  };

  if (loading) {
    return (
      <SiteSettingsProvider {...siteSettingsProps}>
        <div className="min-h-screen flex flex-col">
          <SinglePageNavbar 
            practiceId={practiceId}
            logoLight={practiceLogo.light}
            logoDark={practiceLogo.dark}
          />
          <main className="flex-grow">
            <InfoCentreHomePage clean={isLumina} practiceLogo={practiceLogo} />
          </main>
          <SinglePageFooter 
            practiceId={practiceId}
            logoLight={practiceLogo.light}
            logoDark={practiceLogo.dark}
          />
        </div>
      </SiteSettingsProvider>
    );
  }

  return (
    <SiteSettingsProvider {...siteSettingsProps}>
      <div className="min-h-screen flex flex-col">
        <SinglePageNavbar 
          practiceId={practiceId}
          logoLight={practiceLogo?.light}
          logoDark={practiceLogo?.dark}
        />
        <main className="flex-grow">
          <InfoCentreHomePage clean={isLumina} practiceLogo={practiceLogo} />
        </main>
        <SinglePageFooter 
          practiceId={practiceId}
          logoLight={practiceLogo?.light}
          logoDark={practiceLogo?.dark}
          className="mt-auto"
        />
      </div>
    </SiteSettingsProvider>
  );
}
