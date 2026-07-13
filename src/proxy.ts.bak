import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Get the IP country from Vercel's edge headers
  const country = request.headers.get('x-vercel-ip-country') || 'UNKNOWN';
  
  // Current hostname being visited
  const hostname = request.headers.get('host') || '';

  // To prevent redirect loops, only redirect if they are not already on their destination domain.
  // We use URL objects to easily manipulate the destination.
  
  // 1. If user is from UAE, redirect to UAE domain
  if (country === 'AE' && !hostname.includes('servizuae.com')) {
    return NextResponse.redirect(new URL('https://servizuae.com', request.url));
  }
  
  // 2. If user is from India, redirect to India domain (if not already there)
  if (country === 'IN' && !hostname.includes('servizind.com')) {
    return NextResponse.redirect(new URL('https://servizind.com', request.url));
  }
  
  // 3. If user is from Oman, redirect to Oman domain (if not already there)
  if (country === 'OM' && !hostname.includes('servizoman.com')) {
    return NextResponse.redirect(new URL('https://servizoman.com', request.url));
  }
  
  // 4. If user is from Kazakhstan, redirect to Kazakhstan domain (if not already there)
  if (country === 'KZ' && !hostname.includes('servizkaz.com')) {
    return NextResponse.redirect(new URL('https://servizkaz.com', request.url));
  }

  // Continue to the page for all other scenarios
  return NextResponse.next();
}

// Ensure the middleware only runs on actual page visits, not API routes or static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
