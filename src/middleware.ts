import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const user = process.env.DEV_DOCS_USER;
  const password = process.env.DEV_DOCS_PASSWORD;

  // If no credentials configured, allow access (local dev)
  if (!user || !password) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');

    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded);
      const [authUser, authPass] = decoded.split(':');

      if (authUser === user && authPass === password) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Dev Docs"',
    },
  });
}

export const config = {
  matcher: '/dev/:path*',
};
