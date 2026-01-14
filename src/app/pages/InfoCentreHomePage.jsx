import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useSiteSettings } from "../context/SiteSettingsContext";

const FALLBACK_IMAGE = 'https://via.placeholder.com/800x500.png?text=Image+Not+Available';

const InfoCentreHomePage = ({ clean = false }) => {
  const { siteSettings, isLoading } = useSiteSettings();
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [basePath, setBasePath] = useState('');

  // Get the current path segments and practice ID
  const getPathInfo = () => {
    if (typeof window === 'undefined') return { segments: [], practiceId: null };

    const segments = window.location.pathname.split('/').filter(Boolean);
    let practiceId = null;

    // Function to check if identifier is a customer code
    const isCustomerCode = (identifier) => {
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
    };

    // If the URL is /71/info_centre or /-DEMO-/info_centre (practice ID or customer code first)
    if (segments.length >= 2 && (/^\d+$/.test(segments[0]) || isCustomerCode(segments[0])) && segments[1] === 'info_centre') {
      practiceId = segments[0];
    }
    // If the URL is /info_centre/71, the practice ID is the second segment
    else if (segments[0] === 'info_centre' && segments[1] && !segments[2]) {
      practiceId = segments[1];
    }
    // If the first segment is a number (practice ID) or customer code and not 'info_centre'
    else if (segments.length > 0 && segments[0] !== 'info_centre' && (/^\d+$/.test(segments[0]) || isCustomerCode(segments[0]))) {
      practiceId = segments[0];
    }
    // If we're at /info_centre/list/30/71, the practice ID is the last segment
    else if (segments[0] === 'info_centre' && segments[1] === 'list' && segments[3]) {
      practiceId = segments[3];
    }

    return { segments, practiceId };
  };

  // Determine the base path and URL structure based on the current URL
  const [urlStructure, setUrlStructure] = useState({ hasPracticeIdInPath: false });

  useEffect(() => {
    const { segments, practiceId } = getPathInfo();

    if (practiceId && segments[0] === practiceId) {
      // If we're in /71/info_centre format
      setBasePath(`/${practiceId}/info_centre`);
      setUrlStructure({ hasPracticeIdInPath: true });
    } else if (practiceId) {
      // If we're in /info_centre/71 format
      setBasePath('/info_centre');
      setUrlStructure({ hasPracticeIdInPath: false });
    } else {
      setBasePath('/info_centre');
      setUrlStructure({ hasPracticeIdInPath: false });
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('https://www.ocumail.com/api/section_categories');
        if (!response.ok) {
          const errorMessage = `Network response was not ok: ${response.statusText}`;
          console.error(errorMessage);
          setError(errorMessage);
          setLoading(false);
          return;
        }
        let allCategories = await response.json();
        // Sort categories by orderby in ascending order (lower numbers first)
        allCategories.sort((a, b) => (a.orderby || 0) - (b.orderby || 0));

        // Fetch details for each category to get thumbnail URLs
        const fetchedCategories = await Promise.all(
          allCategories.map(async (category) => {
            try {
              const response = await fetch(`https://www.ocumail.com/api/section_categories/${category.id}`);
              if (!response.ok) {
                if (response.status === 404) {
                  console.warn(`Category with ID ${category.id} not found`);
                  return null;
                }
                console.error(`Network response was not ok for ID: ${category.id}`, response.statusText);
                return null;
              }
              const data = await response.json();
              return {
                id: data.id,
                name: data.name,
                thumbnailImgUrl: data.thumbnail_img_url,
              };
            } catch (error) {
              console.error(`Error fetching category ${category.id}:`, error);
              return null;
            }
          })
        );
        setCategories(fetchedCategories.filter(category => category !== null));
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = async (id) => {
    setSelectedCategoryId(id);
    try {
      const response = await fetch(`https://www.ocumail.com/api/section_items/${id}`);
      if (!response.ok) {
        console.warn(`No items found for category ID: ${id} (${response.status})`);
        setSubcategories([]);
        return;
      }
      const data = await response.json();
      setSubcategories(data.items || []);
    } catch (error) {
      console.error(`Error fetching subcategories for ID: ${id}`, error);
      setSubcategories([]);
    }
  };

  const getCategoryDescription = (categoryName) => {
    const descriptions = {
      'Refractive conditions': 'See how small focusing changes can make a big difference to how you see.',
      'Rx lens options': 'Find out how the right lens design and coating can make a real difference to your vision.',
      'External & lid pathology': "Understand common eyelid and eye surface conditions that affect comfort and eye health.",
      'Anterior & corneal pathology': 'Learn about conditions affecting the front of the eye that can impact vision clarity and comfort.',
      'Posterior & retinal pathology': 'Discover why changes at the back of the eye are important for protecting your sight.',
      'General Eyecare': 'Everyday eye care tips and guidance to help protect your vision and support long-term eye health.',
      'Pharmaceuticals': "Learn about therapeutic eye care solutions designed to treat, protect, and support long-term eye health.",
      'Contact lenses': 'Discover how modern contact lenses can provide an alternative to spectacles.',
      'CooperVision': 'Find the right CooperVision contact lens tailored for daily wear, active lifestyles, and specialised vision care.'
    };

    return descriptions[categoryName] || `Discover more about ${categoryName} and how it impacts your vision.`;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* Hero Section */}
      <div className="w-full h-[500px] bg-[url('/images/InfoCentre/InfoCentreBannerGeneric.jpg')] bg-cover bg-center text-white">
        <div className="h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-5xl font-bold pb-4">
              {siteSettings?.name || 'Welcome'}
              {siteSettings?.name && siteSettings.name.length <= 17 && (
                <span className="ml-4">Info Centre</span>
              )}
            </h1>
            {!siteSettings?.name || siteSettings.name.length > 17 ? (
              <h1 className="text-5xl font-bold">Info Centre</h1>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stacked Category Blocks */}
      <div className="py-16 px-4 bg-gray-100">
        <div className="max-w-7xl mx-auto space-y-20">
          {categories.map((category, index) => {
            return (
              <div key={category.id} className="w-full p-6 bg-white rounded-xl border border-gray-200 shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-lg">
                <div className="w-full flex flex-col md:flex-row items-center">
                  {/* Image Section - Order changes based on index */}
                  <div className={`w-full md:w-1/2 ${index % 2 !== 0 ? 'md:order-2' : ''} p-4`}>
                    <Link
                      href={`${basePath}/list/${category.id}${!urlStructure.hasPracticeIdInPath && getPathInfo().practiceId ? `/${getPathInfo().practiceId}` : ''}`}
                      onClick={() => handleCategoryClick(category.id)}
                      className="block"
                    >
                      <div className="relative h-40 md:h-64 w-full rounded-lg overflow-hidden shadow-md">
                        {category.thumbnailImgUrl && (
                          <Image
                            src={category.thumbnailImgUrl || FALLBACK_IMAGE}
                            alt={category.name}
                            layout="fill"
                            className="object-cover transition-transform duration-200 transform hover:scale-102"
                            priority
                            onError={(e) => {
                              // Prevent infinite loop by setting a flag
                              if (e.target.src !== FALLBACK_IMAGE) {
                                e.target.src = FALLBACK_IMAGE;
                              }
                            }}
                          />
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Text Section - Order changes based on index */}
                  <div className={`w-full md:w-1/2 p-4 text-center md:text-left ${index % 2 !== 0 ? 'md:order-1' : ''}`}>
                    <Link
                      href={`${basePath}/list/${category.id}${!urlStructure.hasPracticeIdInPath && getPathInfo().practiceId ? `/${getPathInfo().practiceId}` : ''}`}
                      onClick={() => handleCategoryClick(category.id)}
                      className="inline-block"
                    >
                      <h2 className="text-3xl font-bold text-gray-800 mb-4">{category.name}</h2>
                      <p className="text-gray-600 mb-6 text-lg leading-relaxed line-clamp-2">
                        {getCategoryDescription(category.name)}
                      </p>
                      <span className="inline-block px-6 py-3 text-base rounded-full shadow-sm transition-all duration-200 transform hover:scale-103 bg-primary text-white hover:bg-opacity-90">
                        Explore {category.name}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InfoCentreHomePage;
