import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith('/');
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      if (isOnRegister || isOnLogin) {
        const callbackUrlParam = nextUrl.searchParams.get('callbackUrl');
        if (callbackUrlParam) {
          try {
            const decodedCallbackUrl = decodeURIComponent(callbackUrlParam);
            const url = new URL(decodedCallbackUrl, nextUrl.origin); // Use nextUrl.origin as base for relative URLs
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
              return Response.redirect(new URL('/login', nextUrl as unknown as URL));
            }
            if (url.origin !== nextUrl.origin && !decodedCallbackUrl.startsWith('/')) {
                return Response.redirect(new URL('/login', nextUrl as unknown as URL));
            }
          } catch (e) {
            return Response.redirect(new URL('/login', nextUrl as unknown as URL));
          }
        }
        return true;
      }

      if (isOnChat) {
        if (isLoggedIn) return true;
        // Redirect unauthenticated users, preserving original path and query
        let returnUrl = nextUrl.pathname + nextUrl.search;
        
        // Validate the returnUrl before encoding and redirecting
        try {
          const url = new URL(returnUrl, nextUrl.origin);
          if (url.protocol !== 'http:' && url.protocol !== 'https:' && !returnUrl.startsWith('/')) {
            returnUrl = '/'; // Default to a safe path if invalid
          } else if (url.origin !== nextUrl.origin && !returnUrl.startsWith('/')) {
            returnUrl = '/'; // Default to a safe path if external and not explicitly relative
          }
        } catch (e) {
          returnUrl = '/'; // Default to a safe path if parsing fails
        }

        const loginUrl = new URL(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`, nextUrl as unknown as URL);
        return Response.redirect(loginUrl);
      }

      if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
