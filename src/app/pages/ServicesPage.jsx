"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSiteSettings } from '../context/SiteSettingsContext';
import Image from 'next/image';

// IcoMoon font
const IcomoonStyles = () => (
  <style jsx global>{`
    @font-face {
      font-family: 'icomoon';
      src: url('https://dl.dropbox.com/s/x3qnbrfeo2d3bfp/icomoon.eot?ty6f5v');
      src: url('https://dl.dropbox.com/s/x3qnbrfeo2d3bfp/icomoon.eot?ty6f5v#iefix') format('embedded-opentype'),
           url('https://dl.dropbox.com/s/6bfb63btid4kjpx/icomoon.ttf?ty6f5v') format('truetype'),
           url('https://dl.dropbox.com/s/irn7sila6z5fy2b/icomoon.woff?ty6f5v') format('woff'),
           url('https://dl.dropbox.com/s/l8b3q7nwzgy6f1r/icomoon.svg?ty6f5v#icomoon') format('svg');
      font-weight: normal;
      font-style: normal;
      font-display: block;
    }

    .icon {
      font-family: 'icomoon' !important;
      speak: never;
      font-style: normal;
      font-weight: normal;
      font-variant: normal;
      text-transform: none;
      line-height: 1;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      
    }

    .icon-comprehensiveeyeexams:before { content: "\e935"; }
    .icon-visualacuity:before { content: "\e934"; }
    .icon-lens-holder:before { content: "\e919"; }
    .icon-lens-holder-1:before { content: "\e938"; }
    .icon-repairing-service:before { content: "\e92c"; }
    .icon-repair_1:before { content: "\e92b"; }
    .icon-eyeglasses:before { content: "\e902"; }
    .icon-eyeglasses-of-thin-shape:before { content: "\e903"; }
    .icon-contactlens:before { content: "\e900"; }
    .icon-driverlicense:before { content: "\e901"; }
    .icon-filters:before { content: "\e904"; }
    .icon-filters-1:before { content: "\e904"; }
    .icon-foroptero:before { content: "\e906"; }
    .icon-glaucoma:before { content: "\e907"; }
    .icon-ophthalmology:before { content: "\e91a"; }
    .icon-optometry:before { content: "\e91b"; }
    .icon-paediatric_1:before { content: "\e928"; }
    .icon-paediatric_2:before { content: "\e929"; }
    .icon-paediatric_3:before { content: "\e92a"; }
    .icon-skippers:before { content: "\e92d"; }
    .icon-view:before { content: "\e92e"; }

    
  `}</style>
);

// ServiceCard
const ServiceCard = ({ title, description, icon_id, iconClass, imagePath, iconsMap, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

    const numericIconId = icon_id;

  const resolvedIcon = numericIconId && iconsMap ? iconsMap[numericIconId] : iconClass || 'icon-eye';

    const imageMapping = {
    100: "/compEyeExam.jpg",
    99: "/acuity.jpg",
    97: "/skippers.jpg",
    96: "/frameAdjust.jpg",
    95: "/lowVision.jpg",
    94: "/myopiaManagement.jpg",
    93: "/behavioral.jpg",
    92: "/pediatric.jpg",
    90: "/colorVision.jpg",
    89: "/keratoconus.jpg",
    87: "/glaucoma.jpg",
    86: "/sportVision.jpg",
    85: "/visionTherapy.jpg",
    84: "/binocTesting.jpg",
    83: "/frames.jpg",
    82: "/sunglass.jpg",
    81: "/DriverLicense.jpg",
    80: "/contactLens.jpg",
  };



  const toggleExpand = () => setIsExpanded(!isExpanded);

  const renderVisual = () => {
    // Convert icon_id to a number before looking it up
    const numericId = Number(numericIconId);
    const imagePath = !isNaN(numericId) ? imageMapping[numericId] : null;

    return (
      <div className="w-full h-40 mb-4 relative rounded-lg overflow-hidden bg-gray-100">
        {imagePath ? (
          <>
            <Image
              src={imagePath}
              alt={title}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={(e) => {
                console.error('Image failed to load:', imagePath, 'for service:', title, 'Error:', e);
                setImageError(true);
              }}
              onLoad={() => console.log('Image loaded successfully:', imagePath, 'for service:', title)}
            />
            {!imageError && <div className="absolute inset-0 border-lg rounded-lg border-transparent"></div>}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className={`icon text-primary text-5xl ${resolvedIcon}`} />
          </div>
        )}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className={`icon text-primary text-5xl ${resolvedIcon}`} />
          </div>
        )}
      </div>
    );
  };

  // Determine if description is long enough to need truncation
  const isLongDescription = description && description.length > 100;

  return (
<div className="group relative bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300 h-full overflow-hidden w-full max-w-[260px] md:max-w-[320px] lg:max-w-[360px] mx-auto">
  {/* Animated border */}
  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary transition-all duration-300 pointer-events-none"></div>

  {renderVisual()}
  <div className="flex flex-col flex-grow w-full">
    <h3 className="text-2xl font-semibold text-black mb-3">{title}</h3>
    <div className={`w-full transition-all duration-200 flex-grow ${!isExpanded && isLongDescription ? 'line-clamp-3 overflow-hidden' : ''} ${className}`} style={{ lineHeight: '1.5em', maxHeight: !isExpanded && isLongDescription ? '4.5em' : 'none' }}>
      {description}
    </div>
  </div>
 
  {isLongDescription && (
    <div className="w-full mt-4 pt-4 border-t border-gray-100">
      <button
        onClick={toggleExpand}
        className="w-auto px-8 py-2 bg-primary text-white font-medium rounded-md hover:bg-white hover:text-primary border-2 border-primary transition-colors duration-200"
      >
        {isExpanded ? 'SHOW LESS' : 'SHOW MORE'}
      </button>
    </div>
  )}
  </div>

  );
};

// ServicesPage
const ServicesPage = () => {
  const { siteSettings } = useSiteSettings();
  const practiceId = siteSettings?.practiceId;
  const [iconsMap, setIconsMap] = useState({});

  const allServices = useMemo(() => {
    const featuredIds = new Set((siteSettings?.featured_services || []).map(s => s.id));
    const additionalServices = (siteSettings?.services || []).filter(service => !featuredIds.has(service.id));
    return [
      ...(siteSettings?.featured_services || []),
      ...additionalServices
    ];
  }, [siteSettings?.featured_services, siteSettings?.services]);

  useEffect(() => {
    const fetchIcons = async () => {
      if (!practiceId) return;
      try {
        const res = await fetch(`/api/${practiceId}/icons`);
        if (!res.ok) throw new Error(`API returned status ${res.status}`);
        const data = await res.json();
        setIconsMap(data.iconsMap || {});
      } catch (err) {
        console.error("Failed to fetch icons:", err);
        setIconsMap({});
      }
    };
    fetchIcons();
  }, [practiceId]);

  return (
    <>
      <IcomoonStyles />
      <section className="w-full bg-gray-50 py-16 px-4" id="services">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-5 text-gray-900 pt-8" style={{ textTransform: 'capitalize' }}>
            {siteSettings.service_description?.welcome_title || 'Our Services'}
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-5"></div>
          <p className="text-xl font-roboto text-[#333] leading-[1.7] text-center mb-12 max-w-5xl mx-auto">
            {siteSettings.service_description?.welcome_text || 'Professional eye care services tailored to your needs'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
            {allServices.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.service_title || service.title}
                description={service.long_description || service.short_description || service.description}
                icon_id={service.icon_id}
                iconClass={service.icon_desc || service.iconDescription}
                iconsMap={iconsMap}
                className="greyText text-center mb-12 max-w-5xl mx-auto"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesPage;