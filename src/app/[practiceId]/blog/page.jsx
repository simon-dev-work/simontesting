"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname } from 'next/navigation';
import { useSiteSettings } from "../../context/SiteSettingsContext";
import Navbar from "../../pages/Navbar";
import FooterPage from "../../pages/FooterPage";
import Loader from "../../components/Loader";

const BlogHomePage = () => {
  const params = useParams();
  const pathname = usePathname();
  const { siteSettings } = useSiteSettings();
  const [allBlogs, setAllBlogs] = useState([]);
  const [practiceBlogs, setPracticeBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract customer code from URL if present
  const pathSegments = pathname ? pathname.split('/').filter(Boolean) : [];
  const RESERVED = ['blog', 'info_centre', 'new_booking', 'api', 'paia', 'privacy', 'settings'];
  const isCustomerCodeRoute = pathSegments[0] && !/^\d+$/.test(pathSegments[0]) && !RESERVED.includes(pathSegments[0]);
  const customerCode = isCustomerCodeRoute ? pathSegments[0] : null;
  const practiceId = isCustomerCodeRoute ? siteSettings?.practiceId : params.practiceId;

  // Use site settings to get practice-specific data
  const practiceName = siteSettings?.name || siteSettings?.practice_name || "";
  const primaryColor = siteSettings?.primaryColor || "#000000";

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all blogs
        const [allBlogsRes, practiceBlogsRes] = await Promise.all([
          fetch('https://eyecareportal.herokuapp.com/api/blogs'),
          practiceId ? fetch(`https://eyecareportal.herokuapp.com/api/blogs?practice_id=${practiceId}`) : Promise.resolve(null)
        ]);

        if (!allBlogsRes.ok) {
          throw new Error(`Failed to fetch all blogs: ${allBlogsRes.statusText}`);
        }

        const allBlogsData = await allBlogsRes.json();

        // Check if the response has the expected format
        if (!allBlogsData || !Array.isArray(allBlogsData)) {
          console.error('Unexpected API response format for all blogs:', allBlogsData);
          throw new Error('Unexpected response format from server for all blogs');
        }

        setAllBlogs(allBlogsData);

        // Process practice-specific blogs if practiceId is available
        if (practiceId && practiceBlogsRes) {
          if (!practiceBlogsRes.ok) {
            console.warn(`Failed to fetch practice blogs: ${practiceBlogsRes.statusText}`);
          } else {
            const practiceBlogsData = await practiceBlogsRes.json();
            if (practiceBlogsData && Array.isArray(practiceBlogsData)) {
              setPracticeBlogs(practiceBlogsData);
            }
          }
        }
      } catch (err) {
        console.error('[Blog Page] Error in fetchBlogs:', err);
        setError(err.message || 'An error occurred while fetching blogs');
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [practiceId, customerCode]);

  // Sort and filter blogs by date (newest first) and show status
  const sortedAllBlogs = useMemo(() => {
    if (!Array.isArray(allBlogs) || allBlogs.length === 0) return [];
    return [...allBlogs]
      .filter(blog => blog.show === true)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allBlogs]);

  const sortedPracticeBlogs = useMemo(() => {
    if (!Array.isArray(practiceBlogs) || practiceBlogs.length === 0) return [];
    return [...practiceBlogs]
      .filter(blog => blog.show === true) // Only include blogs with show: true
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [practiceBlogs]);

  // Combine both blog lists, removing duplicates by ID and sort by date (newest first)
  const allUniqueBlogs = useMemo(() => {
    const blogMap = new Map();

    // First add practice blogs
    sortedPracticeBlogs.forEach(blog => blog && blog.id && blogMap.set(blog.id, blog));

    // Then add all blogs (practice blogs will be overwritten if they exist in both)
    sortedAllBlogs.forEach(blog => blog && blog.id && blogMap.set(blog.id, blog));

    // Convert to array and sort by date (newest first)
    return Array.from(blogMap.values()).sort((a, b) => {
      // Handle cases where date might be missing or invalid
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA; // Sort in descending order (newest first)
    });
  }, [sortedPracticeBlogs, sortedAllBlogs]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500 p-4 max-w-2xl">
          <h2 className="text-xl font-bold mb-2">Error Loading Blogs</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 rounded text-white"
          >
            Try Again
          </button>
          <div className="mt-6 p-4 bg-gray-100 rounded text-left">
            <p className="text-sm font-mono text-gray-700">
              <strong>Practice ID:</strong> {practiceId}<br />
              <strong>Error:</strong> {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderBlogs = (blogs, title) => {
    if (!blogs || blogs.length === 0) return null;

    return (
      <div className="mb-16">
        {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {blogs.map((blog) => (
            <div key={blog.id} className="h-full">
              <Link href={`${pathname.endsWith('/') ? pathname : pathname + '/'}${blog.id}`}>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
                  <div className="relative w-full aspect-[4/3] bg-gray-100">
                    <Image
                      src={blog.thumbnail_image?.url || '/placeholder-image.jpg'}
                      alt={blog.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <span className="text-sm text-gray-500">
                        {new Date(blog.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-3">
                        {blog.title}
                      </h3>
                    </div>
                    <div className="mt-4">
                      <span className="text-primary font-medium inline-flex items-center">
                        Read more
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (allUniqueBlogs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No blog posts found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar practiceId={practiceId} />
      <div>
        {/* Background Image Section */}
        <div className="w-full h-[500px] bg-[url('/images/InfoCentre/InfoCentreBannerGeneric.jpg')] bg-cover bg-center text-center text-white">
          <div className="bg-black bg-opacity-50 h-full flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl font-bold text-white">{practiceName} News Feed</h1>
          </div>
        </div>

        {/* Blog Cards Section */}
        <div className="container mx-auto py-10 px-4">
          {renderBlogs(allUniqueBlogs, '')}
        </div>
      </div>
    </>
  );
};

export default BlogHomePage;
