import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const user = process.env.DEV_DOCS_USER;
  const password = process.env.DEV_DOCS_PASSWORD;
  const devDocsPublic = process.env.DEV_DOCS_PUBLIC === 'true';

  // Local/dev opt-out must be explicit. In hosted environments, missing
  // credentials fail closed instead of exposing /dev docs anonymously.
  if (!user || !password) {
    if (devDocsPublic) {
      return NextResponse.next();
    }

    return unauthorized();
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

  return unauthorized();
}

function unauthorized() {
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
