import { getCollection } from 'astro:content';

// Plan du site généré au build, sans dépendance externe.
export async function GET(context) {
  const site = context.site ?? new URL('https://amaafe.org');

  const pages = [
    '/',
    '/le-centre/',
    '/notre-projet/',
    '/parrainage/',
    '/faire-un-don/',
    '/l-amaafe/',
    '/transparence/',
    '/actualites/',
    '/contact/',
    '/mentions-legales/',
    '/confidentialite/',
    '/conditions-de-don/',
  ];

  const articles = await getCollection('actualites', ({ data }) => data.publie);
  const urls = [...pages, ...articles.map((a) => `/actualites/${a.id}/`)];

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${new URL(u, site).href}</loc></url>`).join('\n') +
    '\n</urlset>\n';

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
