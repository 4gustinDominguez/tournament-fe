import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'es'],

    // Used when no locale matches
    defaultLocale: 'es',
    localePrefix: 'as-needed'
});

export const config = {
    // Match all pathnames except for
    // - … if they contain a dot (e.g. `favicon.ico`)
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
