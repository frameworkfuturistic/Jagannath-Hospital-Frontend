import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()' // Added `interest-cohort` to block FLoC.
  );

  // Content Security Policy (CSP)
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self';",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://api.razorpay.com;",
      "style-src 'self' 'unsafe-inline';",
      "img-src 'self' data: https:;",
      "font-src 'self' data:;",
      "connect-src 'self' https://api.razorpay.com https:;",
     "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://www.google.com https://www.google.com/maps/;",
      "worker-src 'self';",
      "object-src 'none';", // Disallow embedding of plugins like Flash
      "base-uri 'self';", // Prevent attackers from setting base URL for relative links
      "form-action 'self';", // Restrict where forms can be submitted
    ].join(' ')
  );

  // HTTP Strict Transport Security (HSTS)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  // Additional headers for SEO and performance
  response.headers.set('X-Robots-Tag', 'index, follow');
  response.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  // CORS headers (Optional, if your application needs it)
  response.headers.set('Access-Control-Allow-Origin', '*'); // Restrict to specific domains in production
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  return response;
}

export const config = {
  matcher:
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)', // Match all pages except API, static assets, and common files
};
