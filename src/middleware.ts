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
    'camera=(), microphone=(), geolocation=()'
  );

  // Content Security Policy (CSP)
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self';",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline';",
      "style-src 'self' 'unsafe-inline';",
      "img-src 'self' data: https:;",
      "font-src 'self' data:;",
      "connect-src 'self' https:;",
      "frame-src 'self' https://www.google.com https://www.google.com/maps/;",
      "worker-src 'self';",
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

  return response;
}

export const config = {
  // Matcher to exclude API routes, Next.js static files, and common assets
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
};
