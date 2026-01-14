import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 });
  }

  try {
    // Fetch the image from the original URL
    const response = await fetch(imageUrl, {
      headers: {
        // Add referer to avoid hotlinking protection
        'Referer': new URL(imageUrl).origin,
        // Add a user agent to avoid being blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        // Add any necessary AWS headers if needed
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      // Add a timeout to prevent hanging
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      console.error(`Failed to fetch image: ${imageUrl} - Status: ${response.status}`);
      return new NextResponse('Failed to fetch image', {
        status: response.status,
        statusText: response.statusText
      });
    }

    // Get the image data and content type
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with appropriate headers
    return new NextResponse(Buffer.from(imageBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable', // Cache for 7 days (blog images rarely change)
        'CDN-Cache-Control': 'public, max-age=604800',
        'Vary': 'Accept-Encoding'
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse(`Error proxying image: ${error.message}`, {
      status: 500
    });
  }
}
