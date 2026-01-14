"use client";

import { FaFacebook, FaInstagram, FaLinkedin, FaPinterest, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaTiktok, FaGoogle } from 'react-icons/fa';
import { useSiteSettings } from "../context/SiteSettingsContext";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const FooterPage = ({
  practiceLogo,
  practiceEmail,
  practiceAddress,
  practicePhone,
  practiceName,
  primaryColor,
  blogs: blogsProp = []
}) => {
  const { siteSettings } = useSiteSettings();
  const [internalBlogs, setInternalBlogs] = useState([]);
  const [licenseType, setLicenseType] = useState(null);
  const [hideLogo, setHideLogo] = useState(false);

  // Use blogs from props if provided, otherwise use internal state, and filter out hidden blogs
  const blogs = (blogsProp.length > 0 ? blogsProp : internalBlogs).filter(blog => blog.show !== false);

  // Use props if provided, otherwise fall back to siteSettings
  const email = practiceEmail || siteSettings?.email;
  const address = practiceAddress || siteSettings?.address_1;
  const phone = practicePhone || siteSettings?.tel || siteSettings?.phone;
  const name = practiceName || siteSettings?.name;
  const color = primaryColor || siteSettings?.primaryColor || '#000000';

  // Inline style for primary color
  const primaryStyle = { color: color };

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

  // Only fetch blogs if not provided via props and license is not Comprehensive
  useEffect(() => {
    if (blogsProp.length > 0) return; // Skip if blogs are provided via props
    if (licenseType === "Comprehensive") return;
    if (!siteSettings?.practiceId) return;

    let isMounted = true;

    const fetchBlogs = async () => {
      try {
        const response = await fetch(`/api/${siteSettings.practiceId}/blogs`);

        // Handle non-OK responses gracefully
        if (!response.ok) {
          console.warn(`Blogs API returned ${response.status}: ${response.statusText}`);
          if (isMounted) setInternalBlogs([]);
          return;
        }

        const data = await response.json();

        // Only update state if component is still mounted
        if (isMounted) {
          // Ensure data is an array before processing
          const blogsArray = Array.isArray(data) ? data : [];
          const sortedBlogs = blogsArray
            .filter(blog => blog?.date) // Safely filter out invalid entries
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4); // Show 4 most recent blogs
          setInternalBlogs(sortedBlogs);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        if (isMounted) setInternalBlogs([]);
      }
    };

    fetchBlogs();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [siteSettings?.practiceId, licenseType, blogsProp.length]);

  // State to manage path segments and routing
  const [routing, setRouting] = useState({
    isCustomerCodeRoute: false,
    customerCode: null,
    isClient: false
  });

  // Set up client-side routing after mount
  useEffect(() => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const isCustomerCodeRoute = pathSegments[0] && !/^\d+$/.test(pathSegments[0]);

    setRouting({
      isCustomerCodeRoute,
      customerCode: isCustomerCodeRoute ? pathSegments[0] : null,
      isClient: true
    });
  }, []);

  // Helper function to get the correct blog path
  const getBlogPath = (blogId) => {
    if (!routing.isClient) return '#'; // safe during SSR

    // Determine if current URL already omits numeric practiceId
    const segments = window.location.pathname.split('/').filter(Boolean);
    const firstSeg = segments[0];
    const isNumericFirstSeg = firstSeg && /^\d+$/.test(firstSeg);
    const singleNumericRoot = isNumericFirstSeg && segments.length === 1;

    if (!isNumericFirstSeg || singleNumericRoot) {
      return `/blog/${blogId}`;
    }

    const basePath = routing.isCustomerCodeRoute
      ? routing.customerCode
      : siteSettings?.practiceId;

    return `/${basePath}/blog/${blogId}`;
  };

  const getLink = (path) => {
    if (!routing.isClient) return path;

    const currentPath = window.location.pathname;

    // If we're already in a sub-section like /blog or /info_centre,
    // we want links to be root-relative to the domain.
    if (currentPath.startsWith('/blog') || currentPath.startsWith('/info_centre') || currentPath.startsWith('/new_booking')) {
      return path.startsWith('#') ? `/${path}` : path;
    }

    const segmentsPath = currentPath.split('/').filter(Boolean);
    if (segmentsPath.length === 0) return path;

    const firstSeg = segmentsPath[0];
    const RESERVED = ['blog', 'info_centre', 'new_booking', 'api', 'paia', 'privacy', 'settings'];

    const isNumericFirstSeg = firstSeg && /^\d+$/.test(firstSeg);
    const isCustomerCodeRoute = !isNumericFirstSeg && !RESERVED.includes(firstSeg);

    if (isCustomerCodeRoute) {
      return `/${firstSeg}${path}`;
    }

    if (isNumericFirstSeg) {
      // Handle special paths that should not include practice ID
      const isSpecialPath = path === '/info_centre' || path === '/blog' || path.startsWith('/info_centre/') || path.startsWith('/blog/');
      if (isSpecialPath) return path;

      return `/${firstSeg}${path}`;
    }

    return path;
  };

  // Determine whether to show the News column
  const showNewsColumn = licenseType !== "Comprehensive";

  return (
    <footer className="w-full py-12" style={{ backgroundColor: "#363636", '--primary-color': color }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-2 gap-y-8">
          {/* Column 1: Logo with text */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center">
              {!hideLogo && (practiceLogo || siteSettings?.about?.logo_light) ? (
                <Image
                  src={practiceLogo || siteSettings.about.logo_light}
                  alt={siteSettings?.name || 'Practice Logo'}
                  width={200}
                  height={55}
                  className="h-12 w-auto"
                  onError={(e) => {
                    // Hide the image if it fails to load
                    e.target.style.display = 'none';
                    // Show fallback text if both logos fail to load
                    if (!hideLogo) {
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'h-12 w-48 bg-gray-200 flex items-center justify-center text-gray-500';
                      fallbackDiv.textContent = siteSettings?.name || 'Practice Logo';
                      e.target.parentNode.appendChild(fallbackDiv);
                    }
                  }}
                />
              ) : !hideLogo ? (
                <div className="h-12 w-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  {siteSettings?.name || 'Practice Logo'}
                </div>
              ) : null}
            </div>
            <p className="text-white ml-0">
              Stay connected to our practice via our social platforms.
            </p>
            <div className="flex space-x-4">
              {siteSettings?.facebook_url?.trim() && (
                <a
                  href={siteSettings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <FaFacebook className="h-6 w-6" style={primaryStyle} />
                </a>
              )}
              {siteSettings?.instagram_url?.trim() && (
                <a href={siteSettings.instagram_url} className="text-primary hover:text-white">
                  <FaInstagram className="h-6 w-6" style={primaryStyle} />
                </a>
              )}
              {typeof siteSettings.linkedin_url === 'string' && siteSettings.linkedin_url.trim() !== "" && (
                <a href={siteSettings.linkedin_url} className="text-primary hover:text-white">
                  <FaLinkedin className="h-6 w-6" style={primaryStyle} />
                </a>
              )}
              {typeof siteSettings.tiktok_url === 'string' && siteSettings.tiktok_url.trim() !== "" && (
                <a href={siteSettings.tiktok_url} className="text-primary hover:text-white">
                  <FaTiktok className="h-6 w-6" style={primaryStyle} />
                </a>
              )}
              {typeof siteSettings.google_business_profile_url === 'string' && siteSettings.google_business_profile_url.trim() !== "" && (
                <a href={siteSettings.google_business_profile_url} className="text-primary hover:text-white">
                  <FaGoogle className="h-6 w-6" style={primaryStyle} />
                </a>
              )}
              {typeof siteSettings.pinterest_url === 'string' && siteSettings.pinterest_url.trim() !== "" && (
                <a href={siteSettings.pinterest_url} className="text-primary hover:text-white">
                  <FaPinterest className="h-6 w-6" style={primaryStyle} />
                </a>
              )}
              {typeof siteSettings.whatsapp_tel === 'string' && siteSettings.whatsapp_tel.trim() !== "" && (
                <a
                  href={`https://wa.me/${siteSettings.whatsapp_tel.replace(/[^0-9]/g, '')}`}
                  className="text-primary hover:text-white"
                >
                  <FaWhatsapp className="h-6 w-6" style={primaryStyle} />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 lg:col-start-5">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href={getLink("/")} className="text-white hover:text-primary">Home</Link></li>
              <li><Link href={getLink("/#about")} className="text-white hover:text-primary">About</Link></li>
              <li><Link href={getLink("/#services")} className="text-white hover:text-primary">Services</Link></li>
              <li><Link href={getLink("/#team")} className="text-white hover:text-primary">Team</Link></li>
              <li><Link href={getLink("/#testimonials")} className="text-white hover:text-primary">Feedback</Link></li>
            </ul>
          </div>

          {/* Column 3: Latest Blog Posts - Only show if blogs are available */}
          {blogs.length > 0 && (
            <div className="lg:col-span-4 lg:col-start-7">
              <h3 className="text-lg font-semibold text-white mb-4">Recent News</h3>
              <div className="space-y-4">
                {blogs.map(blog => (
                  <div key={blog.id} className="border-b border-gray-700 pb-4 mb-4">
                    <div className="flex gap-4">
                      {(blog.thumbnail_image?.url || blog.header_image?.url) && (
                        <Link
                          href={getBlogPath(blog.id)}
                          className="flex-shrink-0 w-20 h-20 rounded overflow-hidden"
                        >
                          <Image
                            src={blog.thumbnail_image?.url || blog.header_image?.url || '/placeholder-blog.jpg'}
                            alt={blog.title}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-blog.jpg';
                            }}
                          />
                        </Link>
                      )}
                      <div className="flex-1">
                        <Link href={getBlogPath(blog.id)}>
                          <div className="text-[var(--primary-color)] hover:text-white font-medium line-clamp-2 mb-1">
                            {blog.title}
                          </div>
                        </Link>
                        <div className="text-sm text-gray-400">{blog.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Column 4: Get In Touch */}
          <div className="lg:col-span-3 lg:col-start-11">
            <h3 className="text-lg font-semibold text-white mb-4">Get In Touch</h3>
            <div className="space-y-3">
              {address && (
                <div className="flex items-start">
                  <FaMapMarkerAlt className="h-5 w-5 mt-3 flex-shrink-0" style={primaryStyle} />
                  <p className="text-white ml-4 mb-1">{address}</p>
                </div>
              )}
              {phone && (
                <div className="flex items-center">
                  <FaPhone className="h-5 w-5 mr-3" style={primaryStyle} />
                  <a href={`tel:${phone}`} className="text-white hover:text-primary">{phone}</a>
                </div>
              )}
              {email && (
                <div className="flex items-center min-w-0">
                  <FaEnvelope className="h-5 w-5 mr-3 flex-shrink-0" style={primaryStyle} />
                  <a
                    href={`mailto:${email}`}
                    className="text-white hover:text-primary whitespace-nowrap overflow-hidden text-ellipsis block"
                    title={email}
                  >
                    {email}
                  </a>
                </div>
              )}
              {siteSettings?.whatsapp_tel && (
                <div className="flex items-center min-w-0">
                  <FaWhatsapp className="h-5 w-5 mr-3 flex-shrink-0" style={primaryStyle} />
                  <a
                    href={`https://wa.me/${siteSettings.whatsapp_tel.replace(/\D/g, '')}`}
                    className="text-white hover:text-primary whitespace-nowrap overflow-hidden text-ellipsis block"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {siteSettings.whatsapp_tel}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white text-md">
              &copy; {new Date().getFullYear()}. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href={getLink("/privacy")} className="text-white hover:text-primary whitespace-nowrap px-2" style={{ '--primary-color': color }}>
                Privacy Policy
              </Link>
              <Link href={getLink("/paia")} className="text-white hover:text-primary whitespace-nowrap px-2" style={{ '--primary-color': color }}>
                PAIA Manual
              </Link>

            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterPage;