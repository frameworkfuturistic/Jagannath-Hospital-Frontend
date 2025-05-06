import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';

// Domain allowlists
const TRUSTED_DOMAINS = {
  scripts: [
    'https://checkout.razorpay.com',
    'https://js.razorpay.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ],
  styles: [
    'https://fonts.googleapis.com',
  ],
  images: [
    'https://sjhrc.in',
    'https://*.sjhrc.in',
    'https://res.cloudinary.com',
    'https://loremflickr.com',
    'https://images.unsplash.com',
    'https://images.pexels.com',
    'https://cdn.eyemyeye.com',
    'https://gratisography.com',
    'https://azbigmedia.com',
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
    'https://api.razorpay.com', // Added for Razorpay iframe
    'https://www.google.com',
    'https://www.google.com/maps/',
  ],
};

// CSP violation reporting endpoint (optional, configure your own)
const CSP_REPORT_URI = process.env.CSP_REPORT_URI || 'https://sjhrc.in/';


// Generate a simple nonce for Edge Runtime (no crypto dependency)
const generateNonce = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 16; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
};

export function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Generate nonce for production CSP
    const nonce = isDevelopment ? '' : generateNonce();
    // Core Security Headers
    const securityHeaders = {
      'X-XSS-Protection': '1; mode=block',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), interest-cohort=()',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    };

    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Inline script hash for Razorpay
    const inlineScriptHash = "'sha256-Q+8tPsjVtiDsjF/Cv8FMOpg2Yg91oKFKDAJat1PPb2g='";

    // Dynamic CSP Builder
    const cspDirectives = [
      // Base restrictions
      `default-src 'self';`,
      `base-uri 'self';`,
      `form-action 'self' https://api.razorpay.com;`,
      `frame-ancestors 'self';`,
      `object-src 'none';`,
      // Script policies
      `script-src 'self' ${isDevelopment ? "'unsafe-eval' 'unsafe-inline'" : `'nonce-${nonce}' ${inlineScriptHash}`} ${TRUSTED_DOMAINS.scripts.join(' ')};`,
      // Style policies
      `style-src 'self' 'unsafe-inline' ${TRUSTED_DOMAINS.styles.join(' ')};`,
      // Media policies
      `img-src 'self' data: blob: ${TRUSTED_DOMAINS.images.join(' ')} http://localhost:3000;`,
      `media-src 'self' blob:;`,
      // Font policies
      `font-src 'self' ${TRUSTED_DOMAINS.fonts.join(' ')};`,
      // Connection policies
      `connect-src 'self' ${TRUSTED_DOMAINS.connections.join(' ')} ${isDevelopment ? 'http://localhost:3000 ws://localhost:3000 http://localhost:5555 ws://localhost:5555' : ''};`,
      // Frame policies
      `frame-src 'self' ${TRUSTED_DOMAINS.frames.join(' ')};`,
      `report-uri ${CSP_REPORT_URI};`,
    ].join(' ');

    // Apply CSP
    response.headers.set(
      isDevelopment ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
      cspDirectives
    );

    // Additional Protections
    if (!isDevelopment) {
      response.headers.set('Expect-CT', 'max-age=86400, enforce');
      response.headers.set('X-DNS-Prefetch-Control', 'on');
    }

    // Set nonce for use in <script> tags
    if (!isDevelopment) {
      response.headers.set('X-Nonce', nonce);
    }

    // Preload critical scripts
    response.headers.set('Link', '<https://checkout.razorpay.com/v1/checkout.js>; rel=preload; as=script');

    // Log request for debugging
    if (isDevelopment) {
      console.log(`[Middleware] Processing ${request.method} ${request.nextUrl.pathname}`);
    }

    return response;
  } catch (error) {
    console.error('[Middleware] Error:', error);
    const fallbackResponse = NextResponse.next();
    fallbackResponse.headers.set('X-Middleware-Error', 'true');
    return fallbackResponse;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|workbox-*.js|manifest.json|robots.txt|sitemap.xml).*)',
  ],
};