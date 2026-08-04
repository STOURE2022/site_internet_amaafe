# Site du Centre Coranique Rahma

Site statique du **Centre Coranique Rahma** (Yirimadio, Bamako, Mali), porté par l'**AMAAFE**.
Construit avec [Astro](https://astro.build) — HTML/CSS/JavaScript vanilla, sans framework lourd, pensé pour les connexions lentes (mobile d'abord, < 300 Ko par page, polices en local, aucun CDN externe sur les pages publiques).

## Arborescence

```
content/                  ← TOUS les contenus éditables (jamais dans le HTML)
  config.json             ← fichier central : chiffres, contacts, paiement, URLs
  actualites/*.md         ← une actualité par fichier
  enfants/*.md            ← une fiche de parrainage par fichier
public/
  admin/                  ← interface Decap CMS (config.yml à finaliser)
  fonts/                  ← polices WOFF2 servies en local
  images/                 ← logo AMAAFE, futures photos (avec autorisation)
  js/site.js              ← navigation, menu mobile, animations
  js/don.js               ← parcours de don (montant, canal, WhatsApp, copier)
src/
  layouts/Base.astro      ← squelette commun : en-tête, nav, pied de page, SEO
  components/             ← bloc don, jeton « à confirmer », config de don
  pages/                  ← une page = un fichier (accueil, don, parrainage…)
  styles/global.css       ← tout le design (variables CSS de la maquette)
docs/                     ← maquette et prompt d'origine, pour référence
```

## Lancer en local

Prérequis : [Node.js](https://nodejs.org) 20 ou plus récent.

```bash
npm install     # une seule fois
npm run dev     # site sur http://localhost:4321, rechargement automatique
npm run build   # génère le site final dans dist/
npm run preview # sert dist/ pour vérifier le build
```

## Déployer sur Cloudflare Pages

1. Pousser ce dépôt sur GitHub (ou GitLab).
2. Sur [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Connect to Git**, choisir le dépôt.
3. Réglages de build :
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
4. Chaque `git push` sur `main` redéploie automatiquement le site.

Dès que le domaine définitif est acquis :
- l'ajouter dans Cloudflare Pages (**Custom domains**) ;
- remplacer l'URL dans `astro.config.mjs` (champ `site`) — elle sert au sitemap, au robots.txt et aux balises de partage.

Déploiement manuel possible sans Git : `npx wrangler pages deploy dist`.

## Remplacer les données « à confirmer »

Tous les jetons rouges « à confirmer » du site viennent de valeurs à `null` dans **`content/config.json`**. Remplacer le `null` par la vraie valeur, sauvegarder, redéployer : le jeton disparaît partout automatiquement.

| Donnée affichée | Où la renseigner dans `config.json` |
|---|---|
| Nombre d'enfants scolarisés | `chiffres.enfants` |
| Nombre d'enseignants | `chiffres.enseignants` |
| Coût annuel par enfant | `chiffres.coutAnnuelParEnfantFCFA` |
| Montant du parrainage / mois | `parrainage.montantMensuelFCFA` (et `montantMensuelEUR`) |
| Budget de la médersa | `medersa.budgetTotalFCFA` |
| Montant déjà collecté | `medersa.montantCollecteFCFA` + `medersa.pourcentageAvancement` |
| Numéro Orange Money | `paiement.orangeMoney.numero` |
| Numéro Wave | `paiement.wave.numero` |
| RIB du compte Mali | `paiement.virementMali.rib` (+ `banque`) |
| IBAN du compte France | `paiement.virementFrance.iban` (+ `bic`) |
| Horaires de visite | `contact.horairesVisite` |
| URLs des formulaires (Tally/Google Forms) | `formulaires.*` |
| Liens réseaux sociaux | `reseaux.*` |

Valeurs texte entre guillemets (`"lundi–vendredi, 8h–17h"`), nombres sans guillemets (`150`).

Deux jetons ne sont **pas** dans `config.json` (volontairement, car ils relèvent des mentions légales) : le **directeur de la publication** et l'**hébergeur**, à remplacer dans `src/layouts/Base.astro` (pied de page) et `src/pages/mentions-legales.astro`.

## Ajouter une actualité

Créer un fichier `content/actualites/mon-titre.md` (le nom du fichier devient l'adresse `/actualites/mon-titre/`) :

```markdown
---
titre: "Titre de l'actualité"
categorie: "Vie du centre"        # ou : Sortie éducative, Le projet, AMAAFE
extrait: "Une ou deux phrases affichées dans la liste."
date: 2026-09-15                  # laisser à null si la date n'est pas connue
image: null                       # photo uniquement avec autorisation écrite
publie: true
---

Le texte de l'article, en Markdown.
```

Sauvegarder, pousser sur Git : l'article apparaît dans la liste et sur l'accueil (3 plus récentes). Même principe pour les fiches de parrainage dans `content/enfants/`.

> ⚠️ Les 3 actualités livrées sont des exemples tirés de la maquette : vérifier leur contenu (et ajouter les dates réelles) avant la mise en ligne.

## Administration des contenus (Decap CMS)

L'interface d'édition sans code est préparée dans `public/admin/` (accessible sur `/admin/` une fois le site en ligne). Pour l'activer :

1. Dans `public/admin/config.yml`, renseigner `repo:` avec le dépôt GitHub réel.
2. Decap a besoin d'une authentification GitHub OAuth. Sur Cloudflare Pages, le plus simple est de déployer un petit proxy OAuth (par exemple [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth), un Worker Cloudflare gratuit), puis de renseigner `base_url:` dans `config.yml`.
3. Le trésorier se connecte sur `/admin/` avec son compte GitHub (invité comme collaborateur du dépôt) et peut modifier chiffres, coordonnées de paiement, actualités et fiches — chaque sauvegarde crée un commit et redéploie le site.

En attendant l'activation, tout reste éditable à la main dans `content/` (c'est le même contenu).

## Passer le site en plusieurs langues (plus tard)

Le site est en français. La structure prévue pour ajouter l'anglais ou l'arabe sans réécrire :

1. Dupliquer les pages dans `src/pages/en/` (et `content/actualites-en/`…), traduire.
2. Ajouter les balises `hreflang` dans `src/layouts/Base.astro` (une balise `<link rel="alternate" hreflang="…">` par langue).
3. Pour l'arabe : le layout accepte `lang`/`dir` — prévoir `dir="rtl"` sur `<html>`.

## Choix techniques à connaître

- **Le site n'encaisse aucun paiement.** Il guide vers Orange Money / Wave / virement, puis recueille une **déclaration de don** — par WhatsApp pré-rempli (canal principal au Mali) ou formulaire externe. Le **numéro émetteur** est la clé de rapprochement avec le relevé de l'opérateur.
- **Aucune donnée inventée** : toute valeur inconnue affiche un jeton rouge « à confirmer », alimenté par `content/config.json`.
- **Aucune photo d'enfant ni prénom réel** tant que les autorisations parentales ne sont pas recueillies : le site affiche des emplacements hachurés prévus à cet effet.
- **Aucun avantage fiscal annoncé** tant que l'éligibilité n'est pas confirmée.
- **Pas de traceur, pas de cookie** : rien à déclarer, pas de bannière nécessaire. Si une mesure d'audience devient utile, choisir un outil sans cookie (par ex. Cloudflare Web Analytics) et mettre à jour la politique de confidentialité.

Avant publication : suivre **`CHECKLIST-AVANT-MISE-EN-LIGNE.md`**.
