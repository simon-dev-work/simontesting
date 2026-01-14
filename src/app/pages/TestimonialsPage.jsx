"use client";

import Image from "next/image";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { useState, useMemo } from "react";
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const ReviewCard = ({ image, title, comments, rating = 5, date, className = "", quoteIconColor }) => (
  <div className={`h-full ${className}`}>
    <div className="bg-white rounded-xl shadow-md h-full flex flex-col transition-all duration-300 hover:shadow-lg overflow-hidden">
      {/* Primary Color Top Section */}
      <div className="bg-primary p-8 flex-1 flex flex-col min-h-[320px]">
        <div className="flex justify-center mb-4 w-full">
          <FaQuoteLeft className="text-3xl opacity-50" style={{ color: quoteIconColor }} />
        </div>
        <p className="text-white text-center text-xl leading-relaxed line-clamp-5 overflow-hidden text-ellipsis w-full">
          {comments}
        </p>
      </div>

      {/* White Bottom Section */}
      <div className="bg-white p-8 pt-0 flex flex-col items-center relative">
        {/* Image */}
        <div className="relative w-20 h-20 -mt-10 mb-4 z-10 rounded-full shadow-sm overflow-hidden">
          <img
            src={image || '/placeholder-avatar.png'}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-avatar.png';
            }}
          />
        </div>

        {/* Name */}
        <h3 className="text-xl font-semibold text-primary mb-4">{title}</h3>

        {/* Star Rating */}
        <div className="flex justify-center items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`text-base ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>

        {/* Date */}
        {date && (
          <p className="text-base text-gray-500">
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        )}
      </div>
    </div>
  </div>
);

const TestimonialsPage = () => {
  const { siteSettings, isLoading, error } = useSiteSettings();

  // Function to calculate quote icon color based on primary color
  const getQuoteIconColor = (primaryColor) => {
    // Default to white if no primary color
    if (!primaryColor) return '#ffffff';

    // Remove # if present
    const hex = primaryColor.replace('#', '');

    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate new G and B values
    let newG, newB;

    // For G: subtract 14 if >= 14, otherwise add 14
    if (g >= 14) {
      newG = g - 14;
    } else {
      newG = g + 14;
    }

    // For B: subtract 20 if >= 20, otherwise add 20
    if (b >= 20) {
      newB = b - 20;
    } else {
      newB = b + 20;
    }

    // Convert back to hex
    const toHex = (value) => {
      const hex = value.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(newG)}${toHex(newB)}`;
  };

  const allReviews = useMemo(() => {
    const reviews = siteSettings?.reviews?.review || [];
    return reviews.slice(0, 4);
  }, [siteSettings]);

  const quoteIconColor = useMemo(() => {
    return getQuoteIconColor(siteSettings?.primaryColor || '#000000');
  }, [siteSettings?.primaryColor]);

  if (!isLoading && !error && allReviews.length === 0) {
    return null;
  }

  return (
    <>
      {/* Testimonials Section - Only show if there are reviews */}
      {!isLoading && !error && allReviews.length > 0 && (
        <section id="testimonials" className="w-full bg-gray-50 pt-16 pb-0 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-5 text-gray-900 pt-8" style={{ textTransform: 'capitalize' }}>What do our patients say?</h2>
              <div className="w-20 h-1 bg-primary mx-auto"></div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-0">
                {allReviews.map((review) => {
                  // Transform external image URLs to local paths if they match the pattern
                  let imageUrl = review.img;
                  if (imageUrl && (imageUrl.includes('eyecareportal.com') || imageUrl.includes('testimonial'))) {
                    const match = imageUrl.match(/\/(\d+)\.png$/);
                    if (match) {
                      imageUrl = `/images/testimonials/${match[1]}.png`;
                    }
                  }

                  return (
                    <div key={review.id}>
                      <ReviewCard
                        image={imageUrl}
                        title={review.patient_name}
                        comments={review.review_comments}
                        rating={review.rating || 5}
                        date={review.date}
                        quoteIconColor={quoteIconColor}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Show loading or error state */}
      {isLoading && (
        <section className="w-full bg-gray-50 py-16 px-4">
          <div className="max-w-7xl mx-auto text-center py-12">
            Loading reviews...
          </div>
        </section>
      )}

      {error && (
        <section className="w-full bg-gray-50 py-16 px-4">
          <div className="max-w-7xl mx-auto text-center py-12 text-red-500">
            Error loading reviews: {error}
          </div>
        </section>
      )}

      {/* Google Reviews Section */}
      <div className="w-full bg-gray-50 pt-8 pb-16 px-4">
        <div className="max-w-4xl mx-auto flex justify-center">

          {/* 
              This container holds the Frame. 
              We use 'group' here so hovering anywhere on the button triggers the logo spin.
            */}
          <a
            href={siteSettings?.custom_rating_url?.trim() ? siteSettings.custom_rating_url : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block h-24 md:h-32 w-auto aspect-[3.5/1] group transition-transform hover:scale-105 duration-300"
          >
            {/* Background Frame (The Pill) */}
            <Image
              src="/recentRevFrame.png"
              alt="Google Reviews Frame"
              fill
              className="object-contain"
              priority
            />

            {/* 
                 Google Logo Container 
              */}
            <div className="absolute left-[6.5%] top-1/2 -translate-y-1/2 h-[78%] aspect-square flex items-center justify-center">
              <div className="relative w-4/5 h-4/5 google-logo-spin">
                <Image
                  src="/google.png"
                  alt="Google Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </a>

        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        /* 
           Custom spin animation logic:
           We use a cubic-bezier(0.34, 1.56, 0.64, 1) to create the "overshoot" effect.
           When hovering, it goes to 360deg but the curve pushes it past (approx 370+) and pulls it back.
           When un-hovering, it reverses the exact same curve back to 0.
        */
        .google-logo-spin {
          transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Trigger rotation on group hover */
        .group:hover .google-logo-spin {
          transform: rotate(360deg);
        }
      `}</style>
    </>
  );
};

export default TestimonialsPage;