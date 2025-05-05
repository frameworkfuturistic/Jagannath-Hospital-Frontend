import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Domain allowlists
const TRUSTED_DOMAINS = {
  scripts: [
    'https://checkout.razorpay.com',
    'https://js.razorpay.com',
    // 'https://www.googletagmanager.com',
    // 'https://www.google-analytics.com',
  ],
  styles: [
    'https://fonts.googleapis.com',
  ],
  images: [
    'https://*.sjhrc.in',
    'https://loremflickr.com',
    'https://images.unsplash.com',
  ],
  fonts: [
    'https://fonts.gstatic.com',
  ],
  connections: [
    'https://api.razorpay.com',
    'https://lumberjack.razorpay.com',
    'https://checkout.razorpay.com',
    'https://www.google-analytics.com',
  ],
  frames: [
    'https://checkout.razorpay.com',
    'https://js.razorpay.com',
  ],
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // =====================
  // Core Security Headers
  // =====================
  const securityHeaders = {
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // =====================
  // Dynamic CSP Builder
  // =====================
  const cspDirectives = [
    // Base restrictions
    "default-src 'self';",
    "base-uri 'self';",
    "form-action 'self';",
    "frame-ancestors 'self';",
    "object-src 'none';",

    // Script policies (allow unsafe-inline/eval in dev for Next.js)
    `script-src 'self' ${isDevelopment ? "'unsafe-eval' 'unsafe-inline'" : ""} ${TRUSTED_DOMAINS.scripts.join(" ")};`,

    // Style policies
    `style-src 'self' 'unsafe-inline' ${TRUSTED_DOMAINS.styles.join(" ")};`,

    // Media policies
    `img-src 'self' data: blob: ${TRUSTED_DOMAINS.images.join(" ")};`,
    `media-src 'self' blob:;`,

    // Font policies
    `font-src 'self' ${TRUSTED_DOMAINS.fonts.join(" ")};`,

    // Connection policies
    `connect-src 'self' ${TRUSTED_DOMAINS.connections.join(" ")} ${isDevelopment ? "http://localhost:5555 ws://localhost:5555" : ""};`,

    // Frame policies (for Razorpay/Stripe)
    `frame-src 'self' ${TRUSTED_DOMAINS.frames.join(" ")};`,
  ].join(' ');

  // Apply CSP with report-only in dev
  response.headers.set(
    isDevelopment ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
    cspDirectives
  );

  // =====================
  // Additional Protections
  // =====================
  if (!isDevelopment) {
    response.headers.set('Expect-CT', 'max-age=86400, enforce');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - API routes
     * - Static files
     * - Next.js internals
     * - Public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|workbox-*.js|manifest.json).*)',
  ],
};