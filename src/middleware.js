import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

// Cache for storing domain to practice mappings
const domainCache = new Map();
const CACHE_DURATION = 3600000; // 1 hour

function getDailyKey() {
  const today = new Date().toISOString().split("T")[0];
  return crypto.createHash("md5").update(today).digest("hex");
}

async function resolvePracticeInfo(hostname) {
  const domainsToTry = [hostname];
  if (hostname.startsWith('www.')) {
    domainsToTry.push(hostname.replace('www.', ''));
  } else {
    domainsToTry.push(`www.${hostname}`);
  }

  // 1. Try the new domain_lookup API
  try {
    const todayKey = getDailyKey();

    for (const domain of domainsToTry) {
      const response = await fetch('https://eyecareportal.herokuapp.com/api/domain_lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          today_key: todayKey,
          domain: domain
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        // The API returns { practice_id: ... } or similar
        const identifier = data.practice_id || data.id || data.customer_code;
        if (identifier) {
          return {
            identifier: identifier.toString()
          };
        }
      }
    }
  } catch (error) {
    console.error('Error resolving practice by new domain_lookup API:', error);
  }

  try {
    for (const domain of domainsToTry) {
      const response = await fetch(
        `https://passport.nevadacloud.com/api/v1/public/practice_by_domain?domain=${encodeURIComponent(domain)}`,
        { signal: AbortSignal.timeout(3000) }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && (data.customer_code || data.id)) {
          return {
            identifier: data.customer_code || data.id.toString()
          };
        }
      }
    }
  } catch (error) {
    console.error('Error resolving practice by old passport API:', error);
  }

  return null;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase();

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/new_booking') ||
    pathname.startsWith('/promo/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // Check cache first
    let practiceInfo = domainCache.get(hostname);

    if (!practiceInfo) {
      practiceInfo = await resolvePracticeInfo(hostname);

      if (practiceInfo) {
        domainCache.set(hostname, practiceInfo);
        // Clear cache after 1 hour
        setTimeout(() => domainCache.delete(hostname), CACHE_DURATION);
      }
    }

    // If we found a practice, rewrite the URL
    if (practiceInfo?.identifier) {
      // If the path already starts with the identifier, don't rewrite
      if (pathname.startsWith(`/${practiceInfo.identifier}`)) {
        return NextResponse.next();
      }

      const url = request.nextUrl.clone();
      const cleanPath = pathname === '/' ? '' : pathname;
      url.pathname = `/${practiceInfo.identifier}${cleanPath}`;
      return NextResponse.rewrite(url);
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};