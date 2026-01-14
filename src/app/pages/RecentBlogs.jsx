"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import Loader from "../components/Loader";
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function RecentBlogs() {
  const { siteSettings } = useSiteSettings();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [licenseType, setLicenseType] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [retryCount, setRetryCount] = useState(0);

  // Fetch license info
  useEffect(() => {
    async function fetchLicense() {
      if (!siteSettings?.practiceId) return;
      try {
        const res = await fetch(`/api/${siteSettings.practiceId}/check_licence`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setLicenseType(data.product_type || null);
      } catch (err) {
        console.error("License fetch error:", err);
        setLoading(false);
      }
    }
    fetchLicense();
  }, [siteSettings?.practiceId]);

  // Fetch blogs only if license is NOT Comprehensive
  useEffect(() => {
    if (licenseType === "Comprehensive") {
      setLoading(false);
      return;
    }

    const fetchBlogs = async () => {
      if (!siteSettings?.practiceId) return;
      
      try {
        const response = await fetch(`/api/${siteSettings.practiceId}/blogs`);
        if (!response.ok) throw new Error('Failed to fetch blogs');
        
        const responseData = await response.json();
        
        // Handle both response formats: { blogs: [...] } or direct array
        const blogsArray = Array.isArray(responseData) 
          ? responseData 
          : (Array.isArray(responseData?.blogs) ? responseData.blogs : []);
        
        // Sort by date (newest first) and limit to 4 posts
        const sortedBlogs = blogsArray
          .filter(blog => blog?.date) // Ensure blog has a date
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 4);
        
        setBlogs(sortedBlogs);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, [siteSettings?.practiceId, licenseType]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Don't show the component if license is Comprehensive
  if (licenseType === "Comprehensive") {
    return null;
  }

  // Don't show if no blogs and not loading
  if (!loading && (!blogs || blogs.length === 0)) {
    return null;
  }

  // Helper function to get proxied image URL
  const getProxiedImageUrl = (originalUrl) => {
    if (!originalUrl) return null;
    
    // If it's already a local image, return as-is
    if (originalUrl.startsWith('/') && !originalUrl.startsWith('http')) {
      return originalUrl;
    }
    
    // Use proxy for external images
    return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
  };

  // Helper function to handle image errors with retry logic
  const handleImageError = (blogId) => {
    setImageErrors(prev => new Set(prev).add(blogId));
    
    // Optional: Retry failed images after 30 seconds
    setTimeout(() => {
      setImageErrors(prev => {
        const newSet = new Set(prev);
        newSet.delete(blogId);
        return newSet;
      });
    }, 30000);
  };

  // Get the current path segments
  const pathSegments = typeof window !== 'undefined' 
    ? window.location.pathname.split('/').filter(Boolean)
    : [];
    
  // Check if we're in a customer code route (first segment is not a number)
  const isCustomerCodeRoute = pathSegments[0] && !/^\d+$/.test(pathSegments[0]);
  const customerCode = isCustomerCodeRoute ? pathSegments[0] : null;

  // Determine the base path for links
  const getBlogPath = (blogId) => {
    // For customer code routes (like http://localhost:3000/-DEMO-)
    if (isCustomerCodeRoute && customerCode) {
      return `/${customerCode}/blog/${blogId}`;
    }
    // For practice ID routes (like http://localhost:3000/67) or any other case
    return `/blog/${blogId}`;
  };

  return (
    <section className="w-full bg-gray-50 py-16 px-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-5 text-gray-900 pt-8" style={{ textTransform: 'capitalize' }}>
            News Feed
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-5"></div>
          <p className="text-xl font-roboto text-[#333] leading-[1.7] text-center mb-12 max-w-5xl mx-auto">
            Stay updated with our latest news, articles, and insights from the world of web development and digital marketing.
          </p>
        </div>

        {loading ? (
          <Loader />
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No recent posts available.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto pb-8">
              {blogs.map((blog) => (
                <Link 
                  key={blog.id} 
                  href={getBlogPath(blog.id)}
                  className="block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group w-full max-w-[260px] mx-auto"
                >
                  <div className="relative h-52 bg-gray-200">
                    {(blog.thumbnail_image?.url || blog.header_image?.url) ? (
                      <Image
                        src={imageErrors.has(blog.id) ? '/placeholder-blog.svg' : getProxiedImageUrl(blog.thumbnail_image?.url || blog.header_image?.url)}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        onError={() => handleImageError(blog.id)}
                        unoptimized={imageErrors.has(blog.id)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Image
                          src="/placeholder-blog.svg"
                          alt="No image available"
                          width={260}
                          height={208}
                          className="object-cover"
                          unoptimized={true}
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <FaCalendarAlt className="mr-2" />
                      <span>{formatDate(blog.date)}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href={isCustomerCodeRoute && customerCode ? `/${customerCode}/blog` : '/blog'}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-white hover:text-primary hover:border-primary hover:border-2 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
              >
                VISIT NEWS FEED PAGE
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
