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

/* /api/collecte : montant collecté sur HelloAsso, en euros, mis en cache
   une heure. Secrets à définir dans Cloudflare (Settings → Variables) :
   HELLOASSO_CLIENT_ID et HELLOASSO_CLIENT_SECRET (type Secret) — créés
   dans le compte HelloAsso, « Mon compte → Intégrations et API ».
   Variables facultatives : HELLOASSO_ORG (défaut « amaafe »),
   HELLOASSO_FORM (défaut « du-hangar-a-la-madrassa »),
   HELLOASSO_FORM_TYPE (défaut « CrowdFunding »).
   Tant que les secrets manquent, la réponse est { eur: null } et la jauge
   du site n'affiche que les saisies manuelles de l'équipe. */

function chercheMontant(objet, cles) {
  if (objet == null || typeof objet !== 'object') return null;
  for (const cle of cles) {
    if (typeof objet[cle] === 'number') return objet[cle];
  }
  for (const valeur of Object.values(objet)) {
    const trouve = chercheMontant(valeur, cles);
    if (trouve != null) return trouve;
  }
  return null;
}

async function montantHelloAsso(env) {
  const org = env.HELLOASSO_ORG || 'amaafe';
  const form = env.HELLOASSO_FORM || 'du-hangar-a-la-madrassa';
  const type = env.HELLOASSO_FORM_TYPE || 'CrowdFunding';

  const jeton = await fetch('https://api.helloasso.com/oauth2/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.HELLOASSO_CLIENT_ID,
      client_secret: env.HELLOASSO_CLIENT_SECRET,
    }),
  });
  if (!jeton.ok) throw new Error('jeton HelloAsso : ' + jeton.status);
  const { access_token } = await jeton.json();
  const entetes = { authorization: 'Bearer ' + access_token };
  const base = `https://api.helloasso.com/v5/organizations/${org}/forms/${type}/${form}`;

  // 1) Le détail du formulaire expose parfois le montant collecté directement.
  const detail = await fetch(`${base}/public`, { headers: entetes });
  if (detail.ok) {
    const centimes = chercheMontant(await detail.json(), ['amountCollected', 'collectedAmount']);
    if (centimes != null && centimes > 0) return centimes / 100;
  }

  // 2) Sinon : somme des paiements autorisés, page par page (plafond large).
  let totalCentimes = 0;
  let indexPage = 1;
  for (; indexPage <= 20; indexPage++) {
    const page = await fetch(`${base}/payments?states=Authorized&pageSize=100&pageIndex=${indexPage}`, { headers: entetes });
    if (!page.ok) break;
    const corps = await page.json();
    const paiements = corps.data ?? [];
    for (const p of paiements) totalCentimes += p.amount ?? 0;
    const totalPages = corps.pagination?.totalPages ?? 1;
    if (indexPage >= totalPages) break;
  }
  return totalCentimes / 100;
}

async function apiCollecte(env) {
  const enJson = (corps, dureeCache) =>
    new Response(JSON.stringify(corps), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': `public, max-age=300, s-maxage=${dureeCache}`,
      },
    });

  if (!env.HELLOASSO_CLIENT_ID || !env.HELLOASSO_CLIENT_SECRET) {
    return enJson({ eur: null, etat: 'non-configure' }, 3600);
  }

  const cache = caches.default;
  const cle = new Request('https://cache.interne/api/collecte');
  const enCache = await cache.match(cle);
  if (enCache) return enCache;

  try {
    const eur = await montantHelloAsso(env);
    const reponse = enJson({ eur, ts: Date.now() }, 3600);
    await cache.put(cle, reponse.clone());
    return reponse;
  } catch {
    // Identifiants refusés, panne ou réponse inattendue : la jauge retombe
    // sur les saisies manuelles et le tableau de bord signale l'erreur.
    return enJson({ eur: null, etat: 'erreur' }, 300);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/collecte') {
      return apiCollecte(env);
    }

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
