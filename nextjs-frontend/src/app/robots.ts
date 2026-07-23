import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private, authenticated areas. Trailing slashes keep public plural
        // routes crawlable (e.g. /agent/ is blocked, /agents/ stays allowed).
        disallow: [
          '/admin/',
          '/super-admin/',
          '/api/',
          '/auth/',
          '/buyer/',
          '/seller/',
          '/investor/',
          '/wholesaler/',
          '/agent/',
          '/broker/',
          '/lender/',
          '/title/',
          '/staff/',
          '/dashboard/',
          '/logout',
          '/reset-password',
          '/verify-email',
          '/email-verification-notice',
          '/unauthorized',
        ],
      },
    ],
    sitemap: 'https://domesticrealestate.us/sitemap.xml',
  };
}
