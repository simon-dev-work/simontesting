import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  // Helper function to strip AWS signed URL parameters and return permanent URL
  const stripSignedUrlParams = (url) => {
    if (!url) return url;

    try {
      // Check if it's an S3 URL with signed parameters
      if (url.includes('s3.eu-west-2.amazonaws.com') || url.includes('amazonaws.com')) {
        const urlObj = new URL(url);
        // Remove all AWS signature query parameters
        urlObj.search = '';
        return urlObj.toString();
      }
      return url;
    } catch (error) {
      console.error('Error stripping signed URL params:', error);
      return url;
    }
  };

  // Helper function to process blog object and strip signed URLs from images
  const processBlogImages = (blog) => {
    if (!blog) return blog;

    return {
      ...blog,
      // Strip signed params from thumbnail image
      thumbnail_image: blog.thumbnail_image ? {
        ...blog.thumbnail_image,
        url: stripSignedUrlParams(blog.thumbnail_image.url)
      } : blog.thumbnail_image,
      // Strip signed params from header image
      header_image: blog.header_image ? {
        ...blog.header_image,
        url: stripSignedUrlParams(blog.header_image.url)
      } : blog.header_image,
      // Strip signed params from banner image if it exists
      banner: stripSignedUrlParams(blog.banner)
    };
  };

  // Helper function to safely fetch and parse JSON
  const safeFetch = async (url) => {
    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.warn(`API request failed: ${url} - ${response.status}`);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error in safeFetch for ${url}:`, error);
      return [];
    }
  };

  try {
    const { practiceId } = await Promise.resolve(params);

    // If no practiceId provided, return empty array
    if (!practiceId) {
      return NextResponse.json([]);
    }

    // Check if practiceId is a number (traditional ID) or a string (customer code)
    const isNumericId = /^\d+$/.test(practiceId);
    let effectivePracticeId = practiceId;

    // Handle customer code lookup if not a numeric ID
    if (!isNumericId) {
      const cleanCode = practiceId.replace(/^-+|-+$/g, '').toUpperCase(); // Remove leading/trailing dashes and convert to uppercase

      try {
        // Try to fetch practice by customer code from the API
        const practiceResponse = await fetch(`https://eyecareportal.herokuapp.com/api/practices?customer_code=${cleanCode}`);
        if (practiceResponse.ok) {
          const practiceData = await practiceResponse.json();
          if (practiceData && practiceData.length > 0) {
            effectivePracticeId = practiceData[0].id;
          } else {
            console.warn(`No practice found for customer code: ${cleanCode}, will use global blogs only`);
            // Set to null to skip practice-specific blogs
            effectivePracticeId = null;
          }
        } else {
          console.warn(`Failed to fetch practice data for code: ${cleanCode}, will use global blogs only`);
          // Set to null to skip practice-specific blogs
          effectivePracticeId = null;
        }
      } catch (error) {
        console.error(`Error looking up practice for code ${cleanCode}, will use global blogs only:`, error);
        // Set to null to skip practice-specific blogs
        effectivePracticeId = null;
      }
    }

    // Fetch both practice-specific and global blogs in parallel
    const [practiceBlogs, globalBlogs] = await Promise.all([
      // Practice-specific blogs (only if we have a valid practice ID)
      (async () => {
        if (!effectivePracticeId) {
          return [];
        }

        try {
          const url = `https://eyecareportal.herokuapp.com/api/blogs?practice_id=${effectivePracticeId}`;
          const response = await fetch(url, { next: { revalidate: 60 } });

          if (!response.ok) {
            console.error(`Failed to fetch practice blogs: ${response.status} ${response.statusText}`);
            return [];
          }

          const data = await response.json();
          const blogs = Array.isArray(data) ? data : [];
          return blogs;
        } catch (e) {
          console.error('Error fetching practice blogs:', e);
          return [];
        }
      })(),
      // Global blogs (no practice_id parameter)
      (async () => {
        const url = 'https://eyecareportal.herokuapp.com/api/blogs';
        const blogs = await safeFetch(url);
        return blogs;
      })()
    ]);

    // Combine and deduplicate blogs by ID, keeping practice-specific versions when they exist
    const blogMap = new Map();

    // First add all global blogs (with processed images)
    globalBlogs.forEach(blog => {
      if (blog && blog.show === true) {
        const processedBlog = processBlogImages(blog);
        blogMap.set(blog.id, {
          ...processedBlog,
          isGlobal: true,
          url: `/${practiceId}/blog/${blog.id}`
        });
      }
    });

    // Then add/override with practice-specific blogs (with processed images)
    practiceBlogs.forEach(blog => {
      if (blog && blog.show === true) {
        const processedBlog = processBlogImages(blog);
        blogMap.set(blog.id, {
          ...processedBlog,
          isGlobal: false,
          url: `/${practiceId}/blog/${blog.id}`
        });
      }
    });

    // Convert back to array and sort by date (newest first)
    const allBlogs = Array.from(blogMap.values()).sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    return NextResponse.json(allBlogs);
  } catch (error) {
    console.error('[Blogs API] Error:', error);
    // Always return an empty array instead of an error object
    // This ensures the UI won't break if the API fails
    return NextResponse.json([], { status: 200 });
  }
}