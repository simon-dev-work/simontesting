"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { usePathname } from "next/navigation";

const SinglePageNavbar = ({ logoLight, logoDark, practiceId: propPracticeId }) => {
  const { siteSettings } = useSiteSettings();
  const pathname = usePathname();
  const [primaryColor, setPrimaryColor] = useState(siteSettings?.primaryColor || '#000000');

  // Use prop practiceId or fall back to siteSettings.practiceId or a default value
  const effectivePracticeId = propPracticeId || siteSettings?.practiceId || '';
  const [isSticky, setIsSticky] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [licenseType, setLicenseType] = useState(null);
  const [hideLogo, setHideLogo] = useState(false);

  // Determine which logo to use based on sticky state
  // When sticky (white background), use logo_dark
  // When transparent, use logo_light
  const currentLogo = isSticky ? logoDark : logoLight;

  // Fetch settings including logo visibility and primary color
  useEffect(() => {
    async function fetchSettings() {
      if (!siteSettings?.practiceId) return;

      try {
        const response = await fetch(
          `https://www.ocumail.com/api/settings?setting_object_id=${siteSettings.practiceId}&setting_object_type=Practice`
        );

        if (response.ok) {
          const settings = await response.json();

          // Handle logo visibility setting
          const logoSetting = settings.find(s => s.setting_name === 'HidePracticeLogoOnEyecarePortal');
          if (logoSetting) {
            setHideLogo(logoSetting.setting_value === 't');
          }

          // Handle primary color setting
          const colorSetting = settings.find(s => s.setting_name === 'PrimaryColor');
          if (colorSetting?.setting_value) {
            setPrimaryColor(colorSetting.setting_value);
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    }

    fetchSettings();
  }, [siteSettings?.practiceId]);

  // Fetch license info with better error handling
  useEffect(() => {
    let isMounted = true;

    async function fetchLicense() {
      if (!siteSettings?.practiceId) return;

      try {
        const res = await fetch(`/api/${siteSettings.practiceId}/check_licence`);

        if (!res.ok) {
          console.warn(`License API returned ${res.status}: ${res.statusText}`);
          if (isMounted) setLicenseType(null);
          return;
        }

        const data = await res.json();

        if (isMounted) {
          setLicenseType(data?.product_type || null);
        }
      } catch (err) {
        console.error("Error checking license:", err);
        if (isMounted) setLicenseType(null);
      }
    }

    fetchLicense();

    return () => {
      isMounted = false;
    };
  }, [siteSettings?.practiceId]);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        setIsSticky(true);
        setIsScrolled(true);
        return;
      }

      if (window.scrollY > window.innerHeight * 0.2) {
        setIsSticky(true);
        setIsScrolled(true);
      } else {
        setIsSticky(false);
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  // Menu toggle
  const handleMenuToggle = () => {
    setIsMenuOpen(prev => {
      const menuState = !prev;

      if (menuState) {
        setIsSticky(true);
      } else {
        setIsSticky(window.scrollY > window.innerHeight * 0.2);
      }

      return menuState;
    });
  };

  const getLink = (path) => {
    if (!siteSettings?.practiceId) return path;

    const currentPath = pathname || '';
    const pathSegments = currentPath.split('/').filter(Boolean);
    const isCustomerCodeRoute = pathSegments[0] && !/^\d+$/.test(pathSegments[0]);

    if (isCustomerCodeRoute) {
      const customerCode = pathSegments[0];
      return `/${customerCode}${path}`;
    }

    if (siteSettings.customerCode) {
      return `/${siteSettings.customerCode}${path}`;
    }

    return `/${siteSettings.practiceId}${path}`;
  };

  // Update the CSS variable when primaryColor changes
  useEffect(() => {
    if (!primaryColor) return;

    // Set the CSS variable on the document root
    document.documentElement.style.setProperty('--primary-color', primaryColor);

    // Create a style element for hover effects
    const styleId = 'navbar-hover-styles';
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Update the style content with the current primary color
    styleElement.textContent = `
      .nav-link-hover:hover {
        color: ${primaryColor} !important;
      }
      
      /* Also set the CSS variable for any other components that might need it */
      :root {
        --primary-color: ${primaryColor};
      }
    `;

    // Cleanup function to remove the style element when component unmounts
    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [primaryColor]);

  return (
    <header
      className={`w-full fixed top-0 left-0 z-[999999] flex justify-between items-center py-4 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 transition-all ${isSticky ? "bg-white shadow-lg text-black" : "bg-transparent text-white"
        }`}
    >
      <div className="container mx-auto flex items-center justify-between w-full">
        {/* Logo */}
        <div className="flex-shrink-0 z-0">
          <Link href={getLink('/')} className="flex items-center">
            {!hideLogo && currentLogo ? (
              <div className="relative h-12 w-auto">
                <Image
                  src={currentLogo}
                  alt="Practice Logo"
                  width={200}
                  height={55}
                  className="h-full w-auto object-contain max-h-12"
                  priority
                />
              </div>
            ) : (
              <div className="text-xl font-bold">
                {siteSettings?.practiceName || ''}
              </div>
            )}
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={handleMenuToggle}
            className="text-gray-700 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center space-x-8 ml-8">
          <Link
            href={`/info_centre/${effectivePracticeId}`}
            className={`nav-link-hover hover:text-[var(--primary-color)] transition-colors px-3 py-2 ${pathname === `/info_centre/${effectivePracticeId}` ? 'font-bold' : ''
              }`}
          >
            Info Centre
          </Link>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-6">
          <div className="flex flex-col space-y-4">
            <Link
              href={`/info_centre/${effectivePracticeId}`}
              className="nav-link-hover hover:text-[var(--primary-color)] transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Info Centre
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default SinglePageNavbar;
