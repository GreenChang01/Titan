import createMiddleware from 'next-intl/middleware';
import {type MiddlewareConfig, type NextRequest, NextResponse} from 'next/server';
import {routing} from './i18n/routing.ts';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
	// Add pathname to headers for layout detection
	const response = intlMiddleware(request);
	response.headers.set('x-pathname', request.nextUrl.pathname);
	return response;
}

export const config: MiddlewareConfig = {
	matcher: [
		// Match all pathnames except for
		// - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
		// - … the ones containing a dot (e.g. `favicon.ico`)
		// eslint-disable-next-line unicorn/prefer-string-raw
		'/((?!api|trpc|_next|_vercel)(?!.*\\..*).*)',
	],
};
