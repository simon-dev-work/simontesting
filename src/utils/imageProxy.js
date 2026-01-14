/**
 * Utility function to generate a proxied image URL
 * This helps avoid CORS and 403 issues with S3 by routing through our Next.js API
 */

export const getProxiedImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If the URL is already a full URL, check if it's an S3 URL
  if (imageUrl.startsWith('http')) {
    // If it's already a proxied URL, return as is
    if (imageUrl.includes('/api/proxy-image')) {
      return imageUrl;
    }
    
    // For S3 URLs, clean up any existing query parameters from pre-signed URLs
    if (imageUrl.includes('s3.eu-west-2.amazonaws.com')) {
      // Extract the path part after the domain
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      // Reconstruct the clean URL
      const cleanUrl = `https://s3.eu-west-2.amazonaws.com${url.pathname}`;
      return `/api/proxy-image?url=${encodeURIComponent(cleanUrl)}`;
    }
    
    // For other URLs, just proxy them as is
    return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
  }
  
  // If it's a path, construct the full URL first
  const baseUrl = 'https://s3.eu-west-2.amazonaws.com/luminablue-blogs';
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  const fullUrl = `${baseUrl}${cleanPath}`;
    
  return `/api/proxy-image?url=${encodeURIComponent(fullUrl)}`;
};
