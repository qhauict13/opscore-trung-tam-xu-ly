// Basic Auth for the whole site (Vercel Routing Middleware).
// Credentials come from the BASIC_AUTH_USER / BASIC_AUTH_PASSWORD env vars on Vercel.
export const config = { matcher: '/:path*' };

export default function middleware(request) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;

  // Fail closed: if the env vars are missing, block everyone.
  if (!user || !pass) {
    return new Response('Site locked: credentials not configured.', { status: 503 });
  }

  const header = request.headers.get('authorization') || '';
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const i = decoded.indexOf(':');
      if (i !== -1 && decoded.slice(0, i) === user && decoded.slice(i + 1) === pass) {
        return; // authorized: continue to the requested page
      }
    } catch (_) {
      // malformed header falls through to 401
    }
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Opscore", charset="UTF-8"' },
  });
}
