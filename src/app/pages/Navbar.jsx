"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { usePathname } from "next/navigation";

const Navbar = ({ logoLight, logoDark, primaryColor }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [licenseType, setLicenseType] = useState(null);
  const [hideLogo, setHideLogo] = useState(false);
  const { siteSettings } = useSiteSettings();
  const pathname = usePathname();

  // Check if we should hide the logo
  useEffect(() => {
    async function checkLogoSetting() {
      if (!siteSettings?.practiceId) return;

      try {
        const response = await fetch(
          `https://www.ocumail.com/api/settings?setting_object_id=${siteSettings.practiceId}&setting_object_type=Practice`
        );

        if (response.ok) {
          const settings = await response.json();
          const logoSetting = settings.find(s => s.setting_name === 'HidePracticeLogoOnEyecarePortal');
          if (logoSetting) {
            setHideLogo(logoSetting.setting_value === 't');
          }
        }
      } catch (error) {
        console.error('Error checking logo visibility setting:', error);
      }
    }

    checkLogoSetting();
  }, [siteSettings?.practiceId]);

  // Fetch license info with better error handling
  useEffect(() => {
    let isMounted = true;

    async function fetchLicense() {
      if (!siteSettings?.practiceId) return;

      try {
        const res = await fetch(`/api/${siteSettings.practiceId}/check_licence`);

        // Handle non-OK responses gracefully
        if (!res.ok) {
          console.warn(`License API returned ${res.status}: ${res.statusText}`);
          if (isMounted) setLicenseType(null);
          return;
        }

        const data = await res.json();

        // Only update state if component is still mounted
        if (isMounted) {
          setLicenseType(data?.product_type || null);
        }
      } catch (err) {
        console.error("Error checking license:", err);
        if (isMounted) setLicenseType(null);
      }
    }

    fetchLicense();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [siteSettings?.practiceId]);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      // If menu is open on mobile, keep sticky and ignore scroll
      if (isMenuOpen) {
        setIsSticky(true);
        setIsScrolled(true);
        return;
      }

      // Otherwise, sticky depends on scroll position
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
        // Menu opened =>always sticky
        setIsSticky(true);
      } else {
        //Depends on position
        setIsSticky(window.scrollY > window.innerHeight * 0.2);
      }

      return menuState;
    });
  };



  const getLink = (path) => {
    const currentPath = pathname || '';

    // If we're already in a sub-section like /blog or /info_centre or /new_booking,
    // we want links to be root-relative to the domain.
    if (currentPath.startsWith('/blog') || currentPath.startsWith('/info_centre') || currentPath.startsWith('/new_booking')) {
      return path.startsWith('#') ? `/${path}` : path;
    }

    const pathSegments = currentPath.split('/').filter(Boolean);
    if (pathSegments.length === 0) return path;

    const firstSegment = pathSegments[0];
    const RESERVED = ['blog', 'info_centre', 'new_booking', 'api', 'paia', 'privacy', 'settings'];

    const isPracticeId = /^\d+$/.test(firstSegment);
    const isCustomerCode = !isPracticeId && !RESERVED.includes(firstSegment);

    if (isPracticeId || isCustomerCode) {
      // Special handling for /new_booking - should be /new_booking/[id]
      if (path === '/new_booking' || path.startsWith('/new_booking/')) {
        return `/new_booking/${firstSegment}`;
      }

      // Handle special paths that should not include practice ID prefix (clean routes)
      const isCleanPath =
        path === '/info_centre' ||
        path === '/blog' ||
        path.startsWith('/info_centre/') ||
        path.startsWith('/blog/');

      if (isCleanPath) return path;

      // Default: prepend the identifier (e.g., /67/about)
      const cleanPath = path === '/' ? '' : path;
      return `/${firstSegment}${cleanPath}`;
    }

    return path;
  };

  // Decide whether to show NEWS FEED
  const showNewsFeed = licenseType !== "Comprehensive";

  // Get the primary color from props or siteSettings or use a default
  const effectivePrimaryColor = primaryColor || siteSettings?.primaryColor || '#2196f3';
  const textHoverStyle = { '--primary-color': effectivePrimaryColor };

  return (
    <header
      className={`w-full fixed top-0 left-0 z-[999999] flex justify-between items-center py-4 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 transition-all ${isSticky ? "bg-white shadow-lg text-black" : "bg-transparent text-white"
        }`}
      style={textHoverStyle}
    >
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <div className={hideLogo ? "invisible" : ""}>
          <Link href={getLink("/")} className="flex-shrink-0">
            <div className="relative h-12 flex items-center">
              {logoLight || logoDark || siteSettings?.logo_light || siteSettings?.logo_dark || siteSettings?.about?.logo_light || siteSettings?.about?.logo_dark ? (
                <Image
                  src={
                    (isSticky || isMenuOpen)
                      ? logoDark ||
                      siteSettings?.logo_dark ||
                      siteSettings?.about?.logo_dark
                      : logoLight ||
                      siteSettings?.logo_light ||
                      siteSettings?.about?.logo_light
                  }
                  alt={siteSettings?.name || 'Practice Logo'}
                  width={160}
                  height={50}
                  priority
                  onError={(e) => {
                    // Hide the logo if it fails to load
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-12 flex items-center">
                  <span className="text-xl font-bold text-gray-800">
                    {siteSettings?.name || 'Lumina Blue'}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden navfix1:flex items-center font-medium ml-2 sm:ml-4 md:ml-6 lg:ml-8">
          <ul className="flex items-center 
        space-x-4 
        lg:space-x-1 lg:text-sm 
        navfix2:space-x-4 navfix2:text-base"
          >


            <li>
              <Link href={getLink("/")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                <b>HOME</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#about")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                <b>ABOUT</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#services")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                <b>SERVICES</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#team")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                <b>TEAM</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#testimonials")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                <b>FEEDBACK</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/info_centre")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                <b>INFO CENTRE</b>
              </Link>
            </li>

            {showNewsFeed && (
              <li>
                <Link href={getLink("/blog")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                  <b>NEWS FEED</b>
                </Link>
              </li>
            )}
          </ul>

          <div className="ml-4">
            <Link
              href={getLink('/new_booking')}
              className={`px-4 py-2 font-semibold rounded-md border-2 transition-all whitespace-nowrap ${isSticky
                ? 'bg-[var(--primary-color)] text-white border-transparent hover:bg-white hover:text-[var(--primary-color)] hover:border-[var(--primary-color)]'
                : 'bg-white text-black border-black hover:bg-[var(--primary-color)] hover:text-white hover:border-[var(--primary-color)]'
                }`}
              style={{ '--primary-color': effectivePrimaryColor }}
            >
              BOOK NOW
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="navfix1:hidden">
          <button className="text-3xl focus:outline-none" onClick={handleMenuToggle} aria-label="Toggle menu">
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 bg-white z-40 mt-16 overflow-y-auto transition-all duration-300 transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="p-6">
          <ul className="flex flex-col space-y-6 text-lg font-medium items-center">
            <li>
              <Link href={getLink("/")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                <b>HOME</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#about")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                <b>ABOUT</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#services")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                <b>SERVICES</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#team")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                <b>TEAM</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#testimonials")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                <b>FEEDBACK</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/info_centre")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                <b>INFO CENTRE</b>
              </Link>
            </li>

            {showNewsFeed && (
              <li>
                <Link href={getLink("/blog")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                  <b>NEWS FEED</b>
                </Link>
              </li>
            )}

            {isSticky && (
              <li className="mt-6">
                <Link
                  href={getLink("/#booking")}
                  className="inline-block px-6 py-3 bg-[var(--primary-color)] text-white font-semibold rounded-md hover:bg-white hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] border-2 border-transparent transition-all"
                  style={{ '--primary-color': effectivePrimaryColor }}
                  onClick={handleMenuToggle}
                >
                  <b>BOOK NOW</b>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
