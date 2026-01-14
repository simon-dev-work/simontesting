"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from "../../../pages/Navbar";
import { useSiteSettings } from "../../../context/SiteSettingsContext";
import { getProxiedImageUrl } from '../../../../utils/imageProxy';
import Loader from "../../../components/Loader";

const BlogDetail = () => {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { practiceId, blogId } = params;
  const { siteSettings } = useSiteSettings();

  const [blog, setBlog] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const primaryColor = siteSettings?.primary_color || "#000000";

  // Helper to get correct back link
  const getBackLink = () => {
    if (pathname.startsWith('/blog') || pathname.startsWith('/info_centre')) {
      return '/blog';
    }
    return `/${practiceId}/blog`;
  };

  // Helper to get correct blog post link
  const getBlogLink = (id) => {
    if (pathname.startsWith('/blog')) {
      return `/blog/${id}`;
    }
    return `/${practiceId}/blog/${id}`;
  };

  useEffect(() => {
    const fetchBlogAndRecentPosts = async () => {
      if (!blogId) return;

      try {
        setLoading(true);
        setError(null);

        const [blogResponse, recentResponse] = await Promise.all([
          fetch(`/api/${practiceId}/blogs/${blogId}`),
          fetch(`/api/${practiceId}/blogs?limit=5`)
        ]);

        if (!blogResponse.ok) {
          const errorData = await blogResponse.json();
          throw new Error(errorData.error || 'Failed to fetch blog post');
        }

        const blogData = await blogResponse.json()
        if (!blogData || Object.keys(blogData).length === 0) {
          throw new Error('Blog post not found');
        }

        let recentPostsData = [];
        if (recentResponse.ok) {
          const data = await recentResponse.json();
          const posts = Array.isArray(data)
            ? data
            : (Array.isArray(data.blogs) ? data.blogs : []);

          recentPostsData = posts
            .filter(post => post && post.id && post.id.toString() !== blogId.toString())
            .slice(0, 4);

        }

        setBlog(blogData);
        setRecentPosts(recentPostsData);
      } catch (err) {
        console.error('[Blog Detail] Error:', err);
        setError(err.message || 'An error occurred while loading the blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogAndRecentPosts();
  }, [blogId, practiceId]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-2xl">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Blog Post</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => router.push(getBackLink())}
            className="px-6 py-2 rounded text-white hover:opacity-90 transition-opacity"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Blog Post Not Found</h2>
          <p className="mb-6">The requested blog post could not be found.</p>
          <Link
            href={getBackLink()}
            className="px-6 py-2 rounded text-white hover:opacity-90 transition-opacity inline-block"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Format the date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Navbar practiceId={practiceId} />

      {/* Background Image Section */}
      <div className="w-full h-[500px] bg-[url('/images/InfoCentre/InfoCentreBannerGeneric.jpg')] bg-cover bg-center text-center text-white">
        <div className="bg-black bg-opacity-50 h-full flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-6xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center break-words px-4">{blog.title}</h1>
          </div>
        </div>
      </div>

      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto pt-0 pb-10 px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Main Content */}
            <div className="lg:w-2/3 w-full">
              <article className="bg-transparent w-full">
                {/* Blog Header Image */}
                {blog.header_image?.url && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
                    <Image
                      src={getProxiedImageUrl(blog.header_image.url)}
                      alt={blog.title}
                      fill
                      className="object-contain"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 75vw"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Blog Content */}
                <div>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">{formatDate(blog.date || blog.created_at)}</span>
                  </div>

                  {/* Blog Content (HTML) */}
                  {blog.content && (
                    <div
                      className="prose max-w-none text-gray-700 bg-transparent"
                      dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                  )}
                </div>
              </article>
            </div>

            {/* Recent Posts Sidebar */}
            <div className="lg:w-64 mt-8 lg:mt-0 lg:ml-8 h-full">
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
                <h3 className="text-xl text-center font-bold mb-6 text-gray-900 border-b pb-2">Recent Posts</h3>

                {recentPosts.length > 0 ? (
                  <ul className="space-y-8 flex-1">
                    {recentPosts.map((post) => (
                      <li key={post.id} className="pb-4 last:pb-0">
                        <Link
                          href={getBlogLink(post.id)}
                          className="group block"
                        >
                          <div className="space-y-2">
                            {post.thumbnail_image?.url || post.header_image?.url ? (
                              <div className="relative w-full h-32 rounded-lg overflow-hidden mb-2">
                                <Image
                                  src={getProxiedImageUrl(post.thumbnail_image?.url || post.header_image?.url)}
                                  alt={post.title || 'Blog post thumbnail'}
                                  fill
                                  className="object-contain group-hover:opacity-90 transition-opacity"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-lg mb-2">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <h4 className="text-sm font-medium text-center text-gray-900 group-hover:text-primary transition-colors line-clamp-2"
                            >
                              {post.title}
                            </h4>
                            <p className="text-xs text-center text-gray-500">
                              {formatDate(post.date || post.created_at)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No recent posts found.</p>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default BlogDetail;