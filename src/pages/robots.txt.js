// robots.txt généré au build pour pointer vers le bon domaine.
export function GET(context) {
  const site = context.site ?? new URL('https://centre-rahma.pages.dev');
  const contenu = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    '',
    `Sitemap: ${new URL('/sitemap.xml', site).href}`,
    '',
  ].join('\n');
  return new Response(contenu, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
