/** Worker Cloudflare : sert les pages statiques du site et protège
    toute la zone /admin/ (tableau de bord + éditeur Decap) par un
    mot de passe, vérifié côté serveur.

    Le mot de passe N'EST PAS dans le code : il vit dans le secret
    ADMIN_PASSWORD du service Cloudflare (tableau de bord Cloudflare →
    Workers & Pages → site-internet-amaafe → Settings → Variables and
    Secrets → Add → type « Secret », nom ADMIN_PASSWORD).
    Tant que le secret n'est pas défini, la zone admin reste fermée. */

function reponse401(message) {
  return new Response(message, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Administration AMAAFE", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/admin')) {
      if (!env.ADMIN_PASSWORD) {
        return reponse401(
          "Zone d'administration fermée : le secret ADMIN_PASSWORD n'est pas encore défini dans Cloudflare."
        );
      }
      const autorisation = request.headers.get('Authorization') ?? '';
      let motDePasse = null;
      if (autorisation.startsWith('Basic ')) {
        try {
          // « nom:motdepasse » en base64 — seul le mot de passe compte.
          const decode = atob(autorisation.slice(6));
          motDePasse = decode.slice(decode.indexOf(':') + 1);
        } catch {
          motDePasse = null;
        }
      }
      if (motDePasse !== env.ADMIN_PASSWORD) {
        return reponse401('Mot de passe requis pour accéder à l’administration.');
      }
    }

    return env.ASSETS.fetch(request);
  },
};
